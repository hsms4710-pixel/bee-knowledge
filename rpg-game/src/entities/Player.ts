/**
 * 玩家实体
 * 代表游戏中的玩家角色
 */

import { GameEntity } from '../core/GameEngine';
import { eventBus } from '../core/EventBus';

export interface PlayerStats {
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
}

export interface PlayerConfig {
  startingHealth: number;
  startingMana: number;
  experienceMultiplier: number;
}

export interface PlayerState {
  position: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  isInteracting: boolean;
}

export class Player extends GameEntity {
  public name: string;
  public stats: PlayerStats;
  public state: PlayerState;
  public gold: number = 0;
  private config: PlayerConfig;

  constructor(id: string, name: string, config?: PlayerConfig) {
    super(id);
    this.name = name;
    this.config = {
      startingHealth: 100,
      startingMana: 50,
      experienceMultiplier: 1.0,
      ...config
    };

    this.stats = {
      level: 1,
      experience: 0,
      experienceToNext: this.calculateExpToNext(1),
      health: this.config.startingHealth,
      maxHealth: this.config.startingHealth,
      mana: this.config.startingMana,
      maxMana: this.config.startingMana,
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      vitality: 10
    };

    this.state = {
      position: { x: 0, y: 0 },
      direction: 'down',
      isMoving: false,
      isInteracting: false
    };
  }

  /** 初始化玩家 */
  initialize(): void {
    eventBus.on('player.damage', (data: { damage: number }) => this.takeDamage(data.damage));
    eventBus.on('player.heal', (data: { amount: number }) => this.heal(data.amount));
    eventBus.on('player.experience', (data: { amount: number }) => this.gainExperience(data.amount));
    eventBus.on('player.mana', (data: { amount: number }) => this.restoreMana(data.amount));
    eventBus.on('player.gold', (data: { amount: number }) => this.addGold(data.amount));
    eventBus.on('player.levelUp', () => this.levelUp());

    eventBus.emit('player.created', { id: this.id, name: this.name });
  }

  update(_deltaTime: number): void {
    // 玩家更新逻辑
  }

  /** 受到伤害 */
  takeDamage(damage: number): void {
    this.stats.health = Math.max(0, this.stats.health - damage);
    eventBus.emit('player.healthChanged', { 
      current: this.stats.health, 
      max: this.stats.maxHealth 
    });

    if (this.stats.health === 0) {
      this.die();
    }
  }

  /** 治疗 */
  heal(amount: number): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
    eventBus.emit('player.healthChanged', { 
      current: this.stats.health, 
      max: this.stats.maxHealth 
    });
  }

  /** 恢复法力 */
  restoreMana(amount: number): void {
    this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + amount);
    eventBus.emit('player.manaChanged', { 
      current: this.stats.mana, 
      max: this.stats.maxMana 
    });
  }

  /** 获得经验值 */
  gainExperience(amount: number): void {
    this.stats.experience += amount * this.config.experienceMultiplier;
    
    while (this.stats.experience >= this.stats.experienceToNext) {
      this.stats.experience -= this.stats.experienceToNext;
      this.stats.level++;
      this.stats.experienceToNext = this.calculateExpToNext(this.stats.level);
      eventBus.emit('player.levelUp');
    }

    eventBus.emit('player.experienceChanged', { 
      experience: this.stats.experience, 
      toNext: this.stats.experienceToNext 
    });
  }

  /** 升级 */
  levelUp(): void {
    // 增加属性
    this.stats.strength += 2;
    this.stats.dexterity += 2;
    this.stats.intelligence += 2;
    this.stats.vitality += 2;

    // 增加生命和法力上限
    this.stats.maxHealth += 10;
    this.stats.maxMana += 5;
    
    // 满血满蓝
    this.stats.health = this.stats.maxHealth;
    this.stats.mana = this.stats.maxMana;

    eventBus.emit('player.levelUpComplete', { level: this.stats.level });
  }

  /** 添加金币 */
  addGold(amount: number): void {
    this.gold += amount;
    eventBus.emit('player.goldChanged', { gold: this.gold });
  }

  /** 死亡 */
  die(): void {
    eventBus.emit('player.died', { id: this.id, name: this.name });
    // 重置位置或复活
  }

  /** 计算升级所需经验 */
  private calculateExpToNext(level: number): number {
    return Math.floor(100 * Math.pow(1.1, level - 1));
  }

  /** 移动 */
  move(direction: 'up' | 'down' | 'left' | 'right', distance: number = 1): void {
    this.state.direction = direction;
    this.state.isMoving = true;

    switch (direction) {
      case 'up':
        this.y -= distance;
        break;
      case 'down':
        this.y += distance;
        break;
      case 'left':
        this.x -= distance;
        break;
      case 'right':
        this.x += distance;
        break;
    }

    eventBus.emit('player.moved', { direction, x: this.x, y: this.y });
  }

  /** 交互 */
  interact(targetId: string): void {
    this.state.isInteracting = true;
    eventBus.emit('player.interact', { targetId });
  }

  /** 获取位置 */
  get position(): { x: number; y: number } {
    return this.state.position;
  }

  set position(value: { x: number; y: number }) {
    this.state.position = value;
    this.x = value.x;
    this.y = value.y;
  }

  /** 获取等级 */
  getLevel(): number {
    return this.stats.level;
  }

  /** 是否存活 */
  isAlive(): boolean {
    return this.stats.health > 0;
  }
}
