/**
 * 知识沉淀系统 - TypeScript 适配器
 * 
 * 支持 TypeScript/JavaScript 源代码的提取
 * 对齐原文：类名、类功能、函数主要功能、涉及的模块、接口、枚举、核心流程
 * 
 * @module knowledge-system/adapters/typescript
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseAdapter } from '../base-adapter';
import {
  FileExtractionResult,
  ExtractedType,
  ExtractedFunction,
  ExtractedEnum,
  ExtractedCoreFlows,
  ExtractedDependencies,
  JSDocInfo,
  LanguageAdapter,
} from '../types';

/**
 * TypeScript/JavaScript 语言适配器
 */
export class TypeScriptAdapter extends BaseAdapter implements LanguageAdapter {
  readonly language = 'typescript';
  readonly extensions = ['.ts', '.tsx', '.js', '.jsx'];
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
   * 从 TypeScript 文件提取信息
   */
  extract(content: string, filePath: string): FileExtractionResult {
    const module = this.getModuleName(filePath, this.srcDir);
    
    const result: FileExtractionResult = {
      file: path.basename(filePath),
      module,
      fileType: 'source',
      language: 'typescript',
      types: [],
      functions: [],
      enums: [],
      coreFlows: this.createEmptyCoreFlows(),
      dependencies: {
        internal: [],
        external: [],
      },
    };
    
    // 1. 提取 import 语句（依赖）
    result.dependencies = this.extractImports(content, module);
    
    // 2. 提取导出的类
    result.types = this.extractClasses(content, filePath);
    
    // 3. 提取导出的函数
    result.functions = this.extractFunctions(content, filePath);
    
    // 4. 提取导出的接口/类型
    const interfaces = this.extractInterfaces(content, filePath);
    result.types.push(...interfaces);
    
    // 5. 提取导出的枚举
    result.enums = this.extractEnums(content);
    
    // 6. 提取核心流程
    result.coreFlows = this.extractCoreFlows(content, result.types, result.functions);
    
    return result;
  }
  
  /**
   * 提取 import 语句
   */
  private extractImports(content: string, currentModule: string): ExtractedDependencies {
    const internal: string[] = [];
    const external: string[] = [];
    
    // 匹配 import 语句
    const importRegex = /import\s+(?:type\s+)?(?:\{[^}]+\}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // 排除 node_modules 和外部库
      if (importPath.startsWith('.') || importPath.startsWith('@')) {
        // 相对路径导入，是内部依赖
        const moduleName = this.extractModuleNameFromPath(importPath, currentModule);
        if (moduleName && !internal.includes(moduleName)) {
          internal.push(moduleName);
        }
      } else if (!importPath.startsWith('react') && !importPath.startsWith('vue') && !importPath.includes('/')) {
        // 可能是内部包
        if (!['node', 'fs', 'path', 'crypto', 'os', 'http', 'https'].includes(importPath)) {
          external.push(importPath);
        }
      }
    }
    
