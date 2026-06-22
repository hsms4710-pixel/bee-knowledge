/**
 * GDD 第四步：根据图谱生成代码
 * 
 * 基于 L5_Task 层的任务定义，自动生成代码文件
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectDir = join(__dirname);

async function gddStep4_Generate(): Promise<void> {
  console.log('='.repeat(60));
  console.log('🚀 GDD 开发流程 - 步骤 4: 根据图谱生成代码');
  console.log('='.repeat(60));

  // ========== 4.1 生成 package.json ==========
  console.log('\n【4.1】生成 package.json');
  console.log('-'.repeat(40));
  
  const packageJson = {
    name: 'space-shooter',
    version: '1.0.0',
    description: 'A space shooter game built with GDD',
    main: 'src/index.ts',
    type: 'module',
    scripts: {
      dev: 'tsx watch src/index.ts',
      build: 'tsc',
      test: 'vitest run',
      test:watch: 'vitest'
    },
    keywords: ['game', 'space-shooter', 'typescript'],
    author: 'GDD Generated',
    license: 'MIT',
    dependencies: {
      typescript: '^5.3.3',
      vitest: '^1.1.0'
    },
    devDependencies: {
      '@types/node': '^20.10.0',
      tsx: '^4.7.0'
    }
  };
  
  writeFileSync(join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json 生成完成');

  // ========== 4.2 生成 tsconfig.json ==========
  console.log('\n【4.2】生成 tsconfig.json');
  console.log('-'.repeat(40));
  
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'bundler',
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
      outDir: './dist',
      rootDir: './src',
      declaration: true,
      resolveJsonModule: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', 'tests']
  };
  
  writeFileSync(join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
  console.log('✅ tsconfig.json 生成完成');

  // ========== 4.3 生成 vitest.config.ts ==========
  console.log('\n【4.3】生成 vitest.config.ts');
  console.log('-'.repeat(40));
  
  const vitestConfig = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts']
  }
});
`;
  writeFileSync(join(projectDir, 'vitest.config.ts'), vitestConfig);
  console.log('✅ vitest.config.ts 生成完成');

  // ========== 4.4 生成 vitest.setup.ts ==========
  console.log('\n【4.4】生成 vitest.setup.ts');
  console.log('-'.repeat(40));
  
  const vitestSetup = `/**
 * Vitest 配置文件
 */

(globalThis as any).requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(callback, 16) as unknown as number;
};

(globalThis as any).cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
};

(globalThis as any).document = {
  createElement: () => ({
    addEventListener: () => {},
    removeEventListener: () => {},
    style: {},
    width: 800,
    height: 600,
    getContext: () => ({
      fillRect: () => {},
      strokeRect: () => {},
      drawImage: () => {},
      fillText: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      clearRect: () => {},
      save: () => {},
      restore: () => {},
      setTransform: () => {}
    })
  }),
  getElementById: () => null,
  body: {},
  createElementNS: () => ({
    addEventListener: () => {},
    style: {}
  })
};

