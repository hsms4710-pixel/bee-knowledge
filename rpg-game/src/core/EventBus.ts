/**
 * 事件总线
 * 用于系统间和组件间的通信
 */

type EventHandler<T = unknown> = (data: T) => void;

interface TypedEvent<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
}

export class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private history: TypedEvent[] = [];
  private maxHistory: number = 1000;

  /** 订阅事件 */
  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as EventHandler);

    // 返回取消订阅函数
    return () => this.off(event, handler);
  }

  /** 一次性订阅 */
  once<T = unknown>(event: string, handler: EventHandler<T>): void {
    const wrappedHandler: EventHandler<T> = (data) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    this.on(event, wrappedHandler);
  }

  /** 取消订阅 */
  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    this.listeners.get(event)?.delete(handler as EventHandler);
  }

  /** 发布事件 */
  emit<T = unknown>(event: string, data?: T): void {
    const typedEvent: TypedEvent<T> = {
      type: event,
      data: data as T,
      timestamp: Date.now()
    };

    // 记录历史
    this.history.push(typedEvent);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // 触发监听器
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /** 等待一次性事件 */
  async waitFor<T = unknown>(event: string, timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const handler: EventHandler<T> = (data) => {
        this.off(event, handler);
        resolve(data);
      };

      this.on(event, handler);

      if (timeout) {
        setTimeout(() => {
          this.off(event, handler);
          reject(new Error(`Timeout waiting for event "${event}"`));
        }, timeout);
      }
    });
  }

  /** 获取事件历史 */
  getHistory(event?: string): TypedEvent[] {
    if (event) {
      return this.history.filter(e => e.type === event);
    }
    return [...this.history];
  }

  /** 清除历史 */
  clearHistory(): void {
    this.history = [];
  }

  /** 获取订阅数量 */
  getListenerCount(event?: string): number {
    if (event) {
      return this.listeners.get(event)?.size ?? 0;
    }
    let total = 0;
    this.listeners.forEach(listeners => {
      total += listeners.size;
    });
    return total;
  }
}

// 全局事件总线实例
export const eventBus = new EventBus();
