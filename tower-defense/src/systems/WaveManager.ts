/**
 * Tower Defense Game - WaveManager
 * GDD 生成: node_63fd2766
 */

import { EnemyConfig } from '../entities/Enemy';

export interface WaveConfig {
  waveNumber: number;
  enemies: { type: string; count: number }[];
  delay: number; // 敌人生成间隔（毫秒）
  interval: number; // 波次间隔（毫秒）
}

export class WaveManager {
  private waves: WaveConfig[] = [];
  private currentWaveIndex: number = -1;
  private currentWave: WaveConfig | null = null;
  private enemiesSpawned: number = 0;
  private spawnTimer: number = 0;
  private waveTimer: number = 0;
  private isPaused: boolean = false;
  private onWaveComplete: (() => void) | null = null;
  private onAllWavesComplete: (() => void) | null = null;
  
  constructor() {
    this.generateDefaultWaves();
  }
  
  /** 生成默认波次 */
  private generateDefaultWaves(): void {
    this.waves = [
      { waveNumber: 1, enemies: [{ type: 'basic', count: 5 }], delay: 800, interval: 5000 },
      { waveNumber: 2, enemies: [{ type: 'basic', count: 10 }], delay: 700, interval: 5000 },
      { waveNumber: 3, enemies: [{ type: 'basic', count: 8 }, { type: 'fast', count: 4 }], delay: 600, interval: 5000 },
      { waveNumber: 4, enemies: [{ type: 'basic', count: 12 }, { type: 'fast', count: 6 }], delay: 500, interval: 5000 },
      { waveNumber: 5, enemies: [{ type: 'basic', count: 10 }, { type: 'tank', count: 2 }], delay: 700, interval: 5000 },
      { waveNumber: 6, enemies: [{ type: 'basic', count: 15 }, { type: 'fast', count: 8 }, { type: 'tank', count: 3 }], delay: 500, interval: 5000 },
      { waveNumber: 7, enemies: [{ type: 'basic', count: 12 }, { type: 'fast', count: 6 }, { type: 'flyer', count: 4 }], delay: 600, interval: 5000 },
      { waveNumber: 8, enemies: [{ type: 'basic', count: 20 }, { type: 'fast', count: 10 }, { type: 'tank', count: 5 }], delay: 400, interval: 5000 },
      { waveNumber: 9, enemies: [{ type: 'basic', count: 15 }, { type: 'fast', count: 8 }, { type: 'tank', count: 4 }, { type: 'flyer', count: 6 }], delay: 500, interval: 5000 },
      { waveNumber: 10, enemies: [{ type: 'basic', count: 30 }, { type: 'fast', count: 15 }, { type: 'tank', count: 8 }, { type: 'flyer', count: 10 }], delay: 300, interval: 5000 },
    ];
  }
  
  /** 设置自定义波次 */
  setWaves(waves: WaveConfig[]): void {
    this.waves = waves;
    this.currentWaveIndex = -1;
    this.currentWave = null;
  }
  
  /** 开始下一波 */
  startNextWave(): boolean {
    if (this.currentWaveIndex >= this.waves.length - 1) {
      // 所有波次完成
      if (this.onAllWavesComplete) {
        this.onAllWavesComplete();
      }
      return false;
    }
    
    this.currentWaveIndex++;
    this.currentWave = this.waves[this.currentWaveIndex];
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
    
    if (this.onWaveComplete && this.currentWaveIndex > 0) {
      this.onWaveComplete();
    }
    
    return true;
  }
  
  /** 更新 */
  update(deltaTime: number): { type: string; count: number } | null {
    if (this.isPaused) return null;
    
    if (!this.currentWave) {
      return null;
    }
    
    // 等待波次间隔
    if (this.currentWaveIndex > 0 && this.waveTimer > 0) {
      this.waveTimer -= deltaTime * 1000;
      return null;
    }
    
    // 生成敌人
    this.spawnTimer -= deltaTime * 1000;
    
    if (this.spawnTimer <= 0 && this.enemiesSpawned < this.getTotalEnemies()) {
      const enemyToSpawn = this.getEnemyToSpawn();
      if (enemyToSpawn) {
        this.spawnTimer = this.currentWave.delay;
        return enemyToSpawn;
      }
    }
    
    return null;
  }
  
  /** 获取需要生成的敌人 */
  private getEnemyToSpawn(): { type: string; count: number } | null {
    let totalSpawned = 0;
    
    for (const enemy of this.currentWave.enemies) {
      if (this.enemiesSpawned < totalSpawned + enemy.count) {
        return { type: enemy.type, count: 1 };
      }
      totalSpawned += enemy.count;
    }
    
    // 当前波次完成
    this.currentWave = null;
    this.waveTimer = this.currentWaveIndex < this.waves.length - 1 ? this.waves[this.currentWaveIndex + 1].interval : 0;
    return null;
  }
  
  /** 获取当前波次的总敌人数量 */
  private getTotalEnemies(): number {
    return this.currentWave.enemies.reduce((sum, e) => sum + e.count, 0);
  }
  
  /** 获取当前波次索引 */
  getCurrentWaveIndex(): number {
    return this.currentWaveIndex;
  }
  
  /** 获取总波次数 */
  getTotalWaves(): number {
    return this.waves.length;
  }
  
  /** 是否所有波次完成 */
  isAllWavesComplete(): boolean {
    return this.currentWaveIndex >= this.waves.length - 1 && !this.currentWave;
  }
  
  /** 暂停 */
  pause(): void {
    this.isPaused = true;
  }
  
  /** 恢复 */
  resume(): void {
    this.isPaused = false;
  }
  
  /** 设置波次完成回调 */
  onWaveComplete(callback: () => void): void {
    this.onWaveComplete = callback;
  }
  
  /** 设置所有波次完成回调 */
  onAllWavesComplete(callback: () => void): void {
    this.onAllWavesComplete = callback;
  }
  
  /** 获取敌人配置 */
  getEnemyConfig(type: string): EnemyConfig {
    const configs: { [key: string]: EnemyConfig } = {
      basic: {
        id: 'basic_enemy',
        name: '基础敌人',
        health: 50,
        speed: 1,
        goldReward: 5,
        color: '#FF6B6B',
        size: 20,
        canFly: false,
      },
      fast: {
        id: 'fast_enemy',
        name: '快速敌人',
        health: 30,
        speed: 2.5,
        goldReward: 8,
        color: '#FFA500',
        size: 18,
        canFly: false,
      },
      tank: {
        id: 'tank_enemy',
        name: '坦克敌人',
        health: 200,
        speed: 0.5,
        goldReward: 15,
        color: '#8B4513',
        size: 30,
        canFly: false,
      },
      flyer: {
        id: 'flyer_enemy',
        name: '飞行敌人',
        health: 80,
        speed: 1.5,
        goldReward: 12,
        color: '#4169E1',
        size: 22,
        canFly: true,
      },
    };
    
    return configs[type] || configs.basic;
  }
}
