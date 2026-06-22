/**
 * 知识沉淀系统 - 通用类型定义
 * 
 * 基于《洛克王国：世界》AI 增效实践的 MapReduce 架构
 * 语言无关的核心数据结构
 * 
 * @module knowledge-system/types
 */

// ============================================
// 通用提取结果（Map 阶段输出）
// ============================================

/**
 * Map 阶段提取的类型信息
 * 对齐原文："类名、类功能"
 */
export interface ExtractedType {
  /** 类型名称 */
  name: string;
  /** 类型功能描述 */
  function: string;
  /** 字段/属性列表 */
  fields: string[];
  /** 方法列表 */
  methods?: string[];
  /** 注释/文档 */
  jsdoc?: JSDocInfo;
  /** 来源文件 */
  sourceFiles?: string[];
}

/**
 * Map 阶段提取的函数信息
 * 对齐原文："函数主要功能"
 */
export interface ExtractedFunction {
  /** 函数名称 */
  name: string;
  /** 函数签名 */
  signature: string;
  /** 函数描述 */
  description?: string;
  /** 注释/文档 */
  jsdoc?: JSDocInfo;
  /** 来源文件 */
  sourceFiles?: string[];
}

/**
 * Map 阶段提取的枚举信息
 * 对齐原文："枚举类型"
 */
export interface ExtractedEnum {
  /** 枚举名称 */
  name: string;
  /** 枚举成员列表 */
  members: string[];
}

/**
 * Map 阶段提取的核心流程信息
 * 对齐原文："核心流程：资源加载、技能播放、网络通信、事件触发、关键日志"
 */
export interface ExtractedCoreFlows {
  /** 资源加载相关 */
  initialization?: string[];
  /** 状态变更相关 */
  stateTransitions?: string[];
  /** 网络通信相关 */
  networkOperations?: string[];
  /** 事件处理相关 */
  eventHandlers?: string[];
  /** 持久化相关 */
  persistence?: string[];
  /** 其他流程 */
  other?: string[];
}

/**
 * JSDoc/注释信息
 */
export interface JSDocInfo {
  /** 描述 */
  description?: string;
  /** 参数列表 */
  params?: Array<{ name: string; description?: string }>;
  /** 返回值说明 */
  returns?: string;
  /** 示例代码 */
  example?: string;
}

/**
 * Map 阶段提取的依赖信息
 * 对齐原文："涉及的模块"
 */
export interface ExtractedDependencies {
  /** 内部依赖（项目内模块） */
  internal: string[];
  /** 外部依赖（第三方库） */
  external: string[];
}

/**
 * Map 阶段单文件提取结果
 */
export interface FileExtractionResult {
  /** 文件路径 */
  file: string;
  /** 所属模块 */
  module: string;
  /** 文件类型（源代码/测试/配置等） */
  fileType: 'source' | 'test' | 'proto' | 'config';
  /** 编程语言 */
  language: string;
  /** 提取的类型 */
  types: ExtractedType[];
  /** 提取的函数 */
  functions: ExtractedFunction[];
  /** 提取的枚举 */
  enums: ExtractedEnum[];
  /** 提取的核心流程 */
  coreFlows: ExtractedCoreFlows;
  /** 提取的依赖 */
  dependencies: ExtractedDependencies;
}

// ============================================
// 语言适配器接口
// ============================================

/**
 * 语言适配器接口
 * 不同语言实现此接口，提供语言特定的解析逻辑
 */
export interface LanguageAdapter {
  /** 语言标识 */
  readonly language: string;
  /** 支持的文件扩展名 */
  readonly extensions: string[];
  /** 文件类型（源代码/测试/配置） */
  readonly fileType: 'source' | 'test' | 'proto' | 'config';
  
  /**
   * 判断是否可以处理该文件
   */
  canHandle(filePath: string): boolean;
  
