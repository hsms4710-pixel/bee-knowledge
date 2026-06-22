# ai 模块

包含 1 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| AIError | AI 模块类型定义 |  |
| ProviderError | AI 模块类型定义 |  |
| RateLimitError | AI 模块类型定义 |  |
| EmbeddingError | AI 模块类型定义 |  |
| RAGError | AI 模块类型定义 |  |

## 接口/类型

- `ChatMessage` (28 字段: role, provider, content, model, type... +23)
- `ModelConfig` (27 字段: provider, content, model, type, string... +22)
- `LLMResponse` (27 字段: content, model, type, string, provider... +22)
- `StreamChunk` (27 字段: content, type, string, provider, model... +22)
- `ILLMProvider` (26 字段: type, string, provider, model, object... +21)
- `ProviderConfig` (26 字段: string, provider, type, model, object... +21)
- `EmbeddingModelConfig` (26 字段: provider, type, model, object, id... +21)
- `IEmbeddingProvider` (25 字段: type, model, object, id, source... +20)
- `EmbeddingRequest` (25 字段: model, object, id, source, strategy... +20)
- `EmbeddingResponse` (25 字段: object, model, id, source, strategy... +20)
- `DocumentChunk` (23 字段: id, source, strategy, query, prompt... +18)
- `ChunkMetadata` (22 字段: source, strategy, query, prompt, string... +17)
- `ChunkingConfig` (21 字段: strategy, query, prompt, string, code... +16)
- `IRetriever` (20 字段: query, prompt, string, code, prefix... +15)
- `IRAGService` (20 字段: query, prompt, string, code, prefix... +15)
- `CodeGenerationRequest` (19 字段: prompt, string, code, prefix, type... +14)
- `CodeContext` (18 字段: string, code, prefix, type, score... +13)
- `CodeGenerationResponse` (18 字段: code, prefix, type, score, language... +13)
- `IAICodeGenerator` (18 字段: prefix, code, type, score, language... +13)
- `CodeReviewRequest` (17 字段: code, type, score, language, name... +12)
- `ReviewIssue` (17 字段: type, score, language, code, name... +12)
- `CodeReviewResult` (17 字段: score, language, code, name, tests... +12)
- `IAICodeReviewer` (16 字段: language, code, name, tests, estimatedCoverage... +11)
- `TestGenerationRequest` (15 字段: code, name, tests, estimatedCoverage, functionName... +10)
- `TestCase` (15 字段: name, tests, estimatedCoverage, functionName, type... +10)
- `TestGenerationResponse` (15 字段: tests, estimatedCoverage, functionName, type, string... +10)
- `CoverageAnalysis` (14 字段: estimatedCoverage, functionName, type, string, code... +9)
- `IAITestGenerator` (13 字段: functionName, type, string, code, overallScore... +8)
- `CodeSuggestion` (12 字段: type, string, code, overallScore, suggestions... +7)
- `IAICodeSuggester` (10 字段: code, overallScore, suggestions, defaultProvider, void... +5)
- `CodeQualityReport` (9 字段: overallScore, suggestions, defaultProvider, void, totalRequests... +4)
- `LLMGatewayConfig` (7 字段: defaultProvider, void, totalRequests, totalCost, name... +2)
- `ILLMGateway` (6 字段: void, totalRequests, totalCost, name, variables... +1)
- `UsageStats` (5 字段: totalRequests, totalCost, name, variables, message)
- `CostStats` (4 字段: totalCost, name, variables, message)
- `PromptTemplate` (3 字段: name, variables, message)
- `IPromptBuilder` (2 字段: variables, message)
- `LLMProviderType` (0 字段: )
- `MessageRole` (0 字段: )
- `ChunkingStrategy` (0 字段: )
- `ReviewType` (0 字段: )
- `SuggestionType` (0 字段: )

## 依赖
