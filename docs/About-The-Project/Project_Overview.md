# Project Overview

## 🧠 Helix AI

* **Type**: SaaS / PaaS
* **Goal**: An intelligent, emotionally aware virtual companion that helps users in their day-to-day tasks and life, not just as an assistant, but as a long-term partner.
* **Design**:
  * Built as a **monorepo**: `Helix-AI`
  * Uses a **custom LLM** and integrates public models via **Hugging Face**, **APIs**, and **files**
  * Plans for **platform integration**: Discord, Slack, Google, GitHub, Twitter, Facebook, GCP, Azure, AWS, Linode, Steam, Twitch, Stack Overflow, and more.
  * Supports **text and voice interfaces**
  * Exposes an **OpenAPI** service layer with a growing plugin library
  * Stores knowledge in an encrypted **vector store** for fast retrieval and citation
  * Feeds on real-time **telemetry, logs, and system events** to be self-aware of the underlying platform and its components
  * Will leverage **data streams, caches, databases, object stores** for awareness, context, and learning
  * Focused on accessibility features to assist users with disabilities
  * Builds a user profile during onboarding, collecting data such as gender, language, and preferences to tailor interactions

## 🛠 SinLess-Games-IaC

* **Purpose**: Manages infrastructure-as-code, security, policies, and DevSecOps pipelines
* **Structure**:
  * Separate Git repo: `SinLess-Games-IaC`
  * Contains:
    * Kubernetes (`clusters/`, `apps/`, `charts/`)
    * Terraform (`terraform/`)
    * Ansible (`ansible/`)
    * Docker (`docker/`)
    * Observability, policies, chaos, backups, documentation, scripts, and changelogs
    * Version tracking (`versions.json5`)
    * Logging utilities (`scripts/utils/logging.sh`)

---

## 🚀 DevSecOps Flow

1. **Pre-commit**: Linting, formatting, security checks, and tests
2. **Commit & Push**: GitHub / GitLab triggers
3. **CI**: Linting, security scanning, build tests, final build
4. **Staging Deployment**: Deploy with load and e2e tests, canary deployments
5. **Production Deployment**: Canary → Full rollout with automated rollback
6. **Alerts**: Sent via Discord, Email, and SMS

---

## 🧱 Infrastructure Setup

### 🛠 Technologies Used

#### Kubernetes & Orchestration
* K8s / K3s
* FluxCD (GitOps)
* Karmada (Multi-cluster)
* Helm (Charts)
* Rook (Storage orchestrator)
* Vitess (MySQL clustering)
* KEDA (Event-driven autoscaling)
* Crossplane (Infrastructure as Code)

#### CI/CD & Policy
* GitHub & GitLab CI
* Flagger (Canary deployments)
* Kyverno & OPA (Security and policy enforcement)

#### Observability Stack
* **Logging**: Fluentd, Loki, Beats, Logstash
* **Monitoring**: Prometheus, Grafana, Alertmanager
* **Tracing**: Jaeger, Tempo, OpenTelemetry
* **Dashboards**: Grafana, Homepage, Kiali
* **Profiling**: Grafana Pyroscope
* **SLOs & Incidents**: Grafana SLO, Grafana Incident
* **AI Observability**: Grafana Machine Learning

#### Networking & Security
* NGINX-Ingress
* Cloudflare + cloudflared tunnels
* Istio + Citadel
* SPIFFE/SPIRE
* Falco (runtime security)
* Cert-Manager
* Vault (secrets management)
* Pi-hole
* K8s-gateway
* Cilium (container networking)

#### Message & Event Streaming
* RabbitMQ
* Kafka + Zookeeper
* NATS
* CloudEvents

#### Storage
* Minio (S3-compatible)
* MySQL, PostgreSQL, MongoDB
* Redis (Cache)
* InfluxDB
* S3 (Cloud backup)

#### Backup & Recovery
* Velero

#### Cost Management
* Kubecost
* OpenCost

#### AI Stack
* Ollama (chatbot)
* Whisper / Faster-Whisper (STT)
* Wyoming-Piper (TTS)
* Open-WebUI (LLM UI)
* Stable Diffusion (text-to-image)
* SearxNG (privacy-focused metasearch)

#### Mail & Notification
* Mailu (mail server)
* Alertmanager Discord notifier
* SMS and Email alerts (external services assumed)

---

## 🧪 SEIM Stack (Planned)

* **Wazuh** or **Security Onion** for SIEM + threat detection
* **Elastic Stack** (Elasticsearch + Kibana) already in use

---

## 🧾 Configuration Practices

* **Configuration as Code**
* **Infrastructure as Code**
* **Security as Code**
* **Zero Trust Model**

## 🧪 Cluster Environments

* **Staging Cluster**: for testing, CI, chaos experiments, and canary deployments.
* **Production Cluster**: hardened, protected, and monitored with a mix of canary and blue/green rollout strategies.


## 🗃 Repo Structure (Key Parts)

* `apps/`, `charts/`, `clusters/` → Kubernetes manifests & Helm charts
* `ansible/`, `terraform/`, `docker/` → Infra management
* `docs/` → Troubleshooting, usage guides, security, changelogs
* `scripts/` → Utilities, versioning, repo setup
* `.taskfiles/` → Task automation for IaC
* `files/` → Dependency files like `Brewfile`, package lists

## ✅ Observability Map

A diagram illustrates a Kubernetes cluster with a load balancer, master nodes, worker nodes, and the control plane components, showing traffic paths and system interactions.
![HA Kubernetes](../images/ha-kubernetes-diagram.drawio)
Helix's long-term research draws inspiration from the **Fermi Paradox** and **Kardashev Scale**, exploring how advanced AI might help humanity reach higher technological stages.
\n*Document last updated: 2025, June 7*