  /**
   * 从文件内容提取信息（Map 阶段）
   * @param content 文件内容
   * @param filePath 文件路径（用于确定模块名）
   * @returns 提取结果
   */
  extract(content: string, filePath: string): FileExtractionResult;
}

// ============================================
// Merge 阶段数据结构
// ============================================

/**
 * 模块级信息（Merge 阶段输出）
 */
export interface ModuleInfo {
  /** 模块名称 */
  module: string;
  /** 包含的文件列表 */
  files: string[];
  /** 模块中的类型 */
  types: ExtractedType[];
  /** 模块中的函数 */
  functions: ExtractedFunction[];
  /** 模块中的枚举 */
  enums: ExtractedEnum[];
  /** 核心流程 */
  coreFlows: ExtractedCoreFlows;
  /** 依赖关系 */
  dependencies: ExtractedDependencies;
  /** 使用的主要语言 */
  language: string;
}

/**
 * 子模块信息（分层 Merge 第一层）
 */
export interface SubmoduleInfo extends ModuleInfo {
  /** 子模块名称（目录名） */
  submodule: string;
}

// ============================================
// Reduce 阶段数据结构
// ============================================

/**
 * 知识库索引（Reduce 阶段输出）
 */
export interface KnowledgeIndex {
  /** 生成时间 */
  generatedAt: string;
  /** 项目名称 */
  projectName: string;
  /** 使用的语言 */
  languages: string[];
  /** 模块列表 */
  modules: Array<{
    name: string;
    language: string;
    typeCount: number;
    functionCount: number;
    enumCount: number;
  }>;
  /** 统计信息 */
  statistics: {
    totalFiles: number;
    totalTypes: number;
    totalFunctions: number;
    totalEnums: number;
  };
}

// ============================================
// Hash 缓存数据结构
// ============================================

/**
 * Hash 缓存（增量更新用）
 */
export interface HashCache {
  /** 文件级 Hash */
  fileHashes: Record<string, string>;
  /** 模块级 Hash */
  moduleHashes: Record<string, string>;
  /** 最后更新时间 */
  lastUpdate: string;
}

// ============================================
// 测试用例提取结果
// ============================================

/**
 * 测试用例信息
 * 对齐原文："测试用例：游戏流程、游戏对象识别、交互机制总结、功能特性归纳、边缘情况整理"
 */
export interface TestInfo {
  /** 测试名称 */
  name: string;
  /** 测试文件 */
  file: string;
  /** 测试流程（setup、actions、assertions） */
  flows: {
    setup?: string[];
    actions?: string[];
    assertions?: string[];
  };
  /** 功能特性 */
  features: string[];
  /** 测试对象 */
  testObjects: string[];
  /** 边缘情况 */
  edgeCases: string[];
}

/**
 * 合并后的测试集
 */
export interface TestSuite {
  /** 测试集名称 */
  name: string;
  /** 包含的测试 */
  tests: TestInfo[];
}

// ============================================
// 回测相关数据结构
// ============================================

/**
 * 回测记录
 * 对齐原文："AI Bug 修复回测专项"
 */
export interface RetrospectiveRecord {
  /** 问题 */
  question: string;
  /** 期望答案 */
  expectedAnswer: string;
  /** 实际答案（AI 回答） */
  actualAnswer?: string;
  /** 评估状态 */
  status?: 'passed' | 'failed' | 'pending';
  /** 评估指标 */
  metrics?: {
    /** 根因吻合度 */
    rootCauseAccuracy?: number;
    /** 模块定位准确性 */
    moduleLocationAccuracy?: number;
    /** 日志解释合理性 */
    logExplanationAccuracy?: number;
    /** 代码修复适用性 */
    codeFixApplicability?: number;
  };
}

/**
 * 回测配置
 */
export interface RetrospectiveConfig {
  /** 评估维度 */
  dimensions: {
    rootCauseAccuracy: string;
    moduleLocationAccuracy: string;
    logExplanationAccuracy: string;
    codeFixApplicability: string;
  };
  /** 通过阈值 */
  passThreshold: number;
}
