import { CardProps } from '@/components/Card'

export const ObservabilityCards: CardProps[] = [
  {
    title: 'Observability',
    description: 'Metrics, logs, traces & alerts',
    listItems: [
      { text: 'Prometheus', href: 'https://prometheus.io/', role: 'Metrics Collection' },
      { text: 'Grafana', href: 'https://grafana.com/', role: 'Dashboards & Visualization' },
      { text: 'Jaeger', href: 'https://www.jaegertracing.io/', role: 'Distributed Tracing' },
      { text: 'Loki', href: 'https://grafana.com/oss/loki/', role: 'Log Aggregation' },
      { text: 'Tempo', href: 'https://grafana.com/oss/tempo/', role: 'Tracing Backend' },
      { text: 'Pyroscope', href: 'https://grafana.com/oss/pyroscope/', role: 'Continuous Profiling' },
      { text: 'Alertmanager', href: 'https://prometheus.io/docs/alerting/latest/alertmanager/', role: 'Alert Routing' },
      { text: 'OpenTelemetry', href: 'https://opentelemetry.io/', role: 'Unified Observability Standard' },
    ],
    image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Observability.png',
  },
]
