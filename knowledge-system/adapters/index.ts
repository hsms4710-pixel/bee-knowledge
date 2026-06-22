/**
 * 知识沉淀系统 - 适配器索引
 * 
 * @module knowledge-system/adapters/index
 */

export { TypeScriptAdapter } from './typescript';
export { GoAdapter } from './go';
export { ProtoAdapter } from './proto';
export { TestAdapter, TypeScriptTestAdapter, GoTestAdapter } from './test';
export { BaseAdapter, AdapterRegistry } from '../base-adapter';
export * from '../types';
