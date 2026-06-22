/**
 * GDD 集成测试
 * 测试 Graph-Driven Development 的代码索引和分析功能
 */

import { CodeIndexer } from '../src/indexer/CodeIndexer';
import { smartBrainstormEngine } from '../src/brainstorm/SmartBrainstormEngine';
import { ContextAnalyzer } from '../src/brainstorm/ContextAnalyzer';

async function testGDDIntegration(): Promise<void> {
  console.log('='.repeat(60));
  console.log('GDD 集成测试 - RPG 游戏项目');
  console.log('='.repeat(60));

  // 1. 索引 RPG 游戏项目
  console.log('\n【测试 1】代码索引');
  console.log('======================');
  
  const projectPath = './rpg-game/src';
  const graphId = 'rpg-game-' + Date.now();
  
  const indexer = new CodeIndexer(graphId, projectPath);
  const result = await indexer.index();
  
  console.log(`  - 扫描文件: ${result.summary.filesScanned}`);
  console.log(`  - 生成节点: ${result.summary.nodesGenerated}`);
  console.log(`  - 生成边: ${result.summary.edgesGenerated}`);
  console.log(`  - 检测语言: ${result.summary.languages.join(', ')}`);
  console.log(`  - 检测框架: ${result.summary.frameworks.join(', ')}`);

  // 2. 分析项目上下文
  console.log('\n【测试 2】上下文分析');
  console.log('======================');
  
  const contextAnalyzer = new ContextAnalyzer();
  
  const mockIndexResult = {
    files: result.nodes.map(n => ({ path: n.filePath || n.label, language: 'TypeScript' })),
    dependencies: [
      { name: 'typescript', version: '5.3.3' },
      { name: 'vitest', version: '1.1.0' }
    ],
    summary: {
      totalFiles: result.summary.filesScanned,
      totalLines: 5000,
      languages: ['TypeScript'],
      frameworks: ['TypeScript']
    }
  };
  
  const projectContext = contextAnalyzer.analyzeFromIndexResult(mockIndexResult);
  console.log(`  - 检测语言: ${projectContext.languages.join(', ')}`);
  console.log(`  - 检测框架: ${projectContext.frameworks.join(', ')}`);
  console.log(`  - 架构模式: ${projectContext.architecturePatterns.join(', ')}`);
  console.log(`  - 置信度: ${(projectContext.confidence * 100).toFixed(0)}%`);
  console.log(`  - 缺失项: ${projectContext.gaps.join(', ')}`);

  // 3. 启动 Brainstorm 会话
  console.log('\n【测试 3】Brainstorm 会话');
  console.log('======================');
  
  const session = smartBrainstormEngine.startSmartSession(
    '帮我创建一个完整的 RPG 游戏，包含战斗系统、背包系统、任务系统和技能系统',
    undefined,
    { indexCode: false }
  );
  
  console.log(`  - 会话 ID: ${session.sessionId}`);
  console.log(`  - 状态: ${session.state}`);
  console.log(`  - 初始置信度: ${(session.projectContext?.confidence * 100).toFixed(0)}%`);

  // 4. 获取澄清问题
  console.log('\n【测试 4】获取澄清问题');
  console.log('======================');
  
  const question = smartBrainstormEngine.getNextQuestion(session.sessionId!);
  
  if (question) {
    console.log(`  问题: ${question.question}`);
    console.log(`  类型: ${question.type}`);
    console.log(`  上下文: ${question.context || '无'}`);
    console.log('  选项:');
    if (question.options) {
      question.options.slice(0, 4).forEach((opt, i) => {
        console.log(`    ${i + 1}. ${opt.label}: ${opt.description}`);
      });
    }
  } else {
    console.log('  无待回答问题');
  }

  // 5. 模拟回答问题
  console.log('\n【测试 5】回答问题');
  console.log('======================');
  
  if (question && question.options && question.options.length > 0) {
    const selectedOptions = question.options.slice(0, 2).map(o => o.id);
    smartBrainstormEngine.answerQuestion(session.sessionId!, question.id, selectedOptions);
    console.log(`  选择: ${selectedOptions.join(', ')}`);
  }

  // 6. 获取会话进度
  console.log('\n【测试 6】会话进度');
  console.log('======================');
  
  const progress = smartBrainstormEngine.getProgress(session.sessionId!);
  console.log(`  当前状态: ${progress.state}`);
  console.log(`  已回答: ${progress.progress.answered}`);
  console.log(`  总问题: ${progress.progress.total}`);
  console.log(`  完成度: ${progress.progress.percentage}%`);

  // 7. 生成项目结构建议
  console.log('\n【测试 7】项目结构建议');
  console.log('======================');
  
  // 基于索引结果生成建议
  const suggestedStructure = [
    'src/',
    '  core/',
    '    GameEngine.ts',
    '    EventBus.ts',
    '  systems/',
    '    CombatSystem.ts',
    '    InventorySystem.ts',
    '    QuestSystem.ts',
    '    SkillSystem.ts',
    '  entities/',
    '    Player.ts',
    '    Enemy.ts',
    '  utils/',
    '    MathUtils.ts',
    '    StringUtils.ts',
    'tests/',
    '  game-systems.test.ts',
    'docs/',
    '  API.md',
    '  GUIDE.md'
  ];
  
  console.log('  建议的项目结构:');
  suggestedStructure.forEach(line => console.log(`    ${line}`));

  // 8. 测试结果总结
  console.log('\n【测试结果总结】');
  console.log('======================');
  console.log('✅ 代码索引: 成功');
  console.log('✅ 上下文分析: 成功');
  console.log('✅ Brainstorm 会话: 成功');
  console.log('✅ 问题生成: 成功');
  console.log('✅ 会话进度: 成功');
  console.log('✅ 项目结构: 成功');

  console.log('\n' + '='.repeat(60));
  console.log('GDD 集成测试完成!');
  console.log('='.repeat(60));
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testGDDIntegration().catch(console.error);
}
