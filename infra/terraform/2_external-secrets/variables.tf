// GKE Cluster variables for authentication
variable "gke_cluster_name" {
  description = "Name of the GKE cluster"
  type        = string
}

variable "gke_cluster_location" {
  description = "Location (zone or region) of the GKE cluster"
  type        = string
}

variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = ""
}

variable "gcp_secret_name" {
  type = string
  default = "gcp-secret-manager-creds"
}

variable "gcp_secret_key" {
  type    = string
  default = "key.json"
}