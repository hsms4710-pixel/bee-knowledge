/**
 * 知识沉淀系统 - 测试用例适配器
 * 
 * 支持测试文件的提取
 * 对齐原文："测试用例：游戏流程、游戏对象识别、交互机制总结、功能特性归纳、边缘情况整理"
 * 
 * @module knowledge-system/adapters/test
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseAdapter } from '../base-adapter';
import {
  FileExtractionResult,
  ExtractedCoreFlows,
  ExtractedDependencies,
  LanguageAdapter,
  TestInfo,
} from '../types';

/**
 * 测试用例适配器基类
 * 支持多种测试框架
 */
export abstract class TestAdapter extends BaseAdapter implements LanguageAdapter {
  abstract readonly language: string;
  abstract readonly extensions: string[];
  readonly fileType = 'test';
  
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

  canHandle(filePath: string): boolean {
    if (!super.canHandle(filePath)) return false;

    const fileName = path.basename(filePath);
    return /\.(test|spec)\.[tj]sx?$/.test(fileName) || filePath.includes(`${path.sep}test${path.sep}`) || filePath.includes(`${path.sep}tests${path.sep}`);
  }
  
  /**
   * 从测试文件提取信息
   */
  extract(content: string, filePath: string): FileExtractionResult {
    const module = this.getModuleName(filePath, this.srcDir);
    
    const result: FileExtractionResult = {
      file: path.basename(filePath),
      module,
      fileType: 'test',
      language: this.language,
      types: [],
      functions: [],
      enums: [],
      coreFlows: this.createEmptyCoreFlows(),
      dependencies: {
        internal: [],
        external: [],
      },
    };
    
    // 提取测试信息
    const testInfo = this.extractTestInfo(content, filePath);
    
    // 将测试流程转换为核心流程
    result.coreFlows = this.testFlowsToCoreFlows(testInfo.flows);
    
    // 将功能特性添加到 types
    for (const feature of testInfo.features) {
      result.types.push({
        name: feature,
        function: `测试特性: ${feature}`,
        fields: [],
      });
    }
    
    // 将测试对象添加到 functions
    for (const obj of testInfo.testObjects) {
      result.functions.push({
        name: obj,
        signature: `测试对象: ${obj}`,
        sourceFiles: [path.basename(filePath)],
      });
    }
    
    return result;
  }
  
  /**
   * 提取测试信息
   * 对齐原文："游戏流程、游戏对象识别、交互机制总结、功能特性归纳、边缘情况整理"
   */
  protected abstract extractTestInfo(content: string, filePath: string): {
    name: string;
    flows: {
      setup?: string[];
      actions?: string[];
      assertions?: string[];
    };
    features: string[];
    testObjects: string[];
    edgeCases: string[];
  };
  
  /**
   * 将测试流程转换为核心流程
   */
  protected testFlowsToCoreFlows(flows: {
    setup?: string[];
    actions?: string[];
    assertions?: string[];
  }): ExtractedCoreFlows {
    const result = this.createEmptyCoreFlows();
    
    if (flows.setup?.length) {
      result.initialization = flows.setup;
    }
    
    if (flows.actions?.length) {
      result.other = flows.actions;
    }
    
    if (flows.assertions?.length) {
      result.eventHandlers = flows.assertions;
    }
    
    return result;
  }
}

/**
 * TypeScript 测试适配器
 * 支持 Vitest、Jest 等
 */
export class TypeScriptTestAdapter extends TestAdapter {
  readonly language = 'typescript';
  readonly extensions = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx', '.test.js', '.spec.js'];
  
