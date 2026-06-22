/**
 * Space Shooter - 玩家飞船
 * 
 * GDD 生成代码 - L5_Task: n_l5_player_class
 */

import { WeaponSystem } from '../systems/WeaponSystem';
import { Bullet, BulletType } from './Bullet';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  speed: number;
  weaponLevel: number;
  score: number;
}

export class Player {
  // 位置和尺寸
  public x: number;
  public y: number;
  public width: number = 40;
  public height: number = 50;

  // 属性
  public health: number = 3;
  public maxHealth: number = 3;
  public speed: number = 300; // 像素/秒
  public weaponLevel: number = 1;
  public hasShield: boolean = false;
  public shieldDuration: number = 0;

  // 武器系统
  private weaponSystem: WeaponSystem;

  // 状态
  public isAlive: boolean = true;
  private invincibilityTime: number = 0;
  private lastHitTime: number = 0;

  constructor(x: number, y: number, weaponSystem: WeaponSystem) {
    this.x = x;
    this.y = y;
    this.weaponSystem = weaponSystem;
  }

  /**
   * 更新玩家状态
   */
  public update(dx: number, dy: number, deltaTime: number, screenWidth: number, screenHeight: number): void {
    // 移动
    let newX = this.x + dx * this.speed * deltaTime;
    let newY = this.y + dy * this.speed * deltaTime;

    // 边界检测
    newX = Math.max(this.width / 2, Math.min(screenWidth - this.width / 2, newX));
    newY = Math.max(this.height / 2, Math.min(screenHeight - this.height / 2, newY));

    this.x = newX;
    this.y = newY;

    // 更新武器冷却
    this.weaponSystem.updateCooldown(deltaTime);

    // 更新护盾
    if (this.hasShield) {
      this.shieldDuration -= deltaTime;
      if (this.shieldDuration <= 0) {
        this.hasShield = false;
      }
    }

    // 更新无敌时间
    if (this.invincibilityTime > 0) {
      this.invincibilityTime -= deltaTime;
    }
  }

  /**
   * 射击
   */
  public shoot(): void {
    if (this.weaponSystem.canShoot() && this.isAlive) {
      this.weaponSystem.shoot(this.x, this.y - this.height / 2, this.weaponLevel);
    }
  }

  /**
   * 获取新生成的子弹
   */
  public getNewBullets(): Bullet[] {
    return this.weaponSystem.getNewBullets();
  }

  /**
   * 受伤
   */
  public takeDamage(damage: number): void {
    if (this.invincibilityTime > 0 || this.hasShield) {
      return;
    }

    this.health -= damage;
    this.lastHitTime = Date.now();
    this.invincibilityTime = 1; // 1秒无敌

    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
    }
  }

  /**
   * 治疗
   */
  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * 获得护盾
   */
  public gainShield(duration: number = 5): void {
    this.hasShield = true;
    this.shieldDuration = duration;
  }

  /**
   * 武器升级
   */
  public upgradeWeapon(): void {
    if (this.weaponLevel < 5) {
      this.weaponLevel++;
    }
  }

  /**
   * 重置武器
   */
  public resetWeapon(): void {
    this.weaponLevel = 1;
  }

  /**
   * 获取武器伤害
   */
  public getWeaponDamage(): number {
    return 10 + this.weaponLevel * 5;
  }

  /**
   * 是否被摧毁
   */
  public isDestroyed(): boolean {
    return !this.isAlive;
  }

  /**
   * 获取玩家数据 (用于渲染)
   */
  public getData(): { x: number; y: number; width: number; height: number; weaponLevel: number; hasShield: boolean } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      weaponLevel: this.weaponLevel,
      hasShield: this.hasShield
    };
  }

  /**
   * 重置玩家
   */
  public reset(): void {
    this.health = this.maxHealth;
    this.weaponLevel = 1;
    this.hasShield = false;
    this.shieldDuration = 0;
    this.isAlive = true;
    this.invincibilityTime = 0;
  }
}
