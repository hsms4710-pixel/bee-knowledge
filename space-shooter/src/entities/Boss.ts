/**
 * Space Shooter - Boss
 * 
 * GDD 生成代码 - L5_Task: n_l5_boss_class
 */

import { Bullet, BulletType } from './Bullet';

export enum BossPhase {
  PHASE_1 = 1,
  PHASE_2 = 2,
  PHASE_3 = 3
}

export class Boss {
  public x: number;
  public y: number;
  public width: number = 100;
  public height: number = 100;

  public health: number;
  public maxHealth: number = 300;
  public damage: number = 20;
  public score: number = 500;

  public phase: BossPhase = BossPhase.PHASE_1;
  public isAlive: boolean = true;

  private lastShotTime: number = 0;
  private spawnInterval: number = 2; // 射击间隔

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.health = this.maxHealth;
  }

  /**
   * 更新 Boss 状态
   */
  public update(deltaTime: number): void {
    // 水平移动
    this.x += Math.sin(Date.now() / 200) * 50 * deltaTime;
    this.x = Math.max(this.width / 2, Math.min(800 - this.width / 2, this.x));

    // 射击
    this.lastShotTime += deltaTime;
    if (this.lastShotTime >= this.spawnInterval) {
      this.lastShotTime = 0;
      this.performAttack();
    }

    // 检查阶段转换
    this.checkPhaseChange();
  }

  /**
   * 执行攻击
   */
  private performAttack(): void {
    switch (this.phase) {
      case BossPhase.PHASE_1:
        // 扇形攻击
        return Bullet.createBossBullets(this.x, this.y + this.height / 2, 5);
      case BossPhase.PHASE_2:
        // 更多子弹
        return Bullet.createBossBullets(this.x, this.y + this.height / 2, 8);
      case BossPhase.PHASE_3:
        // 全方位攻击
        return Bullet.createBossBullets(this.x, this.y + this.height / 2, 12);
      default:
        return Bullet.createBossBullets(this.x, this.y + this.height / 2, 5);
    }
  }

  /**
   * 获取新子弹 (由游戏引擎调用)
   */
  public getNewBullets(): Bullet[] {
    if (this.lastShotTime >= this.spawnInterval) {
      const bullets = this.performAttack();
      this.lastShotTime = 0;
      return bullets;
    }
    return [];
  }

  /**
   * 受伤
   */
  public takeDamage(damage: number): void {
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
    }
  }

  /**
   * 检查阶段转换
   */
  private checkPhaseChange(): void {
    const healthPercent = this.health / this.maxHealth;

    if (healthPercent <= 0.3 && this.phase < BossPhase.PHASE_3) {
      this.phase = BossPhase.PHASE_3;
      this.spawnInterval = 0.8;
      console.log('Boss 进入第三阶段！');
    } else if (healthPercent <= 0.6 && this.phase < BossPhase.PHASE_2) {
      this.phase = BossPhase.PHASE_2;
      this.spawnInterval = 1.2;
      console.log('Boss 进入第二阶段！');
    }
  }

  /**
   * 是否被摧毁
   */
  public isDestroyed(): boolean {
    return !this.isAlive;
  }

  /**
   * 获取 Boss 数据 (用于渲染)
   */
  public getData(): { x: number; y: number; width: number; height: number; health: number; maxHealth: number; phase: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      health: this.health,
      maxHealth: this.maxHealth,
      phase: this.phase
    };
  }
}
