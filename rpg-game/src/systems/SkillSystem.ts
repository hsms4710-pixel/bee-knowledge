/**
 * 技能系统
 * 管理角色技能和法术
 */

import { GameSystem } from '../core/GameEngine';
import { eventBus } from '../core/EventBus';

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  level: number;
  maxLevel: number;
  cooldown: number;
  currentCooldown: number;
  manaCost: number;
  damage: number;
  effects: SkillEffect[];
  icon: string;
  unlockCondition?: string;
}

export type SkillType = 'active' | 'passive' | 'toggle';

export interface SkillEffect {
  type: string;
  value: number;
  duration: number;
  chance: number;
}

export interface SkillTree {
  id: string;
  name: string;
  description: string;
  skills: string[];
  points: number;
}

export interface SkillConfig {
  maxSkillPoints: number;
  autoLevelUp: boolean;
}

export class SkillSystem extends GameSystem {
  private skills: Map<string, Skill> = new Map();
  private skillTrees: Map<string, SkillTree> = new Map();
  private unlockedSkills: Set<string> = new Set();
  private equippedSkills: string[] = [];
  private skillPoints: number = 0;
  private config: SkillConfig;

  constructor(config?: SkillConfig) {
    super();
    this.config = {
      maxSkillPoints: 100,
      autoLevelUp: false,
      ...config
    };
  }

  async initialize(): Promise<void> {
    eventBus.on('skill.learned', (skillId: string) => this.learnSkill(skillId));
    eventBus.on('skill.upgraded', (skillId: string) => this.upgradeSkill(skillId));
    eventBus.on('skill.used', (skillId: string) => this.useSkill(skillId));
    eventBus.on('skill.equipped', (skillId: string) => this.equipSkill(skillId));
    eventBus.on('skill.unequipped', (skillId: string) => this.unequipSkill(skillId));
    eventBus.on('skill.point.earned', () => this.addSkillPoint());

    // 初始化示例技能
    this.registerDefaultSkills();
  }

  update(deltaTime: number): void {
    // 更新技能冷却
    for (const skill of this.skills.values()) {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown -= deltaTime * 1000;
        if (skill.currentCooldown < 0) {
          skill.currentCooldown = 0;
        }
      }
    }
  }

  /** 注册默认技能 */
  private registerDefaultSkills(): void {
    const defaultSkills: Skill[] = [
      {
        id: 'skill_attack',
        name: '普通攻击',
        description: '进行一次普通的近战攻击',
        type: 'active',
        level: 1,
        maxLevel: 1,
        cooldown: 0,
        currentCooldown: 0,
        manaCost: 0,
        damage: 10,
        effects: [],
        icon: '⚔️'
      },
      {
        id: 'skill_fireball',
        name: '火球术',
        description: '释放一个火球，造成大量火焰伤害',
        type: 'active',
        level: 1,
        maxLevel: 10,
        cooldown: 8000,
        currentCooldown: 0,
        manaCost: 20,
        damage: 50,
        effects: [
          { type: 'burn', value: 10, duration: 3000, chance: 0.3 }
        ],
        icon: '🔥'
      },
      {
        id: 'skill_heal',
        name: '治疗术',
        description: '恢复自身生命值',
        type: 'active',
        level: 1,
        maxLevel: 10,
        cooldown: 15000,
        currentCooldown: 0,
        manaCost: 30,
        damage: 0,
        effects: [
          { type: 'heal', value: 100, duration: 0, chance: 1.0 }
        ],
        icon: '💚'
      },
      {
        id: 'skill_armor',
        name: '坚韧皮肤',
        description: '增加防御力',
        type: 'passive',
        level: 1,
        maxLevel: 5,
        cooldown: 0,
        currentCooldown: 0,
        manaCost: 0,
        damage: 0,
        effects: [
          { type: 'defense', value: 5, duration: 0, chance: 1.0 }
        ],
        icon: '🛡️'
      },
      {
        id: 'skill_berserk',
        name: '狂暴',
        description: '大幅提升攻击力，但降低防御',
        type: 'toggle',
        level: 1,
        maxLevel: 5,
        cooldown: 30000,
        currentCooldown: 0,
        manaCost: 50,
        damage: 0,
        effects: [
          { type: 'attack', value: 30, duration: 10000, chance: 1.0 },
          { type: 'defense', value: -20, duration: 10000, chance: 1.0 }
        ],
        icon: '💢'
      }
    ];

    defaultSkills.forEach(skill => this.registerSkill(skill));
  }

  /** 注册技能 */
  registerSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
  }

  /** 学习技能 */
  learnSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill || skill.level > 0) {
      return false;
    }

    this.unlockedSkills.add(skillId);
    eventBus.emit('skill.learned', skill);
    return true;
  }

  /** 升级技能 */
  upgradeSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill || skill.level >= skill.maxLevel || !this.unlockedSkills.has(skillId)) {
      return false;
    }

    // 检查技能点
    if (this.skillPoints <= 0) {
      eventBus.emit('skill.error', { message: '技能点不足' });
      return false;
    }

    // 升级
    skill.level++;
    skill.damage += 10;
    this.skillPoints--;

    eventBus.emit('skill.upgraded', skill);
    return true;
  }

  /** 使用技能 */
  useSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill || !this.unlockedSkills.has(skillId)) {
      return false;
    }

    // 检查冷却
    if (skill.currentCooldown > 0) {
      eventBus.emit('skill.cooldown', { skillId, remaining: skill.currentCooldown });
      return false;
    }

    // 检查法力
    eventBus.emit('skill.manaRequired', { skillId, manaCost: skill.manaCost });

    // 使用技能
    skill.currentCooldown = skill.cooldown;
    eventBus.emit('skill.used', skill);
    return true;
  }

  /** 装备技能 */
  equipSkill(skillId: string): boolean {
    if (this.equippedSkills.length >= 4) {
      eventBus.emit('skill.error', { message: '技能槽已满' });
      return false;
    }

    if (!this.unlockedSkills.has(skillId)) {
      return false;
    }

    this.equippedSkills.push(skillId);
    eventBus.emit('skill.equipped', { skillId, slot: this.equippedSkills.length - 1 });
    return true;
  }

  /** 卸下技能 */
  unequipSkill(skillId: string): boolean {
    const index = this.equippedSkills.indexOf(skillId);
    if (index === -1) return false;

    this.equippedSkills.splice(index, 1);
    eventBus.emit('skill.unequipped', { skillId, slot: index });
    return true;
  }

  /** 添加技能点 */
  addSkillPoint(): void {
    this.skillPoints++;
    eventBus.emit('skill.point.updated', { points: this.skillPoints });
  }

  /** 获取技能 */
  getSkill(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  /** 获取所有已解锁技能 */
  getUnlockedSkills(): Skill[] {
    return Array.from(this.skills.values())
      .filter(skill => this.unlockedSkills.has(skill.id));
  }

  /** 检查技能是否可用 */
  isSkillReady(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;
    return skill.currentCooldown <= 0;
  }

  /** 获取技能冷却剩余时间 */
  getCooldownRemaining(skillId: string): number {
    const skill = this.skills.get(skillId);
    return skill?.currentCooldown ?? 0;
  }

  /** 获取技能点 */
  getSkillPoints(): number {
    return this.skillPoints;
  }
}
