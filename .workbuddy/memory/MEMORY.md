# Graph-Driven Development 项目记忆

## 项目概述

**名称**: Graph-Driven Development (GDD)  
**类型**: 基于图的开发驱动系统  
**目标**: 为 Coding Agents 提供项目感知能力，支持可视化图编辑、AI 集成和 MCP 工具

## 技术栈

- **语言**: TypeScript
- **框架**: React
- **构建**: Vite
- **状态管理**: Zustand
- **AI 集成**: MCP 协议

## 核心模块

| 模块 | 功能 | 位置 |
|------|------|------|
| core | 图数据结构（Graph/Node/Edge） | src/core/ |
| mcp | MCP 工具实现 | src/mcp/ |
| components | UI 组件 | src/components/ |
| editor | 图编辑器 | src/editor/ |
| ai | AI 集成 | src/ai/ |
| agent-adapter | Agent 适配器（Claude/Codex/CodeBuddy） | src/agent-adapter/ |
| enterprise | 企业级功能 | src/enterprise/ |

## 项目知识库

**位置**: `knowledge-base/`  
**构建命令**: `npx ts-node scripts/build-knowledge.ts --incremental`

知识库采用 MapReduce 架构，从源代码中提取结构化知识：
- `index.json` - 项目索引
- `architecture.md` - 架构总览
- `modules/*.md` - 模块详情

**AI 助手使用顺序**:
1. 先读本文件了解项目背景
2. 再读 `knowledge-base/index.json` 了解代码结构
3. 根据任务读取具体模块文档
4. 最后读源代码获取实现细节

## 开发规范

- 模块采用 TypeScript 严格模式
- 导出 API 需要有 JSDoc 注释
- 代码变更后运行知识库更新命令

## 相关文档

- `docs/项目知识沉淀方案.md` - 知识库设计文档
- `docs/知识库使用指南.md` - AI 助手使用指南
- `docs/洛克王国AI增效实践总结.md` - 参考实践

---

*最后更新: 2026-06-22*
