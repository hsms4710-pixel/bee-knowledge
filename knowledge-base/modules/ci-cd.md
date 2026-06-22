# ci-cd 模块

包含 1 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| CICDGenerator | CICDGenerator 类 | generateGitHubActions, generateGitLabCI, generateJenkinsfile, generateJenkinsDeclarative, push... +12 |

## 接口/类型

- `CIConfig` (13 字段: platform, type, id, string, name... +8)
- `CITrigger` (12 字段: type, id, string, name, format... +7)
- `CIJob` (12 字段: id, string, name, type, format... +7)
- `CIStep` (12 字段: string, name, type, id, format... +7)
- `CISecret` (11 字段: name, type, id, format, lines... +6)
- `CINotification` (10 字段: type, id, format, lines, break... +5)
- `PipelineStatus` (9 字段: id, format, lines, break, true... +4)
- `JobStatus` (9 字段: id, format, lines, break, true... +4)
- `StepStatus` (9 字段: id, format, lines, break, true... +4)
- `CIPlatform` (0 字段: )

## 依赖
