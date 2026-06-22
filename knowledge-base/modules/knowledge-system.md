# knowledge-system

> 语言: typescript | 文件数: 8

## 类型

### GoAdapter

- 功能: 知识沉淀系统 - Go 适配器
- 方法: readFile

### ProtoAdapter

- 功能: 知识沉淀系统 - Protocol Buffers 适配器
- 方法: readFile

### TypeScriptTestAdapter

- 功能: 知识沉淀系统 - 测试用例适配器
- 字段: name, flows, features, testObjects, edgeCases, setup, features
- 方法: extractTestInfo, extractSetupActions

### GoTestAdapter

- 功能: 知识沉淀系统 - 测试用例适配器
- 字段: name, flows, features, testObjects, edgeCases, setup, features
- 方法: extractTestInfo

### TypeScriptAdapter

- 功能: 知识沉淀系统 - TypeScript 适配器
- 方法: readFile

### AdapterRegistry

- 功能: 知识沉淀系统 - 语言适配器基类

### KnowledgeBuilder

- 功能: 类 KnowledgeBuilder
- 字段: fileHashes
- 方法: build, collectFiles, walkDir, findSrcBaseDir, getSubmodule, computeFileHash, computeStringHash, mergeSubmodule

### ExtractedType

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: name, function, fields

### ExtractedFunction

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: name, signature

### ExtractedEnum

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: name, members

### ExtractedCoreFlows

- 功能: 知识沉淀系统 - 通用类型定义

### JSDocInfo

- 功能: 知识沉淀系统 - 通用类型定义

### ExtractedDependencies

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: internal, external

### FileExtractionResult

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: file, module, fileType, language, types, functions, enums, coreFlows, dependencies

### LanguageAdapter

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: language, extensions, fileType

### ModuleInfo

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: module, files, types, functions, enums, coreFlows, dependencies, language

### KnowledgeIndex

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: generatedAt, projectName, languages, modules, name, language, typeCount, functionCount, enumCount

### HashCache

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: fileHashes, moduleHashes, lastUpdate

### TestInfo

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: name, file, flows

### TestSuite

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: name, tests

### RetrospectiveRecord

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: question, expectedAnswer

### RetrospectiveConfig

- 功能: 知识沉淀系统 - 通用类型定义
- 字段: dimensions, rootCauseAccuracy, moduleLocationAccuracy, logExplanationAccuracy, codeFixApplicability

## 依赖

### 内部依赖

- types
- adapters
