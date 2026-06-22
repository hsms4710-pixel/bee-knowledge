# utils 模块

包含 3 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| GDDError | GDDError 类 | toJSON, handle, logError, tryRecover, report... +6 |
| ErrorHandler | Error Handler - 错误处理和恢复系统 | handle, logError, tryRecover, report, toResponse... +5 |
| PerformanceMonitor | Performance - 性能监控和优化工具 | start, record, getStats, getHistory, slice... +14 |
| PerformanceTimer | Performance - 性能监控和优化工具 | withMetadata, stop, elapsed, getPerformanceMonitor, initPerformanceMonitor... +7 |
| Logger | Logger - 日志系统 | initLogFile, rotateLogFile, getCallerInfo, basename, formatMessage... +11 |

## 函数

- `getErrorHandler`((): ErrorHandler) - Error Handler - 错误处理和恢复系统
- `initErrorHandler`((config?: ErrorHandlerConfig): ErrorHandler) - Error Handler - 错误处理和恢复系统
- `handleError`((error: GDDError | Error, context?: Partial<ErrorContext>) => void)
- `getPerformanceMonitor`((): PerformanceMonitor) - Performance - 性能监控和优化工具
- `initPerformanceMonitor`((config?: Partial<PerformanceConfig>): PerformanceMonitor) - Performance - 性能监控和优化工具
- `getLogger`((): Logger) - Logger - 日志系统
- `initLogger`((config?: Partial<LoggerConfig>): Logger) - Logger - 日志系统

## 接口/类型

- `ErrorContext` (12 字段: operation, code, Logger, globalHandler, TODO... +7)
- `ErrorCategory` (0 字段: )
- `ErrorSeverity` (0 字段: )
- `PerformanceMetrics` (20 字段: name, enabled, count, metricsHistory, return... +15)
- `PerformanceConfig` (20 字段: enabled, count, metricsHistory, return, stats... +15)
- `LoggerConfig` (9 字段: level, logStream, prefix, return, 1... +4)
- `LogLevel` (0 字段: )

## 核心流程

- **查询**: 13 个

## 依赖

### 内部依赖

- `./logger`

### 外部依赖

- `fs`
- `path`
