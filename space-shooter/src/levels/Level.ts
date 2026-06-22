/**
 * Space Shooter - 关卡
 * 
 * GDD 生成代码 - L5_Task: n_l5_level_class
 */

import { EnemyType } from '../entities/Enemy';

export class Level {
  private levelIndex: number;
  private enemyWave: number = 0;
  private bossTriggered: boolean = false;

  constructor(levelIndex: number) {
    this.levelIndex = levelIndex;
  }

  /**
   * 获取关卡索引
   */
  public getLevelIndex(): number {
    return this.levelIndex;
  }

  /**
   * 获取敌机生成间隔
   */
  public getSpawnInterval(): number {
    // 难度递增
    return Math.max(0.5, 1.5 - this.levelIndex * 0.2);
  }

  /**
   * 获取允许的敌机类型
   */
  public getEnemyTypes(): EnemyType[] {
    const types: EnemyType[] = [EnemyType.BASIC];

    if (this.levelIndex >= 1) {
      types.push(EnemyType.FAST);
    }
    if (this.levelIndex >= 2) {
      types.push(EnemyType.SHOOTER);
    }
    if (this.levelIndex >= 3) {
      types.push(EnemyType.TANK);
    }

    return types;
  }

  /**
   * 检查是否应该生成 Boss
   */
  public shouldSpawnBoss(enemyCount: number): boolean {
    // 每个关卡击杀 20 个敌人后生成 Boss
    if (this.enemyWave >= 20 && !this.bossTriggered) {
      this.bossTriggered = true;
      return true;
    }
    return false;
  }

  /**
   * 记录敌机击杀
   */
  public recordEnemyKill(): void {
    this.enemyWave++;
  }

  /**
   * 重置关卡
   */
  public reset(): void {
    this.enemyWave = 0;
    this.bossTriggered = false;
  }

  /**
   * 获取关卡名称
   */
  public getLevelName(): string {
    const names = ['新手村', '小行星带', '敌方基地', '深空禁区', '最终决战'];
    return names[Math.min(this.levelIndex, names.length - 1)];
  }
}
