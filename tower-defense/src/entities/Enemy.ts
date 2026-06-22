/**
 * Tower Defense Game - Enemy 基类
 * GDD 生成: node_87026615
 */

export interface EnemyConfig {
  id: string;
  name: string;
  health: number;
  speed: number;
  goldReward: number;
  color: string;
  size: number;
  canFly: boolean;
}

export class Enemy {
  public id: string;
  public x: number;
  public y: number;
  public health: number;
  public maxHealth: number;
  public speed: number;
  public isAlive: boolean = true;
  public reachedEnd: boolean = false;
  public goldReward: number;
  public canFly: boolean = false;
  
  protected config: EnemyConfig;
  
  constructor(config: EnemyConfig, startX: number, startY: number) {
    this.id = `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.config = config;
    this.x = startX;
    this.y = startY;
    this.health = config.health;
    this.maxHealth = config.health;
    this.speed = config.speed;
    this.goldReward = config.goldReward;
    this.canFly = config.canFly;
  }
  
  /** 受到伤害 */
  takeDamage(damage: number): void {
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
    }
  }
  
  /** 移动到指定点 */
  move(targetX: number, targetY: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist <= this.speed) {
      this.x = targetX;
      this.y = targetY;
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
  }
  
  /** 更新 */
  update(_deltaTime: number, _path: { x: number; y: number }[]): void {
    // 子类实现
  }
  
  /** 绘制 */
  draw(ctx: CanvasRenderingContext2D): void {
    // 子类实现
  }
  
  /** 获取血条高度 */
  getHealthBarHeight(): number {
    return 4;
  }
  
  /** 获取中心点 */
  getCenter(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
