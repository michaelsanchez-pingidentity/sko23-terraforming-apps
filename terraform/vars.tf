variable "region" {
  type        = string
  description = "Region your P1 Org is in"
}

variable "organization_id" {
  type        = string
  description = "Your P1 Organization ID"
}

variable "admin_env_id" {
  type        = string
  description = "P1 Environment containing the Worker App"
}

variable "admin_user_id" {
  type        = string
  description = "P1 Administrator to assign Roles to"
}

variable "worker_id" {
  type        = string
  description = "Worker App ID App - App must have sufficient Roles"
}

variable "worker_secret" {
  type        = string
  description = "Worker App Secret - App must have sufficient Roles"
}

variable "namespace" {
  type    = string
  description = "K8s namespace for container deployment"
}

variable "deploy_name" {
  type        = string
  description = "Name used for the deployment"
}

variable "env_type" {
  type = string
  description = "Environment Type (Dev | QA | Prod)"
}

locals {
  deploy_name="${lower(var.deploy_name)}-${lower(var.env_type)}"
}

locals {
  k8s_deploy_name=replace(local.deploy_name, " ", "")
}

locals {
  app_url="https://${kubernetes_ingress_v1.package_ingress.spec[0].rule[0].host}"
}
