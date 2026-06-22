/**
 * 知识沉淀系统 - 通用构建脚本
 * 
 * 基于《洛克王国：世界》AI 增效实践的 MapReduce 架构
 * 语言无关的核心实现，通过适配器支持多种语言
 * 
 * @module knowledge-system/build
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import {
  TypeScriptAdapter,
  GoAdapter,
  ProtoAdapter,
  TypeScriptTestAdapter,
  GoTestAdapter,
  AdapterRegistry,
  FileExtractionResult,
  ModuleInfo,
  SubmoduleInfo,
  KnowledgeIndex,
  HashCache,
  TestSuite,
} from './adapters';

// ============================================
// 适配器注册
// ============================================

const registry = new AdapterRegistry();

// 源代码适配器
registry.register(new TypeScriptAdapter());
registry.register(new GoAdapter());
registry.register(new ProtoAdapter());

// 测试适配器
registry.register(new TypeScriptTestAdapter());
registry.register(new GoTestAdapter());

// ============================================
// 配置
// ============================================

interface BuildConfig {
  srcDirs: string[];
  testDirs: string[];
  outputDir: string;
  cacheDir: string;
  exclude: string[];
}

const DEFAULT_CONFIG: BuildConfig = {
  srcDirs: ['src', 'lib', 'pkg'],
  testDirs: ['test', 'tests', '__tests__'],
  outputDir: 'knowledge-base',
  cacheDir: '.knowledge-cache',
  exclude: ['node_modules', 'vendor', 'dist', '.d.ts', '_mock'],
};

// ============================================
// MapReduce 构建器
// ============================================

export class KnowledgeBuilder {
  private config: BuildConfig;
  
  constructor(config?: Partial<BuildConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * 构建知识库
   */
  async build(projectRoot: string, fullRebuild: boolean = false): Promise<KnowledgeIndex> {
    const srcDir = path.resolve(projectRoot);
    const outputDir = path.resolve(srcDir, this.config.outputDir);
    const cacheDir = path.resolve(srcDir, this.config.cacheDir);
    
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 加载缓存
    const oldCache = fullRebuild ? undefined : this.loadHashCache(cacheDir);
    const newCache: HashCache = {
      fileHashes: oldCache?.fileHashes || {},
      moduleHashes: oldCache?.moduleHashes || {},
      lastUpdate: new Date().toISOString(),
    };
    
    // 收集所有文件
    const sourceFiles = this.collectFiles(srcDir, this.config.srcDirs, this.config.exclude);
    const testFiles = this.collectFiles(srcDir, this.config.testDirs, this.config.exclude);
    
    console.log(`📚 知识沉淀系统（MapReduce 架构）`);
    console.log(`📂 项目: ${srcDir}`);
    console.log(`${fullRebuild ? '🔄 完整构建' : '⚡ 增量构建'}\n`);
    
    // ==========================================
    // Map 阶段：提取文件信息
    // ==========================================
    console.log('🔍 Map 阶段：提取文件信息...');
    
    const fileExtractions = new Map<string, FileExtractionResult>();
    let processedCount = 0;
    let changedCount = 0;
    
    for (const filePath of sourceFiles) {
      const relativePath = path.relative(srcDir, filePath);
      const currentHash = this.computeFileHash(filePath);
      newCache.fileHashes[filePath] = currentHash;
      
      const oldHash = oldCache?.fileHashes[filePath];
      const needsProcessing = fullRebuild || !oldHash || oldHash !== currentHash;
      
      if (needsProcessing) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const adapter = registry.findForFile(filePath);
        
        if (adapter) {
          // 设置源码目录
          const srcBaseDir = this.findSrcBaseDir(filePath, srcDir);
          if (srcBaseDir) {
            (adapter as any).setSrcDir(srcBaseDir);
          }
          
          const extraction = adapter.extract(content, filePath);
          fileExtractions.set(filePath, extraction);
          processedCount++;
          changedCount++;
          console.log(`   ✓ ${relativePath} [${adapter.language}]`);
        } else {
          console.log(`   ⊘ ${relativePath} (不支持的语言)`);
        }
      }
    }
    
    console.log(`   处理了 ${processedCount} 个文件${changedCount > 0 ? ` (${changedCount} 个变更)` : ''}\n`);
    
    // ==========================================
    // Merge 阶段：分层合并
    // ==========================================
    console.log('🔄 Merge 阶段：分层合并...');
    
    // 按模块分组
    const moduleFiles = new Map<string, Map<string, FileExtractionResult[]>>();
    
    for (const [filePath, extraction] of fileExtractions) {
      const module = extraction.module;
      const submodule = this.getSubmodule(extraction, filePath, srcDir);
      
      if (!moduleFiles.has(module)) {
        moduleFiles.set(module, new Map());
      }
      
      const submoduleMap = moduleFiles.get(module)!;
      if (!submoduleMap.has(submodule)) {
        submoduleMap.set(submodule, []);
      }
      
      submoduleMap.get(submodule)!.push(extraction);
    }
    
    // 第一层：文件 → 子模块
    const submodules = new Map<string, SubmoduleInfo[]>();
    
    for (const [moduleName, submoduleMap] of moduleFiles) {
      const moduleSubmodules: SubmoduleInfo[] = [];
      
      for (const [submoduleName, files] of submoduleMap) {
        const submodule = this.mergeSubmodule(files, submoduleName, moduleName);
        moduleSubmodules.push(submodule);
        
        newCache.moduleHashes[`${moduleName}/${submoduleName}`] = 
          this.computeStringHash(JSON.stringify(submodule));
      }
      
      submodules.set(moduleName, moduleSubmodules);
      console.log(`   ✓ ${moduleName} (${moduleSubmodules.length} 个子模块)`);
    }
    
    // 第二层：子模块 → 模块
    const modules: ModuleInfo[] = [];
    
    for (const [moduleName, submodulesList] of submodules) {
      const module = this.mergeModule(submodulesList, moduleName);
      modules.push(module);
      console.log(`      → 合并为 ${moduleName} 模块 (${module.types.length} 类型, ${module.functions.length} 函数)`);
    }
    
    console.log(`   生成了 ${modules.length} 个模块\n`);
    
    // ==========================================
    // 测试用例处理
    // ==========================================
    if (testFiles.length > 0) {
      console.log('🧪 Map 阶段：提取测试用例信息...');
      console.log(`   找到 ${testFiles.length} 个测试文件`);
      
      const testExtractions: FileExtractionResult[] = [];
      
      for (const filePath of testFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const adapter = registry.findForFile(filePath);
        
        if (adapter) {
          const extraction = adapter.extract(content, filePath);
          testExtractions.push(extraction);
        }
      }
      
      // 合并测试用例
      console.log('   合并测试用例...');
      const testSuites = this.mergeTests(testExtractions);
      
      // 生成测试文档
      const testsMarkdown = this.generateTestsMarkdown(testSuites);
      fs.writeFileSync(path.join(outputDir, 'tests.md'), testsMarkdown);
      console.log(`   ✓ tests.md (${testSuites.length} 个测试集)\n`);
    }
    
    // ==========================================
    // Reduce 阶段：生成文档
    // ==========================================
    console.log('📝 Reduce 阶段：生成文档...');
    
    const modulesDir = path.join(outputDir, 'modules');
    if (!fs.existsSync(modulesDir)) {
      fs.mkdirSync(modulesDir, { recursive: true });
    }
    
    for (const module of modules) {
      const markdown = this.generateModuleMarkdown(module);
      const outputPath = path.join(modulesDir, `${module.module}.md`);
      fs.writeFileSync(outputPath, markdown);
      console.log(`   ✓ ${module.module}.md`);
    }
    
    // 生成索引
    const index = this.generateIndex(modules, testFiles.length > 0 ? testSuites.length : 0);
    fs.writeFileSync(path.join(outputDir, 'index.json'), JSON.stringify(index, null, 2));
    console.log('   ✓ index.json');
    
    // 生成架构文档
    fs.writeFileSync(
      path.join(outputDir, 'architecture.md'),
      this.generateArchitectureMarkdown(modules)
    );
    console.log('   ✓ architecture.md\n');
    
    // 保存缓存
    this.saveHashCache(cacheDir, newCache);
    
    // ==========================================
    // 统计输出
    // ==========================================
    console.log('✅ 知识库构建完成！');
    console.log('');
    console.log('📊 统计信息：');
    console.log(`   - 源文件: ${sourceFiles.length}`);
    console.log(`   - 测试文件: ${testFiles.length}`);
    console.log(`   - 模块数量: ${modules.length}`);
    console.log(`   - 类型总数: ${index.statistics.totalTypes}`);
    console.log(`   - 函数总数: ${index.statistics.totalFunctions}`);
    console.log(`   - 枚举总数: ${index.statistics.totalEnums}`);
    console.log(`   - 输出目录: ${outputDir}`);
    
    return index;
  }
  
  // ============================================
  // Map 阶段辅助方法
  // ============================================
  
  private collectFiles(
    srcDir: string,
    targetDirs: string[],
    exclude: string[]
  ): string[] {
    const files: string[] = [];
    
    // 扫描目标目录
    for (const targetDir of targetDirs) {
      const dirPath = path.join(srcDir, targetDir);
      
      if (fs.existsSync(dirPath)) {
        this.walkDir(dirPath, exclude, files);
      }
    }
    
    // 如果目标目录没有找到文件，扫描整个项目
    if (files.length === 0) {
      console.log('   ℹ️  未在标准目录找到文件，扫描整个项目...');
      this.walkDir(srcDir, exclude, files);
    }
    
    return files.filter(f => registry.findForFile(f));
  }
  
  private walkDir(dir: string, exclude: string[], files: string[]): void {
    if (!fs.statSync(dir).isDirectory()) return;
    
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      // 检查是否在排除列表中
      if (exclude.some(e => entry === e || entry.endsWith(e))) {
        continue;
      }
      
      if (stat.isDirectory()) {
        this.walkDir(fullPath, exclude, files);
      } else if (registry.findForFile(fullPath)) {
        files.push(fullPath);
      }
    }
  }
  
  private findSrcBaseDir(filePath: string, projectRoot: string): string | null {
    const relativePath = path.relative(projectRoot, filePath);
    const parts = relativePath.split(path.sep);
    
    // 查找 src/lib/pkg 等目录
    for (const part of parts) {
      if (['src', 'lib', 'pkg', 'internal', 'cmd'].includes(part)) {
        return path.join(projectRoot, part);
      }
    }
    
    return projectRoot;
  }
  
  private getSubmodule(extraction: FileExtractionResult, filePath: string, srcDir: string): string {
    const relativePath = path.relative(srcDir, filePath);
    const parts = relativePath.split(path.sep);
    
    // 返回二级目录作为子模块
    return parts.length > 1 ? parts[1] : parts[0] || 'root';
  }
  
  private computeFileHash(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }
  
  private computeStringHash(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
  }
  
  // ============================================
  // Merge 阶段辅助方法
  // ============================================
  
  private mergeSubmodule(
    files: FileExtractionResult[],
    submodule: string,
    module: string
  ): SubmoduleInfo {
    const typeMap = new Map<string, any>();
    const functionMap = new Map<string, any>();
    const enumMap = new Map<string, any>();
    
    const mergedFlows = this.createEmptyCoreFlows();
    const allInternalDeps = new Set<string>();
    const allExternalDeps = new Set<string>();
    
    for (const file of files) {
      // 合并类型
      for (const type of file.types) {
        if (!typeMap.has(type.name)) {
          typeMap.set(type.name, type);
        }
      }
      
      // 合并函数
      for (const fn of file.functions) {
        if (!functionMap.has(fn.name)) {
          functionMap.set(fn.name, fn);
        }
      }
      
      // 合并枚举
      for (const en of file.enums) {
        if (!enumMap.has(en.name)) {
          enumMap.set(en.name, en);
        }
      }
      
      // 合并核心流程
      for (const [key, values] of Object.entries(file.coreFlows)) {
        const existing = (mergedFlows as any)[key] || [];
        (mergedFlows as any)[key] = [...new Set([...existing, ...(values || [])])];
      }
      
      // 合并依赖
      file.dependencies.internal.forEach(d => allInternalDeps.add(d));
      file.dependencies.external.forEach(d => allExternalDeps.add(d));
    }
    
    return {
      submodule,
      module,
      files: files.map(f => f.file),
      types: [...typeMap.values()],
      functions: [...functionMap.values()],
      enums: [...enumMap.values()],
      coreFlows: mergedFlows,
      dependencies: {
        internal: [...allInternalDeps],
        external: [...allExternalDeps],
      },
      language: files[0]?.language || 'unknown',
    };
  }
  
  private mergeModule(submodules: SubmoduleInfo[], moduleName: string): ModuleInfo {
    const typeMap = new Map<string, any>();
    const functionMap = new Map<string, any>();
    const enumMap = new Map<string, any>();
    
    const mergedFlows = this.createEmptyCoreFlows();
    const allInternalDeps = new Set<string>();
    const allExternalDeps = new Set<string>();
    
    for (const submodule of submodules) {
      // 合并类型
      for (const type of submodule.types) {
        if (!typeMap.has(type.name)) {
          typeMap.set(type.name, type);
        }
      }
      
      // 合并函数
      for (const fn of submodule.functions) {
        if (!functionMap.has(fn.name)) {
          functionMap.set(fn.name, fn);
        }
      }
      
      // 合并枚举
      for (const en of submodule.enums) {
        if (!enumMap.has(en.name)) {
          enumMap.set(en.name, en);
        }
      }
      
      // 合并核心流程
      for (const [key, values] of Object.entries(submodule.coreFlows)) {
        const existing = (mergedFlows as any)[key] || [];
        (mergedFlows as any)[key] = [...new Set([...existing, ...(values || [])])];
      }
      
      // 合并依赖
      submodule.dependencies.internal.forEach(d => allInternalDeps.add(d));
      submodule.dependencies.external.forEach(d => allExternalDeps.add(d));
    }
    
    return {
      module: moduleName,
      files: submodules.flatMap(s => s.files),
      types: [...typeMap.values()],
      functions: [...functionMap.values()],
      enums: [...enumMap.values()],
      coreFlows: mergedFlows,
      dependencies: {
        internal: [...allInternalDeps],
        external: [...allExternalDeps],
      },
      language: submodules[0]?.language || 'unknown',
    };
  }
  
  private mergeTests(testExtractions: FileExtractionResult[]): TestSuite[] {
    const suites = new Map<string, TestInfo[]>();
    
    for (const extraction of testExtractions) {
      const suiteName = extraction.module;
      
      if (!suites.has(suiteName)) {
        suites.set(suiteName, []);
      }
      
      suites.get(suiteName)!.push({
        name: extraction.file.replace(/\.(test|spec)\.[tj]s/, ''),
        file: extraction.file,
        flows: extraction.coreFlows,
        features: extraction.types.map(t => t.function),
        testObjects: extraction.functions.map(f => f.name),
        edgeCases: [],
      });
    }
    
    return Array.from(suites.entries()).map(([name, tests]) => ({
      name,
      tests,
    }));
  }
  
  private createEmptyCoreFlows() {
    return {
      initialization: [],
      stateTransitions: [],
      networkOperations: [],
      eventHandlers: [],
      persistence: [],
      other: [],
    };
  }
  
  // ============================================
  // Reduce 阶段辅助方法
  // ============================================
  
  private generateModuleMarkdown(module: ModuleInfo): string {
    const lines: string[] = [];
    
    lines.push(`# ${module.module}`);
    lines.push('');
    lines.push(`> 语言: ${module.language} | 文件数: ${module.files.length}`);
    lines.push('');
    
    // 类型
    if (module.types.length > 0) {
      lines.push('## 类型');
      lines.push('');
      
      for (const type of module.types) {
        lines.push(`### ${type.name}`);
        lines.push('');
        lines.push(`- 功能: ${type.function}`);
        
        if (type.fields.length > 0) {
          lines.push(`- 字段: ${type.fields.join(', ')}`);
        }
        
        if (type.methods?.length > 0) {
          lines.push(`- 方法: ${type.methods.join(', ')}`);
        }
        
        lines.push('');
      }
    }
    
    // 函数
    if (module.functions.length > 0) {
      lines.push('## 函数');
      lines.push('');
      
      for (const fn of module.functions) {
        lines.push(`### ${fn.name}`);
        lines.push('');
        lines.push(`- 签名: \`${fn.signature}\``);
        
        if (fn.description) {
          lines.push(`- 描述: ${fn.description}`);
        }
        
        lines.push('');
      }
    }
    
    // 枚举
    if (module.enums.length > 0) {
      lines.push('## 枚举');
      lines.push('');
      
      for (const en of module.enums) {
        lines.push(`### ${en.name}`);
        lines.push('');
        lines.push(`- 成员: ${en.members.join(', ')}`);
        lines.push('');
      }
    }
    
    // 核心流程
    if (Object.values(module.coreFlows).some(v => v?.length > 0)) {
      lines.push('## 核心流程');
      lines.push('');
      
      if (module.coreFlows.initialization?.length > 0) {
        lines.push('### 初始化');
        lines.push('');
        lines.push(module.coreFlows.initialization.map(f => `- ${f}`).join('\n'));
        lines.push('');
      }
      
      if (module.coreFlows.stateTransitions?.length > 0) {
        lines.push('### 状态转化');
        lines.push('');
        lines.push(module.coreFlows.stateTransitions.map(f => `- ${f}`).join('\n'));
        lines.push('');
      }
      
      if (module.coreFlows.networkOperations?.length > 0) {
        lines.push('### 网络操作');
        lines.push('');
        lines.push(module.coreFlows.networkOperations.map(f => `- ${f}`).join('\n'));
        lines.push('');
      }
      
      if (module.coreFlows.persistence?.length > 0) {
        lines.push('### 持久化');
        lines.push('');
        lines.push(module.coreFlows.persistence.map(f => `- ${f}`).join('\n'));
        lines.push('');
      }
    }
    
    // 依赖
    if (module.dependencies.internal.length > 0 || module.dependencies.external.length > 0) {
      lines.push('## 依赖');
      lines.push('');
      
      if (module.dependencies.internal.length > 0) {
        lines.push('### 内部依赖');
        lines.push('');
        lines.push(module.dependencies.internal.map(d => `- ${d}`).join('\n'));
        lines.push('');
      }
      
      if (module.dependencies.external.length > 0) {
        lines.push('### 外部依赖');
        lines.push('');
        lines.push(module.dependencies.external.map(d => `- ${d}`).join('\n'));
        lines.push('');
      }
    }
    
    return lines.join('\n');
  }
  
  private generateTestsMarkdown(testSuites: TestSuite[]): string {
    const lines: string[] = [];
    
    lines.push('# 测试用例知识库');
    lines.push('');
    lines.push(`> 共 ${testSuites.length} 个测试集`);
    lines.push('');
    
    for (const suite of testSuites) {
      lines.push(`## ${suite.name}`);
      lines.push('');
      
      for (const test of suite.tests) {
        lines.push(`### ${test.name}`);
        lines.push('');
        
        if (test.flows.setup?.length > 0) {
          lines.push('**Setup:**');
          lines.push(test.flows.setup.map(s => `- ${s}`).join('\n'));
          lines.push('');
        }
        
        if (test.flows.actions?.length > 0) {
          lines.push('**Actions:**');
          lines.push(test.flows.actions.map(a => `- ${a}`).join('\n'));
          lines.push('');
        }
        
        if (test.flows.assertions?.length > 0) {
          lines.push('**Assertions:**');
          lines.push(test.flows.assertions.map(a => `- ${a}`).join('\n'));
          lines.push('');
        }
        
        if (test.features.length > 0) {
          lines.push('**Features:**');
          lines.push(test.features.map(f => `- ${f}`).join('\n'));
          lines.push('');
        }
      }
    }
    
    return lines.join('\n');
  }
  
  private generateIndex(modules: ModuleInfo[], testCount: number): KnowledgeIndex {
    return {
      generatedAt: new Date().toISOString(),
      projectName: path.basename(process.cwd()),
      languages: [...new Set(modules.map(m => m.language))],
      modules: modules.map(m => ({
        name: m.module,
        language: m.language,
        typeCount: m.types.length,
        functionCount: m.functions.length,
        enumCount: m.enums.length,
      })),
      statistics: {
        totalFiles: modules.reduce((sum, m) => sum + m.files.length, 0),
        totalTypes: modules.reduce((sum, m) => sum + m.types.length, 0),
        totalFunctions: modules.reduce((sum, m) => sum + m.functions.length, 0),
        totalEnums: modules.reduce((sum, m) => sum + m.enums.length, 0),
      },
    };
  }
  
  private generateArchitectureMarkdown(modules: ModuleInfo[]): string {
    const lines: string[] = [];
    
    lines.push('# 架构总览');
    lines.push('');
    lines.push(`## 模块列表 (${modules.length} 个)`);
    lines.push('');
    
    // 按语言分组
    const byLanguage = new Map<string, ModuleInfo[]>();
    
    for (const module of modules) {
      if (!byLanguage.has(module.language)) {
        byLanguage.set(module.language, []);
      }
      byLanguage.get(module.language)!.push(module);
    }
    
    for (const [language, langModules] of byLanguage) {
      lines.push(`### ${language.toUpperCase()} 模块`);
      lines.push('');
      lines.push('| 模块 | 类型 | 函数 | 枚举 |');
      lines.push('|------|------|------|------|');
      
      for (const module of langModules) {
        lines.push(`| ${module.module} | ${module.types.length} | ${module.functions.length} | ${module.enums.length} |`);
      }
      
      lines.push('');
    }
    
    // 模块依赖关系
    lines.push('## 模块依赖关系');
    lines.push('');
    
    for (const module of modules) {
      if (module.dependencies.internal.length > 0) {
        lines.push(`### ${module.module} 依赖`);
        lines.push('');
        lines.push(module.dependencies.internal.map(d => `- ${module.module} → ${d}`).join('\n'));
        lines.push('');
      }
    }
    
    return lines.join('\n');
  }
  
  // ============================================
  // 缓存管理
  // ============================================
  
  private loadHashCache(cacheDir: string): HashCache | undefined {
    const cacheFile = path.join(cacheDir, 'hash-cache.json');
    
    if (fs.existsSync(cacheFile)) {
      try {
        return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      } catch {
        return undefined;
      }
    }
    
    return undefined;
  }
  
  private saveHashCache(cacheDir: string, cache: HashCache): void {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(cacheDir, 'hash-cache.json'),
      JSON.stringify(cache, null, 2)
    );
  }
}

// ============================================
// CLI 入口
// ============================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || '--incremental';
  const projectRoot = args[1] || process.cwd();
  
  const builder = new KnowledgeBuilder();
  
  switch (command) {
    case '--full':
      await builder.build(projectRoot, true);
      break;
    case '--incremental':
      await builder.build(projectRoot, false);
      break;
    default:
      console.log('📚 知识沉淀系统（语言无关版）');
      console.log('');
      console.log('用法:');
      console.log('  npx ts-node scripts/build-knowledge-v2.ts [选项] [项目路径]');
      console.log('');
      console.log('选项:');
      console.log('  --full       完整构建');
      console.log('  --incremental 增量构建（默认）');
  }
}

main().catch(console.error);
