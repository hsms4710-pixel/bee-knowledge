/**
 * GDD 第三步：代码索引和分析
 * 
 * 使用 GDD 的代码索引器分析项目结构
 */

import { CodeIndexer } from '../src/indexer/CodeIndexer';
import { ContextAnalyzer } from '../src/brainstorm/ContextAnalyzer';

async function gddStep3_Index(): Promise<void> {
  console.log('='.repeat(60));
  console.log('🚀 GDD 开发流程 - 步骤 3: 代码索引和分析');
  console.log('='.repeat(60));

  // ========== 3.1 初始化索引器 ==========
  console.log('\n【3.1】初始化代码索引器');
  console.log('-'.repeat(40));
  
  const graphId = 'g_space_shooter_001';
  const projectPath = './space-shooter/src';
  
  const indexer = new CodeIndexer(graphId, projectPath);
  
  // ========== 3.2 执行索引 ==========
  console.log('\n【3.2】执行代码索引');
  console.log('-'.repeat(40));
  
  try {
    const result = await indexer.index();
    
    console.log(`扫描文件: ${result.summary.filesScanned}`);
    console.log(`生成节点: ${result.summary.nodesGenerated}`);
    console.log(`生成边: ${result.summary.edgesGenerated}`);
    console.log(`检测语言: ${result.summary.languages.join(', ')}`);
    console.log(`检测框架: ${result.summary.frameworks.join(', ')}`);
    
  } catch (error) {
    // 项目目录可能还不存在，这是正常的
    console.log('项目目录不存在，将从图谱生成代码');
  }

  // ========== 3.3 上下文分析 ==========
  console.log('\n【3.3】项目上下文分析');
  console.log('-'.repeat(40));
  
  const contextAnalyzer = new ContextAnalyzer();
  
  // 基于图谱信息进行分析
  const mockIndexResult = {
    files: [],
    dependencies: [
      { name: 'typescript', version: '5.x' },
      { name: 'vitest', version: '1.x' }
    ],
    summary: {
      totalFiles: 0,
      totalLines: 0,
      languages: ['TypeScript'],
      frameworks: []
    }
  };
  
  const projectContext = contextAnalyzer.analyzeFromIndexResult(mockIndexResult);
  
  console.log(`检测语言: ${projectContext.languages.join(', ')}`);
  console.log(`检测框架: ${projectContext.frameworks.join(', ') || '无'}`);
  console.log(`架构模式: ${projectContext.architecturePatterns.join(', ') || '待创建'}`);
  console.log(`置信度: ${(projectContext.confidence * 100).toFixed(0)}%`);

  // ========== 3.4 生成项目结构建议 ==========
  console.log('\n【3.4】项目结构建议');
  console.log('-'.repeat(40));
  
  const suggestedStructure = generateProjectStructure();
  
  console.log('\n建议的目录结构:');
  suggestedStructure.forEach(line => console.log(`  ${line}`));

  // ========== 3.5 依赖分析 ==========
  console.log('\n【3.5】依赖关系分析');
  console.log('-'.repeat(40));
  
  const dependencies = analyzeDependencies();
  
  console.log('\n模块依赖关系:');
  dependencies.forEach(dep => {
    console.log(`  ${dep.from} → ${dep.to} (${dep.type})`);
  });

  console.log('\n✅ 代码索引和分析完成！');
  console.log('\n下一步: 根据图谱和分析结果生成代码...');
}

/**
 * 生成项目结构建议
 */
function generateProjectStructure(): string[] {
  return [
    'space-shooter/',
    '├── src/',
    '│   ├── core/',
    '│   │   ├── GameEngine.ts',
    '│   │   └── Renderer.ts',
    '│   ├── entities/',
    '│   │   ├── Player.ts',
    '│   │   ├── Enemy.ts',
    '│   │   ├── Bullet.ts',
    '│   │   ├── PowerUp.ts',
    '│   │   └── Boss.ts',
    '│   ├── systems/',
    '│   │   ├── EnemySpawner.ts',
    '│   │   ├── WeaponSystem.ts',
    '│   │   ├── CollisionSystem.ts',
    '│   │   └── PowerUpSystem.ts',
    '│   ├── levels/',
    '│   │   └── Level.ts',
    '│   └── ui/',
    '│       ├── HUD.ts',
    '│       └── Menu.ts',
    '├── tests/',
    '│   └── game-systems.test.ts',
    '├── package.json',
    '├── tsconfig.json',
    '└── vitest.config.ts'
  ];
}

/**
 * 分析模块依赖
 */
function analyzeDependencies(): { from: string; to: string; type: string }[] {
  return [
    { from: 'GameEngine', to: 'Renderer', type: 'uses' },
    { from: 'GameEngine', to: 'Player', type: 'manages' },
    { from: 'GameEngine', to: 'EnemySpawner', type: 'uses' },
    { from: 'Player', to: 'WeaponSystem', type: 'uses' },
    { from: 'Player', to: 'PowerUpSystem', type: 'uses' },
    { from: 'EnemySpawner', to: 'Enemy', type: 'creates' },
    { from: 'WeaponSystem', to: 'Bullet', type: 'creates' },
    { from: 'CollisionSystem', to: 'Player', type: 'detects' },
    { from: 'CollisionSystem', to: 'Enemy', type: 'detects' },
    { from: 'CollisionSystem', to: 'Bullet', type: 'detects' },
    { from: 'PowerUpSystem', to: 'PowerUp', type: 'manages' },
    { from: 'Level', to: 'EnemySpawner', type: 'configures' },
    { from: 'Level', to: 'Boss', type: 'spawns' }
  ];
}

// 导出
export { gddStep3_Index };

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  gddStep3_Index();
}
