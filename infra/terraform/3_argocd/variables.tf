variable "argocd_admin_password_secret_id" {
  description = "Google Secret Manager secret ID for ArgoCD admin password (e.g. projects/<project>/secrets/<name>/versions/latest)"
  type        = string
}
variable "gitlab_repo_token_secret_id" {
  description = "Google Secret Manager secret ID for GitLab repo token (e.g. projects/<project>/secrets/<name>/versions/latest)"
  type        = string
}

variable "gitlab_repo_url" {
  description = "GitLab repository URL for ArgoCD repo secret (should match the one in core-secrets.yaml)"
  type        = string
}

// Google Cloud variables
variable "project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud region"
  type        = string
  default     = "us-central1"
}

// GKE Cluster variables
variable "gke_cluster_name" {
  description = "Name of the GKE cluster"
  type        = string
}

variable "gke_cluster_location" {
  description = "Location (zone or region) of the GKE cluster"
  type        = string
}

// ArgoCD variables
variable "argocd_namespace" {
  description = "Namespace for ArgoCD installation"
  type        = string
  default     = "argocd"
}

variable "argocd_chart_version" {
  description = "Version of the ArgoCD Helm chart"
  type        = string
  default     = "8.3.8"
}


variable "gitlab_target_revision" {
  description = "Target revision (branch/tag) for ArgoCD applications"
  type        = string
  default     = "main"
}

variable "gitlab_dockerconfigjson_secret_id" {
  description = "Google Secret Manager secret ID for GitLab Docker .dockerconfigjson (e.g. projects/<project>/secrets/<name>/versions/latest)"
  type        = string
}

variable "external_secrets_namespace" {
  description = "Namespace for external-secrets and core secrets (e.g. 'external-secrets')"
  type        = string
  default     = "external-secrets"
}