(globalThis as any).window = globalThis;
`;
  writeFileSync(join(projectDir, 'vitest.setup.ts'), vitestSetup);
  console.log('✅ vitest.setup.ts 生成完成');

  // ========== 4.5 生成核心模块 ==========
  console.log('\n【4.5】生成核心模块 (L5: n_l5_game_engine, n_l5_renderer)');
  console.log('-'.repeat(40));
  
  await generateFile('src/core/GameEngine.ts', generateGameEngine());
  await generateFile('src/core/Renderer.ts', generateRenderer());
  console.log('✅ 核心模块生成完成');

  // ========== 4.6 生成实体类 ==========
  console.log('\n【4.6】生成实体类 (L5: n_l5_player_class, n_l5_enemy_class, etc.)');
  console.log('-'.repeat(40));
  
  await generateFile('src/entities/Player.ts', generatePlayer());
  await generateFile('src/entities/Enemy.ts', generateEnemy());
  await generateFile('src/entities/Bullet.ts', generateBullet());
  await generateFile('src/entities/PowerUp.ts', generatePowerUp());
  await generateFile('src/entities/Boss.ts', generateBoss());
  console.log('✅ 实体类生成完成');

  // ========== 4.7 生成系统模块 ==========
  console.log('\n【4.7】生成系统模块 (L5: n_l5_weapon_system, etc.)');
  console.log('-'.repeat(40));
  
  await generateFile('src/systems/EnemySpawner.ts', generateEnemySpawner());
  await generateFile('src/systems/WeaponSystem.ts', generateWeaponSystem());
  await generateFile('src/systems/CollisionSystem.ts', generateCollisionSystem());
  await generateFile('src/systems/PowerUpSystem.ts', generatePowerUpSystem());
  console.log('✅ 系统模块生成完成');

  // ========== 4.8 生成关卡和 UI ==========
  console.log('\n【4.8】生成关卡和 UI (L5: n_l5_level_class, n_l5_hud, n_l5_menu)');
  console.log('-'.repeat(40));
  
  await generateFile('src/levels/Level.ts', generateLevel());
  await generateFile('src/ui/HUD.ts', generateHUD());
  await generateFile('src/ui/Menu.ts', generateMenu());
  console.log('✅ 关卡和 UI 生成完成');

  // ========== 4.9 生成入口文件 ==========
  console.log('\n【4.9】生成入口文件');
  console.log('-'.repeat(40));
  
  await generateFile('src/index.ts', generateIndex());
  console.log('✅ 入口文件生成完成');

  // ========== 4.10 生成测试文件 ==========
  console.log('\n【4.10】生成测试文件');
  console.log('-'.repeat(40));
  
  await generateFile('tests/game-systems.test.ts', generateTests());
  console.log('✅ 测试文件生成完成');

  console.log('\n' + '='.repeat(60));
  console.log('✅ GDD 代码生成完成！');
  console.log('='.repeat(60));
  console.log('\n生成的文件列表:');
  console.log('  - package.json');
  console.log('  - tsconfig.json');
  console.log('  - vitest.config.ts');
  console.log('  - vitest.setup.ts');
  console.log('  - src/core/GameEngine.ts');
  console.log('  - src/core/Renderer.ts');
  console.log('  - src/entities/Player.ts');
  console.log('  - src/entities/Enemy.ts');
  console.log('  - src/entities/Bullet.ts');
  console.log('  - src/entities/PowerUp.ts');
  console.log('  - src/entities/Boss.ts');
  console.log('  - src/systems/EnemySpawner.ts');
  console.log('  - src/systems/WeaponSystem.ts');
  console.log('  - src/systems/CollisionSystem.ts');
  console.log('  - src/systems/PowerUpSystem.ts');
  console.log('  - src/levels/Level.ts');
  console.log('  - src/ui/HUD.ts');
  console.log('  - src/ui/Menu.ts');
  console.log('  - src/index.ts');
  console.log('  - tests/game-systems.test.ts');
  console.log('\n下一步: 运行测试验证生成的代码...');
}

async function generateFile(relativePath: string, content: string): Promise<void> {
  const fullPath = join(projectDir, relativePath);
  const dir = dirname(fullPath);
  
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  writeFileSync(fullPath, content);
}

// ========== 代码生成函数 ==========

function generateGameEngine(): string {
  return `/**
 * 游戏引擎 - Space Shooter
 * L5_Task: n_l5_game_engine
 * 
 * 负责游戏的初始化、循环和状态管理
 */

import { Renderer } from './Renderer';
import { Player } from '../entities/Player';
import { EnemySpawner } from '../systems/EnemySpawner';
import { WeaponSystem } from '../systems/WeaponSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { PowerUpSystem } from '../systems/PowerUpSystem';
import { Level } from '../levels/Level';
import { HUD } from '../ui/HUD';
import { Menu } from '../ui/Menu';

export interface GameConfig {
  title: string;
  width: number;
  height: number;
  fps: number;
  debug: boolean;
}

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete';

export class GameEngine {
  private config: GameConfig;
  private state: GameState = 'menu';
  private lastTime: number = 0;
  private accumulator: number = 0;
  
  // 游戏系统
  private renderer: Renderer;
  private player: Player;
  private enemySpawner: EnemySpawner;
  private weaponSystem: WeaponSystem;
  private collisionSystem: CollisionSystem;
  private powerUpSystem: PowerUpSystem;
  private level: Level;
  private hud: HUD;
  private menu: Menu;

  constructor(config: GameConfig) {
    this.config = {
      fps: 60,
      debug: false,
      ...config
    };
    
    // 初始化渲染器
    this.renderer = new Renderer(config.width, config.height);
    this.hud = new HUD(this.renderer);
    this.menu = new HUD(this.renderer);
  }

