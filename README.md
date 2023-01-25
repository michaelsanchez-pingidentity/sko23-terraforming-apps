# SKO2023-Terraform-Advanced

 Terraform for the SKO Terraform Advanced session

## Packaging

This repo contains all the necessary code to both configure and demonstrate a single Use Case of a Ping integrated application.

Everything needed for this demonstration is contained in this repo:

`/terraform` -- contains the HCL to deploy everything  
`/app` -- contains the application source and Dockerfile used to demonstrate the configuration  
`/proxy-service` -- contains the source of a Fastify proxy used to provide server-side support for the App

### Terraform

The HCL contains resources for PingOne and for k8s. K8s is used to deploy the application image with an associated Ingress to allow browser access to the container.

#### Providers

The Terraform here uses multiple providers:

| Provider | Description |
| --- | --- |
| **PingOne** | PingOne Environment \ Services configuration |
| **Kubernetes** | Configure k8s infrastructure components |

#### Terraform Resources

This is what the HCL will create

| Provider | Resource | Description |
| --- | --- | --- |
| PingOne | Environment | Contains all the P1 configuration for the app |
| PingOne | Application | OIDC App used by the app |
| PingOne | Resource Grant | Assigns resources \ scopes to the OIDC App |



#### Variables

Create a `terraform.tfvars` file with the following:

```hcl
region = "{{ NorthAmerica | Canada | Asia | Europe }}"
organization_id = "{{orgId}}"
admin_env_id = "{{adminEnvId}}"
admin_user_id = "{{adminUserId}}"
license_name = "{{License name to put on new Env}}"
worker_id = "{{workerId}}"
worker_secret = "{{workerSecret}}"
env_name = "SKO2023 - BXRTerraform"
k8s_deploy_name = "{{Name used for K8s deployment and host name}}"
k8s_deploy_domain="ping-devops.com OR ping-partners.com"
k8s_namespace = "{{your k8s namespace}}"
proxy_image_name="docker.io/pricecs/ping-integration-proxy:0.0.9"
app_image_name="gcr.io/ping-gte/bxrterraform:202301-1.9"
env_type = "dev"
license_name="INTERNAL"
```

#### Deployment

At a command line:

```zsh
terraform init
terraform plan
```

If the plan fails - check your `terraform.tfvars` values.

If the plan succeeds:

```hcl
terraform apply —auto-approve
````

