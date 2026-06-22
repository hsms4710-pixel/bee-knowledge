/**
 * 游戏引擎核心
 * 负责游戏的初始化、循环和状态管理
 */

export interface GameConfig {
  title: string;
  width: number;
  height: number;
  fps: number;
  debug: boolean;
}

export interface GameEvent {
  type: string;
  payload?: unknown;
  timestamp: number;
}

export type GameState = 'loading' | 'menu' | 'playing' | 'paused' | 'gameOver';

export class GameEngine {
  private config: GameConfig;
  private state: GameState = 'loading';
  private lastTime: number = 0;
  private accumulator: number = 0;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private systems: Map<string, GameSystem> = new Map();
  private entities: Map<string, GameEntity> = new Map();

  constructor(config: GameConfig) {
    this.config = {
      ...config,
      fps: config.fps ?? 60,
      debug: config.debug ?? false
    };
    this.lastTime = Date.now();
  }

  /** 初始化游戏 */
  async initialize(): Promise<void> {
    console.log(`Initializing ${this.config.title}...`);
    
    // 初始化各系统
    for (const [name, system] of this.systems) {
      await system.initialize();
      console.log(`  - ${name} initialized`);
    }

    this.state = 'menu';
    console.log(`${this.config.title} initialized successfully!`);
  }

  /** 启动游戏 */
  start(): void {
    if (this.state !== 'menu') return;
    
    this.state = 'playing';
    this.lastTime = Date.now();
    this.gameLoop();
    console.log('Game started!');
  }

  /** 暂停游戏 */
  pause(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
      console.log('Game paused');
    }
  }

  /** 恢复游戏 */
  resume(): void {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.lastTime = Date.now();
      console.log('Game resumed');
    }
  }

  /** 停止游戏 */
  stop(): void {
    this.state = 'gameOver';
    console.log('Game stopped');
  }

  /** 游戏主循环 */
  private gameLoop(): void {
    if (this.state !== 'playing') return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // 固定时间步长更新
    const fixedDeltaTime = 1 / this.config.fps;
    this.accumulator += deltaTime;

    while (this.accumulator >= fixedDeltaTime) {
      this.update(fixedDeltaTime);
      this.accumulator -= fixedDeltaTime;
    }

    // 渲染
    this.render();

    // 继续循环
    requestAnimationFrame(() => this.gameLoop());
  }

  /** 更新游戏状态 */
  private update(deltaTime: number): void {
    // 更新所有系统
    for (const system of this.systems.values()) {
      system.update(deltaTime);
    }

    // 更新所有实体
    for (const entity of this.entities.values()) {
      entity.update(deltaTime);
    }
  }

  /** 渲染游戏画面 */
  private render(): void {
    // 渲染逻辑
  }

  /** 注册游戏系统 */
  registerSystem(name: string, system: GameSystem): void {
    this.systems.set(name, system);
    system.setEngine(this);
  }

  /** 注册游戏实体 */
  registerEntity(id: string, entity: GameEntity): void {
    this.entities.set(id, entity);
    entity.setEngine(this);
  }

  /** 移除游戏实体 */
  removeEntity(id: string): void {
    this.entities.delete(id);
  }

  /** 添加事件监听器 */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /** 移除事件监听器 */
  off(event: string, callback: Function): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  /** 触发事件 */
  emit(event: string, payload?: unknown): void {
    const gameEvent: GameEvent = {
      type: event,
      payload,
      timestamp: Date.now()
    };

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(gameEvent));
    }
  }

  /** 获取当前状态 */
  getState(): GameState {
    return this.state;
  }

  /** 获取配置 */
  getConfig(): GameConfig {
    return { ...this.config };
  }
}

/** 游戏系统基类 */
export abstract class GameSystem {
  protected engine: GameEngine | null = null;

  setEngine(engine: GameEngine): void {
    this.engine = engine;
  }

  abstract initialize(): Promise<void>;
  abstract update(deltaTime: number): void;
}

/** 游戏实体基类 */
export abstract class GameEntity {
  protected engine: GameEngine | null = null;
  public id: string;
  public x: number = 0;
  public y: number = 0;

  constructor(id: string) {
    this.id = id;
  }

  setEngine(engine: GameEngine): void {
    this.engine = engine;
  }

  abstract update(deltaTime: number): void;
}
