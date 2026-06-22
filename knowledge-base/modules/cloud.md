# cloud 模块

包含 1 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| TerraformGenerator | TerraformGenerator 类 | generate, generateProvider, generateAWSProvider, generateAzureProvider, generateGCPProvider... +19 |
| PulumiGenerator | PulumiGenerator 类 | generate, generateTypeScript, generatePython, generateStack |
| CDKGenerator | CDKGenerator 类 | generateStack |

## 接口/类型

- `CloudConfig` (11 字段: provider, string, id, environment, enabled... +6)
- `CloudCredentials` (10 字段: string, id, environment, enabled, minInstances... +5)
- `CloudResource` (9 字段: id, environment, enabled, minInstances, schedule... +4)
- `DeploymentConfig` (9 字段: environment, enabled, minInstances, schedule, parts... +4)
- `HealthCheckConfig` (8 字段: enabled, minInstances, schedule, parts, variables... +3)
- `ScalingConfig` (7 字段: minInstances, schedule, parts, variables, outputs... +2)
- `ScheduledScaling` (6 字段: schedule, parts, variables, outputs, language... +1)
- `CloudProvider` (0 字段: )
- `ResourceType` (0 字段: )

## 依赖

### 外部依赖

- `constructs`