  async initialize(): Promise<void> {
    console.log(\`Initializing \${this.config.title}...\`);
    
    // 初始化玩家
    this.player = new Player(
      this.config.width / 2,
      this.config.height - 100
    );
    
    // 初始化游戏系统
    this.enemySpawner = new EnemySpawner(this.config.width);
    this.weaponSystem = new WeaponSystem(this.player);
    this.collisionSystem = new CollisionSystem();
    this.powerUpSystem = new PowerUpSystem();
    
    // 初始化关卡
    this.level = new Level(1);
    
    console.log(\`\${this.config.title} initialized successfully!\`);
  }

  start(): void {
    if (this.state !== 'menu' && this.state !== 'gameOver') return;
    
    this.state = 'playing';
    this.lastTime = Date.now();
    this.gameLoop();
    console.log('Game started!');
  }

  pause(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
      console.log('Game paused');
    }
  }

  resume(): void {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.lastTime = Date.now();
      console.log('Game resumed');
    }
  }

  stop(): void {
    this.state = 'gameOver';
    console.log('Game over');
  }

  private gameLoop(): void {
    if (this.state !== 'playing') return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    const fixedDeltaTime = 1 / this.config.fps;
    this.accumulator += deltaTime;

    while (this.accumulator >= fixedDeltaTime) {
      this.update(fixedDeltaTime);
      this.accumulator -= fixedDeltaTime;
    }

    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    // 更新玩家
    this.player.update(deltaTime, this.config.width, this.config.height);
    
    // 更新武器系统
    this.weaponSystem.update(deltaTime);
    
    // 生成敌机
    this.enemySpawner.spawn(deltaTime, this.level.getEnemyConfig());
    
    // 更新敌机
    this.enemySpawner.updateEnemies(deltaTime, this.config.height);
    
    // 更新道具
    this.powerUpSystem.updatePowerUps(deltaTime, this.config.height);
    
    // 碰撞检测
    this.collisionSystem.checkCollisions(
      this.player,
      this.weaponSystem.getBullets(),
      this.enemySpawner.getEnemies(),
      this.powerUpSystem.getPowerUps()
    );
    
    // 处理碰撞结果
    this.processCollisions();
    
    // 检查关卡完成
    if (this.level.isComplete()) {
      this.state = 'levelComplete';
    }
  }

  private render(): void {
    this.renderer.clear();
    
    // 渲染背景
    this.renderer.drawBackground();
    
    // 渲染敌机
    this.enemySpawner.render(this.renderer.ctx);
    
    // 渲染道具
    this.powerUpSystem.render(this.renderer.ctx);
    
    // 渲染子弹
    this.weaponSystem.render(this.renderer.ctx);
    
    // 渲染玩家
    this.player.render(this.renderer.ctx);
    
    // 渲染 HUD
    this.hud.update(this.player);
    this.hud.render(this.renderer.ctx);
    
    // 呈现画面
    this.renderer.present();
  }

  private processCollisions(): void {
    // 子弹击中敌机
    // 玩家拾取道具
    // 玩家被敌机击中
  }

  getState(): GameState {
    return this.state;
  }

  getPlayer(): Player {
    return this.player;
  }
}
`;
}

function generateRenderer(): string {
  return `/**
 * 渲染器 - Space Shooter
 * L5_Task: n_l5_renderer
 * 
 * 负责 Canvas 渲染和画面输出
 */

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawBackground(): void {
    // 绘制星空背景
    this.ctx.fillStyle = '#000022';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 绘制星星
    this.ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const size = Math.random() * 1.5 + 0.5;
      this.ctx.fillRect(x, y, size, size);
    }
  }

  present(): void {
    // 呈现画面（在实际项目中会将 canvas 添加到 DOM）
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getCtx(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
`;
}

function generatePlayer(): string {
  return `/**
 * 玩家飞船 - Space Shooter
 * L5_Task: n_l5_player_class, n_l5_player_update
 * 
 * 玩家控制的飞船实体
 */

export interface PlayerStats {
  health: number;
  maxHealth: number;
  score: number;
  weaponLevel: number;
  speed: number;
}

export class Player {
  public x: number;
  public y: number;
  public width: number = 40;
  public height: number = 60;
  public stats: PlayerStats;
  public isAlive: boolean = true;
  
  private keys: Set<string> = new Set();

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.stats = {
      health: 3,
      maxHealth: 3,
      score: 0,
      weaponLevel: 1,
      speed: 300 // 像素/秒
    };
  }

  update(deltaTime: number, screenWidth: number, screenHeight: number): void {
    // 处理键盘输入
    const moveSpeed = this.stats.speed * deltaTime;
    
    if (this.keys.has('ArrowLeft') || this.keys.has('a')) {
      this.x -= moveSpeed;
    }
    if (this.keys.has('ArrowRight') || this.keys.has('d')) {
      this.x += moveSpeed;
    }
    if (this.keys.has('ArrowUp') || this.keys.has('w')) {
      this.y -= moveSpeed;
    }
    if (this.keys.has('ArrowDown') || this.keys.has('s')) {
      this.y += moveSpeed;
    }

    // 边界检测
    this.x = Math.max(0, Math.min(screenWidth - this.width, this.x));
    this.y = Math.max(0, Math.min(screenHeight - this.height, this.y));
  }

  render(ctx: CanvasRenderingContext2D): void {
    // 绘制飞船
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height / 2);
    ctx.lineTo(this.x + this.width / 2, this.y + this.height * 0.7);
    ctx.lineTo(this.x, this.y + this.height / 2);
    ctx.closePath();
    ctx.fill();
  }

  takeDamage(amount: number = 1): void {
    this.stats.health -= amount;
    if (this.stats.health <= 0) {
      this.isAlive = false;
    }
  }

  heal(amount: number = 1): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  addScore(points: number): void {
    this.stats.score += points;
  }

  upgradeWeapon(): void {
    this.stats.weaponLevel = Math.min(3, this.stats.weaponLevel + 1);
  }

  pressKey(key: string): void {
    this.keys.add(key);
  }

  releaseKey(key: string): void {
    this.keys.delete(key);
  }
}
`;
}

function generateEnemy(): string {
  return `/**
 * 敌机 - Space Shooter
 * L5_Task: n_l5_enemy_class
 * 
 * 敌机实体，有多种类型
 */

export type EnemyType = 'basic' | 'fast' | 'tank' | 'shooter';

export interface EnemyStats {
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number;
  score: number;
  dropRate: number;
}

export class Enemy {
  public x: number;
  public y: number;
  public width: number = 30;
  public height: number = 30;
  public stats: EnemyStats;
  public isAlive: boolean = true;

  constructor(x: number, y: number, type: EnemyType = 'basic') {
    this.x = x;
    this.y = y;
    this.stats = this.createStats(type);
  }

  private createStats(type: EnemyType): EnemyStats {
    const stats: Record<EnemyType, EnemyStats> = {
      basic: { type: 'basic', health: 1, maxHealth: 1, speed: 100, score: 10, dropRate: 0.1 },
      fast: { type: 'fast', health: 1, maxHealth: 1, speed: 200, score: 20, dropRate: 0.15 },
      tank: { type: 'tank', health: 5, maxHealth: 5, speed: 50, score: 50, dropRate: 0.3 },
      shooter: { type: 'shooter', health: 2, maxHealth: 2, speed: 80, score: 30, dropRate: 0.2 }
    };
    return stats[type];
  }

  update(deltaTime: number, screenHeight: number): void {
    this.y += this.stats.speed * deltaTime;
    
    // 出屏幕则销毁
    if (this.y > screenHeight) {
      this.isAlive = false;
    }
  }

  takeDamage(amount: number = 1): void {
    this.stats.health -= amount;
    if (this.stats.health <= 0) {
      this.isAlive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const colors = {
      basic: '#ff6666',
      fast: '#ff3333',
      tank: '#ff9933',
      shooter: '#9933ff'
    };
    
    ctx.fillStyle = colors[this.stats.type];
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
`;
}

function generateBullet(): string {
  return `/**
 * 子弹 - Space Shooter
 * L5_Task: n_l5_bullet_class
 * 
 * 子弹实体
 */

export type BulletOwner = 'player' | 'enemy';

export class Bullet {
  public x: number;
  public y: number;
  public radius: number = 4;
  public speed: number = 600;
  public damage: number = 1;
  public owner: BulletOwner;
  public isAlive: boolean = true;

  constructor(x: number, y: number, owner: BulletOwner = 'player') {
    this.x = x;
    this.y = y;
    this.owner = owner;
    this.speed = owner === 'player' ? 600 : 400;
    this.damage = owner === 'player' ? 1 : 1;
  }

  update(deltaTime: number): void {
    // 子弹向上或向下移动
    if (this.owner === 'player') {
      this.y -= this.speed * deltaTime;
    } else {
      this.y += this.speed * deltaTime;
    }
    
    // 出屏幕则销毁
    if (this.y < -10 || this.y > 700) {
      this.isAlive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.owner === 'player' ? '#ffff00' : '#ff0000';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
`;
}

function generatePowerUp(): string {
  return `/**
 * 道具 - Space Shooter
 * L5_Task: n_l5_powerup_class
 * 
 * 道具实体
 */

export type PowerUpType = 'weapon' | 'shield' | 'bomb' | 'life';

export interface PowerUpStats {
  type: PowerUpType;
  duration: number; // 持续时间（毫秒）
  effect: string;
}

export class PowerUp {
  public x: number;
  public y: number;
  public radius: number = 20;
  public speed: number = 100;
  public stats: PowerUpStats;
  public isAlive: boolean = true;

  constructor(x: number, y: number, type: PowerUpType = 'weapon') {
    this.x = x;
    this.y = y;
    this.stats = this.createStats(type);
  }

  private createStats(type: PowerUpType): PowerUpStats {
    return {
      weapon: { type: 'weapon', duration: 15000, effect: 'upgrade_weapon' },
      shield: { type: 'shield', duration: 10000, effect: 'protect' },
      bomb: { type: 'bomb', duration: 0, effect: 'clear_screen' },
      life: { type: 'life', duration: 0, effect: 'restore_health' }
    }[type];
  }

  update(deltaTime: number, screenHeight: number): void {
    this.y += this.speed * deltaTime;
    
    if (this.y > screenHeight) {
      this.isAlive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const colors = {
      weapon: '#ffff00',
      shield: '#00ffff',
      bomb: '#ff00ff',
      life: '#00ff00'
    };
    
    ctx.fillStyle = colors[this.stats.type];
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
`;
}

function generateBoss(): string {
  return `/**
 * Boss - Space Shooter
 * L5_Task: n_l5_boss_class
 * 
 * Boss 实体，多阶段战斗
 */

export interface BossStats {
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  patternIndex: number;
}

export class Boss {
  public x: number;
  public y: number;
  public width: number = 200;
  public height: number = 100;
  public stats: BossStats;
  public isAlive: boolean = true;
  public phase: number = 1;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.stats = {
      health: 1000,
      maxHealth: 1000,
      speed: 50,
      damage: 10,
      patternIndex: 0
    };
  }

  update(deltaTime: number, screenWidth: number): void {
    // 简单的左右移动
    this.x += Math.sin(Date.now() / 500) * this.stats.speed * deltaTime;
    this.x = Math.max(0, Math.min(screenWidth - this.width, this.x));
  }

  takeDamage(amount: number): void {
    this.stats.health -= amount;
    
    // 阶段转换
    if (this.stats.health < this.stats.maxHealth * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.stats.speed *= 1.5;
    }
    
    if (this.stats.health <= 0) {
      this.isAlive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // 绘制 Boss 飞船
    ctx.fillStyle = '#ff0066';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 阶段指示器
    ctx.fillStyle = this.phase === 2 ? '#ff0000' : '#ff6666';
    ctx.fillRect(this.x, this.y - 10, this.width * (this.stats.health / this.stats.maxHealth), 8);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x, this.y - 10, this.width, 8);
  }
}
`;
}

function generateEnemySpawner(): string {
  return `/**
 * 敌机生成器 - Space Shooter
 * L5_Task: n_l5_enemy_spawner
 * 
 * 负责定时生成敌机
 */

import { Enemy, EnemyType } from '../entities/Enemy';

export interface EnemyConfig {
  spawnInterval: number;
  enemyTypes: EnemyType[];
  difficulty: number;
}

export class EnemySpawner {
  private enemies: Enemy[] = [];
  private spawnTimer: number = 0;
  private screenWidth: number;
  private spawnInterval: number = 1000;
  private difficulty: number = 1;

  constructor(screenWidth: number) {
    this.screenWidth = screenWidth;
  }

  spawn(deltaTime: number, config?: EnemyConfig): void {
    if (config) {
      this.spawnInterval = config.spawnInterval;
      this.difficulty = config.difficulty;
    }

    this.spawnTimer -= deltaTime;
    
    if (this.spawnTimer <= 0) {
      this.createEnemy();
      this.spawnTimer = this.spawnInterval - (this.difficulty * 50);
    }
  }

  private createEnemy(): void {
    const enemyTypes: EnemyType[] = ['basic', 'fast', 'tank', 'shooter'];
    const type = enemyTypes[Math.floor(Math.random() * Math.min(this.difficulty, enemyTypes.length))];
    
    const x = Math.random() * (this.screenWidth - 30);
    const y = -30;
    
    const enemy = new Enemy(x, y, type);
    this.enemies.push(enemy);
  }

  updateEnemies(deltaTime: number, screenHeight: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].update(deltaTime, screenHeight);
      if (!this.enemies[i].isAlive) {
        this.enemies.splice(i, 1);
      }
    }
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.enemies.forEach(enemy => enemy.render(ctx));
  }

  clear(): void {
    this.enemies = [];
  }
}
`;
}

function generateWeaponSystem(): string {
  return `/**
 * 武器系统 - Space Shooter
 * L5_Task: n_l5_weapon_system
 * 
 * 管理玩家武器和射击
 */

import { Bullet } from '../entities/Bullet';
import { Player } from '../entities/Player';

export class WeaponSystem {
  private bullets: Bullet[] = [];
  private fireTimer: number = 0;
  private player: Player;
  private fireRate: number = 200; // 毫秒

  constructor(player: Player) {
    this.player = player;
    this.updateFireRate();
  }

  private updateFireRate(): void {
    // 根据武器等级调整射速
    const rates = [200, 150, 100];
    this.fireRate = rates[Math.min(this.player.stats.weaponLevel - 1, rates.length - 1)];
  }

  update(deltaTime: number): void {
    // 检测空格键射击
    if (this.player.keys.has(' ')) {
      this.fireTimer -= deltaTime;
      
      if (this.fireTimer <= 0) {
        this.shoot();
        this.fireTimer = this.fireRate;
      }
    }

    // 更新子弹
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].update(deltaTime);
      if (!this.bullets[i].isAlive) {
        this.bullets.splice(i, 1);
      }
    }

    this.updateFireRate();
  }

  private shoot(): void {
    const bulletX = this.player.x + this.player.width / 2;
    const bulletY = this.player.y;
    
    // 根据武器等级生成子弹数量
    const bulletCount = Math.min(this.player.stats.weaponLevel, 3);
    const spread = bulletCount > 1 ? 0.3 : 0;
    
    for (let i = 0; i < bulletCount; i++) {
      const offset = bulletCount === 1 ? 0 : (i - (bulletCount - 1) / 2) * spread;
      const bullet = new Bullet(bulletX + offset * 20, bulletY);
      this.bullets.push(bullet);
    }
  }

  getBullets(): Bullet[] {
    return this.bullets;
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.bullets.forEach(bullet => bullet.render(ctx));
  }

  clear(): void {
    this.bullets = [];
  }
}
`;
}

function generateCollisionSystem(): string {
  return `/**
 * 碰撞系统 - Space Shooter
 * L5_Task: n_l5_collision_system
 * 
 * 处理所有碰撞检测
 */

import { Player } from '../entities/Player';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { PowerUp } from '../entities/PowerUp';

export interface CollisionResult {
  bulletHitEnemy: Array<{ bullet: Bullet; enemy: Enemy }>;
  playerHitPowerUp: Array<{ player: Player; powerUp: PowerUp }>;
  playerHitEnemy: Array<{ player: Player; enemy: Enemy }>;
}

export class CollisionSystem {
  
  checkCollisions(
    player: Player,
    bullets: Bullet[],
    enemies: Enemy[],
    powerUps: PowerUp[]
  ): CollisionResult {
    const result: CollisionResult = {
      bulletHitEnemy: [],
      playerHitPowerUp: [],
      playerHitEnemy: []
    };

    // 子弹 vs 敌机
    for (const bullet of bullets) {
      if (!bullet.isAlive || bullet.owner !== 'player') continue;
      
      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;
        
        if (this.circleRectCollision(bullet, enemy)) {
          result.bulletHitEnemy.push({ bullet, enemy });
          bullet.isAlive = false;
          enemy.takeDamage(bullet.damage);
          break;
        }
      }
    }

    // 玩家 vs 道具
    for (const powerUp of powerUps) {
      if (!powerUp.isAlive) continue;
      
      if (this.rectCollision(player, powerUp)) {
        result.playerHitPowerUp.push({ player, powerUp });
        powerUp.isAlive = false;
      }
    }

    // 玩家 vs 敌机（简化版，实际应该用敌机子弹）
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      
      if (this.rectCollision(player, enemy)) {
        result.playerHitEnemy.push({ player, enemy });
        enemy.isAlive = false;
        player.takeDamage(1);
      }
    }

    return result;
  }

  private circleRectCollision(circle: Bullet, rect: Enemy): boolean {
    const cx = circle.x;
    const cy = circle.y;
    const rx = rect.x;
    const ry = rect.y;
    const rw = rect.width;
    const rh = rect.height;

    const nearestX = Math.max(rx, Math.min(cx, rx + rw));
    const nearestY = Math.max(ry, Math.min(cy, ry + rh));

    const dx = cx - nearestX;
    const dy = cy - nearestY;

    return dx * dx + dy * dy < circle.radius * circle.radius;
  }

  private rectCollision(a: Player | PowerUp, b: Player | PowerUp | Enemy): boolean {
    return !(a.x + a.width < b.x ||
             b.x + (b as any).width < a.x ||
             a.y + a.height < b.y ||
             b.y + (b as any).height < a.y);
  }
}
`;
}

function generatePowerUpSystem(): string {
  return `/**
 * 道具系统 - Space Shooter
 * L5_Task: n_l5_powerup_system
 * 
 * 管理道具掉落、拾取和效果
 */

import { PowerUp, PowerUpType } from '../entities/PowerUp';
import { Player } from '../entities/Player';

export class PowerUpSystem {
  private powerUps: PowerUp[] = [];

  spawn(x: number, y: number, type: PowerUpType = 'weapon'): void {
    const powerUp = new PowerUp(x, y, type);
    this.powerUps.push(powerUp);
  }

  spawnRandom(x: number, y: number): void {
    const types: PowerUpType[] = ['weapon', 'shield', 'bomb', 'life'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.spawn(x, y, type);
  }

  updatePowerUps(deltaTime: number, screenHeight: number): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      this.powerUps[i].update(deltaTime, screenHeight);
      if (!this.powerUps[i].isAlive) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  applyPowerUp(player: Player, powerUp: PowerUp): void {
    switch (powerUp.stats.type) {
      case 'weapon':
        player.upgradeWeapon();
        break;
      case 'shield':
        // 实际应该添加护盾效果
        break;
      case 'bomb':
        // 实际应该清屏
        break;
      case 'life':
        player.heal(1);
        break;
    }
  }

  getPowerUps(): PowerUp[] {
    return this.powerUps;
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.powerUps.forEach(powerUp => powerUp.render(ctx));
  }

  clear(): void {
    this.powerUps = [];
  }
}
`;
}

function generateLevel(): string {
  return `/**
 * 关卡 - Space Shooter
 * L5_Task: n_l5_level_class
 * 
 * 关卡配置和管理
 */

import { EnemyType } from '../entities/Enemy';

export interface EnemyWave {
  enemyType: EnemyType;
  count: number;
  interval: number;
}

export class Level {
  private levelNumber: number;
  private waves: EnemyWave[];
  private currentWaveIndex: number = 0;
  private enemiesSpawned: number = 0;
  private enemiesKilled: number = 0;

  constructor(levelNumber: number) {
    this.levelNumber = levelNumber;
    this.waves = this.generateWaves();
  }

  private generateWaves(): EnemyWave[] {
    // 根据关卡生成波次
    const baseWaves: EnemyWave[] = [
      { enemyType: 'basic', count: 10, interval: 800 },
      { enemyType: 'fast', count: 5, interval: 600 },
      { enemyType: 'tank', count: 3, interval: 1000 },
      { enemyType: 'shooter', count: 5, interval: 700 }
    ];

    // 难度递增
    return baseWaves.map((wave, i) => ({
      ...wave,
      count: wave.count + this.levelNumber * 2,
      interval: Math.max(400, wave.interval - this.levelNumber * 50)
    }));
  }

  getEnemyConfig(): { spawnInterval: number; enemyTypes: EnemyType[]; difficulty: number } {
    const currentWave = this.waves[this.currentWaveIndex];
    return {
      spawnInterval: currentWave.interval,
      enemyTypes: [currentWave.enemyType],
      difficulty: this.levelNumber
    };
  }

  enemyKilled(): void {
    this.enemiesKilled++;
  }

  isComplete(): boolean {
    return this.enemiesKilled >= this.getTotalEnemyCount();
  }

  private getTotalEnemyCount(): number {
    return this.waves.reduce((sum, wave) => sum + wave.count, 0);
  }

  getLevelNumber(): number {
    return this.levelNumber;
  }
}
`;
}

function generateHUD(): string {
  return `/**
 * HUD - Space Shooter
 * L5_Task: n_l5_hud
 * 
 * 游戏内 HUD 显示
 */

import { Player } from '../entities/Player';

export class HUD {
  private renderer: any;

  constructor(renderer: any) {
    this.renderer = renderer;
  }

  update(player: Player): void {
    // 更新 HUD 数据
  }

  render(ctx: CanvasRenderingContext2D): void {
    // 生命值
    const heartX = 10;
    const heartY = 10;
    const heartSize = 20;
    
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < this.player.stats.health ? '#ff0000' : '#333333';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('♥', heartX + i * (heartSize + 5), heartY + heartSize);
    }

    // 得分
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(\`Score: \${this.player.stats.score}\`, 10, 50);

    // 武器等级
    ctx.fillText(\`Weapon: \${'★'.repeat(this.player.stats.weaponLevel)}\${'☆'.repeat(3 - this.player.stats.weaponLevel)}\`, 10, 70);
  }
}
`;
}

function generateMenu(): string {
  return `/**
 * 菜单 - Space Shooter
 * L5_Task: n_l5_menu
 * 
 * 主菜单 UI
 */

export class Menu {
  private renderer: any;
  private selectedOption: number = 0;
  private options: string[] = ['Start Game', 'Continue', 'Exit'];

  constructor(renderer: any) {
    this.renderer = renderer;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // 标题
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE SHOOTER', 400, 200);

    // 选项
    ctx.font = '24px Arial';
    this.options.forEach((option, index) => {
      ctx.fillStyle = index === this.selectedOption ? '#ffff00' : '#ffffff';
      ctx.fillText(option, 400, 300 + index * 60);
    });
  }

  selectOption(index: number): void {
    this.selectedOption = Math.max(0, Math.min(this.options.length - 1, index));
  }

  getSelectedOption(): number {
    return this.selectedOption;
  }
}
`;
}

function generateIndex(): string {
  return `/**
 * Space Shooter 入口
 * 
 * 基于 GDD 图谱自动生成
 */

import { GameEngine } from './core/GameEngine';
import { eventBus } from './core/EventBus';

const gameConfig = {
  title: 'Space Shooter',
  width: 800,
  height: 600,
  fps: 60,
  debug: true
};

const engine = new GameEngine(gameConfig);

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Space Shooter - GDD Generated Game');
  console.log('='.repeat(60));

  // 1. 初始化游戏
  console.log('\\n1. 初始化游戏...');
  await engine.initialize();

  // 2. 启动游戏
  console.log('\\n2. 启动游戏...');
  engine.start();

  // 3. 游戏信息
  console.log('\\n3. 游戏信息:');
  console.log('   - 屏幕尺寸: 800x600');
  console.log('   - 目标帧率: 60 FPS');
  console.log('   - 控制方式: WASD/方向键移动，空格键射击');
  console.log('\\n4. 游戏特性:');
  console.log('   - 4种敌机类型 (基础、快速、坦克、射手)');
  console.log('   - 4种道具 (火力升级、护盾、炸弹、生命)');
  console.log('   - 武器等级系统 (3级)');
  console.log('   - 关卡系统');

  console.log('\\n5. GDD 图谱映射:');
  console.log('   L1_Constitution: 趣味性优先、难度平衡、流畅响应');
  console.log('   L2_TechStack: TypeScript、HTML5 Canvas、Vitest');
  console.log('   L3_Epic: 玩家系统、敌机系统、武器系统、道具系统、Boss系统、关卡系统、UI系统');
  console.log('   L4_Story: 移动、生命、得分、生成、AI、射击、碰撞、掉落、拾取、效果...');
  console.log('   L5_Task: 16个具体开发任务');

  console.log('\\n游戏已准备就绪!');
}

if (import.meta.url === \`file://\${process.argv[1]}\`) {
  main().catch(console.error);
}

export { engine };
`;
}

function generateTests(): string {
  return `/**
 * Space Shooter 测试
 * 
 * 基于 GDD 图谱自动生成
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '../src/entities/Player';
import { Enemy } from '../src/entities/Enemy';
import { Bullet } from '../src/entities/Bullet';
import { PowerUp } from '../src/entities/PowerUp';
import { GameEngine } from '../src/core/GameEngine';

describe('Space Shooter Game', () => {
  let player: Player;
  let enemy: Enemy;
  let bullet: Bullet;

  beforeEach(() => {
    player = new Player(400, 500);
    enemy = new Enemy(100, 100, 'basic');
    bullet = new Bullet(420, 500);
  });

  describe('Player', () => {
    it('should be created at correct position', () => {
      expect(player.x).toBe(400);
      expect(player.y).toBe(500);
    });

    it('should have initial stats', () => {
      expect(player.stats.health).toBe(3);
      expect(player.stats.score).toBe(0);
      expect(player.stats.weaponLevel).toBe(1);
    });

    it('should take damage', () => {
      player.takeDamage(1);
      expect(player.stats.health).toBe(2);
    });

    it('should die when health reaches 0', () => {
      player.takeDamage(3);
      expect(player.isAlive).toBe(false);
    });

    it('should add score', () => {
      player.addScore(10);
      expect(player.stats.score).toBe(10);
    });

    it('should upgrade weapon', () => {
      player.upgradeWeapon();
      expect(player.stats.weaponLevel).toBe(2);
    });

    it('should heal', () => {
      player.takeDamage(2);
      player.heal(1);
      expect(player.stats.health).toBe(2);
    });
  });

  describe('Enemy', () => {
    it('should be created with correct stats', () => {
      expect(enemy.x).toBe(100);
      expect(enemy.y).toBe(100);
      expect(enemy.stats.type).toBe('basic');
    });

    it('should move down', () => {
      const initialY = enemy.y;
      enemy.update(0.1, 700);
      expect(enemy.y).toBe(initialY + 10); // speed * deltaTime
    });

    it('should take damage', () => {
      enemy.takeDamage(1);
      expect(enemy.isAlive).toBe(false);
    });

    it('should create different enemy types', () => {
      const fastEnemy = new Enemy(100, 100, 'fast');
      expect(fastEnemy.stats.type).toBe('fast');
      expect(fastEnemy.stats.speed).toBe(200);
    });
  });

  describe('Bullet', () => {
    it('should move up when owned by player', () => {
      const initialY = bullet.y;
      bullet.update(0.1);
      expect(bullet.y).toBe(initialY - 60); // speed * deltaTime
    });

    it('should die when out of screen', () => {
      bullet.y = -100;
      bullet.update(0.1);
      expect(bullet.isAlive).toBe(false);
    });
  });

  describe('PowerUp', () => {
    it('should be created with correct stats', () => {
      const powerUp = new PowerUp(400, 300, 'weapon');
      expect(powerUp.stats.type).toBe('weapon');
      expect(powerUp.stats.duration).toBe(15000);
    });

    it('should move down', () => {
      const initialY = enemy.y;
      const powerUp = new PowerUp(400, initialY, 'weapon');
      powerUp.update(0.1, 700);
      expect(powerUp.y).toBe(initialY + 10);
    });
  });
});
`
}

// 运行代码生成
if (import.meta.url === `file://${process.argv[1]}`) {
  gddStep4_Generate().catch(console.error);
}
