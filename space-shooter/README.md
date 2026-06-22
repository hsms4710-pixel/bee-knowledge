# 🚀 Space Shooter - GDD Generated Game

一个使用 **Graph-Driven Development (GDD)** 开发流程创建的太空射击游戏。

## 📋 GDD 开发流程

本项目严格按照 GDD 的 4 步开发流程创建：

### 步骤 1: Brainstorm 需求澄清
```
用户输入: "帮我创建一个太空射击游戏，玩家控制飞船躲避敌机并击落它们"
↓
智能 Brainstorm 会话
├─ 分析用户输入
├─ 生成澄清问题 (技术栈、功能范围、架构)
└─ 收集用户答案
```

### 步骤 2: 构建 5 层图谱架构
```
L1_Constitution (项目宪法)
├─ 趣味性优先
├─ 难度平衡
└─ 流畅响应

L2_TechStack (技术栈)
├─ TypeScript 5.x
├─ HTML5 Canvas
└─ Vitest

L3_Epic (史诗功能)
├─ 玩家系统
├─ 敌机系统
├─ 武器系统
├─ 道具系统
├─ Boss 系统
├─ 关卡系统
└─ UI 系统

L4_Story (故事功能)
├─ 玩家移动、生命、得分
├─ 敌机生成、AI
├─ 子弹发射、碰撞
├─ 道具掉落、拾取、效果
├─ Boss 生成、攻击模式
└─ 关卡设计、进度

L5_Task (具体任务)
├─ 实现 Player 类
├─ 实现 Enemy 类
├─ 实现 WeaponSystem
├─ 实现 CollisionSystem
└─ ... (共 16 个任务)
```

### 步骤 3: 代码索引和分析
```
分析项目上下文
├─ 检测语言: TypeScript
├─ 检测框架: HTML5 Canvas
├─ 架构模式: 游戏循环 + 实体系统
└─ 生成项目结构建议
```

### 步骤 4: 根据图谱生成代码
```
从 L5_Task 层映射到代码文件
├─ n_l5_game_engine → src/core/GameEngine.ts
├─ n_l5_renderer → src/core/Renderer.ts
├─ n_l5_player_class → src/entities/Player.ts
├─ n_l5_enemy_class → src/entities/Enemy.ts
├─ n_l5_weapon_system → src/systems/WeaponSystem.ts
└─ ... (共 18 个文件)
```

## 🎮 游戏特性

- **4 种敌机类型**: 基础、快速、坦克、射手
- **4 种道具**: 火力升级、护盾、炸弹、生命
- **武器等级系统**: 3 级武器升级
- **关卡系统**: 波次敌人生成
- **流畅体验**: 60 FPS 稳定运行

## 🎯 控制方式

- **WASD / 方向键**: 移动飞船
- **空格键**: 射击

## 📁 项目结构

```
space-shooter/
├── src/
│   ├── core/              # 核心模块 (L5: n_l5_game_engine, n_l5_renderer)
│   │   ├── GameEngine.ts  # 游戏引擎
│   │   └── Renderer.ts    # 渲染器
│   ├── entities/          # 实体类 (L5: n_l5_player_class, n_l5_enemy_class, etc.)
│   │   ├── Player.ts      # 玩家
│   │   ├── Enemy.ts       # 敌机
│   │   ├── Bullet.ts      # 子弹
│   │   ├── PowerUp.ts     # 道具
│   │   └── Boss.ts        # Boss
│   ├── systems/           # 系统模块 (L5: n_l5_weapon_system, etc.)
│   │   ├── EnemySpawner.ts    # 敌机生成器
│   │   ├── WeaponSystem.ts    # 武器系统
│   │   ├── CollisionSystem.ts # 碰撞系统
│   │   └── PowerUpSystem.ts   # 道具系统
│   ├── levels/            # 关卡 (L5: n_l5_level_class)
│   │   └── Level.ts       # 关卡配置
│   └── ui/                # UI (L5: n_l5_hud, n_l5_menu)
│       ├── HUD.ts         # 游戏内 HUD
│       └── Menu.ts        # 主菜单
├── tests/                 # 测试文件
│   └── game-systems.test.ts
├── gdd-brainstorm.ts      # GDD Brainstorm 脚本
├── gdd-graph.ts           # GDD 图谱定义
├── gdd-index.ts           # GDD 代码索引
├── gdd-generate.ts        # GDD 代码生成
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 运行游戏
npm run dev

# 运行测试
npm test
```

## 📊 GDD 图谱统计

| 层级 | 节点数 | 说明 |
|------|--------|------|
| L1_Constitution | 3 | 项目原则 |
| L2_TechStack | 3 | 技术选型 |
| L3_Epic | 7 | 史诗功能 |
| L4_Story | 17 | 故事功能 |
| L5_Task | 16 | 具体任务 |
| **总计** | **46** | - |

**边数**: 35 条依赖关系

**总预计工时**: 52 小时 ≈ 7 天

## 📈 测试覆盖

- Player 系统测试
- Enemy 系统测试
- Bullet 系统测试
- PowerUp 系统测试
- Collision 系统测试

## 🎨 GDD 价值

使用 GDD 开发流程的优势：

1. **需求清晰**: Brainstorm 阶段确保需求理解准确
2. **架构可视**: 5 层图谱提供清晰的架构视图
3. **依赖明确**: 图谱边定义了模块依赖关系
4. **代码可追溯**: 每个代码文件都对应图谱节点
5. **易于维护**: 图谱即文档，便于后续维护

---

*此项目由 Graph-Driven Development (GDD) 自动生成*
*生成时间: 2026-06-18*
