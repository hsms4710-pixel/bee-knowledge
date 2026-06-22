/**
 * Space Shooter - 武器系统
 * 
 * GDD 生成代码 - L5_Task: n_l5_weapon_system
 */

import { Bullet, BulletType } from '../entities/Bullet';

export class WeaponSystem {
  private canShoot: boolean = true;
  private lastShotTime: number = 0;
  private cooldown: number = 0.2; // 射击冷却时间 (秒)
  private newBullets: Bullet[] = [];

  /**
   * 更新冷却时间
   */
  public updateCooldown(deltaTime: number): void {
    if (!this.canShoot) {
      this.lastShotTime += deltaTime;
      if (this.lastShotTime >= this.cooldown) {
        this.canShoot = true;
        this.lastShotTime = 0;
      }
    }
  }

  /**
   * 检查是否可以射击
   */
  public canShoot(): boolean {
    return this.canShoot;
  }

  /**
   * 射击
   */
  public shoot(x: number, y: number, weaponLevel: number): void {
    if (!this.canShoot) return;

    this.canShoot = false;
    this.lastShotTime = 0;

    // 根据武器等级生成不同数量和类型的子弹
    const bullets = this.createBullets(x, y, weaponLevel);
    this.newBullets.push(...bullets);

    // 根据武器等级调整冷却
    this.cooldown = Math.max(0.05, 0.2 - weaponLevel * 0.03);
  }

  /**
   * 创建子弹
   */
  private createBullets(x: number, y: number, weaponLevel: number): Bullet[] {
    switch (weaponLevel) {
      case 1:
        return [Bullet.createPlayerBullet(x, y, 1)];
      case 2:
        return Bullet.createDoubleBullet(x, y, 2);
      case 3:
        return Bullet.createTripleBullet(x, y, 3);
      case 4:
        // 双排三连发
        const firstRow = Bullet.createTripleBullet(x, y, 4);
        const secondRow = Bullet.createTripleBullet(x, y - 10, 4);
        return [...firstRow, ...secondRow];
      case 5:
        // 全屏攻击
        const bullets: Bullet[] = [];
        for (let i = 0; i < 5; i++) {
          const offset = (i - 2) * 15;
          bullets.push(Bullet.createPlayerBullet(x + offset, y, 5));
        }
        return bullets;
      default:
        return [Bullet.createPlayerBullet(x, y, 1)];
    }
  }

  /**
   * 获取新生成的子弹
   */
  public getNewBullets(): Bullet[] {
    const bullets = this.newBullets;
    this.newBullets = [];
    return bullets;
  }
}
