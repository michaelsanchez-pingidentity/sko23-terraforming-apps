resource "kubernetes_ingress_v1" "package_ingress" {
  metadata {
    namespace = var.namespace
    name      = "${var.k8s_deploy_name}-ingress"
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
      host = "${var.k8s_deploy_name}.ping-devops.com"
      http {
        path {
          path = "/"
          backend {
            service {
              name = "${var.k8s_deploy_name}-app-service"
              port {
                number = 5000
              }
            }
          }
        }
      }
    }

    tls {
      hosts = ["${var.k8s_deploy_name}.ping-devops.com"]
    }
  }
}

resource "kubernetes_deployment" "bxr_app" {
  metadata {
    namespace = var.namespace
    name      = "${var.k8s_deploy_name}-app"
    labels = {
      "app.kubernetes.io/name"       = "${var.k8s_deploy_name}-app",
      "app.kubernetes.io/instance"   = "${var.k8s_deploy_name}-app",
      "app.kubernetes.io/managed-by" = "${var.k8s_deploy_name}-app"
    }
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "${var.k8s_deploy_name}-app"
      }
    }
    template {
      metadata {
        labels = {
          app = "${var.k8s_deploy_name}-app"
        }
      }
      spec {
        image_pull_secrets {
          name = "gcr-pull-secret"
        }
        container {
          image = "gcr.io/ping-gte/bxrterraform:latest"
          name  = "${var.k8s_deploy_name}-app"

          env {
            # OAuth client redirect URI & App launch URL
            name  = "REACT_APP_HOST"
            value = "${var.k8s_deploy_name}.ping-devops.com"
          }
          env {
            # The PingOne host for authN API calls
            # Note: For this demo, we're proxying the calls to avoid CORS
            # Typically you'd resolve this with a P1 Custom Domain
            name  = "REACT_APP_AUTHPATH"
            value = "https://apps.facile.pingidentity.cloud/pingauth"
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
    name      = "${var.k8s_deploy_name}-app-service"
  }
  spec {
    selector = {
      app = "${var.k8s_deploy_name}-app"
    }
    session_affinity = "ClientIP"
    port {
      port        = 5000
      target_port = 5000
    }

    type = "ClusterIP"
  }
}