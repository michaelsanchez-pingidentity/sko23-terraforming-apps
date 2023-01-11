# SKO2023-Terraform-Advanced

 Terraform for the SKO Terraform Advanced session

## Packaging

This repo contains all the necessary code to both configure and demonstrate a single Use Case of an application integration.

Everything needed for this is contained in this repo:

`/terraform` -- contains the HCL to deploy everything
`/app` -- contains the application source and Dockerfile used to demonstrate the configuration

### Terraform

The HCL contains resources for PingOne and for k8s. K8s is used to deploy the application image with an associated Ingress to allow browser access to the container.

#### Variables

Create a `terraform.tfvars` file with the following:

```hcl
region = "{{ NorthAmerica | Canada | Asia | Europe }}"
organization_id = "{{orgId}}"
admin_env_id = "{{adminEnvId}}"
admin_user_id = "{{adminUserId}}"
worker_id = "{{workerId}}"
worker_secret = "{{workerSecret}}"
deploy_name = "SKO2023 - BXRTerraform"
namespace = "{{k8s namespace}}"
env_type = "dev"
```

#### Deployment

At a command line:

```zsh
terraform init
terraform plan
terraform apply —auto-approve
```
