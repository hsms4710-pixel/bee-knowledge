/**
 * 战斗系统
 * 处理玩家与敌人的战斗逻辑
 */

import { GameSystem } from '../core/GameEngine';
import { eventBus } from '../core/EventBus';

export interface CombatStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  criticalRate: number;
  dodgeRate: number;
}

export interface Combatant {
  id: string;
  name: string;
  stats: CombatStats;
  isAlive: boolean;
}

export interface DamageEvent {
  attackerId: string;
  defenderId: string;
  damage: number;
  isCritical: boolean;
  isDodge: boolean;
}

export interface CombatResult {
  winnerId: string;
  turns: number;
  damageDealt: number;
}

export interface CombatConfig {
  turnTime: number; // 每回合时间（毫秒）
  autoCombat: boolean;
  allowRetreat: boolean;
}

export class CombatSystem extends GameSystem {
  private combatants: Map<string, Combatant> = new Map();
  private currentCombat: CombatConfig | null = null;
  private combatActive: boolean = false;
  private combatLog: DamageEvent[] = [];

  async initialize(): Promise<void> {
    // 监听战斗相关事件
    eventBus.on('combat.start', (config: CombatConfig) => this.startCombat(config));
    eventBus.on('combat.end', () => this.endCombat());
    eventBus.on('combat.attack', (data: { attackerId: string; defenderId: string }) => 
      this.executeAttack(data.attackerId, data.defenderId)
    );
  }

  update(_deltaTime: number): void {
    // 战斗系统更新逻辑
  }

  /** 注册战斗单位 */
  registerCombatant(combatant: Combatant): void {
    this.combatants.set(combatant.id, combatant);
  }

  /** 开始战斗 */
  startCombat(config: CombatConfig): void {
    this.currentCombat = config;
    this.combatActive = true;
    this.combatLog = [];
    console.log('=== Combat Started ===');
  }

  /** 结束战斗 */
  endCombat(): void {
    this.combatActive = false;
    this.currentCombat = null;
    console.log('=== Combat Ended ===');
  }

  /** 执行攻击 */
  executeAttack(attackerId: string, defenderId: string): DamageEvent {
    const attacker = this.combatants.get(attackerId);
    const defender = this.combatants.get(defenderId);

    if (!attacker || !defender) {
      throw new Error('Combatants not found');
    }

    if (!attacker.isAlive || !defender.isAlive) {
      throw new Error('Combatants are dead');
    }

    // 计算闪避
    const dodgeRoll = Math.random();
    const isDodge = dodgeRoll < defender.stats.dodgeRate;

    if (isDodge) {
      const event: DamageEvent = {
        attackerId,
        defenderId,
        damage: 0,
        isCritical: false,
        isDodge: true
      };
      this.combatLog.push(event);
      eventBus.emit('damage.dealt', event);
      return event;
    }

    // 计算伤害
    const baseDamage = Math.max(1, attacker.stats.attack - defender.stats.defense);
    const criticalRoll = Math.random();
    const isCritical = criticalRoll < attacker.stats.criticalRate;
    const damage = isCritical ? baseDamage * 1.5 : baseDamage;

    // 应用伤害
    defender.stats.health = Math.max(0, defender.stats.health - damage);

    // 检查死亡
    if (defender.stats.health === 0) {
      defender.isAlive = false;
      eventBus.emit('entity.died', { entityId: defenderId, name: defender.name });
    }

    const event: DamageEvent = {
      attackerId,
      defenderId,
      damage: Math.round(damage),
      isCritical,
      isDodge: false
    };

    this.combatLog.push(event);
    eventBus.emit('damage.dealt', event);
    return event;
  }

  /** 获取战斗结果 */
  getCombatResult(): CombatResult | null {
    if (!this.isCombatActive || !this.currentCombat) return null;

    const aliveCombatants = Array.from(this.combatants.values())
      .filter(c => c.isAlive);

    if (aliveCombatants.length === 1) {
      return {
        winnerId: aliveCombatants[0].id,
        turns: this.combatLog.length,
        damageDealt: this.combatLog.reduce((sum, e) => sum + e.damage, 0)
      };
    }

    return null;
  }

  /** 获取战斗日志 */
  getCombatLog(): DamageEvent[] {
    return [...this.combatLog];
  }

  /** 检查战斗是否活跃 */
  isCombatActive(): boolean {
    return this.combatActive;
  }
}
