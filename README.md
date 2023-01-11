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