    return { internal, external };
  }
  
  /**
   * 从导入路径提取模块名
   */
  private extractModuleNameFromPath(importPath: string, currentModule: string): string | null {
    if (importPath === '.' || importPath === './') return null;
    
    // 处理相对路径
    let relativePath = importPath.replace(/^\.\//, '').replace(/^\.\./, '');
    
    // 处理 index 文件
    if (relativePath.endsWith('/index') || relativePath.endsWith('/index.ts')) {
      relativePath = relativePath.substring(0, relativePath.lastIndexOf('/'));
    }
    
    // 获取第一级目录作为模块名
    const parts = relativePath.split('/');
    const firstPart = parts[0];
    
    // 如果是当前模块内部的导入，返回 null
    if (firstPart === currentModule || firstPart === undefined) {
      return null;
    }
    
    return firstPart;
  }
  
  /**
   * 提取导出的类
   */
  private extractClasses(content: string, filePath: string): ExtractedType[] {
    const classes: ExtractedType[] = [];
    
    // 匹配 export class
    const classRegex = /export\s+class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[^{]+)?\s*\{([\s\S]*?)(?=\n\s*export|\n\s*class|\n\s*function|\n\s*interface|\n\s*enum|\n\s*type|$)/g;
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      const name = match[1];
      const classBody = match[2];
      const position = match.index;
      
      // 提取 JSDoc
      const jsdoc = this.extractJSDoc(content, position);
      
      // 提取方法
      const methods = this.extractClassMethods(classBody);
      
      // 提取属性
      const fields = this.extractClassFields(classBody);
      
      classes.push({
        name,
        function: jsdoc?.description || `类 ${name}`,
        fields,
        methods,
        jsdoc,
        sourceFiles: [path.basename(filePath)],
      });
    }
    
    return classes;
  }
  
  /**
   * 提取类的方法
   */
  private extractClassMethods(classBody: string): string[] {
    const methods: string[] = [];
    const methodRegex = /(?:async\s+)?[\w<>]+\s+(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g;
    let match;
    
    while ((match = methodRegex.exec(classBody)) !== null) {
      if (!['constructor', 'if', 'for', 'while'].includes(match[1])) {
        methods.push(match[1]);
      }
    }
    
    return methods;
  }
  
  /**
   * 提取类的属性
   */
  private extractClassFields(classBody: string): string[] {
    const fields: string[] = [];
    const fieldRegex = /^(?!\s*async\s|\s*static\s*async\s|\s*\w+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{)[ \t]*([\w]+)(?::)/gm;
    let match;
    
    // 简化：提取非方法的属性声明
    const simpleFieldRegex = /^[ \t]*(?:readonly\s+)?(\w+)(?::\s*[^;=]+?;)/gm;
    
    while ((match = simpleFieldRegex.exec(classBody)) !== null) {
      const fieldName = match[1];
      if (!['if', 'for', 'while', 'switch', 'catch', 'private', 'protected', 'public'].includes(fieldName)) {
        fields.push(fieldName);
      }
    }
    
    return fields;
  }
  
  /**
   * 提取导出的函数
   */
  private extractFunctions(content: string, filePath: string): ExtractedFunction[] {
    const functions: ExtractedFunction[] = [];
    
    // 匹配 export function 和 export const fn = () =>
    const fnRegex = /(?:\/\*\*|\/\/|#).*\n\s*export\s+(?:async\s+)?function\s+(\w+)\s*(\([^)]*\))(?:\s*:(?:\s*[^{]+))?\s*\{/g;
    let match;
    
    while ((match = fnRegex.exec(content)) !== null) {
      const name = match[1];
      const signature = `function ${name}${match[2]}`;
      const position = match.index;
      
      const jsdoc = this.extractJSDoc(content, position);
      
      functions.push({
        name,
        signature,
        description: jsdoc?.description,
        jsdoc,
        sourceFiles: [path.basename(filePath)],
      });
    }
    
    // 匹配 export const fn = function() 和箭头函数
    const constFnRegex = /(?:\/\*\*|\/\/|#).*\n\s*export\s+const\s+(\w+)\s*=\s*(?:async\s+)?(?:function\s*)?\(\s*([^)]*)\s*\)\s*(?:=>|\{)/g;
    
    while ((match = constFnRegex.exec(content)) !== null) {
      const name = match[1];
      const params = match[2] ? match[2].split(',').map(p => p.trim().split(':')[0].trim()).join(', ') : '';
      const signature = `const ${name}(${params})`;
      const position = match.index;
      
      const jsdoc = this.extractJSDoc(content, position);
      
      // 避免重复
      if (!functions.some(f => f.name === name)) {
        functions.push({
          name,
          signature,
          description: jsdoc?.description,
          jsdoc,
          sourceFiles: [path.basename(filePath)],
        });
      }
    }
    
    return functions;
  }
  
  /**
   * 提取导出的接口/类型
   */
  private extractInterfaces(content: string, filePath: string): ExtractedType[] {
    const types: ExtractedType[] = [];
    
    // 匹配 export interface
    const interfaceRegex = /export\s+interface\s+(\w+)\s*\{([\s\S]*?)\}/g;
    let match;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
      const name = match[1];
      const body = match[2];
      const position = match.index;
      
      const fields = this.extractInterfaceFields(body);
      const jsdoc = this.extractJSDoc(content, position);
      
      types.push({
        name,
        function: jsdoc?.description || `接口 ${name}`,
        fields,
        jsdoc,
        sourceFiles: [path.basename(filePath)],
      });
    }
    
    // 匹配 export type
    const typeRegex = /export\s+type\s+(\w+)\s*=\s*(\{[\s\S]*?\}|\w+(?:\s*<[^>]+>)?(?:\s*\|\s*\w+)*)/g;
    
    while ((match = typeRegex.exec(content)) !== null) {
      const name = match[1];
      const position = match.index;
      
      // 避免重复
      if (!types.some(t => t.name === name)) {
        const jsdoc = this.extractJSDoc(content, position);
        
        types.push({
          name,
          function: jsdoc?.description || `类型 ${name}`,
          fields: [],
          jsdoc,
          sourceFiles: [path.basename(filePath)],
        });
      }
    }
    
    return types;
  }
  
  /**
   * 提取接口字段
   */
  private extractInterfaceFields(body: string): string[] {
    const fields: string[] = [];
    const fieldRegex = /^(?!\s*\})\s*(?:readonly\s+)?(\w+)(?::)/gm;
    let match;
    
    while ((match = fieldRegex.exec(body)) !== null) {
      fields.push(match[1]);
    }
    
    return fields;
  }
  
  /**
   * 提取导出的枚举
   */
  private extractEnums(content: string): ExtractedEnum[] {
    const enums: ExtractedEnum[] = [];
    
    const enumRegex = /export\s+enum\s+(\w+)\s*\{\s*([^}]*)\s*\}/g;
    let match;
    
    while ((match = enumRegex.exec(content)) !== null) {
      const name = match[1];
      const membersStr = match[2];
      
      const members = membersStr
        .split(',')
        .map(m => m.trim().split(/\s*=/)[0].trim())
        .filter(m => m && !m.startsWith('//'));
      
      enums.push({ name, members });
    }
    
    return enums;
  }
  
  /**
   * 提取核心流程
   */
  private extractCoreFlows(
    content: string,
    types: ExtractedType[],
    functions: ExtractedFunction[]
  ): ExtractedCoreFlows {
    const flows = this.createEmptyCoreFlows();
    
    // 分析函数名称，归类到不同流程
    for (const fn of functions) {
      const nameLower = fn.name.toLowerCase();
      
      if (
        nameLower.includes('init') ||
        nameLower.includes('load') ||
        nameLower.includes('setup') ||
        nameLower.includes('create') ||
        nameLower.includes('construct')
      ) {
        flows.initialization?.push(fn.name);
      } else if (
        nameLower.includes('state') ||
        nameLower.includes('transition') ||
        nameLower.includes('update') ||
        nameLower.includes('change')
      ) {
        flows.stateTransitions?.push(fn.name);
      } else if (
        nameLower.includes('request') ||
        nameLower.includes('send') ||
        nameLower.includes('fetch') ||
        nameLower.includes('api') ||
        nameLower.includes('http') ||
        nameLower.includes('rpc')
      ) {
        flows.networkOperations?.push(fn.name);
      } else if (
        nameLower.includes('handle') ||
        nameLower.includes('on') ||
        nameLower.includes('event') ||
        nameLower.includes('listen')
      ) {
        flows.eventHandlers?.push(fn.name);
      } else if (
        nameLower.includes('save') ||
        nameLower.includes('store') ||
        nameLower.includes('persist') ||
        nameLower.includes('write')
      ) {
        flows.persistence?.push(fn.name);
      } else {
        flows.other?.push(fn.name);
      }
    }
    
    return flows;
  }
  
  /**
   * 提取 JSDoc 注释
   */
  private extractJSDoc(content: string, position: number): JSDocInfo | undefined {
    const before = content.slice(0, position);
    
    // 匹配 /** ... */ 格式的 JSDoc
    const jsdocRegex = /\/\*\*([\s\S]*?)\*\/\s*$/;
    const match = before.match(jsdocRegex);
    
    if (!match) return undefined;
    
    const jsdocContent = match[1];
    const info: JSDocInfo = {};
    
    // 提取描述（第一行）
    const descMatch = jsdocContent.match(/\*\s*([^\n]+)/);
    if (descMatch) {
      info.description = descMatch[1].trim();
    }
    
    // 提取 @param
    const paramRegex = /@param\s+\{([^}]+)\}\s+(\w+)(?:\s+(.+))?/g;
    const params: Array<{ name: string; description?: string }> = [];
    let paramMatch;
    
    while ((paramMatch = paramRegex.exec(jsdocContent)) !== null) {
      params.push({
        name: paramMatch[2],
        description: paramMatch[3],
      });
    }
    
    if (params.length > 0) {
      info.params = params;
    }
    
    // 提取 @returns
    const returnsMatch = jsdocContent.match(/@returns\s+(.+)/);
    if (returnsMatch) {
      info.returns = returnsMatch[1].trim();
    }
    
    // 提取 @example
    const exampleMatch = jsdocContent.match(/@example\s*\n?\s*\*\s*([\s\S]+)/);
    if (exampleMatch) {
      info.example = exampleMatch[1].trim();
    }
    
    return Object.keys(info).length > 0 ? info : undefined;
  }
}
