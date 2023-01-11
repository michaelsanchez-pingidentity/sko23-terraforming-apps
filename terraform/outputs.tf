# output "authz_url" {
#   value = "https://auth.pingone.com/v1/environments/${pingone_environment.youniverse_migrations.id}/as"
# }

# output "login_url" {
#   value = local.app_url
# }

output "k8s_deploy_name" {
  value = local.k8s_deploy_name
}
