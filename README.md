# Online IDE — DevOps & Security Additions

> **Note:** The source code for this project is taken from an existing Online IDE codebase. The following DevOps and security topics have been added on top of the original codebase as part of a Container Security Practical Project at TUM (Technical University of Munich).

## Added DevOps & Security Topics

### Container Build & Image Security
- **Minimized Images with Multistage Builds**: All 5 microservices (Gateway, Compiler, Project, UI, Dark-Mode) use multi-stage Dockerfiles — Maven build stage followed by minimal Alpine JRE runtime stage, with non-root user (`appuser`)
- **Restrictions for Containers (Build Time)**: Kaniko used for rootless, daemonless container builds in CI — no Docker daemon required, reducing attack surface during build
- **Restrictions for Containers (Run Time)**: All deployments enforce `securityContext` with `allowPrivilegeEscalation: false`, `capabilities.drop: ["ALL"]`, and `runAsNonRoot: true`
- **Use Hadolint to Check Images**: Hadolint lints all 5 Dockerfiles in CI for best practices and misconfigurations
- **Tools to Scan for Vulnerabilities in Containers**: Dockle scans built container images post-deploy for security misconfigurations (hardcoded passwords, root user, exposed secrets)

### CI/CD Pipeline
- **CI/CD Pipeline**: GitLab CI with 4 stages — static tests (Hadolint, Conftest/OPA), build (Kaniko, Cosign), deploy (GitOps manifest updates), post-deploy tests (Dockle)

### Image Signing & Admission Control
- **Signatures Management on Containerized Environments**: Cosign (v2.5.3) signs every built image with a private key; Connaisseur enforces signature validation at admission time (Docker Hub Notary + Cosign validators) with default-deny policy
- **Admission Controllers**: Connaisseur for image signature verification; OPA Gatekeeper for policy enforcement (blocks privileged containers and unapproved image registries)
- **Policy Enforcement**: OPA Gatekeeper ConstraintTemplates for image registry whitelist and no-privileged-container policies; OPA/Rego policies for Dockerfile linting via Conftest

### Kubernetes Security
- **Kubernetes Deployment**: K8s manifests for 5 microservices with dedicated ServiceAccounts and hardened securityContexts
- **K8s Security Context and Secrets**: All pods run with `runAsNonRoot`, `allowPrivilegeEscalation: false`, `capabilities.drop: ["ALL"]`, `readOnlyRootFilesystem: true`; secrets injected from External Secrets (not hardcoded)
- **RBAC (Role-Based Access Control)**: Namespace-scoped roles (reader: read-only pods/deployments; maintainer: full CRUD on core resources) and cluster-scoped ClusterRoles with bindings
- **Pod Security Standards**: Enforced baseline with warn restricted via namespace labels (`pod-security.kubernetes.io/enforce: baseline`)

### Service Mesh & Network Security
- **Istio Service Mesh (Ambient Mode)**: Sidecar-free mTLS with ztunnel (L4) and waypoint (L7) proxies; STRICT mTLS, 9 per-service AuthorizationPolicies, deny-by-default network access
- **Certificate Management on Orchestrated Container**: Istio handles mTLS certificate lifecycle automatically — ztunnel and waypoint proxies manage workload identity and TLS certificates via SPIFFE/SPIRE, with automatic rotation

### Secrets & Infrastructure
- **Secret Management**: External Secrets Operator (ESO) syncs secrets from Google Cloud Secret Manager to Kubernetes; Reflector enables cross-namespace secret sync; Reloader auto-restarts pods on secret changes
- **Terraform IaC**: 4-stage Terraform modules (Istio, Google Secrets Manager, External Secrets, ArgoCD)

### GitOps & Runtime Security
- **ArgoCD GitOps**: App-of-apps pattern with sync waves (Connaisseur -> Falco/Gatekeeper -> Policies -> Secrets -> Apps -> Istio) for automated, declarative, auditable deployments
- **Introducing Anomaly Detection Tooling like Falco**: Falco deployed with eBPF driver and containerd socket integration for runtime threat detection

---

