# indexer 模块

包含 5 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| CodeIndexer | CodeIndexer 类 | index, analyzeProjectStructure, scanDirectory, findPackageJson, findPythonDependencies... +20 |
| FrameworkAnalyzer | FrameworkAnalyzer 类 | analyze, scoreFrameworks, rankFrameworks, extractFrameworkFeatures, extractFeatures... +2 |
| IncrementalIndexer | IncrementalIndexer 类 | loadCache, saveCache, computeHash, getFileStatus, collectFiles... +6 |
| PythonEnhancer | PythonEnhancer 类 | analyzeProject, analyzePythonFiles, scanForPythonFiles, shouldSkipFile, analyzePythonFile... +7 |

## 接口/类型

- `IndexResult` (30 字段: graphId, path, name, id, filesScanned... +25)
- `FileAnalysis` (30 字段: path, name, id, filesScanned, graphId... +25)
- `DependencyInfo` (30 字段: name, id, filesScanned, graphId, complete... +25)
- `IndexedNode` (30 字段: id, filesScanned, graphId, complete, files... +25)
- `IndexedEdge` (30 字段: id, filesScanned, graphId, complete, files... +25)
- `IndexSummary` (29 字段: filesScanned, graphId, complete, files, continue... +24)
- `FrameworkType` (13 字段: name, main, FRAMEWORK_PATTERNS, importScore, 2... +8)
- `FrameworkFeature` (13 字段: name, main, FRAMEWORK_PATTERNS, importScore, 2... +8)
- `ProjectFrameworks` (12 字段: main, FRAMEWORK_PATTERNS, importScore, 2, 3... +7)
- `FileCacheEntry` (10 字段: filePath, version, added, value, cache... +5)
- `IndexCache` (9 字段: version, added, value, cache, cacheData... +4)
- `IncrementalIndexResult` (8 字段: added, value, cache, cacheData, null... +3)
- `PythonSymbol` (21 字段: name, path, module, framework, lines... +16)
- `ParameterInfo` (21 字段: name, path, module, framework, lines... +16)
- `PythonFileAnalysis` (21 字段: path, module, framework, lines, projectPath... +16)
- `ImportInfo` (20 字段: module, framework, lines, projectPath, files... +15)
- `FrameworkHint` (19 字段: framework, lines, projectPath, files, pythonFiles... +14)
- `CodeMetrics` (19 字段: lines, framework, projectPath, files, pythonFiles... +14)
- `FrameworkAnalysis` (18 字段: framework, projectPath, files, pythonFiles, analyses... +13)
- `CodeIndexResult` (4 字段: files, path, name, totalFiles)

## 核心流程

- **节点操作**: 1 个
- **查询**: 7 个

## 依赖

### 内部依赖

- `./PythonEnhancer`

### 外部依赖

- `crypto`
