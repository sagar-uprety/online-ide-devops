// GitLab repository access for ArgoCD (Opaque, with ArgoCD repo labels/annotations)
data "google_secret_manager_secret_version" "gitlab_repo_token" {
  secret = var.gitlab_repo_token_secret_id
}

resource "kubernetes_secret" "gitlab_repo_access" {
  metadata {
    name      = "gitlab-repo-secret"
    namespace = "argocd"
    annotations = {
      "reflector.v1.k8s.emberstack.com/reflection-allowed" = "true"
      "reflector.v1.k8s.emberstack.com/reflection-auto-enabled" = "true"
      "reflector.v1.k8s.emberstack.com/reflection-allowed-namespaces" = "argocd"
    }
    labels = {
      "argocd.argoproj.io/secret-type" = "repository"
    }
  }
  type = "Opaque"
  data = {
    type     = "git"
    url      = var.gitlab_repo_url
    username = "k8s-gitlab-access"
    password = data.google_secret_manager_secret_version.gitlab_repo_token.secret_data
  }
  depends_on = [kubernetes_namespace.argocd]
}

// Create namespace for ArgoCD
resource "kubernetes_namespace" "argocd" {
  metadata {
    name = var.argocd_namespace
    labels = {
      name = var.argocd_namespace
    }
  }
}

// Prepare ArgoCD values with dynamic configuration
locals {
  argocd_values = file("${path.module}/argocd-values.yaml")
}

// ArgoCD Helm chart installation
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = var.argocd_chart_version
  namespace  = kubernetes_namespace.argocd.metadata[0].name

  values = [local.argocd_values]

  depends_on = [kubernetes_namespace.argocd]
}

// Wait for ArgoCD CRDs to be available
resource "null_resource" "wait_for_argocd_crds" {
  depends_on = [helm_release.argocd]
  
  provisioner "local-exec" {
    command = <<-EOT
      echo "Waiting for ArgoCD CRDs to be available..."
      for i in {1..30}; do
        if kubectl get crd applications.argoproj.io > /dev/null 2>&1; then
          echo "ArgoCD CRDs are available"
          exit 0
        fi
        echo "Waiting for CRDs... (attempt $i/30)"
        sleep 10
      done
      echo "Timeout waiting for ArgoCD CRDs"
      exit 1
    EOT
  }
}


// GitLab Docker registry secret (kubernetes.io/dockerconfigjson)
data "google_secret_manager_secret_version" "gitlab_dockerconfigjson" {
  secret = var.gitlab_dockerconfigjson_secret_id
}

resource "kubernetes_secret" "gitlab_docker_read" {
  metadata {
    name      = "gitlab-read"
    namespace = var.external_secrets_namespace
    annotations = {
      "reflector.v1.k8s.emberstack.com/reflection-allowed" = "true"
      "reflector.v1.k8s.emberstack.com/reflection-auto-enabled" = "true"
      "reflector.v1.k8s.emberstack.com/reflection-allowed-namespaces" = "online-ide,connaisseur"
    }
  }
  type = "kubernetes.io/dockerconfigjson"
  data = {
    ".dockerconfigjson" = data.google_secret_manager_secret_version.gitlab_dockerconfigjson.secret_data
  }
  depends_on = [kubernetes_namespace.argocd]
}