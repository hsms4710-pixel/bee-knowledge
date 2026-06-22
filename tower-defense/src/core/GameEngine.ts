/**
 * Tower Defense Game - GameEngine
 * GDD 生成: node_6cc2a12b
 */

import { PathSystem } from '../systems/PathSystem';
import { WaveManager } from '../systems/WaveManager';
import { Enemy, EnemyConfig } from '../entities/Enemy';
import { Tower } from '../entities/Tower';
import { ArrowTower } from '../entities/towers/ArrowTower';
import { MagicTower } from '../entities/towers/MagicTower';
import { CannonTower } from '../entities/towers/CannonTower';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public width: number;
  public height: number;
  
  public pathSystem: PathSystem;
  public waveManager: WaveManager;
  public towers: Tower[] = [];
  public enemies: Enemy[] = [];
  public gold: number = 200;
  public lives: number = 20;
  public gameState: 'menu' | 'playing' | 'paused' | 'gameover' | 'victory' = 'menu';
  
  private lastTime: number = 0;
  private selectedTowerType: string | null = null;
  private hoveredTile: { x: number; y: number } | null = null;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.pathSystem = new PathSystem();
    this.waveManager = new WaveManager();
    
    // 设置波次完成回调
    this.waveManager.onAllWavesComplete(() => {
      this.gameState = 'victory';
    });
    
    this.setupEventListeners();
  }
  
  /** 设置事件监听 */
  private setupEventListeners(): void {
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMove(e));
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  /** 处理画布点击 */
  private handleCanvasClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.width / rect.width);
    const y = (e.clientY - rect.top) * (this.height / rect.height);
    
    if (this.gameState !== 'playing') return;
    
    // 检查是否点击了路径
    if (this.isOnPath(x, y)) {
      return;
    }
    
    // 检查是否点击了已有的塔
    for (const tower of this.towers) {
      const dist = Math.hypot(tower.x - x, tower.y - y);
      if (dist < 30) {
        // 显示升级选项
        this.showTowerMenu(tower);
        return;
      }
    }
    
    // 放置新塔
    if (this.selectedTowerType) {
      const cost = this.getTowerCost(this.selectedTowerType);
      if (this.gold >= cost) {
        this.placeTower(this.selectedTowerType, x, y);
        this.gold -= cost;
      }
    }
  }
  
  /** 处理画布移动 */
  private handleCanvasMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.width / rect.width);
    const y = (e.clientY - rect.top) * (this.height / rect.height);
    
    this.hoveredTile = { x, y };
  }
  
  /** 调整画布大小 */
  private resizeCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  
  /** 开始游戏 */
  start(): void {
    this.gameState = 'playing';
    this.waveManager.startNextWave();
  }
  
  /** 暂停游戏 */
  pause(): void {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.waveManager.pause();
    }
  }
  
  /** 恢复游戏 */
  resume(): void {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.waveManager.resume();
    }
  }
  
  /** 选择塔类型 */
  selectTower(type: string): void {
    this.selectedTowerType = type;
  }
  
  /** 放置塔 */
  placeTower(type: string, x: number, y: number): void {
    let tower: Tower;
    
    switch (type) {
      case 'arrow':
        tower = new ArrowTower(x, y);
        break;
      case 'magic':
        tower = new MagicTower(x, y);
        break;
      case 'cannon':
        tower = new CannonTower(x, y);
        break;
      default:
        return;
    }
    
    this.towers.push(tower);
  }
  
  /** 获取塔费用 */
  getTowerCost(type: string): number {
    const costs: { [key: string]: number } = {
      arrow: 100,
      magic: 150,
      cannon: 200,
    };
    return costs[type] || 100;
  }
  
  /** 检查是否在路径上 */
  isOnPath(x: number, y: number): boolean {
    const waypoints = this.pathSystem.getWaypoints();
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const dx = x - p1.x;
      const dy = y - p1.y;
      
      const dot = ((p2.x - p1.x) * dx + (p2.y - p1.y) * dy) / (dist * dist);
      if (dot < 0 || dot > 1) continue;
      
      const closestX = p1.x + (p2.x - p1.x) * dot;
      const closestY = p1.y + (p2.y - p1.y) * dot;
      
      const distance = Math.hypot(x - closestX, y - closestY);
      if (distance < 30) {
        return true;
      }
    }
    
    return false;
  }
  
  /** 显示塔菜单 */
  showTowerMenu(tower: Tower): void {
    // TODO: 实现塔升级菜单
  }
  
  /** 生成敌人 */
  spawnEnemy(type: string): void {
    const path = this.pathSystem.getWaypoints();
    const config = this.waveManager.getEnemyConfig(type);
    
    // 创建敌人实例
    const enemy = new Enemy(config, path[0].x, path[0].y);
    this.enemies.push(enemy);
  }
  
  /** 更新 */
  update(): void {
    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;
    
    if (this.gameState !== 'playing') return;
    
    // 更新波次管理器
    const spawn = this.waveManager.update(deltaTime);
    if (spawn) {
      this.spawnEnemy(spawn.type);
    }
    
    // 更新塔
    for (const tower of this.towers) {
      tower.update(deltaTime, this.enemies);
    }
    
    // 更新敌人
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) {
        // 敌人死亡，奖励金币
        this.gold += enemy.goldReward;
        continue;
      }
      
      if (enemy.reachedEnd) {
        // 敌人到达终点，扣除生命
        this.lives--;
        if (this.lives <= 0) {
          this.gameState = 'gameover';
        }
        continue;
      }
    }
    
    // 移除死亡和到达终点的敌人
    this.enemies = this.enemies.filter(e => e.isAlive && !e.reachedEnd);
  }
  
  /** 绘制 */
  draw(): void {
    const ctx = this.ctx;
    
    // 清空画布
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 绘制路径
    this.pathSystem.draw(ctx);
    
    // 绘制敌人
    for (const enemy of this.enemies) {
      enemy.draw(ctx);
    }
    
    // 绘制塔
    for (const tower of this.towers) {
      tower.draw(ctx);
    }
    
    // 绘制悬停预览
    if (this.hoveredTile && this.selectedTowerType && this.gameState === 'playing') {
      const { x, y } = this.hoveredTile;
      if (!this.isOnPath(x, y)) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeRect(x - 25, y - 25, 50, 50);
      }
    }
  }
  
  /** 主循环 */
  loop(): void {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
  
  /** 启动游戏循环 */
  startLoop(): void {
    this.resizeCanvas();
    this.lastTime = performance.now();
    this.loop();
  }
}
