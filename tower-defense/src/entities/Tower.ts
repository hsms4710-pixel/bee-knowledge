/**
 * Tower Defense Game - Tower 基类
 * GDD 生成: node_b633c78e
 */

export interface TowerConfig {
  id: string;
  name: string;
  cost: number;
  damage: number;
  range: number;
  rate: number; // 攻击间隔（秒）
  color: string;
}

export abstract class Tower {
  public id: string;
  public x: number;
  public y: number;
  public level: number = 1;
  public cooldown: number = 0;
  
  protected config: TowerConfig;
  
  constructor(config: TowerConfig, x: number, y: number) {
    this.id = `tower_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.config = config;
    this.x = x;
    this.y = y;
  }
  
  /** 获取当前属性 */
  getStats(): { damage: number; range: number; rate: number } {
    // 属性随等级增长
    return {
      damage: this.config.damage * (1 + (this.level - 1) * 0.2),
      range: this.config.range * (1 + (this.level - 1) * 0.1),
      rate: this.config.rate * (1 - (this.level - 1) * 0.1), // 攻击速度提升
    };
  }
  
  /** 升级 */
  upgrade(): boolean {
    if (this.level >= 3) return false;
    this.level++;
    this.cooldown = 0;
    return true;
  }
  
  /** 获取升级费用 */
  getUpgradeCost(): number {
    return Math.floor(this.config.cost * 0.5 * this.level);
  }
  
  /** 寻找目标（子类实现） */
  abstract findTarget(enemies: Enemy[]): Enemy | null;
  
  /** 攻击（子类实现） */
  abstract attack(target: Enemy): void;
  
  /** 更新 */
  update(deltaTime: number, enemies: Enemy[]): void {
    this.cooldown -= deltaTime;
    
    if (this.cooldown <= 0) {
      const target = this.findTarget(enemies);
      if (target) {
        this.attack(target);
        this.cooldown = 1 / this.getStats().rate;
      }
    }
  }
  
  /** 绘制 */
  abstract draw(ctx: CanvasRenderingContext2D): void;
  
  /** 获取范围 */
  getRange(): number {
    return this.getStats().range;
  }
}

// 敌人类前向声明
interface Enemy {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  takeDamage: (damage: number) => void;
}
