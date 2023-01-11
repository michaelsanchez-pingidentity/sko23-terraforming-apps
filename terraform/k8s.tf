resource "kubernetes_ingress_v1" "package_ingress" {
  metadata {
    namespace = var.namespace
    name      = "${local.k8s_deploy_name}-ingress"
    annotations = {
      "kubernetes.io/ingress.class"                    = "nginx-public"
      "nginx.ingress.kubernetes.io/backend-protocol"   = "HTTPS"
      "nginx.ingress.kubernetes.io/cors-allow-headers" = "X-Forwarded-For"
      "nginx.ingress.kubernetes.io/force-ssl-redirect" = true
      "nginx.ingress.kubernetes.io/service-upstream"   = true
    }
  }

  spec {
    rule {
      host = "${local.k8s_deploy_name}.ping-devops.com"
      http {
        path {
          path = "/"
          backend {
            service {
              name = "${local.k8s_deploy_name}-app-service"
              port {
                number = 5000
              }
            }
          }
        }
      }
    }

    tls {
      hosts = ["${local.k8s_deploy_name}.ping-devops.com"]
    }
  }
}

resource "kubernetes_deployment" "bxr_app" {
  metadata {
    namespace = var.namespace
    name      = "${local.k8s_deploy_name}-app"
    labels = {
      "app.kubernetes.io/name"       = "${local.k8s_deploy_name}-app",
      "app.kubernetes.io/instance"   = "${local.k8s_deploy_name}-app",
      "app.kubernetes.io/managed-by" = "${local.k8s_deploy_name}-app"
    }
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "${local.k8s_deploy_name}-app"
      }
    }
    template {
      metadata {
        labels = {
          app = "${local.k8s_deploy_name}-app"
        }
      }
      spec {
        image_pull_secrets {
          name = "gcr-pull-secret"
        }
        container {
          image = "gcr.io/ping-gte/bxrterraform:latest"
          name  = "${local.k8s_deploy_name}-app"

          env {
            # OAuth client redirect URI & App launch URL
            name  = "REACT_APP_HOST"
            value = "${local.k8s_deploy_name}.ping-devops.com"
          }
          env {
            # The PingOne host for authN API calls
            name  = "REACT_APP_AUTHPATH"
            value = "${local.k8s_deploy_name}.ping-devops.com"
          }
          env {
            # P1 Environment ID
            name  = "REACT_APP_ENVID"
            value = module.environment.environment_id
          }
          env {
            # Client ID
            name  = "REACT_APP_CLIENT"
            value = pingone_application.bxr_logon.oidc_options[0].client_id
          }
          env {
            # Client secret
            name  = "REACT_APP_RECSET"
            value = pingone_application.bxr_logon.oidc_options[0].client_secret
          }
        }

      }
    }
  }
}

resource "kubernetes_service" "bxr_app" {
  metadata {
    namespace = var.namespace
    name      = "${local.k8s_deploy_name}-app-service"
  }
  spec {
    selector = {
      app = "${local.k8s_deploy_name}-app"
    }
    session_affinity = "ClientIP"
    port {
      port        = 5000
      target_port = 5000
    }

    type = "ClusterIP"
  }
}