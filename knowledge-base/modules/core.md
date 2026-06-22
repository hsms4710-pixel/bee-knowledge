# core 模块

包含 5 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| Edge | Edge 类 | getDefaultLabel, setProperty, getProperty, toJSON, fromJSON... +1 |
| Graph | Graph 类 | addNode, removeNode, getNode, getNodes, addEdge... +11 |
| ModuleNode | ModuleNode 类 | updateTechStack, addResponsibility, setCodeMapping, setStatus, toJSON... +7 |
| FeatureNode | FeatureNode 类 | addRelatedModule, addAcceptanceCriterion, setStatus, toJSON, fromJSON... +5 |
| TaskNode | TaskNode 类 | start, complete, fail, setStatus, setCodeMapping... +3 |
| GraphSerializer | GraphSerializer 类 | toJSON, fromJSON, toGraphML, fromGraphML, toReactFlow... +2 |

## 接口/类型

- `EdgeConfig` (4 字段: string, id, 1, value)
- `EdgeType` (0 字段: )
- `GraphConfig` (7 字段: string, id, edgesToDelete, result, queue... +2)
- `BaseNodeConfig` (10 字段: string, layer, id, metadata, techStack... +5)

## 核心流程

- **节点操作**: 4 个
- **边操作**: 6 个
- **查询**: 4 个

## 依赖

### 内部依赖

- `./node`
- `./edge`
- `../mcp/types`
- `./graph`
