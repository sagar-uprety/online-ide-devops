terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.1.1"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.0.2"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.38.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
   backend "gcs" {
    bucket  = "containersecwiz"
    prefix  = "tfstate/gke/argocd"
  }
}
