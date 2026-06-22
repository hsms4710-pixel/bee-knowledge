/**
 * Space Shooter - 敌机生成器
 * 
 * GDD 生成代码 - L5_Task: n_l5_enemy_spawner
 */

import { Enemy, EnemyType, EnemyConfig } from '../entities/Enemy';

export class EnemySpawner {
  private screenWidth: number;
  private screenHeight: number;
  private spawnInterval: number = 1.5;
  private currentDifficulty: number = 1;

  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  /**
   * 设置生成间隔
   */
  public setSpawnInterval(interval: number): void {
    this.spawnInterval = Math.max(0.3, interval);
  }

  /**
   * 获取生成间隔
   */
  public getSpawnInterval(): number {
    return this.spawnInterval;
  }

  /**
   * 设置难度
   */
  public setDifficulty(difficulty: number): void {
    this.currentDifficulty = difficulty;
    // 难度越高，生成越快
    this.spawnInterval = Math.max(0.3, 1.5 - difficulty * 0.2);
  }

  /**
   * 生成敌机
   */
  public spawnEnemy(allowedTypes: EnemyType[] = [EnemyType.BASIC]): Enemy {
    // 随机选择类型
    const typeIndex = Math.floor(Math.random() * allowedTypes.length);
    const type = allowedTypes[typeIndex];

    // 根据类型获取配置
    const config = this.getEnemyConfig(type);

    // 随机 X 位置
    const x = Math.random() * (this.screenWidth - 40) + 20;
    const y = -30;

    return new Enemy(x, y, config);
  }

  /**
   * 获取敌机配置
   */
  private getEnemyConfig(type: EnemyType): EnemyConfig {
    const baseConfigs: Record<EnemyType, EnemyConfig> = {
      [EnemyType.BASIC]: {
        type: EnemyType.BASIC,
        health: 1,
        speed: 100,
        damage: 1,
        score: 10,
        fireRate: 0,
        bulletDamage: 0
      },
      [EnemyType.FAST]: {
        type: EnemyType.FAST,
        health: 1,
        speed: 250,
        damage: 1,
        score: 20,
        fireRate: 0,
        bulletDamage: 0
      },
      [EnemyType.TANK]: {
        type: EnemyType.TANK,
        health: 3,
        speed: 50,
        damage: 2,
        score: 50,
        fireRate: 0,
        bulletDamage: 0
      },
      [EnemyType.SHOOTER]: {
        type: EnemyType.SHOOTER,
        health: 2,
        speed: 80,
        damage: 1,
        score: 30,
        fireRate: 2,
        bulletDamage: 10
      }
    };

    let config = baseConfigs[type];

    // 根据难度调整
    config.health = Math.ceil(config.health * (1 + this.currentDifficulty * 0.3));
    config.score = Math.ceil(config.score * (1 + this.currentDifficulty * 0.2));

    return config;
  }

  /**
   * 获取可生成的敌机类型
   */
  public getEnemyTypes(level: number = 1): EnemyType[] {
    const types: EnemyType[] = [EnemyType.BASIC];

    if (level >= 1) {
      types.push(EnemyType.FAST);
    }
    if (level >= 2) {
      types.push(EnemyType.SHOOTER);
    }
    if (level >= 3) {
      types.push(EnemyType.TANK);
    }

    return types;
  }
}
