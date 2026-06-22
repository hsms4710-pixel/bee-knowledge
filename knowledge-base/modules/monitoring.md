# monitoring 模块

包含 1 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| PrometheusGenerator | PrometheusGenerator 类 | generateConfig, generateServiceScrapeConfig, generateAlertManagerConfig, generateAlertRules, generateAlertRule... +12 |
| OpenTelemetryGenerator | OpenTelemetryGenerator 类 | generateCollectorConfig, generateNodeIntegration, generatePythonIntegration, record, getRecent... +4 |
| MetricsCollector | MetricsCollector 类 | record, getRecent, getStatistics, percentile, add... +1 |
| LogAggregator | LogAggregator 类 | add, search |

## 接口/类型

- `MonitoringConfig` (17 字段: provider, name, metric, type, id... +12)
- `MonitoredService` (16 字段: name, metric, type, id, timestamp... +11)
- `Metric` (16 字段: name, metric, type, id, timestamp... +11)
- `AlertRule` (16 字段: name, metric, type, id, timestamp... +11)
- `AlertCondition` (16 字段: metric, type, name, id, timestamp... +11)
- `AlertAction` (15 字段: type, name, id, timestamp, throughput... +10)
- `Dashboard` (14 字段: name, id, timestamp, throughput, traceId... +9)
- `DashboardPanel` (14 字段: id, timestamp, throughput, name, traceId... +9)
- `PerformanceMetrics` (14 字段: timestamp, throughput, id, name, traceId... +9)
- `TraceSpan` (13 字段: id, name, traceId, parts, static_configs... +8)
- `SpanEvent` (12 字段: name, traceId, parts, static_configs, otlp... +7)
- `SpanLink` (12 字段: traceId, parts, static_configs, name, otlp... +7)
- `LogEntry` (2 字段: timestamp, string)
- `LogQuery` (1 字段: string)
- `MonitoringProvider` (0 字段: )

## 核心流程

- **节点操作**: 2 个
- **查询**: 6 个

## 依赖

### 内部依赖

- `@opentelemetry/sdk-node`
- `@opentelemetry/exporter-trace-otlp-http`
- `@opentelemetry/exporter-metrics-otlp-http`
- `@opentelemetry/exporter-logs-otlp-http`
- `@opentelemetry/resources`
- `@opentelemetry/semantic-conventions`
