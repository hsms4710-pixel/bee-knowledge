# mcp 模块

包含 12 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| ContextTools | ContextTools 类 | setCodeIndexer, queryGraph, getContext, analyzeImpact, getRelated... +2 |
| GDDCommandManager | GDDCommandManager 类 | registerCommands, execute, executeAnalyze, executeBrainstorm, executePlan... +9 |
| GraphStore | GraphStore 类 | createGraph, getGraph, updateGraph, deleteGraph, listGraphs... +13 |
| MCPServer | MCPServer 类 | getTools, createGraph, loadGraph, exportGraph, addNode... +10 |
| NodeTemplateManager | NodeTemplateManager 类 | registerDefaultTemplates, getTemplate, getTemplatesByLayer, getAllTemplates, validateNode... +3 |

## 函数

- `getNodeKind`((node: GraphNode): NodeKind) - MCP Server 类型定义 V2.0
- `isModuleNode`((node: GraphNode): node is ModuleNode) - MCP Server 类型定义 V2.0
- `isFeatureNode`((node: GraphNode): node is FeatureNode)
- `isTaskNode`((node: GraphNode): node is TaskNode)

## 接口/类型

- `GraphQueryInput` (24 字段: graphId, node, target, indirectlyAffected, level... +19)
- `GetContextInput` (24 字段: graphId, node, target, indirectlyAffected, level... +19)
- `ImpactAnalysisInput` (24 字段: graphId, node, target, indirectlyAffected, level... +19)
- `GetRelatedInput` (24 字段: graphId, node, target, indirectlyAffected, level... +19)
- `NodeContext` (23 字段: node, target, indirectlyAffected, level, source... +18)
- `ImpactAnalysisResult` (22 字段: target, indirectlyAffected, level, source, totalCount... +17)
- `RelatedItemsResult` (19 字段: source, totalCount, codeIndexer, nodes, 0... +14)
- `GDDCommandInput` (9 字段: command, success, name, commands, 0... +4)
- `GDDCommandResult` (8 字段: success, name, commands, 0, undefined... +3)
- `GDDCommandDefinition` (7 字段: name, commands, 0, undefined, continue... +2)
- `GDDCommand` (0 字段: )
- `NodeTemplate` (12 字段: layer, optionalProperties, examples, templates, allTemplates... +7)
- `ProjectContext` (21 字段: id, string, createdAt, languages, frameworks... +16)
- `TechStack` (21 字段: languages, frameworks, libraries, name, id... +16)
- `ModuleNode` (18 字段: id, status, string, createdAt, number... +13)
- `FeatureNode` (17 字段: id, string, createdAt, number, TaskNode... +12)
- `TaskNode` (17 字段: id, string, number, createdAt, TaskNode... +12)
- `EdgeData` (13 字段: id, name, graphId, success, graph... +8)
- `GraphData` (13 字段: id, name, graphId, success, graph... +8)
- `CreateGraphInput` (13 字段: name, graphId, id, success, graph... +8)
- `LoadGraphInput` (13 字段: graphId, id, success, graph, content... +8)
- `ExportGraphInput` (13 字段: graphId, id, success, graph, content... +8)
- `AddNodeInput` (13 字段: graphId, id, success, graph, content... +8)
- `UpdateNodeInput` (13 字段: graphId, id, success, graph, content... +8)
- `DeleteNodeInput` (13 字段: graphId, id, success, graph, content... +8)
- `AddEdgeInput` (13 字段: graphId, id, success, graph, content... +8)
- `UpdateContextInput` (13 字段: graphId, id, success, graph, content... +8)
- `ClarificationOption` (13 字段: id, graphId, success, graph, content... +8)
- `ClarificationQuestion` (13 字段: id, graphId, success, graph, content... +8)
- `ClarificationSession` (12 字段: graphId, success, graph, content, node... +7)
- `CreateGraphOutput` (11 字段: graph, content, node, deletedNodeId, edge... +6)
- `LoadGraphOutput` (11 字段: graph, content, node, deletedNodeId, edge... +6)
- `ExportGraphOutput` (10 字段: content, node, deletedNodeId, edge, context... +5)
- `AddNodeOutput` (9 字段: node, deletedNodeId, edge, context, graphId... +4)
- `UpdateNodeOutput` (9 字段: node, deletedNodeId, edge, context, graphId... +4)
- `DeleteNodeOutput` (8 字段: deletedNodeId, edge, context, graphId, tasks... +3)
- `AddEdgeOutput` (7 字段: edge, context, graphId, tasks, type... +2)
- `UpdateContextOutput` (6 字段: context, graphId, tasks, type, name... +1)
- `TaskGenerationRequest` (5 字段: graphId, tasks, type, name, required)
- `TaskGenerationResult` (4 字段: tasks, type, name, required)
- `GraphEvent` (3 字段: type, name, required)
- `MCPServerConfig` (2 字段: name, required)
- `MCPToolDefinition` (2 字段: name, required)
- `LayerType` (0 字段: )
- `ModuleStatus` (0 字段: )
- `FeatureStatus` (0 字段: )
- `TaskType` (0 字段: )
- `TaskStatus` (0 字段: )
- `GraphNode` (0 字段: )
- `NodeKind` (0 字段: )
- `EdgeType` (0 字段: )
- `GraphEventType` (0 字段: )

## 核心流程

- **节点操作**: 13 个
- **边操作**: 3 个
- **查询**: 17 个

## 依赖

### 内部依赖

- `./GraphStore`
- `../indexer/CodeIndexer`
- `./types`
- `./MCPServer`
- `./ContextTools`
- `../brainstorm/SmartBrainstormEngine`
- `../templates/TemplateManager`
- `@modelcontextprotocol/sdk/server/index.js`
- `@modelcontextprotocol/sdk/server/streamableHttp.js`
- `@modelcontextprotocol/sdk/types.js`
- `@modelcontextprotocol/sdk/server/stdio.js`

### 外部依赖

- `express`
- `cors`
- `better-sqlite3`
- `fs`
- `path`
- `uuid`
- `child_process`
