// Kubernetes Gateway API CRDs (required for Istio waypoint gateways)
resource "null_resource" "gateway_api_crds" {
  provisioner "local-exec" {
    command = "kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml"
  }
}

// Istio base components (minimal)
resource "helm_release" "istio_base" {
  name             = "istio-base"
  repository       = "https://istio-release.storage.googleapis.com/charts"
  chart            = "base"
  namespace        = "istio-system"
  create_namespace = true
  version          = "1.27.1"

  depends_on = [null_resource.gateway_api_crds]
}

// Minimal Istio control plane with ambient mesh
resource "helm_release" "istiod" {
  name       = "istiod"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "istiod"
  namespace  = "istio-system"
  version    = "1.27.1"

  depends_on = [helm_release.istio_base]

  values = [
    file("${path.module}/values/istiod-values.yaml")
  ]
}

// CNI plugin for ambient mesh (sidecar-free)
resource "helm_release" "istio_cni" {
  name       = "istio-cni"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "cni"
  namespace  = "istio-system"
  version    = "1.27.1"

  depends_on = [helm_release.istiod, kubernetes_manifest.gcp_critical_pods]

  values = [
    file("${path.module}/values/istio-cni-values.yaml")
  ]
}

// Ztunnel for ambient mesh
resource "helm_release" "ztunnel" {
  name       = "ztunnel"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "ztunnel"
  namespace  = "istio-system"
  version    = "1.27.1"

  depends_on = [helm_release.istio_cni, kubernetes_manifest.gcp_critical_pods]

  values = [
    file("${path.module}/values/ztunnel-values.yaml")
  ]
}

# ResourceQuota to allow scheduling of system-critical pods in istio-system namespace
resource "kubernetes_manifest" "gcp_critical_pods" {
  manifest = {
    apiVersion = "v1"
    kind       = "ResourceQuota"
    metadata = {
      name      = "gcp-critical-pods"
      namespace = "istio-system"
    }
    spec = {
      hard = {
        pods = "1k"
      }
      scopeSelector = {
        matchExpressions = [
          {
            operator  = "In"
            scopeName = "PriorityClass"
            values    = ["system-node-critical"]
          }
        ]
      }
    }
  }
  lifecycle {
    ignore_changes = [manifest["spec"]["hard"]["pods"]]
  }
}
