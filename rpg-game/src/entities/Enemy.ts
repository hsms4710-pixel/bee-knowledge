/**
 * 敌人实体
 * 代表游戏中的怪物和敌人
 */

import { GameEntity } from '../core/GameEngine';
import { eventBus } from '../core/EventBus';

export interface EnemyStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  experience: number;
  gold: number;
}

export interface EnemyConfig {
  respawnTime: number; // 复活时间（毫秒）
  patrolRadius: number;
  aggroRange: number;
}

export interface EnemyAI {
  type: 'patrol' | 'chase' | 'flee' | 'aggressive' | 'passive';
  config: {
    patrolSpeed: number;
    chaseSpeed: number;
    fleeHealthPercent: number;
  };
}

export class Enemy extends GameEntity {
  public name: string;
  public type: string;
  public stats: EnemyStats;
  public ai: EnemyAI;
  public isAlive: boolean = true;
  private config: EnemyConfig;
  private respawnTimer: number = 0;
  private targetId: string | null = null;

  constructor(id: string, name: string, type: string, config?: EnemyConfig) {
    super(id);
    this.name = name;
    this.type = type;
    this.config = {
      respawnTime: 30000,
      patrolRadius: 10,
      aggroRange: 5,
      ...config
    };

    this.stats = this.createDefaultStats(type);
    this.ai = this.createDefaultAI();
  }

  /** 创建默认属性 */
  private createDefaultStats(type: string): EnemyStats {
    const statsConfig: Record<string, EnemyStats> = {
      'slime': {
        health: 30,
        maxHealth: 30,
        attack: 5,
        defense: 2,
        speed: 2,
        experience: 10,
        gold: 5
      },
      'wolf': {
        health: 50,
        maxHealth: 50,
        attack: 15,
        defense: 5,
        speed: 8,
        experience: 25,
        gold: 15
      },
      'goblin': {
        health: 80,
        maxHealth: 80,
        attack: 20,
        defense: 8,
        speed: 6,
        experience: 50,
        gold: 30
      },
      'dragon': {
        health: 500,
        maxHealth: 500,
        attack: 50,
        defense: 30,
        speed: 15,
        experience: 500,
        gold: 200
      }
    };

    return statsConfig[type] || statsConfig['slime'];
  }

  /** 创建默认 AI */
  private createDefaultAI(): EnemyAI {
    return {
      type: 'aggressive',
      config: {
        patrolSpeed: 1,
        chaseSpeed: 3,
        fleeHealthPercent: 0.2
      }
    };
  }

  /** 初始化敌人 */
  initialize(): void {
    eventBus.on('enemy.damage', (data: { enemyId: string; damage: number }) => {
      if (data.enemyId === this.id) {
        this.takeDamage(data.damage);
      }
    });

    eventBus.on('player.moved', (data: { x: number; y: number }) => {
      this.updateAI(data.x, data.y);
    });

    eventBus.emit('enemy.spawned', { id: this.id, name: this.name, type: this.type });
  }

  update(deltaTime: number): void {
    if (!this.isAlive) return;

    // AI 更新
    this.executeAI(deltaTime);
  }

  /** AI 决策 */
  private updateAI(playerX: number, playerY: number): void {
    const distance = Math.sqrt(
      Math.pow(playerX - this.x, 2) + Math.pow(playerY - this.y, 2)
    );

    if (distance <= this.config.aggroRange) {
      this.targetId = 'player';
    } else if (this.targetId === 'player') {
      this.targetId = null;
    }
  }

  /** 执行 AI */
  private executeAI(deltaTime: number): void {
    const speed = this.ai.type === 'chase' 
      ? this.ai.config.chaseSpeed 
      : this.ai.config.patrolSpeed;

    // 简单的 AI 逻辑
    if (this.targetId === 'player') {
      // 追击玩家
      this.ai.type = 'chase';
      // 实际项目中这里会有更复杂的 AI 逻辑
    } else {
      // 巡逻
      this.ai.type = 'patrol';
      // 随机移动
    }
  }

  /** 受到伤害 */
  takeDamage(damage: number): void {
    this.stats.health = Math.max(0, this.stats.health - damage);
    eventBus.emit('enemy.healthChanged', { 
      id: this.id, 
      name: this.name,
      current: this.stats.health, 
      max: this.stats.maxHealth 
    });

    if (this.stats.health === 0) {
      this.die();
    }
  }

  /** 死亡 */
  die(): void {
    this.isAlive = false;
    eventBus.emit('enemy.died', { 
      id: this.id, 
      name: this.name,
      experience: this.stats.experience,
      gold: this.stats.gold 
    });

    // 分发奖励
    eventBus.emit('player.experience', { amount: this.stats.experience });
    eventBus.emit('player.gold', { amount: this.stats.gold });

    // 开始复活计时
    this.respawnTimer = this.config.respawnTime;
  }

  /** 复活 */
  respawn(): void {
    this.stats.health = this.stats.maxHealth;
    this.isAlive = true;
    this.respawnTimer = 0;
    eventBus.emit('enemy.respawned', { id: this.id, name: this.name });
  }

  /** 获取 AI 状态 */
  getAIState(): string {
    return this.ai.type;
  }

  /** 是否存活 */
  isEnemyAlive(): boolean {
    return this.isAlive;
  }
}
