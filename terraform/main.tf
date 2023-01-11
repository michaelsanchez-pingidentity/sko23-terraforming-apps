module "environment" {
  source  = "terraform-pingidentity-modules/environment/pingone"
  version = "0.0.12"

  target_environment_name = var.deploy_name

  admin_user_assign_environment_admin_role = false
  admin_user_assign_identity_admin_role = true
  admin_user_id_list = [
    var.admin_user_id
  ]
  create_authorize = true
  create_davinci = true
  create_risk = true
  license_name = "INTERNAL"
  organization_id = var.organization_id
}


##############################################
# Additional HCL 
##############################################
provider "pingone" {
  client_id                    = var.worker_id
  client_secret                = var.worker_secret
  environment_id               = var.admin_env_id
  region                       = var.region
  force_delete_production_type = false
}

data "pingone_licenses" "internal_license" {
  organization_id = var.organization_id

  data_filter {
    name   = "name"
    values = ["INTERNAL"]
  }

  data_filter {
    name   = "status"
    values = ["ACTIVE"]
  }
}

# resource "pingone_environment" "release_environment" {
#   name        = "${var.deploy_name} - ${var.env_type}"
#   description = "Created by Terraform"
#   type        = "SANDBOX"
#   license_id  = data.pingone_licenses.internal_license.ids[0]
#   default_population {}
#   service {
#     type = "SSO"
#   }
# }

resource "pingone_application" "bxr_logon" {
  environment_id = module.environment.environment_id
  enabled        = true
  name           = "BXR - Logon"
  login_page_url = "${local.app_url}/app"

  oidc_options {
    type                        = "NATIVE_APP"
    grant_types                 = ["AUTHORIZATION_CODE", "IMPLICIT"]
    response_types              = ["CODE", "TOKEN", "ID_TOKEN"]
    token_endpoint_authn_method = "NONE"
    redirect_uris = [ "${local.app_url}/app" ]
  }
}

data "pingone_resource" "openid" {
  environment_id = module.environment.environment_id

  name = "openid"
}

data "pingone_resource" "pingone" {
  environment_id = module.environment.environment_id

  name = "PingOne API"
}

data "pingone_resource_scope" "openid_email" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.openid.id

  name = "email"
}

data "pingone_resource_scope" "openid_profile" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.openid.id

  name = "profile"
}

data "pingone_resource_scope" "pingone_read_user" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone.id

  name = "p1:read:user"
}

data "pingone_resource_scope" "pingone_update_user" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone.id

  name = "p1:update:user"
}

data "pingone_resource_scope" "pingone_read_sessions" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone.id

  name = "p1:read:sessions"
}

resource "pingone_application_resource_grant" "bxr_login_openid" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxr_logon.id

  resource_id = data.pingone_resource.openid.id

  scopes = [
    data.pingone_resource_scope.openid_email.id,
    data.pingone_resource_scope.openid_profile.id
  ]
}

resource "pingone_application_resource_grant" "bxr_login_pingone" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxr_logon.id

  resource_id = data.pingone_resource.pingone.id

  scopes = [
    data.pingone_resource_scope.pingone_read_user.id,
    data.pingone_resource_scope.pingone_update_user.id,
    data.pingone_resource_scope.pingone_read_sessions.id
  ]
}