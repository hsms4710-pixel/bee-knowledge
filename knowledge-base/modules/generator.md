# generator 模块

包含 3 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| CodeGenerator | CodeGenerator 类 | registerDefaultTemplates, getReactComponentTemplate, getApiRouteTemplate, handler, getDatabaseModelTemplate... +10 |
| TopologySorter | TopologySorter 类 | sortByLayers, sortLinear, getParallelGroups, calculateSpeedup, generateReport |

## 接口/类型

- `GenerationOptions` (16 字段: outputDir, success, errors, duration, name... +11)
- `GenerationResult` (16 字段: success, errors, duration, name, templates... +11)
- `CodeTemplate` (13 字段: name, templates, break, id, user... +8)
- `SortResult` (4 字段: layers, currentLayer, 1, totalNodes)

## 核心流程

- **节点操作**: 1 个
- **查询**: 7 个

## 依赖

### 内部依赖

- `../core`
- `./TopologySorter`

### 外部依赖

- `react`
- `next`
- `typeorm`
- `next-auth`
- `next-auth/providers/credentials`
