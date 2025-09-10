# Istio Ambient Mesh Configuration (online-ide namespace)

Components to understand:

ztunnel: Acts as a Layer 4 (transport) proxy for all workloads in the namespace. It enforces mutual TLS (mTLS), authenticates identities, and ensures encrypted traffic between services.

waypoint: Sits at Layer 7 (application) boundaries and provides advanced traffic control, policy enforcement, and telemetry 

## Safety Checklist

- [x] Ambient mode enabled (pilot + CNI + ztunnel values) 
- [x] Namespace label for ambient
- [x] Strict mTLS
- [x] Deny-by-default
- [x] Dedicated ServiceAccounts
- [x] Database restricted

## Istio Feature -> Security Benefit (Project POV)

| Istio Feature / Config | What It Does Here | Security Benefit / Threat Mitigated |
|------------------------|-------------------|--------------------------------------|
| Ambient Mesh (ztunnel + waypoint) | Layered L4 (ztunnel) & optional L7 (waypoint) without sidecars | Lower operational overhead while still enforcing identity & policy; reduces attack surface from per-pod sidecar CVEs |
| Namespace label `istio.io/dataplane-mode: ambient` | Opts only this namespace into ambient | Controlled blast radius; prevents accidental inclusion of other namespaces |
| Strict mTLS PeerAuthentication | Forces encrypted, authenticated workload-to-workload traffic | Stops plaintext snooping / MITM; assures workload identity for authz decisions |
| Dedicated ServiceAccounts per service | Unique SPIFFE identities per workload | Prevents privilege sharing & lateral movement via shared default SA |
| AuthorizationPolicies (ALLOW + namespace DENY) | Explicit per-principal, per-path/method allow list; deny-by-default fallback | Enforces least-privilege; stops unexpected internal calls & request smuggling between services |
| Path + method scoping (project, compiler, dark-mode, ui) | Limits gateway surface to necessary verbs & prefixes | Reduces exploit chain options (e.g. unused endpoints / HTTP verb confusion) |
| Database authz isolation | Only `project-sa` may initiate traffic to DB Service | Protects persistence layer from reconnaissance & injection via other compromised services |
| Waypoints at L7 boundary | Central enforcement / telemetry insertion point | Uniform policy and future observability (WAF, rate limit) without code changes |
| Distroless images (Helm values) | Removes shell/package managers from control-plane & proxies | Shrinks runtime attack surface, limits post-exploit privilege escalation |
| Disabled privileged proxy mode | `proxy.privileged=false` | Mitigates container escape vectors relying on elevated capabilities |
| Deny unnamed lateral traffic | Namespace DENY + absent allow rules | Contains compromised service; halts worm-like propagation |

## Threat Scenarios Addressed

| Threat | How Current Setup Mitigates |
|--------|-----------------------------|
| Lateral movement from a compromised backend (e.g. compiler) | Compiler SA lacks allow rules to reach project / DB; DENY policy blocks. |
| Credential replay / pod impersonation | mTLS + unique ServiceAccounts ensure identity cannot be spoofed without cert + key (issued per workload). |
| Passive traffic sniffing | STRICT mTLS encrypts all intra-namespace traffic. |
| Unauthorized data exfil via unused endpoints | Only explicitly declared paths accepted; ambiguous verbs (e.g. PUT where not needed) removed. |
| Database enumeration by non-project pods | DB AuthorizationPolicy restricts principal to project-sa only. |
| Supply chain exploit in sidecars | Ambient mode reduces sidecar count (no per-pod sidecars) lowering patch surface. |
| Over-broad access from UI assets or hashed bundles | UI policy explicitly enumerates necessary prefixes including hashed bundles; no wildcard root beyond /ui/. |


## Quick Audit Checklist (Run Periodically)

These commands help verify Istio security controls in the `online-ide` namespace:

```bash
# 1. List ServiceAccounts (identities)
kubectl get sa -n online-ide
# Shows all service accounts used for identity in mTLS and authorization.

# 2. List PeerAuthentication resources
kubectl get peerauthentication -n online-ide
# Confirms mTLS enforcement. If mode is STRICT, all traffic is encrypted and authenticated.

# 3. List AuthorizationPolicies
kubectl get authorizationpolicy -n online-ide
# Shows all access control rules. These decide which identities can access which services, paths, and methods.

# 4. Attempt blocked lateral call (should fail)
kubectl exec -n online-ide deploy/compiler -- wget -S -T 2 --spider http://project-service:8000/project/
# Expect 403 Forbidden.
# mTLS authenticates the compiler pod, but AuthorizationPolicy does NOT allow compiler-sa to access project-service, so Istio blocks the request.

# 5. Gateway allowed but path is forbidden (should fail)
kubectl exec -n online-ide deploy/gateway -- wget -S -T 2 --spider http://project-service:8000/random
# Expect 403 Forbidden.
# mTLS authenticates gateway-sa, and AuthorizationPolicy allows gateway-sa, but only for specific paths (e.g., /project/). /random is not allowed, so Istio blocks the request.

# 6. Gateway allowed (should succeed, but app may require user token)
kubectl exec -n online-ide deploy/gateway -- wget -S -T 2 --spider http://project-service:8000/project/
# Expect 401 Unauthorized.
# mTLS authenticates gateway-sa, and AuthorizationPolicy allows gateway-sa for /project/. However, the application itself requires a user token for access, so it returns 401 Unauthorized.

# 7. Attempt connection from outside the mesh (should fail if mTLS is strict)
kubectl run test-outside --rm -it --image=busybox -n default --restart=Never --command -- wget -S -T 2 --spider http://project-service.online-ide:8000/project/
# Expect connection error: "Connection reset by peer".
# Why? mTLS is enforced in online-ide, so traffic from pods not in the mesh (or without proper identity/certificates) cannot be authenticated and will be blocked by Istio before reaching the service.