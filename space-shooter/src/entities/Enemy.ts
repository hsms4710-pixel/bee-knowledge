/**
 * Space Shooter - 敌机
 * 
 * GDD 生成代码 - L5_Task: n_l5_enemy_class
 */

import { Bullet, BulletType } from './Bullet';

export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  TANK = 'tank',
  SHOOTER = 'shooter'
}

export interface EnemyConfig {
  type: EnemyType;
  health: number;
  speed: number;
  damage: number;
  score: number;
  fireRate: number; // 射击间隔 (秒)
  bulletDamage: number;
}

export class Enemy {
  // 位置和尺寸
  public x: number;
  public y: number;
  public width: number = 30;
  public height: number = 30;

  // 属性
  public type: EnemyType;
  public health: number;
  public maxHealth: number;
  public speed: number;
  public damage: number = 1;
  public score: number;

  // 射击
  public fireRate: number;
  public bulletDamage: number;
  private lastShotTime: number = 0;

  // 移动模式
  private movePattern: 'straight' | 'zigzag' | 'sine' = 'straight';
  private sineOffset: number = 0;
  private targetX: number = 0;

  // 状态
  public isAlive: boolean = true;

  constructor(x: number, y: number, config: EnemyConfig) {
    this.x = x;
    this.y = y;
    this.type = config.type;
    this.health = config.health;
    this.maxHealth = config.health;
    this.speed = config.speed;
    this.damage = config.damage;
    this.score = config.score;
    this.fireRate = config.fireRate;
    this.bulletDamage = config.bulletDamage;

    // 根据类型设置移动模式
    switch (config.type) {
      case EnemyType.FAST:
        this.movePattern = 'zigzag';
        break;
      case EnemyType.SHOOTER:
        this.movePattern = 'sine';
        break;
      default:
        this.movePattern = 'straight';
    }
  }

  /**
   * 更新敌机状态
   */
  public update(deltaTime: number): void {
    // 移动
    this.move(deltaTime);

    // 射击 (只有 shooter 类型)
    if (this.type === EnemyType.SHOOTER) {
      this.tryShoot(deltaTime);
    }
  }

  /**
   * 移动
   */
  private move(deltaTime: number): void {
    switch (this.movePattern) {
      case 'straight':
        this.y += this.speed * deltaTime;
        break;

      case 'zigzag':
        this.y += this.speed * deltaTime;
        this.x += Math.sin(this.y * 0.1) * 50 * deltaTime;
        break;

      case 'sine':
        this.y += this.speed * deltaTime;
        this.sineOffset += deltaTime * 2;
        this.x = this.targetX + Math.sin(this.sineOffset) * 80;
        break;
    }

    // 限制在屏幕内
    if (this.x < 0) this.x = 0;
    if (this.x > 800) this.x = 800;
  }

  /**
   * 尝试射击
   */
  private tryShoot(deltaTime: number): void {
    this.lastShotTime += deltaTime;
    if (this.lastShotTime >= this.fireRate) {
      this.lastShotTime = 0;
      // 返回空数组，实际射击由外部处理
    }
  }

  /**
   * 执行射击 (由游戏引擎调用)
   */
  public performShot(): Bullet[] {
    this.lastShotTime = 0;
    
    if (this.type === EnemyType.SHOOTER) {
      // 射击者发射 3 颗子弹
      const bullets: Bullet[] = [];
      for (let i = -1; i <= 1; i++) {
        bullets.push(new Bullet(
          this.x,
          this.y + this.height / 2,
          0,
          1,
          300,
          5,
          BulletType.ENEMY
        ));
      }
      return bullets;
    }

    // 其他类型不射击
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
   * 获取得分值
   */
  public getScoreValue(): number {
    return this.score;
  }

  /**
   * 是否被摧毁
   */
  public isDestroyed(): boolean {
    return !this.isAlive;
  }

  /**
   * 获取敌机数据 (用于渲染)
   */
  public getData(): { x: number; y: number; width: number; height: number; type: string; health: number; maxHealth: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      type: this.type,
      health: this.health,
      maxHealth: this.maxHealth
    };
  }
}
