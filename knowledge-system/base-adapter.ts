/**
 * 知识沉淀系统 - 语言适配器基类
 * 
 * 提供通用的工具方法，具体语言适配器继承此类
 * 
 * @module knowledge-system/base-adapter
 */

import * as crypto from 'crypto';
import { LanguageAdapter, FileExtractionResult, ExtractedCoreFlows } from './types';

/**
 * 语言适配器基类
 * 提供通用工具方法
 */
export abstract class BaseAdapter implements LanguageAdapter {
  abstract readonly language: string;
  abstract readonly extensions: string[];
  abstract readonly fileType: 'source' | 'test' | 'proto' | 'config';
  
  /**
   * 判断是否可以处理该文件
   */
  canHandle(filePath: string): boolean {
    const ext = this.getFileExtension(filePath);
    return this.extensions.includes(ext);
  }
  
  /**
   * 从文件路径提取模块名（目录名）
   */
  protected getModuleName(filePath: string, srcDir: string): string {
    const relativePath = filePath.replace(srcDir, '').replace(/^\//, '');
    const parts = relativePath.split('/');
    return parts[0] || 'root';
  }
  
  /**
   * 从文件路径提取子模块名（二级目录）
   */
  protected getSubmoduleName(filePath: string, srcDir: string): string {
    const relativePath = filePath.replace(srcDir, '').replace(/^\//, '');
    const parts = relativePath.split('/');
    return parts.length > 1 ? parts[1] : parts[0] || 'root';
  }
  
  /**
   * 获取文件扩展名
   */
  protected getFileExtension(filePath: string): string {
    const lastDot = filePath.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filePath.substring(lastDot);
  }
  
  /**
   * 计算文件 Hash
   */
  protected computeFileHash(filePath: string): string {
    const content = this.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }
  
  /**
   * 读取文件内容
   */
  protected abstract readFile(filePath: string): string;
  
  /**
   * 创建空的核心流程对象
   */
  protected createEmptyCoreFlows(): ExtractedCoreFlows {
    return {
      initialization: [],
      stateTransitions: [],
      networkOperations: [],
      eventHandlers: [],
      persistence: [],
      other: [],
    };
  }
  
  /**
   * 去除字符串首尾的空白和引号
   */
  protected trimQuotes(s: string): string {
    return s.trim().replace(/^['"]|['"]$/g, '');
  }
  
  /**
   * 从注释中提取描述
   */
  protected extractCommentDescription(content: string, position: number): string | undefined {
    const before = content.slice(0, position);
    
    // 尝试匹配多行注释 /* ... */
    const blockMatch = before.match(/\/\*[\s\S]*?\*\/\s*$/);
    if (blockMatch) {
      const lines = blockMatch[0].split('\n').slice(1, -1);
      const descLines = lines.filter(line => line.includes('*'));
      if (descLines.length > 0) {
        return descLines.map(line => line.replace(/^\s*\*\s?/, '').trim()).join(' ');
      }
    }
    
    // 尝试匹配单行注释 // ...
    const lineMatch = before.match(/\/\/([^\n]+)\s*$/);
    if (lineMatch) {
      return lineMatch[1].trim();
    }
    
    return undefined;
  }
}

/**
 * 适配器注册表
 */
export class AdapterRegistry {
  private adapters: Map<string, LanguageAdapter> = new Map();
  
  /**
   * 注册适配器
   */
  register(adapter: LanguageAdapter): void {
    this.adapters.set(adapter.language, adapter);
  }
  
  /**
   * 获取适配器
   */
  get(language: string): LanguageAdapter | undefined {
    return this.adapters.get(language);
  }
  
  /**
   * 查找能处理该文件的适配器
   */
  findForFile(filePath: string): LanguageAdapter | undefined {
    for (const adapter of this.adapters.values()) {
      if (adapter.canHandle(filePath)) {
        return adapter;
      }
    }
    return undefined;
  }
  
  /**
   * 获取所有已注册的语言
   */
  getRegisteredLanguages(): string[] {
    return Array.from(this.adapters.keys());
  }
}
