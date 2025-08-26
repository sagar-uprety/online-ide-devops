output "argocd_namespace" {
  description = "Namespace where ArgoCD is installed"
  value       = kubernetes_namespace.argocd.metadata[0].name
}

output "argocd_server_service_name" {
  description = "Name of the ArgoCD server service"
  value       = "${helm_release.argocd.name}-server"
}

output "argocd_server_url" {
  description = "ArgoCD server URL (use kubectl port-forward or get LoadBalancer IP)"
  value       = "Access via: kubectl port-forward svc/${helm_release.argocd.name}-server -n ${var.argocd_namespace} 8080:443"
}

output "argocd_admin_password_secret" {
  description = "Admin password is managed by ESO - check the argocd-secret in the argocd namespace"
  value       = "kubectl get secret argocd-secret -n argocd -o jsonpath='{.data.admin\\.password}' | base64 -d"
}

output "gke_cluster_endpoint" {
  description = "GKE cluster endpoint"
  value       = data.google_container_cluster.primary.endpoint
  sensitive   = true
}

output "gke_cluster_ca_certificate" {
  description = "GKE cluster CA certificate"
  value       = data.google_container_cluster.primary.master_auth.0.cluster_ca_certificate
  sensitive   = true
}
