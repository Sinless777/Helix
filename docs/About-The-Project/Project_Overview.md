# Project Overview

## 🧠 Helix AI

* **Type**: SaaS / PaaS
* **Goal**: An intelligent, emotionally aware virtual companion that helps users in their day-to-day tasks and life, not just as an assistant, but as a long-term partner.
* **Design**:
  * Built as a **monorepo**: `Helix-AI`
  * Uses a **custom LLM** and integrates public models via **Hugging Face**, **APIs**, and **files**
  * Plans for **platform integration**: Discord, Slack, Google, GitHub, Twitter, Facebook, etc.
  * Supports **text and voice interfaces**
  * Feeds on real-time **telemetry, logs, and system events** to be self-aware of the underlying platform and its components
  * Will leverage **data streams, caches, databases, object stores** for awareness, context, and learning

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
    * Versioning scripts (`scripts/versioning/*.sh`)

---

## 🚀 DevSecOps Flow

1. **Pre-commit**: Linting, formatting, security checks, and tests
2. **Commit & Push**: GitHub / GitLab triggers
3. **CI**: Linting, security scanning, build tests, final build
4. **Staging Deployment**: Deploy with load and e2e tests, canary deployments
5. **Production Deployment**: Canary → Full rollout with automated rollback
6. **Alerts**: Sent via Discord, Email, and SMS
7. **Versioning**: Patch/Minor/Major bumps tracked in `versions.json5`

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

* **Staging Cluster**: for testing, CI, chaos experiments, etc.
* **Production Cluster**: hardened, protected, monitored

## 🧩 Versioning

* Stored in `versions.json5`
* Patch bump script updates the version, creates tags, and publishes releases
* Structured changelogs stored in `docs/changelogs/`

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
\n*Document last updated: 2025, June 7*