## Prerequisites
- [gcloud CLI](https://cloud.google.com/sdk/docs/install)
- [gke-gcloud-auth-plugin](https://cloud.google.com/blog/products/containers-kubernetes/kubectl-auth-changes-in-gke)
   ```sh
   sudo apt-get install google-cloud-sdk-gke-gcloud-auth-plugin
   ```
- [Terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
- [kubectx](https://github.com/ahmetb/kubectx?tab=readme-ov-file#installation)

## Connecting to Google Kubernetes Engine

> **Note:** The gcloud commands below are specific to our project setup. Adjust the project ID, zone, and cluster name to match your own GKE deployment.

GKE cluster has been setup for Online-IDE with 3 nodes.

```sh
gcloud container clusters get-credentials <YOUR_CLUSTER_NAME> --zone <YOUR_ZONE> --project <YOUR_PROJECT_ID>
```

Note: IAM permissions are required to connect to the cluster.

## Setup Steps

1. **Authenticate with Google Cloud:**
   ```sh
   gcloud auth application-default login
   gcloud config set project <YOUR_PROJECT_ID>
   ```

2. **Deploy Istio Module with Terraform:**
   ```sh
   cd infra/terraform/0_istio
   terraform init
   terraform plan
   terraform apply
   ```

3. **Deploy Google Secrets Manager Module:**
   ```sh
   cd infra/terraform/1_google-secrets-manager
   terraform init
   terraform plan
   terraform apply
   ```

4. **Deploy External Secrets Module:**
   ```sh
   cd infra/terraform/2_external-secrets
   terraform init
   terraform plan
   terraform apply
   ```

5. **Apply External Secrets YAML:**
   ```sh
   cd infra
   kubectl apply -f external-secrets.yaml
   ```

6. **Deploy ArgoCD Module with Terraform:**
   ```sh
   cd infra/terraform/3_argocd
   terraform init
   terraform plan
   terraform apply
   ```

7. **Create ArgoCD Root Application:**
   > ArgoCD is used for GitOps-based continuous delivery, enabling automated, declarative, and auditable deployment of all Kubernetes resources from version-controlled manifests.
   ```sh
   cd argocd/applications
   kubectl apply -f root-application.yaml
   ```

8. **Access the application via port-forwarding:**
   ```sh
   kubectl port-forward service/gateway-service 8080:8080 -n online-ide
   ```

## Storing Secrets

1. **Add secrets to Google Cloud Secrets Manager:**
    - Store all secrets required by your Kubernetes workloads in Google Cloud Secrets Manager.
    - Use the prefix `OIDE_` for online-ide project secrets and `ARTEMIS_` for artemis project secrets.

2. **Create an ExternalSecret object (not a plain Kubernetes secret):**

    Example:
    ```yaml
    apiVersion: external-secrets.io/v1
    kind: ExternalSecret
    metadata:
       name: gitlab-read
       namespace: external-secrets # Do not change this
       annotations:
          reflector.v1.k8s.emberstack.com/reflection-allowed: "true"
          reflector.v1.k8s.emberstack.com/reflection-auto-enabled: "true"
          reflector.v1.k8s.emberstack.com/reflection-allowed-namespaces: "online-ide"
    spec:
       refreshInterval: "1m"
       secretStoreRef:
          name: gcp-secret-manager
          kind: SecretStore
       target:
          name: gitlab-read
          creationPolicy: Owner
       data:
          - secretKey: .dockerconfigjson
            remoteRef:
               key: "GITLAB_READ_DOCKERCONFIGJSON"
    ```

3. Secrets are created in the `external-secrets` namespace and automatically reflected to the `online-ide` namespace using reflector annotations.

## Adding Images

1. Ensure the registry prefix is whitelisted in `argocd/gatekeeper-policies/image-registry-constraint.yml`.
2. Also allow the registry in Connaisseur at `argocd/helm-values/connaisseur-values.yaml` if not already listed.

## Image Signing with Cosign & Signature Validation with Connaisseur

All custom images are automatically built and signed during CI using Cosign and a private key, as defined in `.container-sign-template`.

Connaisseur intercepts all CREATE and UPDATE requests for Kubernetes resources and validates image signatures before allowing resource creation or updates.

Configuration: `argocd/helm-values/connaisseur-values.yaml`

### How to Test Image Validation

- **Unsigned image (should fail):**
   ```sh
   kubectl run demo --image=docker.io/securesystemsengineering/testimage:unsigned
   ```

- **Signed image (should pass):**
   ```sh
   kubectl run ui --image=gitlab.lrz.de:5005/container-security-wizards/online-ide/ui:0eac8983
   ```

## Istio Service Mesh

Istio Service Mesh is enabled for L4 and L7.
Check details at [argocd/istio/README.md](argocd/istio/README.md)

### Quick Audit Checklist

```bash
# 1. List ServiceAccounts (identities)
kubectl get sa -n online-ide

# 2. List PeerAuthentication resources (mTLS enforcement)
kubectl get peerauthentication -n online-ide

# 3. List AuthorizationPolicies
kubectl get authorizationpolicy -n online-ide

# 4. Attempt blocked lateral call (should fail with 403)
kubectl exec -n online-ide deploy/compiler -- wget -S -T 2 --spider http://project-service:8000/project/

# 5. Gateway allowed but path is forbidden (should fail with 403)
kubectl exec -n online-ide deploy/gateway -- wget -S -T 2 --spider http://project-service:8000/random

# 6. Gateway allowed (should succeed, app may return 401)
kubectl exec -n online-ide deploy/gateway -- wget -S -T 2 --spider http://project-service:8000/project/

# 7. Connection from outside the mesh (should fail if mTLS is strict)
kubectl run test-outside --rm -it --image=busybox -n default --restart=Never --command -- wget -S -T 2 --spider http://project-service.online-ide:8000/project/
```

## ArgoCD

ArgoCD is enabled in the cluster and installed as a Helm release via Terraform.

Root application: `argocd/applications/root-application.yaml`

### Accessing ArgoCD UI

```sh
kubectl port-forward service/argocd-server 3005:80 -n argocd
```

- **Username:** `admin`
- **Password:**
   ```sh
   kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 --decode
   ```
