// Google Cloud provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

// Data source to get GKE cluster information
data "google_container_cluster" "primary" {
  name     = var.gke_cluster_name
  location = var.gke_cluster_location
}

// Kubernetes provider configuration for GKE
provider "kubernetes" {
  host                   = "https://${data.google_container_cluster.primary.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(data.google_container_cluster.primary.master_auth.0.cluster_ca_certificate)
}

// Helm provider configuration for GKE
provider "helm" {
  kubernetes = {
    host                   = "https://${data.google_container_cluster.primary.endpoint}"
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(data.google_container_cluster.primary.master_auth.0.cluster_ca_certificate)
  }
}

// Data source for Google Cloud client configuration
data "google_client_config" "default" {}
