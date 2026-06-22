# Bee Knowledge

基于 MapReduce 架构的项目知识沉淀系统，支持多语言适配器模式。

## 核心特性

- **Map 阶段**: 提取类型、函数、接口、枚举、核心流程
- **Merge 阶段**: 分层合并 (file → submodule → module → architecture)
- **Reduce 阶段**: 生成 Markdown 文档
- **Hash 缓存**: 增量更新
- **适配器模式**: 支持 TypeScript / Go / Proto / 测试用例

## 目录结构

```
bee-knowledge/
├── knowledge-system/         # 核心代码
│   ├── adapters/             # 语言适配器
│   │   ├── typescript.ts
│   │   ├── go.ts
│   │   ├── proto.ts
│   │   └── test.ts
│   ├── base-adapter.ts       # 基类和注册表
│   ├── build.ts              # MapReduce 构建器
│   └── types.ts              # 类型定义
├── scripts/
│   └── build-knowledge-v2.ts # CLI 入口
├── knowledge-base/           # 生成的知识库
│   ├── index.json
│   ├── architecture.md
│   ├── modules/
│   └── tests.md
└── package.json
```

## 使用方法

```bash
# 安装依赖
npm install ts-node typescript

# 构建知识库
npx ts-node scripts/build-knowledge-v2.ts

# 增量构建
npx ts-node scripts/build-knowledge-v2.ts --incremental

# 回顾分析
npx ts-node scripts/build-knowledge-v2.ts --retrospective
```

## 适配器扩展

实现 `LanguageAdapter` 接口即可支持新语言：

```typescript
import { LanguageAdapter, ExtractedType } from '../types';

class MyLanguageAdapter extends BaseAdapter {
  getLanguage(): string { return 'mylang'; }
  
  async extractTypes(content: string, filePath: string): Promise<ExtractedType[]> {
    // 实现类型提取逻辑
    return [];
  }
  // ... 其他方法
}
```

## License

MIT
