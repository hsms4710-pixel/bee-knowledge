/**
 * 知识沉淀系统 - Protocol Buffers 适配器
 * 
 * 支持 .proto 文件的提取
 * 对齐原文："协议（Protobuf/网络协议）"
 * 
 * @module knowledge-system/adapters/proto
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
 * Protocol Buffers 适配器
 */
export class ProtoAdapter extends BaseAdapter implements LanguageAdapter {
  readonly language = 'proto';
  readonly extensions = ['.proto'];
  readonly fileType = 'proto';
  
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
   * 从 Proto 文件提取信息
   */
  extract(content: string, filePath: string): FileExtractionResult {
    const module = this.getModuleName(filePath, this.srcDir);
    
    const result: FileExtractionResult = {
      file: path.basename(filePath),
      module,
      fileType: 'proto',
      language: 'proto',
      types: [],
      functions: [],
      enums: [],
      coreFlows: this.createEmptyCoreFlows(),
      dependencies: {
        internal: [],
        external: [],
      },
    };
    
    // 1. 提取 import（依赖）
    result.dependencies = this.extractImports(content, module);
    
    // 2. 提取 message（类型）
    result.types = this.extractMessages(content, filePath);
    
    // 3. 提取 service + rpc（函数）
    result.functions = this.extractServices(content, filePath);
    
    // 4. 提取 enum
    result.enums = this.extractEnums(content);
    
    // 5. 提取核心流程
    result.coreFlows = this.extractCoreFlows(content, result.types, result.functions);
    
    return result;
  }
  
  /**
   * 提取 import 语句
   */
  private extractImports(content: string, currentModule: string): ExtractedDependencies {
    const internal: string[] = [];
    const external: string[] = [];
    
    const importRegex = /import\s+"([^"]+)"/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // 提取文件名作为依赖
      const fileName = path.basename(importPath, '.proto');
      
      // 判断是内部还是外部依赖
      if (importPath.includes('google/')) {
        external.push(fileName);
      } else {
        internal.push(fileName);
      }
    }
    
    return { internal, external };
  }
  
  /**
   * 提取 message 定义
   * 对齐原文："协议"
   */
  private extractMessages(content: string, filePath: string): ExtractedType[] {
    const messages: ExtractedType[] = [];
    
    // 匹配 message 定义
    const messageRegex = /(\/\/.*(?:\n\s*\/\/.*)*\n\s*)?message\s+(\w+)\s*\{([\s\S]*?)\n\s*\}/g;
    let match;
    
    while ((match = messageRegex.exec(content)) !== null) {
      const comment = match[1] || '';
      const name = match[2];
      const body = match[3];
      const position = match.index;
      
      const fields = this.extractMessageFields(body);
      
      // 从注释或使用默认描述
      const description = comment
        .replace(/^\/\/\s?/gm, '')
        .trim() || `消息 ${name}`;
      
      messages.push({
        name,
        function: description,
        fields,
        jsdoc: {
          description,
        },
        sourceFiles: [path.basename(filePath)],
      });
    }
    
    return messages;
  }
  
  /**
   * 提取 message 字段
   */
  private extractMessageFields(body: string): string[] {
    const fields: string[] = [];
    
    // 匹配字段声明
    const fieldRegex = /^\s*(?:repeated\s+|map<[^>]+>\s+)?(\w+)\s+(\w+)/gm;
    let match;
    
    while ((match = fieldRegex.exec(body)) !== null) {
      const fieldName = match[2];
      if (!['required', 'optional', 'repeated', 'map', 'oneof', 'reserved'].includes(fieldName)) {
        fields.push(fieldName);
      }
    }
    
    return fields;
  }
  
  /**
   * 提取 service 和 rpc 定义
   * 对齐原文："协议"
   */
  private extractServices(content: string, filePath: string): ExtractedFunction[] {
    const functions: ExtractedFunction[] = [];
    
    // 匹配 rpc 定义
    const rpcRegex = /(\/\/.*(?:\n\s*\/\/.*)*\n\s*)?rpc\s+(\w+)\s*\(\s*(\w+)\s*\)\s*returns\s*\(\s*(\w+)\s*\)/g;
    let match;
    
    while ((match = rpcRegex.exec(content)) !== null) {
      const comment = match[1] || '';
      const name = match[2];
      const requestType = match[3];
      const responseType = match[4];
      const position = match.index;
      
      const signature = `rpc ${name}(${requestType}) returns (${responseType})`;
      
      // 从注释或使用默认描述
      const description = comment
        .replace(/^\/\/\s?/gm, '')
        .trim() || `RPC ${name}`;
      
      functions.push({
        name,
        signature,
        description,
        jsdoc: {
          description,
        },
        sourceFiles: [path.basename(filePath)],
      });
    }
    
    return functions;
  }
  
  /**
   * 提取 enum 定义
   */
  private extractEnums(content: string): ExtractedEnum[] {
    const enums: ExtractedEnum[] = [];
    
    // 匹配 enum 定义
    const enumRegex = /(?:\/\/.*(?:\n\s*\/\/.*)*\n\s*)?enum\s+(\w+)\s*\{\s*([\s\S]*?)\n\s*\}/g;
    let match;
    
    while ((match = enumRegex.exec(content)) !== null) {
      const name = match[1];
      const body = match[2];
      
      const members = this.extractEnumMembers(body);
      
      enums.push({
        name,
        members,
      });
    }
    
    return enums;
  }
  
  /**
   * 提取 enum 成员
   */
  private extractEnumMembers(body: string): string[] {
    const members: string[] = [];
    const memberRegex = /^\s*(\w+)\s*=\s*\d+/gm;
    let match;
    
    while ((match = memberRegex.exec(body)) !== null) {
      members.push(match[1]);
    }
    
    return members;
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
    
    for (const fn of functions) {
      const nameLower = fn.name.toLowerCase();
      
      // 状态相关
      if (
        nameLower.includes('state') ||
        nameLower.includes('get') ||
        nameLower.includes('query')
      ) {
        flows.stateTransitions?.push(fn.name);
      }
      // 网络操作
      else if (
        nameLower.includes('create') ||
        nameLower.includes('update') ||
        nameLower.includes('delete') ||
        nameLower.includes('list')
      ) {
        flows.networkOperations?.push(fn.name);
      }
      // 持久化
      else if (
        nameLower.includes('save') ||
        nameLower.includes('store') ||
        nameLower.includes('persist')
      ) {
        flows.persistence?.push(fn.name);
      }
      // 初始化
      else if (
        nameLower.includes('init') ||
        nameLower.includes('setup') ||
        nameLower.includes('start')
      ) {
        flows.initialization?.push(fn.name);
      }
      // 其他
      else {
        flows.other?.push(fn.name);
      }
    }
    
    return flows;
  }
}
