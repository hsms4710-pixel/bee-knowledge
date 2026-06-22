/**
 * Vitest 配置文件
 * 设置 Node.js 环境中的全局变量
 */

// 模拟 requestAnimationFrame
(globalThis as any).requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(callback, 16) as unknown as number;
};

(globalThis as any).cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
};

// 模拟 DOM 相关 API
(globalThis as any).document = {
  createElement: () => ({
    addEventListener: () => {},
    removeEventListener: () => {},
    style: {}
  }),
  getElementById: () => null,
  body: {}
};

(globalThis as any).window = globalThis;
