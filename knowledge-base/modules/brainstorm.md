# brainstorm 模块

包含 7 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| BrainstormEngine | BrainstormEngine 类 | startSession, getSession, endSession, transitionState, getState... +26 |
| ContextAnalyzer | ContextAnalyzer 类 | analyzeFromIndexResult, analyzeFromUserInput, maxComplexity, analyzeLanguages, analyzeFrameworks... +13 |
| QuestionGenerator | QuestionGenerator 类 | generateQuestions, createQuestion, getDependencies, getPriority, filterOptions... +1 |
| SmartBrainstormEngine | SmartBrainstormEngine 类 | startSmartSession, startFromIndexResult, getSession, endSession, transitionState... +33 |
| SmartQuestionGenerator | SmartQuestionGenerator 类 | generateSmartQuestions, generate, getDynamicTemplates, sortTemplatesByPriority, createQuestionFromTemplate... +15 |

## 接口/类型

- `ProjectContext` (19 字段: string, name, totalFiles, category, minConfidence... +14)
- `ArchitecturePattern` (18 字段: name, totalFiles, category, minConfidence, config... +13)
- `DesignPattern` (18 字段: name, totalFiles, category, minConfidence, config... +13)
- `CodeMetrics` (17 字段: totalFiles, category, minConfidence, config, context... +12)
- `InferredRequirement` (16 字段: category, minConfidence, config, context, continue... +11)
- `AnalysisConfig` (15 字段: minConfidence, config, context, continue, true... +10)
- `InferenceRecord` (41 字段: timestamp, autoIndex, SmartGeneratorConfig, config, userInput... +36)
- `SmartGeneratorConfig` (17 字段: enableLLM, provider, type, 0, index... +12)
- `LLMConfig` (16 字段: provider, type, 0, index, config... +11)
- `RequirementAnalysis` (10 字段: rawInput, id, sessionId, timestamp, root... +5)
- `ClarificationOption` (9 字段: id, sessionId, timestamp, root, maxQuestionsPerSession... +4)
- `ClarificationQuestion` (9 字段: id, sessionId, timestamp, root, maxQuestionsPerSession... +4)
- `ClarificationSession` (9 字段: sessionId, timestamp, id, root, maxQuestionsPerSession... +4)
- `SessionHistoryEntry` (8 字段: timestamp, id, root, maxQuestionsPerSession, type... +3)
- `DecisionNode` (7 字段: id, root, maxQuestionsPerSession, type, success... +2)
- `DecisionTree` (7 字段: root, maxQuestionsPerSession, type, success, duration... +2)
- `BrainstormConfig` (6 字段: maxQuestionsPerSession, type, success, duration, id... +1)
- `BrainstormEvent` (5 字段: type, success, duration, id, edges)
- `BrainstormResult` (4 字段: success, duration, id, edges)
- `GraphData` (2 字段: id, edges)
- `BrainstormState` (0 字段: )
- `QuestionType` (0 字段: )
- `BrainstormEventType` (0 字段: )

## 核心流程

- **节点操作**: 6 个
- **查询**: 18 个

## 依赖

### 内部依赖

- `./types`
- `../mcp/types`
- `./QuestionGenerator`
- `../mcp/GraphStore`
- `../indexer/types`
- `./SmartQuestionGenerator`
- `./ContextAnalyzer`
