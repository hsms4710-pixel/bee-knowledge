# agent-adapter 模块

包含 8 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| AgentAdapterManager | Agent Adapter Manager - 适配器管理器 | registerAdapter, getAdapter, getRegisteredPlatforms, createAdapter, connectToPlatform... +7 |
| ClaudeCodeAdapter | Claude Code Adapter - Claude Code CLI 适配器 | doInitialize, doConnect, doDisconnect, doCallTool, doListTools... +7 |
| CodeBuddyAdapter | CodeBuddy Adapter - CodeBuddy 内置集成适配器 | doInitialize, doConnect, doDisconnect, doCallTool, doListTools... +11 |
| CodexCLIAdapter | Codex CLI Adapter - OpenAI Codex CLI 适配器 | doInitialize, doConnect, doDisconnect, doCallTool, doListTools... +9 |
| TRAEAdapter | TRAE Adapter - TRAE Agent 适配器 | doInitialize, doConnect, doDisconnect, doCallTool, doListTools... +6 |

## 接口/类型

- `AgentAdapterConfig` (9 字段: platform, jsonrpc, name, content, boolean... +4)
- `MCPRequest` (9 字段: jsonrpc, name, content, boolean, type... +4)
- `MCPNotification` (9 字段: jsonrpc, name, content, boolean, type... +4)
- `ToolCallParams` (8 字段: name, content, boolean, type, id... +3)
- `ToolCallResult` (8 字段: content, boolean, name, type, id... +3)
- `IAgentAdapter` (6 字段: name, type, id, openFiles, platform... +1)
- `MCPTool` (6 字段: name, type, id, openFiles, platform... +1)
- `AgentEventPayload` (5 字段: type, id, openFiles, platform, tools)
- `GraphChange` (5 字段: type, id, openFiles, platform, tools)
- `AgentSession` (4 字段: id, openFiles, platform, tools)
- `SessionContext` (3 字段: openFiles, platform, tools)
- `HealthCheckResult` (2 字段: platform, tools)
- `AgentCapabilities` (2 字段: platform, tools)
- `AgentPlatform` (0 字段: )
- `TransportType` (0 字段: )
- `AgentEvent` (0 字段: )

## 核心流程

- **查询**: 11 个
- **工具**: 12 个

## 依赖

### 内部依赖

- `./types`
- `./AgentAdapterBase`
- `./adapters/ClaudeCodeAdapter`
- `./adapters/CodexCLIAdapter`
- `./adapters/CodeBuddyAdapter`
- `./adapters/TRAEAdapter`
- `../AgentAdapterBase`
- `../types`
