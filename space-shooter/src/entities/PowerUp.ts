/**
 * Space Shooter - 道具
 * 
 * GDD 生成代码 - L5_Task: n_l5_powerup_class
 */

export enum PowerUpType {
  WEAPON = 'weapon',
  SHIELD = 'shield',
  BOMB = 'bomb',
  LIFE = 'life'
}

export interface PowerUpEffect {
  type: PowerUpType;
  duration?: number;
  value?: number;
}

export class PowerUp {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 100; // 下落速度
  public size: number = 20;
  public type: PowerUpType;
  public rotation: number = 0;

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  /**
   * 更新道具状态
   */
  public update(deltaTime: number): void {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.rotation += deltaTime * 2;
  }

  /**
   * 获取道具效果
   */
  public getEffect(): PowerUpEffect {
    switch (this.type) {
      case PowerUpType.WEAPON:
        return { type: PowerUpType.WEAPON };
      case PowerUpType.SHIELD:
        return { type: PowerUpType.SHIELD, duration: 5 };
      case PowerUpType.BOMB:
        return { type: PowerUpType.BOMB, value: 1 };
      case PowerUpType.LIFE:
        return { type: PowerUpType.LIFE, value: 1 };
      default:
        return { type: PowerUpType.WEAPON };
    }
  }

  /**
   * 随机生成道具
   */
  public static random(x: number, y: number): PowerUp {
    const types = [PowerUpType.WEAPON, PowerUpType.SHIELD, PowerUpType.BOMB, PowerUpType.LIFE];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new PowerUp(x, y, randomType);
  }

  /**
   * 获取道具数据 (用于渲染)
   */
  public getData(): { x: number; y: number; size: number; type: string } {
    return {
      x: this.x,
      y: this.y,
      size: this.size,
      type: this.type
    };
  }
}