  protected extractTestInfo(content: string, filePath: string): {
    name: string;
    flows: {
      setup?: string[];
      actions?: string[];
      assertions?: string[];
    };
    features: string[];
    testObjects: string[];
    edgeCases: string[];
  } {
    const name = path.basename(filePath, path.extname(filePath));
    
    const flows = {
      setup: [] as string[],
      actions: [] as string[],
      assertions: [] as string[],
    };
    
    const features: string[] = [];
    const testObjects: string[] = [];
    const edgeCases: string[] = [];
    
    // 匹配 describe/it/test 块
    // 匹配 setup/beforeEach
    const setupRegex = /(?:beforeEach|beforeAll|setup|before)\s*\(\s*\(\s*\)\s*=>\s*\{?\s*([\s\S]*?)(?:\n\s*\}|\n\s*return)/g;
    let match;
    
    while ((match = setupRegex.exec(content)) !== null) {
      const setupCode = match[1];
      const setupActions = this.extractSetupActions(setupCode);
      flows.setup.push(...setupActions);
    }
    
    // 匹配 it/test 块
    const testRegex = /(?:it|test)\s*\(\s*['"]([^'"]+)['"]/g;
    
    while ((match = testRegex.exec(content)) !== null) {
      const testName = match[1];
      
      // 分类测试
      if (testName.toLowerCase().includes('should') || testName.toLowerCase().includes('when')) {
        testObjects.push(testName);
      } else if (
        testName.toLowerCase().includes('edge') ||
        testName.toLowerCase().includes('boundary') ||
        testName.toLowerCase().includes('invalid') ||
        testName.toLowerCase().includes('error')
      ) {
        edgeCases.push(testName);
      } else {
        features.push(testName);
      }
    }
    
    // 匹配 expect 语句
    const expectRegex = /expect\s*\(\s*([^)]+)\s*\)\s*\.\s*(\w+)/g;
    
    while ((match = expectRegex.exec(content)) !== null) {
      flows.assertions.push(`${match[1]}.${match[2]}`);
    }
    
    return {
      name,
      flows,
      features: [...new Set(features)],
      testObjects: [...new Set(testObjects)],
      edgeCases: [...new Set(edgeCases)],
    };
  }
  
  private extractSetupActions(setupCode: string): string[] {
    const actions: string[] = [];
    
    // 匹配常见 setup 操作
    const setupPatterns = [
      /mock\w*\s*\(/g,
      /spyOn\s*\(/g,
      /create\w*\s*\(/g,
      /init\w*\s*\(/g,
    ];
    
    for (const pattern of setupPatterns) {
      let match;
      while ((match = pattern.exec(setupCode)) !== null) {
        actions.push(match[0].trim());
      }
    }
    
    return actions;
  }
}

/**
 * Go 测试适配器
 * 支持标准 testing 包
 */
export class GoTestAdapter extends TestAdapter {
  readonly language = 'go';
  readonly extensions = ['_test.go'];
  
  protected extractTestInfo(content: string, filePath: string): {
    name: string;
    flows: {
      setup?: string[];
      actions?: string[];
      assertions?: string[];
    };
    features: string[];
    testObjects: string[];
    edgeCases: string[];
  } {
    const name = path.basename(filePath, '_test.go');
    
    const flows = {
      setup: [] as string[],
      actions: [] as string[],
      assertions: [] as string[],
    };
    
    const features: string[] = [];
    const testObjects: string[] = [];
    const edgeCases: string[] = [];
    
    // 匹配 Test 函数
    const testRegex = /func\s+Test(\w+)\s*\(\s*t\s+\*testing\.T\s*\)\s*\{/g;
    let match;
    
    while ((match = testRegex.exec(content)) !== null) {
      const testName = match[1];
      
      // 分类测试
      if (testName.toLowerCase().includes('test')) {
        testObjects.push(testName);
      } else if (
        testName.toLowerCase().includes('edge') ||
        testName.toLowerCase().includes('boundary') ||
        testName.toLowerCase().includes('invalid') ||
        testName.toLowerCase().includes('error')
      ) {
        edgeCases.push(testName);
      } else {
        features.push(testName);
      }
    }
    
    // 匹配 t.Run 子测试
    const subtestRegex = /t\.Run\s*\(\s*"([^"]+)"/g;
    
    while ((match = subtestRegex.exec(content)) !== null) {
      const subtestName = match[1];
      
      if (
        subtestName.toLowerCase().includes('edge') ||
        subtestName.toLowerCase().includes('boundary')
      ) {
        edgeCases.push(subtestName);
      } else {
        features.push(subtestName);
      }
    }
    
    // 匹配断言
    const assertRegex = /t\.(?:Errorf?|Fatalf?|Logf?|Skipf?)\s*\(/g;
    
    while ((match = assertRegex.exec(content)) !== null) {
      flows.assertions.push(match[0].trim());
    }
    
    return {
      name,
      flows,
      features: [...new Set(features)],
      testObjects: [...new Set(testObjects)],
      edgeCases: [...new Set(edgeCases)],
    };
  }
}
