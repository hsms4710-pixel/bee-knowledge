/**
 * GDD 第二步：构建 5 层图谱架构
 * 
 * 基于 Brainstorm 澄清的需求，构建完整的项目图谱
 */

// ========== 图谱数据结构 ==========

interface GraphNode {
  id: string;
  layer: string;
  label: string;
  description: string;
  properties?: Record<string, unknown>;
  status?: 'draft' | 'reviewing' | 'approved' | 'implemented';
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'depends_on' | 'contains' | 'implements' | 'refines';
  label?: string;
}

interface GameGraph {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ========== 5 层图谱定义 ==========

export const spaceShooterGraph: GameGraph = {
  id: 'g_space_shooter_001',
  name: 'Space Shooter - 太空射击游戏',
  description: '一个经典的太空射击游戏，包含道具系统和 Boss 战',
  createdAt: Date.now(),
  
  // ========== L1: 项目宪法 ==========
  nodes: [
    // L1: Constitution
    {
      id: 'n_l1_fun',
      layer: 'L1_Constitution',
      label: '趣味性优先',
      description: '所有设计决策都以玩家乐趣为核心',
      properties: { principle: 'fun_first' },
      status: 'approved'
    },
    {
      id: 'n_l1_balance',
      layer: 'L1_Constitution',
      label: '难度平衡',
      description: '游戏难度曲线合理，既有挑战又不会挫败玩家',
      properties: { principle: 'difficulty_curve' },
      status: 'approved'
    },
    {
      id: 'n_l1_responsive',
      layer: 'L1_Constitution',
      label: '流畅响应',
      description: '游戏运行流畅，60fps 稳定',
      properties: { principle: 'performance' },
      status: 'approved'
    },

    // ========== L2: 技术栈 ==========
    {
      id: 'n_l2_typescript',
      layer: 'L2_TechStack',
      label: 'TypeScript',
      description: '主要开发语言，提供类型安全',
      properties: { version: '5.x', category: 'language' },
      status: 'approved'
    },
    {
      id: 'n_l2_canvas',
      layer: 'L2_TechStack',
      label: 'HTML5 Canvas',
      description: '2D 游戏渲染',
      properties: { category: 'rendering' },
      status: 'approved'
    },
    {
      id: 'n_l2_vitest',
      layer: 'L2_TechStack',
      label: 'Vitest',
      description: '单元测试框架',
      properties: { version: '1.x', category: 'testing' },
      status: 'approved'
    },

    // ========== L3: 史诗功能 (Epic) ==========
    {
      id: 'n_l3_player',
      layer: 'L3_Epic',
      label: '玩家系统',
      description: '玩家飞船控制、生命值、得分',
      properties: { priority: 'high' },
      status: 'approved'
    },
    {
      id: 'n_l3_enemy',
      layer: 'L3_Epic',
      label: '敌机系统',
      description: '敌机生成、AI、移动模式',
      properties: { priority: 'high' },
      status: 'approved'
    },
    {
      id: 'n_l3_weapon',
      layer: 'L3_Epic',
      label: '武器系统',
      description: '子弹发射、武器升级、伤害计算',
      properties: { priority: 'high' },
      status: 'approved'
    },
    {
      id: 'n_l3_powerup',
      layer: 'L3_Epic',
      label: '道具系统',
      description: '道具掉落、拾取、效果',
      properties: { priority: 'medium' },
      status: 'approved'
    },
    {
      id: 'n_l3_boss',
      layer: 'L3_Epic',
      label: 'Boss 系统',
      description: 'Boss 生成、多阶段战斗、特殊技能',
      properties: { priority: 'medium' },
      status: 'approved'
    },
    {
      id: 'n_l3_level',
      layer: 'L3_Epic',
      label: '关卡系统',
      description: '关卡设计、难度递进、胜利条件',
      properties: { priority: 'medium' },
      status: 'approved'
    },
    {
      id: 'n_l3_ui',
      layer: 'L3_Epic',
      label: 'UI 系统',
      description: 'HUD、菜单、暂停、游戏结束',
      properties: { priority: 'medium' },
      status: 'approved'
    },

    // ========== L4: 故事功能 (Story) ==========
    {
      id: 'n_l4_player_movement',
      layer: 'L4_Story',
      label: '玩家移动',
      description: '飞船上下左右移动控制',
      properties: { parentId: 'n_l3_player' },
      status: 'approved'
    },
    {
      id: 'n_l4_player_health',
      layer: 'L4_Story',
      label: '玩家生命',
      description: '生命值管理、受伤、死亡',
      properties: { parentId: 'n_l3_player' },
      status: 'approved'
    },
    {
      id: 'n_l4_player_score',
      layer: 'L4_Story',
      label: '玩家得分',
      description: '击毁敌机得分、最高分记录',
      properties: { parentId: 'n_l3_player' },
      status: 'approved'
    },
    {
      id: 'n_l4_enemy_spawn',
      layer: 'L4_Story',
      label: '敌机生成',
      description: '定时生成敌机、难度递增',
      properties: { parentId: 'n_l3_enemy' },
      status: 'approved'
    },
    {
      id: 'n_l4_enemy_ai',
      layer: 'L4_Story',
      label: '敌机 AI',
      description: '敌机移动模式、攻击行为',
      properties: { parentId: 'n_l3_enemy' },
      status: 'approved'
    },
    {
      id: 'n_l4_bullet_fire',
      layer: 'L4_Story',
      label: '子弹发射',
      description: '玩家射击、子弹轨迹',
      properties: { parentId: 'n_l3_weapon' },
      status: 'approved'
    },
    {
      id: 'n_l4_bullet_collision',
      layer: 'L4_Story',
      label: '碰撞检测',
      description: '子弹与敌机碰撞、敌机子弹与玩家碰撞',
      properties: { parentId: 'n_l3_weapon' },
      status: 'approved'
    },
    {
      id: 'n_l4_powerup_drop',
      layer: 'L4_Story',
      label: '道具掉落',
      description: '敌机死亡掉落道具',
      properties: { parentId: 'n_l3_powerup' },
      status: 'approved'
    },
    {
      id: 'n_l4_powerup_pickup',
      layer: 'L4_Story',
      label: '道具拾取',
      description: '玩家接触道具拾取',
      properties: { parentId: 'n_l3_powerup' },
      status: 'approved'
    },
    {
      id: 'n_l4_powerup_effect',
      layer: 'L4_Story',
      label: '道具效果',
      description: '道具激活效果 (火力、护盾、炸弹)',
      properties: { parentId: 'n_l3_powerup' },
      status: 'approved'
    },
    {
      id: 'n_l4_boss_spawn',
      layer: 'L4_Story',
      label: 'Boss 生成',
      description: '关卡 Boss 出现时机',
      properties: { parentId: 'n_l3_boss' },
      status: 'approved'
    },
    {
      id: 'n_l4_boss_pattern',
      layer: 'L4_Story',
      label: 'Boss 攻击模式',
      description: 'Boss 多阶段攻击模式',
      properties: { parentId: 'n_l3_boss' },
      status: 'approved'
    },
    {
      id: 'n_l4_level_design',
      layer: 'L4_Story',
      label: '关卡设计',
      description: '关卡布局、敌机配置',
      properties: { parentId: 'n_l3_level' },
      status: 'approved'
    },
    {
      id: 'n_l4_level_progress',
      layer: 'L4_Story',
      label: '关卡进度',
      description: '关卡切换、进度保存',
      properties: { parentId: 'n_l3_level' },
      status: 'approved'
    },
    {
      id: 'n_l4_hud_health',
      layer: 'L4_Story',
      label: '生命值显示',
      description: 'HUD 上显示玩家生命',
      properties: { parentId: 'n_l3_ui' },
      status: 'approved'
    },
    {
      id: 'n_l4_hud_score',
      layer: 'L4_Story',
      label: '得分显示',
      description: 'HUD 上显示当前得分',
      properties: { parentId: 'n_l3_ui' },
      status: 'approved'
    },
    {
      id: 'n_l4_menu_main',
      layer: 'L4_Story',
      label: '主菜单',
      description: '开始游戏、继续、退出',
      properties: { parentId: 'n_l3_ui' },
      status: 'approved'
    },

    // ========== L5: 具体任务 (Task) ==========
    {
      id: 'n_l5_player_class',
      layer: 'L5_Task',
      label: '实现 Player 类',
      description: '包含位置、速度、生命值、得分属性',
      properties: { 
        parentId: 'n_l4_player_movement',
        file: 'src/entities/Player.ts',
        estimatedHours: 2
      },
      status: 'approved'
    },
    {
      id: 'n_l5_player_update',
      layer: 'L5_Task',
      label: '实现玩家更新逻辑',
      description: '键盘输入处理、边界检测',
      properties: {
        parentId: 'n_l4_player_movement',
        file: 'src/entities/Player.ts',
        estimatedHours: 1
      },
      status: 'approved'
    },
    {
      id: 'n_l5_enemy_class',
      layer: 'L5_Task',
      label: '实现 Enemy 类',
      description: '包含类型、生命值、移动模式',
      properties: {
        parentId: 'n_l4_enemy_spawn',
        file: 'src/entities/Enemy.ts',
        estimatedHours: 2
      },
      status: 'approved'
    },
    {
      id: 'n_l5_enemy_spawner',
      layer: 'L5_Task',
      label: '实现敌机生成器',
      description: '定时生成、难度递增、类型随机',
      properties: {
        parentId: 'n_l4_enemy_spawn',
        file: 'src/systems/EnemySpawner.ts',
        estimatedHours: 2
      },
      status: 'approved'
    },
    {
      id: 'n_l5_bullet_class',
      layer: 'L5_Task',
      label: '实现 Bullet 类',
      description: '子弹属性、移动、碰撞',
      properties: {
        parentId: 'n_l4_bullet_fire',
        file: 'src/entities/Bullet.ts',
        estimatedHours: 1
      },
      status: 'approved'
    },
    {
      id: 'n_l5_weapon_system',
      layer: 'L5_Task',
      label: '实现武器系统',
      description: '射击冷却、武器升级、伤害计算',
      properties: {
        parentId: 'n_l4_bullet_fire',
        file: 'src/systems/WeaponSystem.ts',
        estimatedHours: 2
      },
      status: 'approved'
    },
    {
      id: 'n_l5_collision_system',
      layer: 'L5_Task',
      label: '实现碰撞系统',
      description: '矩形碰撞检测、碰撞响应',
      properties: {
        parentId: 'n_l4_bullet_collision',
        file: 'src/systems/CollisionSystem.ts',
        estimatedHours: 2
      },
      status: 'approved'
    },
    {
      id: 'n_l5_powerup_class',
      layer: 'L5_Task',
      label: '实现 PowerUp 类',
      description: '道具类型、效果、持续时间',
      properties: {
        parentId: 'n_l4_powerup_drop',
        file: 'src/entities/PowerUp.ts',
        estimatedHours: 2
      },
      status: 'approved'
    },
    {
      id: 'n_l5_powerup_system',
      layer: 'L5_Task',
      label: '实现道具系统',
      description: '道具掉落率、拾取检测、效果激活',
      properties: {
        parentId: 'n_l4_powerup_pickup',
        file: 'src/systems/PowerUpSystem.ts',
        estimatedHours: 3
      },
      status: 'approved'
    },
    {
      id: 'n_l5_boss_class',
      layer: 'L5_Task',
      label: '实现 Boss 类',
      description: 'Boss 属性、多阶段生命、攻击模式',
      properties: {
        parentId: 'n_l4_boss_spawn',
        file: 'src/entities/Boss.ts',
        estimatedHours: 4
      },
      status: 'approved'
    },
    {
      id: 'n_l5_level_class',
      layer: 'L5_Task',
      label: '实现 Level 类',
      description: '关卡配置、敌机波次、Boss 触发',
      properties: {
        parentId: 'n_l4_level_design',
        file: 'src/levels/Level.ts',
        estimatedHours: 3
      },
      status: 'approved'
    },
    {
      id: 'n_l5_game_engine',
      layer: 'L5_Task',
      label: '实现游戏引擎',
      description: '游戏循环、状态管理、系统协调',
      properties: {
        parentId: 'n_l3_player',
        file: 'src/core/GameEngine.ts',
        estimatedHours: 4
      },
      status: 'approved'
    },
    {
      id: 'n_l5_renderer',
      layer: 'L5_Task',
      label: '实现渲染器',
      description: 'Canvas 渲染、精灵绘制、特效',
      properties: {
        parentId: 'n_l3_player',
        file: 'src/core/Renderer.ts',
        estimatedHours: 3
      },
      status: 'approved'
    },
    {
      id: 'n_l5_hud',
      layer: 'L5_Task',
      label: '实现 HUD',
      description: '生命值、得分、武器等级显示',
      properties: {
        parentId: 'n_l4_hud_health',
        file: 'src/ui/HUD.ts',
        estimatedHours: 2
      },
      status: 'approved'
    },
    {
      id: 'n_l5_menu',
      layer: 'L5_Task',
      label: '实现主菜单',
      description: '开始/继续/退出按钮、背景动画',
      properties: {
        parentId: 'n_l4_menu_main',
        file: 'src/ui/Menu.ts',
        estimatedHours: 2
      },
      status: 'approved'
    }
  ],

  // ========== 边 (依赖关系) ==========
  edges: [
    // L1 -> L2
    { id: 'e_l1l2_1', source: 'n_l1_fun', target: 'n_l2_typescript', type: 'refines' },
    { id: 'e_l1l2_2', source: 'n_l1_balance', target: 'n_l2_typescript', type: 'refines' },
    
    // L2 -> L3
    { id: 'e_l2l3_1', source: 'n_l2_typescript', target: 'n_l3_player', type: 'enables' },
    { id: 'e_l2l3_2', source: 'n_l2_canvas', target: 'n_l3_ui', type: 'enables' },
    
    // L3 -> L4 (Epic 包含 Story)
    { id: 'e_l3l4_1', source: 'n_l3_player', target: 'n_l4_player_movement', type: 'contains' },
    { id: 'e_l3l4_2', source: 'n_l3_player', target: 'n_l4_player_health', type: 'contains' },
    { id: 'e_l3l4_3', source: 'n_l3_player', target: 'n_l4_player_score', type: 'contains' },
    { id: 'e_l3l4_4', source: 'n_l3_enemy', target: 'n_l4_enemy_spawn', type: 'contains' },
    { id: 'e_l3l4_5', source: 'n_l3_enemy', target: 'n_l4_enemy_ai', type: 'contains' },
    { id: 'e_l3l4_6', source: 'n_l3_weapon', target: 'n_l4_bullet_fire', type: 'contains' },
    { id: 'e_l3l4_7', source: 'n_l3_weapon', target: 'n_l4_bullet_collision', type: 'contains' },
    { id: 'e_l3l4_8', source: 'n_l3_powerup', target: 'n_l4_powerup_drop', type: 'contains' },
    { id: 'e_l3l4_9', source: 'n_l3_powerup', target: 'n_l4_powerup_pickup', type: 'contains' },
    { id: 'e_l3l4_10', source: 'n_l3_powerup', target: 'n_l4_powerup_effect', type: 'contains' },
    { id: 'e_l3l4_11', source: 'n_l3_boss', target: 'n_l4_boss_spawn', type: 'contains' },
    { id: 'e_l3l4_12', source: 'n_l3_boss', target: 'n_l4_boss_pattern', type: 'contains' },
    { id: 'e_l3l4_13', source: 'n_l3_level', target: 'n_l4_level_design', type: 'contains' },
    { id: 'e_l3l4_14', source: 'n_l3_level', target: 'n_l4_level_progress', type: 'contains' },
    { id: 'e_l3l4_15', source: 'n_l3_ui', target: 'n_l4_hud_health', type: 'contains' },
    { id: 'e_l3l4_16', source: 'n_l3_ui', target: 'n_l4_hud_score', type: 'contains' },
    { id: 'e_l3l4_17', source: 'n_l3_ui', target: 'n_l4_menu_main', type: 'contains' },

    // L4 -> L5 (Story 实现为 Task)
    { id: 'e_l4l5_1', source: 'n_l4_player_movement', target: 'n_l5_player_class', type: 'implements' },
    { id: 'e_l4l5_2', source: 'n_l4_player_movement', target: 'n_l5_player_update', type: 'implements' },
    { id: 'e_l4l5_3', source: 'n_l4_enemy_spawn', target: 'n_l5_enemy_class', type: 'implements' },
    { id: 'e_l4l5_4', source: 'n_l4_enemy_spawn', target: 'n_l5_enemy_spawner', type: 'implements' },
    { id: 'e_l4l5_5', source: 'n_l4_bullet_fire', target: 'n_l5_bullet_class', type: 'implements' },
    { id: 'e_l4l5_6', source: 'n_l4_bullet_fire', target: 'n_l5_weapon_system', type: 'implements' },
    { id: 'e_l4l5_7', source: 'n_l4_bullet_collision', target: 'n_l5_collision_system', type: 'implements' },
    { id: 'e_l4l5_8', source: 'n_l4_powerup_drop', target: 'n_l5_powerup_class', type: 'implements' },
    { id: 'e_l4l5_9', source: 'n_l4_powerup_pickup', target: 'n_l5_powerup_system', type: 'implements' },
    { id: 'e_l4l5_10', source: 'n_l4_boss_spawn', target: 'n_l5_boss_class', type: 'implements' },
    { id: 'e_l4l5_11', source: 'n_l4_level_design', target: 'n_l5_level_class', type: 'implements' },
    { id: 'e_l4l5_12', source: 'n_l4_hud_health', target: 'n_l5_hud', type: 'implements' },
    { id: 'e_l4l5_13', source: 'n_l4_menu_main', target: 'n_l5_menu', type: 'implements' },

    // 任务依赖
    { id: 'e_t_dep_1', source: 'n_l5_player_class', target: 'n_l5_player_update', type: 'depends_on' },
    { id: 'e_t_dep_2', source: 'n_l5_bullet_class', target: 'n_l5_weapon_system', type: 'depends_on' },
    { id: 'e_t_dep_3', source: 'n_l5_enemy_class', target: 'n_l5_enemy_spawner', type: 'depends_on' },
    { id: 'e_t_dep_4', source: 'n_l5_powerup_class', target: 'n_l5_powerup_system', type: 'depends_on' },
    { id: 'e_t_dep_5', source: 'n_l5_game_engine', target: 'n_l5_renderer', type: 'depends_on' },
    { id: 'e_t_dep_6', source: 'n_l5_player_class', target: 'n_l5_collision_system', type: 'depends_on' },
    { id: 'e_t_dep_7', source: 'n_l5_bullet_class', target: 'n_l5_collision_system', type: 'depends_on' }
  ]
};

// ========== 导出图谱 ==========
export default spaceShooterGraph;

// ========== 打印图谱统计 ==========
console.log('='.repeat(60));
console.log('🚀 GDD 开发流程 - 步骤 2: 构建 5 层图谱架构');
console.log('='.repeat(60));

console.log(`\n项目名称: ${spaceShooterGraph.name}`);
console.log(`项目描述: ${spaceShooterGraph.description}`);

// 统计各层节点数
const layerCounts = spaceShooterGraph.nodes.reduce((acc, node) => {
  acc[node.layer] = (acc[node.layer] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('\n【图谱统计】');
console.log('-'.repeat(40));
console.log(`总节点数: ${spaceShooterGraph.nodes.length}`);
console.log(`总边数: ${spaceShooterGraph.edges.length}`);
console.log(`\n各层节点分布:`);
Object.entries(layerCounts).forEach(([layer, count]) => {
  const layerName = {
    'L1_Constitution': 'L1 - 项目宪法',
    'L2_TechStack': 'L2 - 技术栈',
    'L3_Epic': 'L3 - 史诗功能',
    'L4_Story': 'L4 - 故事功能',
    'L5_Task': 'L5 - 具体任务'
  }[layer] || layer;
  console.log(`  ${layerName}: ${count} 个`);
});

// 打印核心任务
console.log('\n【核心任务列表】');
console.log('-'.repeat(40));
const coreTasks = spaceShooterGraph.nodes.filter(n => 
  n.layer === 'L5_Task' && n.properties?.estimatedHours && 
  (n.properties.estimatedHours as number) >= 2
);
console.log('\n预计工时 >= 2小时的任务:');
coreTasks.forEach(task => {
  console.log(`  - ${task.label}: ${(task.properties?.estimatedHours as number)}小时`);
});

// 计算总工时
const totalHours = spaceShooterGraph.nodes
  .filter(n => n.layer === 'L5_Task' && n.properties?.estimatedHours)
  .reduce((sum, n) => sum + (n.properties?.estimatedHours as number), 0);

console.log(`\n总预计工时: ${totalHours} 小时 ≈ ${Math.ceil(totalHours / 8)} 天`);

console.log('\n✅ 图谱构建完成！');
console.log('\n下一步: 根据图谱生成代码...');
