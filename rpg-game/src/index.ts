/**
 * RPG 游戏入口
 * 初始化游戏引擎和各系统
 */

import { GameEngine } from './core/GameEngine';
import { CombatSystem } from './systems/CombatSystem';
import { InventorySystem } from './systems/InventorySystem';
import { QuestSystem } from './systems/QuestSystem';
import { SkillSystem } from './systems/SkillSystem';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { eventBus } from './core/EventBus';

// 游戏配置
const gameConfig = {
  title: 'RPG Adventure',
  width: 800,
  height: 600,
  fps: 60,
  debug: true
};

// 创建游戏引擎
const engine = new GameEngine(gameConfig);

// 创建游戏系统
const combatSystem = new CombatSystem();
const inventorySystem = new InventorySystem();
const questSystem = new QuestSystem();
const skillSystem = new SkillSystem();

// 注册系统到引擎
engine.registerSystem('combat', combatSystem);
engine.registerSystem('inventory', inventorySystem);
engine.registerSystem('quest', questSystem);
engine.registerSystem('skill', skillSystem);

// 创建玩家
const player = new Player('player_1', 'Hero');
player.initialize();
engine.registerEntity('player', player);

// 创建敌人
const slime1 = new Enemy('enemy_1', '史莱姆', 'slime');
const wolf1 = new Enemy('enemy_2', '灰狼', 'wolf');
slime1.initialize();
wolf1.initialize();
engine.registerEntity('slime_1', slime1);
engine.registerEntity('wolf_1', wolf1);

// 注册战斗单位
combatSystem.registerCombatant({
  id: 'player',
  name: 'Hero',
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
  id: 'slime_1',
  name: '史莱姆',
  stats: {
    health: 30,
    maxHealth: 30,
    attack: 5,
    defense: 2,
    speed: 2,
    criticalRate: 0,
    dodgeRate: 0
  },
  isAlive: true
});

// 演示函数
async function demoGame(): Promise<void> {
  console.log('\n=== RPG 游戏演示 ===\n');

  // 1. 初始化游戏
  console.log('1. 初始化游戏...');
  await engine.initialize();

  // 2. 接受任务
  console.log('\n2. 接受任务...');
  questSystem.acceptQuest('quest_tutorial_1');

  // 3. 模拟战斗
  console.log('\n3. 开始战斗...');
  combatSystem.startCombat({ turnTime: 1000, autoCombat: false, allowRetreat: true });

  // 玩家攻击
  console.log('   玩家攻击史莱姆...');
  const attack1 = combatSystem.executeAttack('player', 'slime_1');
  console.log(`   造成 ${attack1.damage} 点伤害${attack1.isCritical ? ' (暴击!)' : ''}`);

  // 敌人攻击
  console.log('   史莱姆反击...');
  const attack2 = combatSystem.executeAttack('slime_1', 'player');
  console.log(`   造成 ${attack2.damage} 点伤害`);

  // 再次攻击击败敌人
  console.log('\n   玩家再次攻击...');
  const attack3 = combatSystem.executeAttack('player', 'slime_1');
  console.log(`   造成 ${attack3.damage} 点伤害`);

  // 获取战斗结果
  const result = combatSystem.getCombatResult();
  if (result) {
    console.log(`\n   战斗结束! 获胜者: ${result.winnerId}`);
    console.log(`   总伤害: ${result.damageDealt}`);
  }

  combatSystem.endCombat();

  // 4. 更新任务进度
  console.log('\n4. 更新任务进度...');
  questSystem.updateObjective('quest_tutorial_1', 'obj_kill_slimes', 1);

  // 5. 使用物品
  console.log('\n5. 使用生命药水...');
  inventorySystem.addItem('potion_health', 3);
  console.log(`   当前背包物品: ${inventorySystem.getItemCount('potion_health')} 个生命药水`);

  // 6. 获得经验
  console.log('\n6. 获得经验...');
  eventBus.emit('player.experience', { amount: 100 });
  console.log(`   玩家等级: ${player.getLevel()}`);

  // 7. 学习技能
  console.log('\n7. 学习技能...');
  skillSystem.learnSkill('skill_fireball');
  skillSystem.learnSkill('skill_heal');
  console.log(`   已学习技能: 火球术, 治疗术`);

  // 8. 装备技能
  console.log('\n8. 装备技能...');
  skillSystem.equipSkill('skill_fireball');
  skillSystem.equipSkill('skill_heal');
  console.log(`   已装备技能: 火球术, 治疗术`);

  // 9. 移动玩家
  console.log('\n9. 玩家移动...');
  player.move('down', 5);
  player.move('right', 3);
  console.log(`   玩家位置: (${player.x}, ${player.y})`);

  // 10. 游戏状态
  console.log('\n10. 游戏状态总结:');
  console.log(`   - 玩家生命: ${player.stats.health}/${player.stats.maxHealth}`);
  console.log(`   - 玩家法力: ${player.stats.mana}/${player.stats.maxMana}`);
  console.log(`   - 玩家金币: ${player.gold}`);
  console.log(`   - 活跃任务: ${questSystem.getActiveQuests().length} 个`);
  console.log(`   - 已解锁技能: ${skillSystem.getUnlockedSkills().length} 个`);

  console.log('\n=== 演示完成! ===\n');
}

// 运行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  demoGame().catch(console.error);
}

// 导出供其他模块使用
export { engine, player, combatSystem, inventorySystem, questSystem, skillSystem };
