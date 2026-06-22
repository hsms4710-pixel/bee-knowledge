/**
 * 知识沉淀系统 - 主构建脚本
 * 基于 MapReduce 架构，从源代码和测试用例中提取结构化知识
 * 
 * 设计参考：《洛克王国：世界》AI 增效实践
 * 
 * Map 阶段提取内容（严格对齐原文）：
 * - 类名、类功能
 * - 函数主要功能
 * - 涉及的模块（依赖）
 * - 接口/类型定义（对应"协议"）
 * - 枚举类型
 * - 核心流程（导出 API）
 * - 测试用例（游戏流程、功能特性、边缘情况）
 * 
 * @file build-knowledge.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ============================================
// 类型定义（严格对齐原文）
// ============================================

interface JSDocInfo {
  description?: string;
  params?: Array<{ name: string; description?: string }>;
  returns?: string;
  example?: string;
}

interface FileInfo {
  file: string;
  module: string;
  classes: ClassInfo[];
  functions: FunctionInfo[];
  interfaces: TypeInfo[];
  enums: EnumInfo[];
  coreFlows: CoreFlowInfo;
  dependencies: {
    internal: string[];
    external: string[];
  };
}

interface ClassInfo {
  name: string;
  function: string;
  methods: string[];
  properties: string[];
  jsdoc?: JSDocInfo;
  sourceFiles?: string[];
}

interface FunctionInfo {
  name: string;
  signature: string;
  description?: string;
  jsdoc?: JSDocInfo;
  sourceFiles?: string[];
}

interface TypeInfo {
  name: string;
  fields: string[];
}

interface EnumInfo {
  name: string;
  members: string[];
}

interface CoreFlowInfo {
  nodeOperations?: string[];
  edgeOperations?: string[];
  queries?: string[];
  tools?: string[];
  other?: string[];
}

interface ModuleInfo {
  module: string;
  files: string[];
  classes: ClassInfo[];
  functions: FunctionInfo[];
  interfaces: TypeInfo[];
  enums: EnumInfo[];
  coreFlows: CoreFlowInfo;
  dependencies: {
    internal: string[];
    external: string[];
  };
}

interface SubmoduleInfo extends ModuleInfo {
  submodule: string;
}

interface TestInfo {
  file: string;
  name?: string;
  description?: string;
  testFlows?: TestFlowInfo;
  gameObjects?: string[];
  interactions?: string[];
  features?: string[];
  edgeCases?: string[];
}

interface TestFlowInfo {
  setup?: string[];
  actions?: string[];
  assertions?: string[];
}

interface KnowledgeIndex {
  version: string;
  lastUpdated: string;
  project: {
    name: string;
    description: string;
  };
  modules: Array<{
    name: string;
    path: string;
    fileCount: number;
    classCount: number;
    functionCount: number;
    interfaceCount: number;
  }>;
  tests?: {
    totalCount: number;
    testFiles: number;
    path: string;
  };
}

interface HashCache {
  fileHashes: Record<string, string>;
  moduleHashes: Record<string, string>;
  testHashes: Record<string, string>;
  lastUpdate: string;
}

interface RetrospectiveMetrics {
  rootCauseAccuracy?: number;
  moduleLocationAccuracy?: number;
  logExplanationAccuracy?: number;
  codeFixApplicability?: number;
}

interface RetrospectiveRecord {
  id: string;
  timestamp: string;
  question: string;
  expectedAnswer: string;
  actualAnswer: string;
  metrics: RetrospectiveMetrics;
  status: 'pending' | 'evaluated' | 'passed' | 'failed';
}

interface RetrospectiveConfig {
  enabled: boolean;
  evaluationDimensions: {
    rootCauseAccuracy: { weight: number; threshold: number };
    moduleLocationAccuracy: { weight: number; threshold: number };
    logExplanationAccuracy: { weight: number; threshold: number };
    codeFixApplicability: { weight: number; threshold: number };
  };
}

// ============================================
// 配置
// ============================================

const CONFIG = {
  srcDir: 'src',
  testDir: 'test',
  outputDir: 'knowledge-base',
  cacheDir: '.knowledge-cache',
  extensions: ['.ts', '.tsx'],
  testExtensions: ['.ts'],
  exclude: ['node_modules', 'dist', '.d.ts', '.test.ts', '.spec.ts'],
  testExclude: ['node_modules', 'dist', '.d.ts'],
};

// ============================================
// Hash 工具函数
// ============================================

function computeFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function computeStringHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function loadHashCache(): HashCache | null {
  const cacheFile = path.join(CONFIG.cacheDir, 'hash-cache.json');
  if (fs.existsSync(cacheFile)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

function saveHashCache(cache: HashCache): void {
  if (!fs.existsSync(CONFIG.cacheDir)) {
    fs.mkdirSync(CONFIG.cacheDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(CONFIG.cacheDir, 'hash-cache.json'),
    JSON.stringify(cache, null, 2)
  );
}

// ============================================
// 文件扫描
// ============================================

function scanSourceFiles(srcDir: string): string[] {
  const files: string[] = [];
  
  function scanDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!CONFIG.exclude.includes(entry.name)) {
          scanDir(path.join(currentDir, entry.name));
        }
      } else if (entry.isFile()) {
        const filePath = path.join(currentDir, entry.name);
        const ext = path.extname(entry.name);
        const baseName = entry.name;
        
        if (
          CONFIG.extensions.includes(ext) &&
          !CONFIG.exclude.some(pattern => baseName.includes(pattern))
        ) {
          files.push(filePath);
        }
      }
    }
  }
  
  scanDir(srcDir);
  return files;
}

function scanTestFiles(testDir: string): string[] {
  const files: string[] = [];
  
  function scanDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!CONFIG.testExclude.includes(entry.name)) {
          scanDir(path.join(currentDir, entry.name));
        }
      } else if (entry.isFile()) {
        const filePath = path.join(currentDir, entry.name);
        const ext = path.extname(entry.name);
        
        if (CONFIG.testExtensions.includes(ext)) {
          files.push(filePath);
        }
      }
    }
  }
  
  if (fs.existsSync(testDir)) {
    scanDir(testDir);
  }
  return files;
}

function getModuleName(filePath: string, srcDir: string): string {
  const relativePath = path.relative(srcDir, filePath);
  const parts = relativePath.split(path.sep);
  return parts[0] || 'root';
}

// ============================================
// JSDoc 提取
// ============================================

function extractJSDocFull(content: string, position: number): JSDocInfo | undefined {
  const before = content.slice(0, position);
  const match = before.match(/\/\*\*([\s\S]*?)\*\/\s*$/);
  if (!match) return undefined;
  
  const jsdocContent = match[1];
  const result: JSDocInfo = {};
  
  const descMatch = jsdocContent.match(/\*\s*([^\n]+)/);
  if (descMatch) {
    result.description = descMatch[1].trim();
  }
  
  const paramMatches = jsdocContent.matchAll(/@param\s+(?:\{[^}]+\})?(\w+)(?:\s+(.+))?/g);
  const params: Array<{ name: string; description?: string }> = [];
  for (const m of paramMatches) {
    params.push({
      name: m[1],
      description: m[2]?.trim(),
    });
  }
  if (params.length > 0) {
    result.params = params;
  }
  
  const returnsMatch = jsdocContent.match(/@returns\s+(?:\{[^}]+\})?(.+)/);
  if (returnsMatch) {
    result.returns = returnsMatch[1].trim();
  }
  
  const exampleMatch = jsdocContent.match(/@example\s*([\s\S]+)/);
  if (exampleMatch) {
    result.example = exampleMatch[1].trim();
  }
  
  return result;
}

// ============================================
// Map 阶段：代码结构提取
// ============================================

function extractExportedClasses(content: string): ClassInfo[] {
  const classes: ClassInfo[] = [];
  
  const classRegex = /export\s+class\s+(\w+)(?:\s+extends\s+[\w<>]+)?(?:\s+implements\s+[\w,\s<>]+)?\s*\{/g;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    const name = match[1];
    const classStart = match.index;
    
    const jsdoc = extractJSDocFull(content, classStart);
    const description = jsdoc?.description || `${name} 类`;
    
    const classContent = content.slice(classStart);
    
    const methods: string[] = [];
    const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g;
    let methodMatch;
    while ((methodMatch = methodRegex.exec(classContent)) !== null) {
      if (!['constructor', 'if', 'while', 'for', 'switch', 'catch', 'try', 'get', 'set'].includes(methodMatch[1])) {
        methods.push(methodMatch[1]);
      }
    }
    
    const properties: string[] = [];
    const propRegex = /\s+(\w+)(?::\s*[^;=]+)?\s*(?:=\s*[^;]+)?\s*;[^}]*$/gm;
    let propMatch;
    while ((propMatch = propRegex.exec(classContent)) !== null) {
      if (!['if', 'else', 'for', 'while', 'switch', 'catch', 'try', 'const', 'let', 'var', 
           'public', 'private', 'protected', 'static', 'async', 'get', 'set'].includes(propMatch[1])) {
        properties.push(propMatch[1]);
      }
    }
    
    classes.push({
      name,
      function: description,
      methods: [...new Set(methods)],
      properties: [...new Set(properties)],
      jsdoc: jsdoc,
    });
  }
  
  return classes;
}

function extractExportedFunctions(content: string): FunctionInfo[] {
  const functions: FunctionInfo[] = [];
  
  const funcRegex = /export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*([^)]+))?\s*\{/g;
  let match;
  
  while ((match = funcRegex.exec(content)) !== null) {
    const name = match[1];
    const paramsStr = match[2] || '';
    const returnType = match[3]?.trim() || 'void';
    const funcStart = match.index;
    
    const jsdoc = extractJSDocFull(content, funcStart);
    
    functions.push({
      name,
      signature: `(${paramsStr})${returnType ? `: ${returnType}` : ''}`,
      description: jsdoc?.description,
      jsdoc: jsdoc,
    });
  }
  
  const arrowFuncRegex = /export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*\w+)?\s*=>/g;
  while ((match = arrowFuncRegex.exec(content)) !== null) {
    const name = match[1];
    if (!functions.some(f => f.name === name)) {
      const jsdoc = extractJSDocFull(content, match.index);
      functions.push({
        name,
        signature: `(${match[2] || ''}) => void`,
        description: jsdoc?.description,
        jsdoc: jsdoc,
      });
    }
  }
  
  return functions;
}

function extractExportedTypes(content: string): TypeInfo[] {
  const types: TypeInfo[] = [];
  
  const interfaceRegex = /export\s+interface\s+(\w+)\s*\{/g;
  let match;
  
  while ((match = interfaceRegex.exec(content)) !== null) {
    const name = match[1];
    const interfaceStart = match.index;
    const interfaceContent = content.slice(interfaceStart);
    
    const fields: string[] = [];
    const fieldRegex = /\s+(\w+)(?::\s*[^;}]+)?\s*;[^}]*$/gm;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(interfaceContent)) !== null) {
      if (!['if', 'else', 'for', 'while', 'switch', 'catch', 'try'].includes(fieldMatch[1])) {
        fields.push(fieldMatch[1]);
      }
    }
    
    types.push({
      name,
      fields: [...new Set(fields)],
    });
  }
  
  const typeRegex = /export\s+type\s+(\w+)\s*=\s*(?:\{[^}]*\}|[^;]+);/g;
  while ((match = typeRegex.exec(content)) !== null) {
    const name = match[1];
    if (!types.some(t => t.name === name)) {
      types.push({
        name,
        fields: [],
      });
    }
  }
  
  return types;
}

function extractExportedEnums(content: string): EnumInfo[] {
  const enums: EnumInfo[] = [];
  
  const enumRegex = /export\s+enum\s+(\w+)\s*\{/g;
  let match;
  
  while ((match = enumRegex.exec(content)) !== null) {
    const name = match[1];
    const enumStart = match.index;
    const enumContent = content.slice(enumStart);
    
    const members: string[] = [];
    const memberRegex = /\s+(\w+)\s*(?:=\s*[^,}]+)?\s*,?/g;
    let memberMatch;
    while ((memberMatch = memberRegex.exec(enumContent)) !== null) {
      if (memberMatch[1] !== name) {
        members.push(memberMatch[1]);
      }
    }
    
    enums.push({
      name,
      members: [...new Set(members)].slice(0, 20),
    });
  }
  
  return enums;
}

function extractDependencies(content: string): { internal: string[]; external: string[] } {
  const internal: string[] = [];
  const external: string[] = [];
  
  const importRegex = /import\s+(?:type\s+)?(?:\{[^}]+\}|\w+(?:\s*,\s*\w+)*)\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    if (importPath.startsWith('.') || importPath.startsWith('@')) {
      internal.push(importPath);
    } else {
      external.push(importPath);
    }
  }
  
  return { internal, external };
}

function categorizeCoreFlows(functions: FunctionInfo[], classes: ClassInfo[]): CoreFlowInfo {
  const flows: CoreFlowInfo = {
    nodeOperations: [],
    edgeOperations: [],
    queries: [],
    tools: [],
    other: [],
  };
  
  for (const func of functions) {
    const nameLower = func.name.toLowerCase();
    if (nameLower.includes('node') || nameLower.includes('addnode') || nameLower.includes('removenode')) {
      flows.nodeOperations.push(func.name);
    } else if (nameLower.includes('edge') || nameLower.includes('addedge') || nameLower.includes('removeedge')) {
      flows.edgeOperations.push(func.name);
    } else if (nameLower.includes('get') || nameLower.includes('query') || nameLower.includes('find') || nameLower.includes('list')) {
      flows.queries.push(func.name);
    } else if (nameLower.includes('tool') || nameLower.includes('util') || nameLower.includes('helper')) {
      flows.tools.push(func.name);
    } else {
      flows.other.push(func.name);
    }
  }
  
  for (const cls of classes) {
    for (const method of cls.methods) {
      const methodLower = method.toLowerCase();
      if (methodLower.includes('node')) {
        flows.nodeOperations.push(`${cls.name}.${method}`);
      } else if (methodLower.includes('edge')) {
        flows.edgeOperations.push(`${cls.name}.${method}`);
      } else if (methodLower.includes('get') || methodLower.includes('query')) {
        flows.queries.push(`${cls.name}.${method}`);
      } else if (methodLower.includes('tool') || methodLower.includes('util')) {
        flows.tools.push(`${cls.name}.${method}`);
      } else {
        flows.other.push(`${cls.name}.${method}`);
      }
    }
  }
  
  return {
    nodeOperations: [...new Set(flows.nodeOperations)],
    edgeOperations: [...new Set(flows.edgeOperations)],
    queries: [...new Set(flows.queries)],
    tools: [...new Set(flows.tools)],
    other: [...new Set(flows.other)],
  };
}

function mapFile(filePath: string, srcDir: string): FileInfo {
  const content = fs.readFileSync(filePath, 'utf-8');
  const moduleName = getModuleName(filePath, srcDir);
  
  const classes = extractExportedClasses(content);
  const functions = extractExportedFunctions(content);
  const interfaces = extractExportedTypes(content);
  const enums = extractExportedEnums(content);
  const dependencies = extractDependencies(content);
  const coreFlows = categorizeCoreFlows(functions, classes);
  
  return {
    file: path.relative(srcDir, filePath),
    module: moduleName,
    classes,
    functions,
    interfaces,
    enums,
    coreFlows,
    dependencies,
  };
}

// ============================================
// 测试用例 Map 阶段
// ============================================

function mapTestFile(filePath: string): TestInfo {
  const content = fs.readFileSync(filePath, 'utf-8');
  const testInfo: TestInfo = {
    file: path.basename(filePath),
  };
  
  const fileCommentMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^\n]+)/);
  if (fileCommentMatch) {
    testInfo.description = fileCommentMatch[1].trim();
  }
  
  const testNameMatch = content.match(/(?:测试内容|Test|测试):[\s\S]*?(.+)/i);
  if (testNameMatch) {
    testInfo.name = testNameMatch[1].trim();
  } else {
    testInfo.name = path.basename(filePath, '.ts');
  }
  
  const testFlows: TestFlowInfo = {
    setup: [],
    actions: [],
    assertions: [],
  };
  
  const testFuncRegex = /(?:function\s+)?test\s*\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = testFuncRegex.exec(content)) !== null) {
    testFlows.actions.push(match[1]);
  }
  
  const describeRegex = /(?:function\s+)?describe\s*\(\s*['"]([^'"]+)['"]/g;
  while ((match = describeRegex.exec(content)) !== null) {
    testFlows.setup.push(match[1]);
  }
  
  const assertRegex = /(?:expect|assert)\s*\(\s*([^)]+)\)/g;
  while ((match = assertRegex.exec(content)) !== null) {
    testFlows.assertions.push(match[1]);
  }
  
  if (testFlows.setup.length > 0 || testFlows.actions.length > 0 || testFlows.assertions.length > 0) {
    testInfo.testFlows = testFlows;
  }
  
  const gameObjects: string[] = [];
  const importRegex = /import\s+(?:type\s+)?(?:\{([^}]+)\})|\w+(?:\s*,\s*\w+)*\s+from/g;
  const imports = content.match(importRegex);
  if (imports) {
    for (const imp of imports) {
      const names = imp.match(/\{([^}]+)\}/);
      if (names) {
        gameObjects.push(...names[1].split(',').map(s => s.trim()).slice(0, 10));
      }
    }
  }
  
  if (gameObjects.length > 0) {
    testInfo.gameObjects = [...new Set(gameObjects)];
  }
  
  const features: string[] = [];
  const featureRegex = /(测试|验证|检查|测试内容)[：:]\s*([^\(]+)/g;
  while ((match = featureRegex.exec(content)) !== null) {
    features.push(match[2].trim());
  }
  
  if (features.length > 0) {
    testInfo.features = [...new Set(features)];
  }
  
  const edgeCases: string[] = [];
  const edgeRegex = /(边界|异常|错误|空值|null|undefined|empty)/gi;
  const edgeMatches = content.match(edgeRegex);
  if (edgeMatches) {
    edgeCases.push(...new Set(edgeMatches.map(s => s.toLowerCase())));
  }
  
  if (edgeCases.length > 0) {
    testInfo.edgeCases = edgeCases;
  }
  
  return testInfo;
}

// ============================================
// Merge 阶段：分层合并
// ============================================

function mergeFilesToSubmodule(files: FileInfo[]): SubmoduleInfo {
  const moduleName = files[0].module;
  const submoduleName = path.dirname(files[0].file) || 'root';
  
  const classMap = new Map<string, ClassInfo>();
  for (const file of files) {
    for (const cls of file.classes) {
      if (!classMap.has(cls.name)) {
        classMap.set(cls.name, { ...cls, sourceFiles: [file.file] });
      } else {
        const existing = classMap.get(cls.name)!;
        existing.sourceFiles!.push(file.file);
        const allMethods = [...existing.methods, ...cls.methods];
        existing.methods = [...new Set(allMethods)];
        const allProps = [...existing.properties, ...cls.properties];
        existing.properties = [...new Set(allProps)];
      }
    }
  }
  
  const functionMap = new Map<string, FunctionInfo>();
  for (const file of files) {
    for (const func of file.functions) {
      if (!functionMap.has(func.name)) {
        functionMap.set(func.name, { ...func, sourceFiles: [file.file] });
      } else {
        const existing = functionMap.get(func.name)!;
        existing.sourceFiles!.push(file.file);
      }
    }
  }
  
  const interfaceMap = new Map<string, TypeInfo>();
  for (const file of files) {
    for (const type of file.interfaces) {
      if (!interfaceMap.has(type.name)) {
        interfaceMap.set(type.name, type);
      }
    }
  }
  
  const enumMap = new Map<string, EnumInfo>();
  for (const file of files) {
    for (const enumItem of file.enums) {
      if (!enumMap.has(enumItem.name)) {
        enumMap.set(enumItem.name, enumItem);
      }
    }
  }
  
  const mergedFlows: CoreFlowInfo = {
    nodeOperations: [],
    edgeOperations: [],
    queries: [],
    tools: [],
    other: [],
  };
  
  for (const file of files) {
    if (file.coreFlows.nodeOperations?.length) {
      mergedFlows.nodeOperations.push(...file.coreFlows.nodeOperations);
    }
    if (file.coreFlows.edgeOperations?.length) {
      mergedFlows.edgeOperations.push(...file.coreFlows.edgeOperations);
    }
    if (file.coreFlows.queries?.length) {
      mergedFlows.queries.push(...file.coreFlows.queries);
    }
    if (file.coreFlows.tools?.length) {
      mergedFlows.tools.push(...file.coreFlows.tools);
    }
    if (file.coreFlows.other?.length) {
      mergedFlows.other.push(...file.coreFlows.other);
    }
  }
  
  const allInternalDeps = new Set<string>();
  const allExternalDeps = new Set<string>();
  
  for (const file of files) {
    file.dependencies.internal.forEach(d => allInternalDeps.add(d));
    file.dependencies.external.forEach(d => allExternalDeps.add(d));
  }
  
  return {
    module: moduleName,
    submodule: submoduleName,
    files: files.map(f => f.file),
    classes: [...classMap.values()],
    functions: [...functionMap.values()],
    interfaces: [...interfaceMap.values()],
    enums: [...enumMap.values()],
    coreFlows: {
      nodeOperations: [...new Set(mergedFlows.nodeOperations)],
      edgeOperations: [...new Set(mergedFlows.edgeOperations)],
      queries: [...new Set(mergedFlows.queries)],
      tools: [...new Set(mergedFlows.tools)],
      other: [...new Set(mergedFlows.other)],
    },
    dependencies: {
      internal: [...allInternalDeps],
      external: [...allExternalDeps],
    },
  };
}

function mergeSubmodulesToModule(submodules: SubmoduleInfo[]): ModuleInfo {
  const moduleName = submodules[0].module;
  
  const classMap = new Map<string, ClassInfo>();
  for (const sub of submodules) {
    for (const cls of sub.classes) {
      if (!classMap.has(cls.name)) {
        classMap.set(cls.name, cls);
      } else {
        const existing = classMap.get(cls.name)!;
        if (cls.sourceFiles) {
          existing.sourceFiles = [...new Set([...(existing.sourceFiles || []), ...cls.sourceFiles])];
        }
        const allMethods = [...existing.methods, ...cls.methods];
        existing.methods = [...new Set(allMethods)];
      }
    }
  }
  
  const functionMap = new Map<string, FunctionInfo>();
  for (const sub of submodules) {
    for (const func of sub.functions) {
      if (!functionMap.has(func.name)) {
        functionMap.set(func.name, func);
      } else {
        const existing = functionMap.get(func.name)!;
        if (func.sourceFiles) {
          existing.sourceFiles = [...new Set([...(existing.sourceFiles || []), ...func.sourceFiles])];
        }
      }
    }
  }
  
  const interfaceMap = new Map<string, TypeInfo>();
  for (const sub of submodules) {
    for (const type of sub.interfaces) {
      if (!interfaceMap.has(type.name)) {
        interfaceMap.set(type.name, type);
      }
    }
  }
  
  const enumMap = new Map<string, EnumInfo>();
  for (const sub of submodules) {
    for (const enumItem of sub.enums) {
      if (!enumMap.has(enumItem.name)) {
        enumMap.set(enumItem.name, enumItem);
      }
    }
  }
  
  const mergedFlows: CoreFlowInfo = {
    nodeOperations: [],
    edgeOperations: [],
    queries: [],
    tools: [],
    other: [],
  };
  
  for (const sub of submodules) {
    if (sub.coreFlows.nodeOperations?.length) {
      mergedFlows.nodeOperations.push(...sub.coreFlows.nodeOperations);
    }
    if (sub.coreFlows.edgeOperations?.length) {
      mergedFlows.edgeOperations.push(...sub.coreFlows.edgeOperations);
    }
    if (sub.coreFlows.queries?.length) {
      mergedFlows.queries.push(...sub.coreFlows.queries);
    }
    if (sub.coreFlows.tools?.length) {
      mergedFlows.tools.push(...sub.coreFlows.tools);
    }
    if (sub.coreFlows.other?.length) {
      mergedFlows.other.push(...sub.coreFlows.other);
    }
  }
  
  const allInternalDeps = new Set<string>();
  const allExternalDeps = new Set<string>();
  
  for (const sub of submodules) {
    sub.dependencies.internal.forEach(d => allInternalDeps.add(d));
    sub.dependencies.external.forEach(d => allExternalDeps.add(d));
  }
  
  const allFiles = submodules.flatMap(s => s.files);
  
  return {
    module: moduleName,
    files: allFiles,
    classes: [...classMap.values()],
    functions: [...functionMap.values()],
    interfaces: [...interfaceMap.values()],
    enums: [...enumMap.values()],
    coreFlows: {
      nodeOperations: [...new Set(mergedFlows.nodeOperations)],
      edgeOperations: [...new Set(mergedFlows.edgeOperations)],
      queries: [...new Set(mergedFlows.queries)],
      tools: [...new Set(mergedFlows.tools)],
      other: [...new Set(mergedFlows.other)],
    },
    dependencies: {
      internal: [...allInternalDeps],
      external: [...allExternalDeps],
    },
  };
}

function mergeTests(tests: TestInfo[]): TestInfo[] {
  const versionMap = new Map<string, TestInfo[]>();
  
  for (const test of tests) {
    const version = test.file.match(/v(\d+\.\d+)/)?.[1] || 'other';
    const existing = versionMap.get(version) || [];
    existing.push(test);
    versionMap.set(version, existing);
  }
  
  const merged: TestInfo[] = [];
  for (const [version, versionTests] of versionMap) {
    const combined: TestInfo = {
      file: `version-${version}`,
      name: `V${version} 测试集`,
      description: `版本 ${version} 的测试用例集合`,
      testFlows: {
        setup: [],
        actions: [],
        assertions: [],
      },
      gameObjects: [],
      interactions: [],
      features: [],
      edgeCases: [],
    };
    
    for (const test of versionTests) {
      if (test.testFlows?.setup) {
        combined.testFlows!.setup.push(...test.testFlows.setup);
      }
      if (test.testFlows?.actions) {
        combined.testFlows!.actions.push(...test.testFlows.actions);
      }
      if (test.testFlows?.assertions) {
        combined.testFlows!.assertions.push(...test.testFlows.assertions);
      }
      if (test.gameObjects) {
        combined.gameObjects!.push(...test.gameObjects);
      }
      if (test.features) {
        combined.features!.push(...test.features);
      }
      if (test.edgeCases) {
        combined.edgeCases!.push(...test.edgeCases);
      }
    }
    
    if (combined.testFlows) {
      combined.testFlows.setup = [...new Set(combined.testFlows.setup)];
      combined.testFlows.actions = [...new Set(combined.testFlows.actions)];
      combined.testFlows.assertions = [...new Set(combined.testFlows.assertions)];
    }
    combined.gameObjects = [...new Set(combined.gameObjects || [])];
    combined.features = [...new Set(combined.features || [])];
    combined.edgeCases = [...new Set(combined.edgeCases || [])];
    
    merged.push(combined);
  }
  
  return merged;
}

// ============================================
// Reduce 阶段：生成文档
// ============================================

function generateModuleMarkdown(module: ModuleInfo): string {
  const lines: string[] = [];
  
  lines.push(`# ${module.module} 模块`);
  lines.push('');
  lines.push(`包含 ${module.files.length} 个文件`);
  lines.push('');
  
  if (module.classes.length > 0) {
    lines.push('## 类');
    lines.push('');
    lines.push('| 类名 | 功能 | 方法 |');
    lines.push('|------|------|------|');
    
    for (const cls of module.classes) {
      const methods = cls.methods.slice(0, 5).join(', ');
      const more = cls.methods.length > 5 ? `... +${cls.methods.length - 5}` : '';
      lines.push(`| ${cls.name} | ${cls.function} | ${methods}${more} |`);
    }
    lines.push('');
  }
  
  if (module.functions.length > 0) {
    lines.push('## 函数');
    lines.push('');
    
    for (const func of module.functions) {
      const desc = func.description ? ` - ${func.description}` : '';
      lines.push(`- \`${func.name}\`${func.signature ? `(${func.signature})` : ''}${desc}`);
    }
    lines.push('');
  }
  
  if (module.interfaces.length > 0) {
    lines.push('## 接口/类型');
    lines.push('');
    
    for (const type of module.interfaces) {
      const fields = type.fields.slice(0, 5).join(', ');
      const more = type.fields.length > 5 ? `... +${type.fields.length - 5}` : '';
      lines.push(`- \`${type.name}\` (${type.fields.length} 字段: ${fields}${more})`);
    }
    lines.push('');
  }
  
  if (module.enums.length > 0) {
    lines.push('## 枚举');
    lines.push('');
    
    for (const enumItem of module.enums) {
      const members = enumItem.members.slice(0, 5).join(', ');
      const more = enumItem.members.length > 5 ? `... +${enumItem.members.length - 5}` : '';
      lines.push(`- \`${enumItem.name}\` (${enumItem.members.length} 成员: ${members}${more})`);
    }
    lines.push('');
  }
  
  const hasFlows = module.coreFlows.nodeOperations.length > 0 || 
                   module.coreFlows.edgeOperations.length > 0 ||
                   module.coreFlows.queries.length > 0 ||
                   module.coreFlows.tools.length > 0;
  
  if (hasFlows) {
    lines.push('## 核心流程');
    lines.push('');
    
    if (module.coreFlows.nodeOperations.length > 0) {
      lines.push(`- **节点操作**: ${module.coreFlows.nodeOperations.length} 个`);
    }
    if (module.coreFlows.edgeOperations.length > 0) {
      lines.push(`- **边操作**: ${module.coreFlows.edgeOperations.length} 个`);
    }
    if (module.coreFlows.queries.length > 0) {
      lines.push(`- **查询**: ${module.coreFlows.queries.length} 个`);
    }
    if (module.coreFlows.tools.length > 0) {
      lines.push(`- **工具**: ${module.coreFlows.tools.length} 个`);
    }
    lines.push('');
  }
  
  lines.push('## 依赖');
  lines.push('');
  if (module.dependencies.internal.length > 0) {
    lines.push('### 内部依赖');
    lines.push('');
    for (const dep of module.dependencies.internal) {
      lines.push(`- \`${dep}\``);
    }
    lines.push('');
  }
  
  if (module.dependencies.external.length > 0) {
    lines.push('### 外部依赖');
    lines.push('');
    for (const dep of module.dependencies.external) {
      lines.push(`- \`${dep}\``);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

function generateTestsMarkdown(tests: TestInfo[]): string {
  const lines: string[] = [];
  
  lines.push('# 测试用例知识库');
  lines.push('');
  lines.push('## 概述');
  lines.push('');
  lines.push(`共 ${tests.length} 个测试集`);
  lines.push('');
  
  for (const test of tests) {
    lines.push(`## ${test.name || test.file}`);
    lines.push('');
    
    if (test.description) {
      lines.push(`**描述**: ${test.description}`);
      lines.push('');
    }
    
    if (test.testFlows) {
      lines.push('### 测试流程');
      lines.push('');
      
      if (test.testFlows.setup?.length > 0) {
        lines.push(`- **设置** (${test.testFlows.setup.length} 个):`);
        test.testFlows.setup.slice(0, 10).forEach(s => lines.push(`  - ${s}`));
        if (test.testFlows.setup.length > 10) {
          lines.push(`  - ... 还有 ${test.testFlows.setup.length - 10} 个`);
        }
        lines.push('');
      }
      
      if (test.testFlows.actions?.length > 0) {
        lines.push(`- **动作** (${test.testFlows.actions.length} 个):`);
        test.testFlows.actions.slice(0, 10).forEach(a => lines.push(`  - ${a}`));
        if (test.testFlows.actions.length > 10) {
          lines.push(`  - ... 还有 ${test.testFlows.actions.length - 10} 个`);
        }
        lines.push('');
      }
      
      if (test.testFlows.assertions?.length > 0) {
        lines.push(`- **断言** (${test.testFlows.assertions.length} 个)`);
        lines.push('');
      }
    }
    
    if (test.features?.length > 0) {
      lines.push('### 功能特性');
      lines.push('');
      for (const feature of test.features.slice(0, 10)) {
        lines.push(`- ${feature}`);
      }
      if (test.features.length > 10) {
        lines.push(`- ... 还有 ${test.features.length - 10} 个`);
      }
      lines.push('');
    }
    
    if (test.edgeCases?.length > 0) {
      lines.push('### 边缘情况');
      lines.push('');
      for (const edge of test.edgeCases) {
        lines.push(`- ${edge}`);
      }
      lines.push('');
    }
    
    if (test.gameObjects?.length > 0) {
      lines.push('### 测试对象');
      lines.push('');
      const objects = test.gameObjects.slice(0, 15).join(', ');
      lines.push(`\`${objects}${test.gameObjects.length > 15 ? '...' : ''}\``);
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

function generateKnowledgeIndex(modules: ModuleInfo[], testCount: number): KnowledgeIndex {
  const moduleEntries = modules.map(m => ({
    name: m.module,
    path: `modules/${m.module}.md`,
    fileCount: m.files.length,
    classCount: m.classes.length,
    functionCount: m.functions.length,
    interfaceCount: m.interfaces.length,
  }));
  
  const index: KnowledgeIndex = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    project: {
      name: 'Graph-Driven Development',
      description: '基于图的开发驱动系统，支持可视化图编辑、AI 集成和 MCP 工具',
    },
    modules: moduleEntries,
  };
  
  if (testCount > 0) {
    index.tests = {
      totalCount: testCount,
      testFiles: 1,
      path: 'tests.md',
    };
  }
  
  return index;
}

function generateArchitectureMarkdown(modules: ModuleInfo[], testCount: number): string {
  const lines: string[] = [];
  
  lines.push('# 项目架构');
  lines.push('');
  lines.push('## 概述');
  lines.push('');
  lines.push('Graph-Driven Development 是一个基于图的开发驱动系统。');
  lines.push('');
  lines.push('## 模块列表');
  lines.push('');
  lines.push('| 模块 | 文件数 | 类数 | 函数数 | 接口数 |');
  lines.push('|------|--------|------|--------|--------|');
  
  for (const module of modules) {
    lines.push(`| ${module.module} | ${module.files.length} | ${module.classes.length} | ${module.functions.length} | ${module.interfaces.length} |`);
  }
  
  lines.push('');
  
  if (testCount > 0) {
    lines.push('## 测试覆盖');
    lines.push('');
    lines.push(`- 测试用例: ${testCount} 个`);
    lines.push('- 详见: [tests.md](tests.md)');
    lines.push('');
  }
  
  lines.push('## 技术栈');
  lines.push('');
  lines.push('- TypeScript');
  lines.push('- React');
  lines.push('- Vite');
  lines.push('- Zustand');
  lines.push('- MCP 协议');
  
  return lines.join('\n');
}

// ============================================
// 回测机制
// ============================================

function evaluateRetrospectiveRecord(
  record: RetrospectiveRecord, 
  knowledgeIndex: KnowledgeIndex,
  modules: ModuleInfo[]
): RetrospectiveRecord {
  const evaluation: RetrospectiveMetrics = {
    rootCauseAccuracy: 0,
    moduleLocationAccuracy: 0,
    logExplanationAccuracy: 0,
    codeFixApplicability: 0,
  };
  
  const expectedWords = extractKeywords(record.expectedAnswer);
  const actualWords = extractKeywords(record.actualAnswer);
  
  const overlap = expectedWords.filter(w => actualWords.includes(w)).length;
  const accuracy = expectedWords.length > 0 ? overlap / expectedWords.length : 0;
  
  evaluation.rootCauseAccuracy = accuracy;
  evaluation.moduleLocationAccuracy = accuracy;
  evaluation.logExplanationAccuracy = accuracy;
  evaluation.codeFixApplicability = accuracy;
  
  const config: RetrospectiveConfig = {
    enabled: true,
    evaluationDimensions: {
      rootCauseAccuracy: { weight: 0.3, threshold: 0.7 },
      moduleLocationAccuracy: { weight: 0.25, threshold: 0.7 },
      logExplanationAccuracy: { weight: 0.2, threshold: 0.6 },
      codeFixApplicability: { weight: 0.25, threshold: 0.6 },
    },
  };
  
  const totalScore = 
    evaluation.rootCauseAccuracy * config.evaluationDimensions.rootCauseAccuracy.weight +
    evaluation.moduleLocationAccuracy * config.evaluationDimensions.moduleLocationAccuracy.weight +
    evaluation.logExplanationAccuracy * config.evaluationDimensions.logExplanationAccuracy.weight +
    evaluation.codeFixApplicability * config.evaluationDimensions.codeFixApplicability.weight;
  
  record.metrics = evaluation;
  record.status = totalScore >= 0.7 ? 'passed' : 'failed';
  
  return record;
}

function extractKeywords(text: string): string[] {
  const stopWords = ['的', '是', '在', '了', '和', '与', '或', '等', '一个', '这个', '那个', '可以', '应该', '需要'];
  const words = text
    .replace(/[，。！？、：；""''（）\[\]]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.includes(w));
  
  return [...new Set(words)].slice(0, 20);
}

function generateRetrospectiveTemplate(): { config: RetrospectiveConfig; records: RetrospectiveRecord[] } {
  const config: RetrospectiveConfig = {
    enabled: true,
    evaluationDimensions: {
      rootCauseAccuracy: { weight: 0.3, threshold: 0.7 },
      moduleLocationAccuracy: { weight: 0.25, threshold: 0.7 },
      logExplanationAccuracy: { weight: 0.2, threshold: 0.6 },
      codeFixApplicability: { weight: 0.25, threshold: 0.6 },
    },
  };
  
  const records: RetrospectiveRecord[] = [
    {
      id: 'retro-001',
      timestamp: new Date().toISOString(),
      question: '如何创建一个新图？',
      expectedAnswer: '使用 Graph 类的构造函数或工厂方法创建图实例',
      actualAnswer: '',
      metrics: {},
      status: 'pending',
    },
    {
      id: 'retro-002',
      timestamp: new Date().toISOString(),
      question: 'MCP 工具有哪些？',
      expectedAnswer: 'MCP 工具包括图操作工具（添加/删除节点、边）、查询工具（获取图信息）、导出工具等',
      actualAnswer: '',
      metrics: {},
      status: 'pending',
    },
    {
      id: 'retro-003',
      timestamp: new Date().toISOString(),
      question: '节点的数据结构是什么？',
      expectedAnswer: 'Node 接口包含 id、label、data 等属性，用于表示图中的节点',
      actualAnswer: '',
      metrics: {},
      status: 'pending',
    },
    {
      id: 'retro-004',
      timestamp: new Date().toISOString(),
      question: '如何将图导出为 JSON？',
      expectedAnswer: '使用 Graph 的 toJSON 方法或 MCP 工具的导出功能',
      actualAnswer: '',
      metrics: {},
      status: 'pending',
    },
    {
      id: 'retro-005',
      timestamp: new Date().toISOString(),
      question: '边的属性有哪些？',
      expectedAnswer: 'Edge 接口包含 id、source、target、label、data 等属性',
      actualAnswer: '',
      metrics: {},
      status: 'pending',
    },
  ];
  
  return { config, records };
}

function runRetrospective(): void {
  const outputDir = path.resolve(CONFIG.outputDir);
  const retroFile = path.join(outputDir, 'retrospective.json');
  
  if (!fs.existsSync(retroFile)) {
    console.log('回测数据不存在，请先运行 --full 构建');
    return;
  }
  
  const retroData = JSON.parse(fs.readFileSync(retroFile, 'utf-8'));
  const indexFile = path.join(outputDir, 'index.json');
  const index = fs.existsSync(indexFile) 
    ? JSON.parse(fs.readFileSync(indexFile, 'utf-8')) 
    : { modules: [] };
  
  console.log('运行回测评估...\n');
  console.log('评估维度：');
  console.log('  - 根因吻合度 (rootCauseAccuracy)');
  console.log('  - 模块定位准确性 (moduleLocationAccuracy)');
  console.log('  - 日志解释合理性 (logExplanationAccuracy)');
  console.log('  - 代码修复适用性 (codeFixApplicability)');
  console.log('');
  
  let passedCount = 0;
  let failedCount = 0;
  
  for (const record of retroData.records) {
    const evaluated = evaluateRetrospectiveRecord(record, index, []);
    
    const statusIcon = evaluated.status === 'passed' ? 'PASS' : 'FAIL';
    console.log(`${statusIcon} ${record.question}`);
    console.log(`   期望: ${record.expectedAnswer}`);
    console.log(`   状态: ${evaluated.status}`);
    console.log(`   得分: 根因${(evaluated.metrics.rootCauseAccuracy || 0).toFixed(2)} | 模块${(evaluated.metrics.moduleLocationAccuracy || 0).toFixed(2)} | 日志${(evaluated.metrics.logExplanationAccuracy || 0).toFixed(2)} | 修复${(evaluated.metrics.codeFixApplicability || 0).toFixed(2)}`);
    console.log('');
    
    if (evaluated.status === 'passed') {
      passedCount++;
    } else {
      failedCount++;
    }
  }
  
  console.log('回测结果汇总：');
  console.log(`   通过: ${passedCount}/${retroData.records.length}`);
  console.log(`   失败: ${failedCount}/${retroData.records.length}`);
  console.log(`   通过率: ${((passedCount / retroData.records.length) * 100).toFixed(1)}%`);
}

function cleanCache(): void {
  const cacheDir = path.resolve(CONFIG.cacheDir);
  
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('缓存已清除');
  } else {
    console.log('缓存目录不存在');
  }
}

function showStatus(): void {
  const cache = loadHashCache();
  const outputDir = path.resolve(CONFIG.outputDir);
  
  console.log('知识库状态');
  console.log('');
  
  if (!cache) {
    console.log('知识库尚未构建');
    console.log('');
    console.log('运行以下命令构建知识库：');
    console.log('  npx ts-node scripts/build-knowledge.ts --full');
    return;
  }
  
  console.log(`最后更新: ${cache.lastUpdate}`);
  console.log(`已缓存文件: ${Object.keys(cache.fileHashes).length}`);
  console.log(`已缓存模块: ${Object.keys(cache.moduleHashes).length}`);
  console.log(`已缓存测试: ${Object.keys(cache.testHashes).length}`);
  console.log('');
  
  if (fs.existsSync(outputDir)) {
    const modules = fs.readdirSync(path.join(outputDir, 'modules')).filter(f => f.endsWith('.md'));
    console.log(`已生成模块文档: ${modules.length}`);
    
    if (fs.existsSync(path.join(outputDir, 'tests.md'))) {
      console.log('已生成测试文档: tests.md');
    }
    
    if (fs.existsSync(path.join(outputDir, 'retrospective.json'))) {
      console.log('已生成回测数据: retrospective.json');
    }
  }
}

// ============================================
// 主流程
// ============================================

async function buildKnowledge(fullRebuild: boolean = false): Promise<void> {
  console.log('开始构建知识库...\n');
  
  const srcDir = path.resolve(CONFIG.srcDir);
  const testDir = path.resolve(CONFIG.testDir);
  const outputDir = path.resolve(CONFIG.outputDir);
  const modulesDir = path.join(outputDir, 'modules');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(modulesDir)) {
    fs.mkdirSync(modulesDir, { recursive: true });
  }
  
  const oldCache = fullRebuild ? null : loadHashCache();
  const newCache: HashCache = {
    fileHashes: {},
    moduleHashes: {},
    testHashes: {},
    lastUpdate: new Date().toISOString(),
  };
  
  console.log('扫描源代码...');
  const files = scanSourceFiles(srcDir);
  console.log(`   找到 ${files.length} 个文件\n`);
  
  console.log('Map 阶段：提取文件信息...');
  const fileInfoMap = new Map<string, FileInfo>();
  let processedCount = 0;
  let changedCount = 0;
  let skippedCount = 0;
  
  for (const filePath of files) {
    const currentHash = computeFileHash(filePath);
    newCache.fileHashes[filePath] = currentHash;
    
    const oldHash = oldCache?.fileHashes[filePath];
    const needsProcessing = fullRebuild || !oldHash || oldHash !== currentHash;
    
    if (needsProcessing) {
      const fileInfo = mapFile(filePath, srcDir);
      fileInfoMap.set(filePath, fileInfo);
      processedCount++;
      changedCount++;
      console.log(`   + ${path.relative(srcDir, filePath)}`);
    } else {
      skippedCount++;
    }
  }
  
  if (processedCount === 0 && skippedCount > 0) {
    console.log(`   无文件变更，跳过 (${skippedCount} 个文件已缓存)\n`);
  } else {
    console.log(`   处理了 ${processedCount} 个文件，跳过 ${skippedCount} 个\n`);
  }
  
  const moduleGroups = new Map<string, FileInfo[]>();
  const submoduleGroups = new Map<string, FileInfo[]>();
  
  for (const fileInfo of fileInfoMap.values()) {
    const existingModule = moduleGroups.get(fileInfo.module) || [];
    existingModule.push(fileInfo);
    moduleGroups.set(fileInfo.module, existingModule);
    
    const submoduleName = path.dirname(fileInfo.file) || 'root';
    const submoduleKey = `${fileInfo.module}/${submoduleName}`;
    const existingSub = submoduleGroups.get(submoduleKey) || [];
    existingSub.push(fileInfo);
    submoduleGroups.set(submoduleKey, existingSub);
  }
  
  const needsModuleRebuild = fileInfoMap.size > 0;
  const modules: ModuleInfo[] = [];
  
  if (!needsModuleRebuild && fs.existsSync(modulesDir)) {
    console.log('增量模式：无文件变更，保留已有模块文档');
    
    const cachedModules = new Map<string, ModuleInfo>();
    for (const [moduleName, moduleHash] of Object.entries(newCache.moduleHashes)) {
      const mdFile = path.join(modulesDir, `${moduleName}.md`);
      if (fs.existsSync(mdFile)) {
        cachedModules.set(moduleName, {
          module: moduleName,
          files: [],
          classes: [],
          functions: [],
          interfaces: [],
          enums: [],
          coreFlows: { nodeOperations: [], edgeOperations: [], queries: [], tools: [], other: [] },
          dependencies: { internal: [], external: [] },
        });
      }
    }
    
    modules.push(...cachedModules.values());
    console.log(`   保留 ${modules.length} 个模块文档`);
  } else {
    console.log('Merge 阶段：分层合并...');
    
    const submodules: SubmoduleInfo[] = [];
    for (const [submoduleKey, files] of submoduleGroups) {
      const submodule = mergeFilesToSubmodule(files);
      submodules.push(submodule);
    }
    console.log(`   第一层：生成 ${submodules.length} 个子模块`);
    
    for (const [moduleName, files] of moduleGroups) {
      const moduleSubmodules = submodules.filter(s => s.module === moduleName);
      
      let module: ModuleInfo;
      if (moduleSubmodules.length === 0) {
        module = mergeSubmodulesToModule([mergeFilesToSubmodule(files)]);
      } else if (moduleSubmodules.length === 1 && moduleSubmodules[0].submodule === 'root') {
        module = {
          ...moduleSubmodules[0],
          files: moduleSubmodules[0].files,
        };
      } else {
        module = mergeSubmodulesToModule(moduleSubmodules);
      }
      
      const moduleJson = JSON.stringify(module);
      newCache.moduleHashes[moduleName] = computeStringHash(moduleJson);
      
      modules.push(module);
      console.log(`   + ${moduleName} (${files.length} 文件, ${module.classes.length} 类, ${module.functions.length} 函数)`);
    }
    
    console.log(`   第二层：生成 ${modules.length} 个模块\n`);
  }
  
  console.log('处理测试用例...');
  const testFiles = scanTestFiles(testDir);
  let testProcessedCount = 0;
  let testSkippedCount = 0;
  
  if (testFiles.length > 0) {
    console.log(`   找到 ${testFiles.length} 个测试文件`);
    
    const tests: TestInfo[] = [];
    for (const filePath of testFiles) {
      const currentHash = computeFileHash(filePath);
      newCache.testHashes[filePath] = currentHash;
      
      const oldHash = oldCache?.testHashes[filePath];
      const needsProcessing = fullRebuild || !oldHash || oldHash !== currentHash;
      
      if (needsProcessing) {
        const testInfo = mapTestFile(filePath);
        tests.push(testInfo);
        testProcessedCount++;
      } else {
        testSkippedCount++;
      }
    }
    
    if (testProcessedCount > 0 || !fs.existsSync(path.join(outputDir, 'tests.md'))) {
      console.log('   合并测试用例...');
      const mergedTests = mergeTests(tests);
      
      const testsMarkdown = generateTestsMarkdown(mergedTests);
      fs.writeFileSync(path.join(outputDir, 'tests.md'), testsMarkdown);
      console.log('   tests.md');
    }
  }
  
  console.log('\nReduce 阶段：生成文档...');
  
  if (modules.length > 0 && needsModuleRebuild) {
    for (const module of modules) {
      const markdown = generateModuleMarkdown(module);
      const outputPath = path.join(modulesDir, `${module.module}.md`);
      fs.writeFileSync(outputPath, markdown);
      console.log(`   + ${module.module}.md`);
    }
  } else if (modules.length === 0) {
    const existingModuleFiles = fs.readdirSync(modulesDir).filter(f => f.endsWith('.md'));
    console.log(`   保留 ${existingModuleFiles.length} 个模块文档（无变更）`);
    for (const mdFile of existingModuleFiles) {
      const moduleName = path.basename(mdFile, '.md');
      modules.push({
        module: moduleName,
        files: [],
        classes: [],
        functions: [],
        interfaces: [],
        enums: [],
        coreFlows: { nodeOperations: [], edgeOperations: [], queries: [], tools: [], other: [] },
        dependencies: { internal: [], external: [] },
      });
    }
  }
  
  const testCount = testFiles.length;
  const index = generateKnowledgeIndex(modules, testCount);
  fs.writeFileSync(path.join(outputDir, 'index.json'), JSON.stringify(index, null, 2));
  console.log('   index.json');
  
  fs.writeFileSync(path.join(outputDir, 'architecture.md'), generateArchitectureMarkdown(modules, testCount));
  console.log('   architecture.md\n');
  
  saveHashCache(newCache);
  
  console.log('生成回测数据...');
  const retrospectiveData = generateRetrospectiveTemplate();
  fs.writeFileSync(path.join(outputDir, 'retrospective.json'), JSON.stringify(retrospectiveData, null, 2));
  console.log('   retrospective.json\n');
  
  console.log('知识库构建完成！\n');
  console.log('统计信息：');
  console.log(`   - 文件总数: ${files.length}`);
  console.log(`   - 模块数量: ${modules.length}`);
  console.log(`   - 类总数: ${modules.reduce((sum, m) => sum + m.classes.length, 0)}`);
  console.log(`   - 函数总数: ${modules.reduce((sum, m) => sum + m.functions.length, 0)}`);
  console.log(`   - 接口总数: ${modules.reduce((sum, m) => sum + m.interfaces.length, 0)}`);
  console.log(`   - 枚举总数: ${modules.reduce((sum, m) => sum + m.enums.length, 0)}`);
  if (testCount > 0) {
    console.log(`   - 测试文件: ${testCount}`);
  }
  console.log(`   - 回测模板: ${retrospectiveData.records.length} 条`);
  console.log(`   - 输出目录: ${outputDir}`);
  console.log('');
  console.log('可用命令：');
  console.log('   npx ts-node scripts/build-knowledge.ts --full       # 完整构建');
  console.log('   npx ts-node scripts/build-knowledge.ts --status     # 查看状态');
  console.log('   npx ts-node scripts/build-knowledge.ts --retro      # 运行回测评估');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || '--incremental';
  
  switch (command) {
    case '--full':
      await buildKnowledge(true);
      break;
    case '--incremental':
      await buildKnowledge(false);
      break;
    case '--status':
      showStatus();
      break;
    case '--clean':
      cleanCache();
      break;
    case '--retro':
      runRetrospective();
      break;
    default:
      console.log('知识库构建工具（对齐《洛克王国》MapReduce 架构）');
      console.log('');
      console.log('用法:');
      console.log('  npx ts-node scripts/build-knowledge.ts [选项]');
      console.log('');
      console.log('选项:');
      console.log('  --full       完整构建');
      console.log('  --incremental 增量构建（默认）');
      console.log('  --status     显示状态');
      console.log('  --clean      清除缓存');
      console.log('  --retro      运行回测评估');
      break;
  }
}

main().catch(console.error);
