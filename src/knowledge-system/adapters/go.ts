/**
 * 知识沉淀系统 - Go 适配器
 * 
 * 支持 Go 语言源代码的提取
 * 对齐原文：
 * - 服务器代码：操作描述、状态转化、持久化/网络交互
 * - 类名、类功能、函数主要功能、涉及的模块、枚举、核心流程
 * 
 * @module knowledge-system/adapters/go
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseAdapter, LanguageAdapter } from '../base-adapter';
import {
  FileExtractionResult,
  ExtractedType,
  ExtractedFunction,
  ExtractedEnum,
  ExtractedCoreFlows,
  ExtractedDependencies,
  JSDocInfo,
} from '../types';

/**
 * Go 语言适配器
 */
export class GoAdapter extends BaseAdapter implements LanguageAdapter {
  readonly language = 'go';
  readonly extensions = ['.go'];
  readonly fileType = 'source';
  
  private srcDir: string = '';
  
  /**
   * 设置源码目录
   */
  setSrcDir(srcDir: string): void {
    this.srcDir = srcDir;
  }
  
  /**
   * 读取文件内容
   */
  protected readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }
  
  /**
   * 从 Go 文件提取信息
   */
  extract(content: string, filePath: string): FileExtractionResult {
    const module = this.getModuleName(filePath, this.srcDir);
    
    const result: FileExtractionResult = {
      file: path.basename(filePath),
      module,
      fileType: 'source',
      language: 'go',
      types: [],
      functions: [],
      enums: [],
      coreFlows: this.createEmptyCoreFlows(),
      dependencies: {
        internal: [],
        external: [],
      },
    };
    
    // 1. 提取 package 名和 import（依赖）
    const pkgName = this.extractPackageName(content);
    result.dependencies = this.extractImports(content, module);
    
    // 2. 提取导出的 struct（类型）
    result.types = this.extractStructs(content, filePath, pkgName);
    
    // 3. 提取导出的函数/方法
    result.functions = this.extractFunctions(content, filePath, pkgName);
    
    // 4. 提取导出的 const（枚举）
    result.enums = this.extractConsts(content);
    
    // 5. 提取核心流程（对齐原文：状态转化、持久化/网络交互）
    result.coreFlows = this.extractCoreFlows(content, result.types, result.functions);
    
    return result;
  }
  
  /**
   * 提取 package 名
   */
  private extractPackageName(content: string): string {
    const match = content.match(/package\s+(\w+)/);
    return match ? match[1] : 'main';
  }
  
  /**
   * 提取 import 语句
   * 对齐原文："涉及的模块"
   */
  private extractImports(content: string, currentModule: string): ExtractedDependencies {
    const internal: string[] = [];
    const external: string[] = [];
    
    // 匹配单行 import
    const singleImportRegex = /import\s+"([^"]+)"/g;
    let match;
    
    while ((match = singleImportRegex.exec(content)) !== null) {
      const importPath = match[1];
      this.categorizeImport(importPath, currentModule, internal, external);
    }
    
    // 匹配多行 import ("")
    const multiImportRegex = /import\s*\(\s*([\s\S]*?)\s*\)/g;
    
    while ((match = multiImportRegex.exec(content)) !== null) {
      const importsBlock = match[1];
      const importLineRegex = /(?:\w+\s+)?"([^"]+)"/g;
      let lineMatch;
      
      while ((lineMatch = importLineRegex.exec(importsBlock)) !== null) {
        const importPath = lineMatch[1];
        this.categorizeImport(importPath, currentModule, internal, external);
      }
    }
    
    return { internal, external };
  }
  
  /**
   * 分类导入为内部或外部依赖
   */
  private categorizeImport(
    importPath: string,
    currentModule: string,
    internal: string[],
    external: string[]
  ): void {
    // 外部包（标准库或第三方）
    const stdLibs = [
      'fmt', 'os', 'io', 'net', 'http', 'time', 'sync', 'context',
      'encoding', 'errors', 'flag', 'log', 'math', 'path', 'reflect',
      'regexp', 'runtime', 'sort', 'strconv', 'strings', 'testing',
      'unicode', 'unsafe', 'database', 'crypto', 'compress', 'image',
    ];
    
    const isStdLib = stdLibs.some(lib => importPath === lib || importPath.startsWith(lib + '/'));
    
    if (isStdLib) {
      external.push(importPath);
      return;
    }
    
    // 检查是否是项目内导入
    // 常见模式：git.woa.com/xxx 或本地路径
    if (importPath.includes('git.woa.com') || importPath.includes('github.com')) {
      external.push(importPath);
      return;
    }
    
    // 本地路径导入，提取模块名
    const parts = importPath.split('/');
    const moduleName = parts[0] || currentModule;
    
    if (moduleName !== currentModule && !internal.includes(moduleName)) {
      internal.push(moduleName);
    }
  }
  
  /**
   * 提取导出的 struct
   * 对齐原文："类名、类功能"
   */
  private extractStructs(content: string, filePath: string, pkgName: string): ExtractedType[] {
    const structs: ExtractedType[] = [];
    
    // 匹配导出的 struct（大写开头）
    const structRegex = /(?:\/\*\*|\/\/).*\n\s*(?:type\s+)?([A-Z]\w+)\s+struct\s*\{([\s\S]*?)\n\s*\}/g;
    let match;
    
    while ((match = structRegex.exec(content)) !== null) {
      const name = match[1];
      const body = match[2];
      const position = match.index;
      
      const fields = this.extractStructFields(body);
      const jsdoc = this.extractGoComment(content, position);
      
      structs.push({
        name,
        function: jsdoc?.description || `结构体 ${name}`,
        fields,
        jsdoc,
        sourceFiles: [path.basename(filePath)],
      });
    }
    
    return structs;
  }
  
  /**
   * 提取 struct 字段
   */
  private extractStructFields(body: string): string[] {
    const fields: string[] = [];
    
    // 匹配字段声明
    const fieldRegex = /^\s*(\w+)\s+(?:\[\][\w.]+|map\[[^\]]+\][\w.]+|[\w.]+)/gm;
    let match;
    
    while ((match = fieldRegex.exec(body)) !== null) {
      const fieldName = match[1];
      if (!['if', 'for', 'while', 'switch', 'catch'].includes(fieldName)) {
        fields.push(fieldName);
      }
    }
    
    return fields;
  }
  
  /**
   * 提取导出的函数/方法
   * 对齐原文："函数主要功能"
   */
  private extractFunctions(content: string, filePath: string, pkgName: string): ExtractedFunction[] {
    const functions: ExtractedFunction[] = [];
    
    // 匹配导出的函数（大写开头）
    const funcRegex = /(?:\/\*\*|\/\/).*\n\s*func\s+(?:\([\w\s,]*\))?\s*([A-Z]\w+)\s*(\([^)]*\))(?:\s*(?:\[\])?[^{]+)?\s*\{/g;
    let match;
    
    while ((match = funcRegex.exec(content)) !== null) {
      const name = match[1];
      const params = match[2];
      const position = match.index;
      
      // 检查是否是方法（有接收者）
      const isMethod = params.includes(')') && params.split(')').length > 1;
      
      const signature = isMethod
        ? `func ${params.trim().split(')')[0]}) ${name}(${params.trim().split(')')[1] || ''})`
        : `func ${name}${params}`;
      
      const jsdoc = this.extractGoComment(content, position);
      
      functions.push({
        name,
        signature: signature.trim(),
        description: jsdoc?.description,
        jsdoc,
        sourceFiles: [path.basename(filePath)],
      });
    }
    
    return functions;
  }
  
  /**
   * 提取导出的 const（枚举）
   * 对齐原文："枚举类型"
   */
  private extractConsts(content: string): ExtractedEnum[] {
    const enums: ExtractedEnum[] = [];
    
    // 匹配 const 块
    const constBlockRegex = /(?:\/\*\*|\/\/).*\n\s*const\s*\(\s*([\s\S]*?)\n\s*\)/g;
    let match;
    
    while ((match = constBlockRegex.exec(content)) !== null) {
      const position = match.index;
      const body = match[1];
      const jsdoc = this.extractGoComment(content, position);
      
      // 提取 const 名称（从注释中）
      const nameMatch = body.match(/(\w+)\s*=\s*iota/);
      if (nameMatch) {
        const members = this.extractConstMembers(body);
        enums.push({
          name: nameMatch[1] + 'Type',
          members,
        });
      } else {
        // 单个 const 块
        const members = this.extractConstMembers(body);
        if (members.length > 0) {
          enums.push({
            name: jsdoc?.description || 'AnonymousConst',
            members,
          });
        }
      }
    }
    
    // 匹配单独的导出 const
    const singleConstRegex = /(?:\/\*\*|\/\/).*\n\s*(?:\w+\s+)?([A-Z]\w+)\s*=?\s*[^\n]+/g;
    
    while ((match = singleConstRegex.exec(content)) !== null) {
      const name = match[1];
      const position = match.index;
      
      // 避免重复
      if (!enums.some(e => e.members.includes(name))) {
        const jsdoc = this.extractGoComment(content, position);
        
        enums.push({
          name: jsdoc?.description || name,
          members: [name],
        });
      }
    }
    
    return enums;
  }
  
  /**
   * 提取 const 成员
   */
  private extractConstMembers(body: string): string[] {
    const members: string[] = [];
    const memberRegex = /^\s*(\w+)\s*(?:=|:=|\+)?/gm;
    let match;
    
    while ((match = memberRegex.exec(body)) !== null) {
      const memberName = match[1];
      if (!['if', 'for', 'while', 'switch', 'catch'].includes(memberName)) {
        members.push(memberName);
      }
    }
    
    return members;
  }
  
  /**
   * 提取核心流程
   * 对齐原文："核心流程：状态转化、持久化/网络交互"
   */
  private extractCoreFlows(
    content: string,
    types: ExtractedType[],
    functions: ExtractedFunction[]
  ): ExtractedCoreFlows {
    const flows = this.createEmptyCoreFlows();
    
    for (const fn of functions) {
      const nameLower = fn.name.toLowerCase();
      
      // 状态转化
      if (
        nameLower.includes('state') ||
        nameLower.includes('transition') ||
        nameLower.includes('status') ||
        nameLower.includes('phase')
      ) {
        flows.stateTransitions?.push(fn.name);
      }
      // 持久化
      else if (
        nameLower.includes('save') ||
        nameLower.includes('store') ||
        nameLower.includes('persist') ||
        nameLower.includes('write') ||
        nameLower.includes('insert') ||
        nameLower.includes('update') ||
        nameLower.includes('delete')
      ) {
        flows.persistence?.push(fn.name);
      }
      // 网络交互
      else if (
        nameLower.includes('request') ||
        nameLower.includes('send') ||
        nameLower.includes('handle') ||
        nameLower.includes('serve') ||
        nameLower.includes('rpc') ||
        nameLower.includes('api')
      ) {
        flows.networkOperations?.push(fn.name);
      }
      // 初始化
      else if (
        nameLower.includes('init') ||
        nameLower.includes('setup') ||
        nameLower.includes('start') ||
        nameLower.includes('bootstrap')
      ) {
        flows.initialization?.push(fn.name);
      }
      // 事件处理
      else if (
        nameLower.includes('on') ||
        nameLower.includes('event') ||
        nameLower.includes('callback')
      ) {
        flows.eventHandlers?.push(fn.name);
      }
      // 其他
      else {
        flows.other?.push(fn.name);
      }
    }
    
    return flows;
  }
  
  /**
   * 提取 Go 风格的注释（// ...）
   */
  private extractGoComment(content: string, position: number): JSDocInfo | undefined {
    const before = content.slice(0, position);
    
    // 匹配 // 注释
    const lineCommentRegex = /(\/\/[^\n]+)\s*$/;
    const match = before.match(lineCommentRegex);
    
    if (!match) return undefined;
    
    const comment = match[1].replace(/^\s*\/\/\s?/, '').trim();
    
    if (!comment) return undefined;
    
    return {
      description: comment,
    };
  }
}
