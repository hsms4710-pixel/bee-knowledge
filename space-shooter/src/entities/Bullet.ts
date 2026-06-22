/**
 * Space Shooter - 子弹
 * 
 * GDD 生成代码 - L5_Task: n_l5_bullet_class
 */

export enum BulletType {
  PLAYER = 'player',
  ENEMY = 'enemy'
}

export class Bullet {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public speed: number;
  public size: number;
  public type: BulletType;
  public damage: number;
  public sourceType: string = ''; // 'player', 'enemy', 'boss'

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    speed: number,
    size: number,
    type: BulletType,
    damage: number = 10
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.speed = speed;
    this.size = size;
    this.type = type;
    this.damage = damage;
  }

  /**
   * 更新子弹位置
   */
  public update(deltaTime: number): void {
    this.x += this.vx * this.speed * deltaTime;
    this.y += this.vy * this.speed * deltaTime;
  }

  /**
   * 检查是否超出屏幕
   */
  public isOffScreen(width: number, height: number): boolean {
    return (
      this.x < -50 ||
      this.x > width + 50 ||
      this.y < -50 ||
      this.y > height + 50
    );
  }

  /**
   * 创建玩家子弹
   */
  public static createPlayerBullet(x: number, y: number, weaponLevel: number = 1): Bullet {
    const speed = 800;
    const damage = 10 + weaponLevel * 5;
    const size = 6;

    return new Bullet(x, y, 0, -1, speed, size, BulletType.PLAYER, damage);
  }

  /**
   * 创建双发玩家子弹
   */
  public static createDoubleBullet(x: number, y: number, weaponLevel: number = 2): Bullet[] {
    const speed = 800;
    const damage = 10 + weaponLevel * 5;
    const size = 5;

    return [
      new Bullet(x - 8, y, 0, -1, speed, size, BulletType.PLAYER, damage),
      new Bullet(x + 8, y, 0, -1, speed, size, BulletType.PLAYER, damage)
    ];
  }

  /**
   * 创建三发玩家子弹
   */
  public static createTripleBullet(x: number, y: number, weaponLevel: number = 3): Bullet[] {
    const speed = 800;
    const damage = 10 + weaponLevel * 5;
    const size = 4;

    return [
      new Bullet(x, y, 0, -1, speed, size, BulletType.PLAYER, damage),
      new Bullet(x - 15, y, 0.3, -0.9, speed, size, BulletType.PLAYER, damage),
      new Bullet(x + 15, y, -0.3, -0.9, speed, size, BulletType.PLAYER, damage)
    ];
  }

  /**
   * 创建敌人子弹
   */
  public static createEnemyBullet(x: number, y: number, targetX: number, targetY: number): Bullet {
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 400;

    return new Bullet(
      x, y,
      dx / distance,
      dy / distance,
      speed,
      6,
      BulletType.ENEMY,
      10
    );
  }

  /**
   * 创建 Boss 子弹 (扇形)
   */
  public static createBossBullets(x: number, y: number, count: number = 5): Bullet[] {
    const bullets: Bullet[] = [];
    const speed = 300;
    const size = 5;
    const damage = 15;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI / 2) + (i - count / 2) * 0.3;
      bullets.push(new Bullet(
        x, y,
        Math.cos(angle),
        Math.sin(angle),
        speed,
        size,
        BulletType.ENEMY,
        damage
      ));
    }

    return bullets;
  }
}
