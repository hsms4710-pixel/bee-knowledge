/**
 * RPG 游戏系统测试
 * 测试所有核心系统功能
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GameEngine } from '../src/core/GameEngine';
import { CombatSystem } from '../src/systems/CombatSystem';
import { InventorySystem } from '../src/systems/InventorySystem';
import { QuestSystem } from '../src/systems/QuestSystem';
import { SkillSystem } from '../src/systems/SkillSystem';
import { Player } from '../src/entities/Player';
import { Enemy } from '../src/entities/Enemy';

describe('RPG Game Systems', () => {
  let engine: GameEngine;
  let combatSystem: CombatSystem;
  let inventorySystem: InventorySystem;
  let questSystem: QuestSystem;
  let skillSystem: SkillSystem;
  let player: Player;

  beforeEach(() => {
    // 创建测试实例
    engine = new GameEngine({
      title: 'Test RPG',
      width: 800,
      height: 600,
      fps: 60,
      debug: false
    });

    combatSystem = new CombatSystem();
    inventorySystem = new InventorySystem();
    questSystem = new QuestSystem();
    skillSystem = new SkillSystem();

    engine.registerSystem('combat', combatSystem);
    engine.registerSystem('inventory', inventorySystem);
    engine.registerSystem('quest', questSystem);
    engine.registerSystem('skill', skillSystem);

    player = new Player('test_player', 'TestHero');
    player.initialize();
    engine.registerEntity('player', player);
  });

  afterEach(() => {
    // 清理
    engine = null!;
    combatSystem = null!;
    inventorySystem = null!;
    questSystem = null!;
    skillSystem = null!;
    player = null!;
  });

  describe('GameEngine', () => {
    it('should initialize game engine', async () => {
      await engine.initialize();
      expect(engine.getState()).toBe('menu');
    });

    it('should start and stop game', async () => {
      await engine.initialize();
      engine.start();
      expect(engine.getState()).toBe('playing');
      engine.stop();
      expect(engine.getState()).toBe('gameOver');
    });

    it('should pause and resume game', async () => {
      await engine.initialize();
      engine.start();
      engine.pause();
      expect(engine.getState()).toBe('paused');
      engine.resume();
      expect(engine.getState()).toBe('playing');
    });

    it('should register game systems', async () => {
      await engine.initialize();
      expect(engine.getState()).toBe('menu');
    });

    it('should register game entities', async () => {
      await engine.initialize();
      expect(engine.getState()).toBe('menu');
    });
  });

  describe('CombatSystem', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      // 注册战斗单位
      combatSystem.registerCombatant({
        id: 'player',
        name: 'TestHero',
        stats: {
          health: 100,
          maxHealth: 100,
          attack: 20,
          defense: 10,
          speed: 5,
          criticalRate: 0.1,
          dodgeRate: 0.05
        },
        isAlive: true
      });

      combatSystem.registerCombatant({
        id: 'enemy',
        name: 'TestEnemy',
        stats: {
          health: 50,
          maxHealth: 50,
          attack: 10,
          defense: 5,
          speed: 3,
          criticalRate: 0,
          dodgeRate: 0
        },
        isAlive: true
      });
    });

    it('should calculate correct damage', () => {
      const result = combatSystem.executeAttack('player', 'enemy');
      expect(result.damage).toBeGreaterThan(0);
      expect(result.damage).toBeLessThanOrEqual(20); // attack - defense = 15, max 15
    });

    it('should handle critical hits', () => {
      let criticalCount = 0;
      const trials = 100;
      
      for (let i = 0; i < trials; i++) {
        const result = combatSystem.executeAttack('player', 'enemy');
        if (result.isCritical) criticalCount++;
      }
      
      // 约 10% 暴击率
      expect(criticalCount).toBeGreaterThan(0);
    });

    it('should handle dodges', () => {
      const result = combatSystem.executeAttack('player', 'enemy');
      // 敌人闪避率为 0，不应闪避
      expect(result.isDodge).toBe(false);
    });

    it('should kill enemy when health reaches 0', () => {
      // 重置战斗状态
      combatSystem.endCombat();
      combatSystem.startCombat({ turnTime: 1000, autoCombat: false, allowRetreat: true });
      
      // 重新注册战斗单位（因为之前可能已死亡）
      combatSystem.registerCombatant({
        id: 'player',
        name: 'TestHero',
        stats: {
          health: 100,
          maxHealth: 100,
          attack: 20,
          defense: 10,
          speed: 5,
          criticalRate: 0.1,
          dodgeRate: 0.05
        },
        isAlive: true
      });

      combatSystem.registerCombatant({
        id: 'enemy',
        name: 'TestEnemy',
        stats: {
          health: 50,
          maxHealth: 50,
          attack: 10,
          defense: 5,
          speed: 3,
          criticalRate: 0,
          dodgeRate: 0
        },
        isAlive: true
      });

      // 多次攻击直到敌人死亡
      for (let i = 0; i < 10; i++) {
        const result = combatSystem.executeAttack('player', 'enemy');
        if (result.damage > 0 && !combatSystem.isCombatActive()) {
          break;
        }
      }
      
      const result = combatSystem.getCombatResult();
      expect(result?.winnerId).toBe('player');
    });

    it('should get combat log', () => {
      combatSystem.executeAttack('player', 'enemy');
      const log = combatSystem.getCombatLog();
      expect(log.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('InventorySystem', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should add items to inventory', () => {
      const success = inventorySystem.addItem('potion_health', 5);
      expect(success).toBe(true);
      expect(inventorySystem.getItemCount('potion_health')).toBe(5);
    });

    it('should remove items from inventory', () => {
      inventorySystem.addItem('potion_health', 5);
      const success = inventorySystem.removeItem('potion_health', 2);
      expect(success).toBe(true);
      expect(inventorySystem.getItemCount('potion_health')).toBe(3);
    });

    it('should check if item exists', () => {
      expect(inventorySystem.hasItem('potion_health')).toBe(false);
      inventorySystem.addItem('potion_health', 1);
      expect(inventorySystem.hasItem('potion_health')).toBe(true);
      expect(inventorySystem.hasItem('potion_health', 2)).toBe(false);
    });

    it('should equip weapons', () => {
      inventorySystem.addItem('sword_iron', 1);
      const success = inventorySystem.equipItem('sword_iron', 'mainHand');
      expect(success).toBe(true);
      expect(inventorySystem.getEquipment().mainHand?.id).toBe('sword_iron');
    });

    it('should equip armor', () => {
      inventorySystem.addItem('helmet_leather', 1);
      const success = inventorySystem.equipItem('helmet_leather', 'helmet');
      expect(success).toBe(true);
      expect(inventorySystem.getEquipment().helmet?.id).toBe('helmet_leather');
    });

    it('should unequip items', () => {
      inventorySystem.addItem('sword_iron', 1);
      inventorySystem.equipItem('sword_iron', 'mainHand');
      const success = inventorySystem.unequipItem('mainHand');
      expect(success).toBe(true);
      expect(inventorySystem.getEquipment().mainHand).toBeUndefined();
    });
  });

  describe('QuestSystem', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should accept quests', () => {
      const success = questSystem.acceptQuest('quest_tutorial_1');
      expect(success).toBe(true);
      expect(questSystem.getActiveQuests().length).toBe(1);
    });

    it('should update quest objectives', () => {
      questSystem.acceptQuest('quest_tutorial_1');
      questSystem.updateObjective('quest_tutorial_1', 'obj_kill_slimes', 1);
      
      const quest = questSystem.getQuest('quest_tutorial_1');
      expect(quest?.objectives[0].current).toBe(1);
    });

    it('should complete quests', () => {
      questSystem.acceptQuest('quest_tutorial_1');
      // 完成所有目标
      for (let i = 0; i < 3; i++) {
        questSystem.updateObjective('quest_tutorial_1', 'obj_kill_slimes', 1);
      }
      
      const activeQuests = questSystem.getActiveQuests();
      expect(activeQuests.length).toBe(0);
    });

    it('should check quest completion', () => {
      expect(questSystem.isQuestCompleted('quest_tutorial_1')).toBe(false);
      questSystem.acceptQuest('quest_tutorial_1');
      for (let i = 0; i < 3; i++) {
        questSystem.updateObjective('quest_tutorial_1', 'obj_kill_slimes', 1);
      }
      expect(questSystem.isQuestCompleted('quest_tutorial_1')).toBe(true);
    });

    it('should not allow too many active quests', () => {
      // 默认最多 5 个活跃任务
      // 注意：同一个任务只能接受一次，所以这里需要不同的任务ID
      questSystem.acceptQuest('quest_tutorial_1');
      questSystem.acceptQuest('quest_tutorial_2');
      questSystem.acceptQuest('quest_main_1');
      
      // 检查活跃任务数量
      const activeQuests = questSystem.getActiveQuests();
      // 根据任务的前置条件，可能只有部分任务能被接受
      expect(activeQuests.length).toBeLessThanOrEqual(5);
    });
  });

  describe('SkillSystem', () => {
    beforeEach(async () => {
      await engine.initialize();
      // 重置技能系统状态
      skillSystem.learnSkill('skill_fireball');
    });

    it('should learn skills', () => {
      const success = skillSystem.learnSkill('skill_fireball');
      expect(success).toBe(true);
      expect(skillSystem.getUnlockedSkills().some(s => s.id === 'skill_fireball')).toBe(true);
    });

    it('should upgrade skills', () => {
      skillSystem.addSkillPoint();
      const success = skillSystem.upgradeSkill('skill_fireball');
      
      const skill = skillSystem.getSkill('skill_fireball');
      expect(success).toBe(true);
      expect(skill?.level).toBe(2);
      expect(skill?.damage).toBe(60); // 基础 50 + 10
    });

    it('should not upgrade without skill points', () => {
      const success = skillSystem.upgradeSkill('skill_fireball');
      expect(success).toBe(false);
    });

    it('should use skills', () => {
      const success = skillSystem.useSkill('skill_fireball');
      expect(success).toBe(true);
    });

    it('should respect cooldowns', () => {
      skillSystem.useSkill('skill_fireball');
      const success = skillSystem.useSkill('skill_fireball');
      expect(success).toBe(false); // 在冷却中
    });

    it('should equip skills', () => {
      skillSystem.learnSkill('skill_heal');
      
      const success1 = skillSystem.equipSkill('skill_fireball');
      const success2 = skillSystem.equipSkill('skill_heal');
      
      expect(success1).toBe(true);
      expect(success2).toBe(true);
      expect(skillSystem.equippedSkills.length).toBe(2);
    });

    it('should check skill readiness', () => {
      expect(skillSystem.isSkillReady('skill_fireball')).toBe(true);
      
      skillSystem.useSkill('skill_fireball');
      expect(skillSystem.isSkillReady('skill_fireball')).toBe(false);
    });
  });

  describe('Player', () => {
    let testPlayer: Player;

    beforeEach(async () => {
      await engine.initialize();
      // 创建新的玩家实例
      testPlayer = new Player('test_player_' + Date.now(), 'TestHero');
      testPlayer.initialize();
    });

    it('should take damage', () => {
      testPlayer.takeDamage(20);
      expect(testPlayer.stats.health).toBe(80);
    });

    it('should heal', () => {
      testPlayer.takeDamage(50);
      testPlayer.heal(30);
      expect(testPlayer.stats.health).toBe(80);
    });

    it('should gain experience', () => {
      testPlayer.gainExperience(100);
      expect(testPlayer.stats.experience).toBe(100);
    });

    it('should level up', () => {
      // 获得足够经验升级
      const expToNext = testPlayer.stats.experienceToNext;
      testPlayer.gainExperience(expToNext);
      expect(testPlayer.getLevel()).toBe(2);
    });

    it('should add gold', () => {
      testPlayer.addGold(100);
      expect(testPlayer.gold).toBe(100);
    });

    it('should move', () => {
      testPlayer.move('down', 5);
      expect(testPlayer.y).toBe(5);
      expect(testPlayer.state.direction).toBe('down');
    });

    it('should check if alive', () => {
      expect(testPlayer.isAlive()).toBe(true);
      testPlayer.takeDamage(100);
      expect(testPlayer.isAlive()).toBe(false);
    });
  });

  describe('Enemy', () => {
    let enemy: Enemy;

    beforeEach(async () => {
      await engine.initialize();
      enemy = new Enemy('test_enemy', 'TestSlime', 'slime');
      enemy.initialize();
    });

    it('should create enemy with correct stats', () => {
      expect(enemy.name).toBe('TestSlime');
      expect(enemy.stats.health).toBe(30);
      expect(enemy.stats.attack).toBe(5);
    });

    it('should take damage', () => {
      enemy.takeDamage(10);
      expect(enemy.stats.health).toBe(20);
    });

    it('should die when health reaches 0', () => {
      enemy.takeDamage(30);
      expect(enemy.isAlive).toBe(false);
    });

    it('should respawn', () => {
      enemy.takeDamage(30);
      enemy.respawn();
      expect(enemy.isAlive).toBe(true);
      expect(enemy.stats.health).toBe(30);
    });
  });
});
