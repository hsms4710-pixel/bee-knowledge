/**
 * GDD 第一步：Brainstorm 需求澄清
 * 
 * 使用 GDD 的智能 Brainstorm 引擎来澄清需求
 */

import { smartBrainstormEngine } from '../src/brainstorm/SmartBrainstormEngine';
import { ContextAnalyzer } from '../src/brainstorm/ContextAnalyzer';

async function gddStep1_Brainstorm(): Promise<void> {
  console.log('='.repeat(60));
  console.log('🚀 GDD 开发流程 - 步骤 1: Brainstorm 需求澄清');
  console.log('='.repeat(60));

  // ========== 1.1 启动智能会话 ==========
  console.log('\n【1.1】启动智能 Brainstorm 会话');
  console.log('-'.repeat(40));
  
  const userInput = '帮我创建一个太空射击游戏(Space Shooter)，玩家控制飞船躲避敌机并击落它们，支持道具系统和Boss战';
  
  const session = smartBrainstormEngine.startSmartSession(
    userInput,
    undefined,
    { indexCode: false }
  );
  
  console.log(`用户输入: ${userInput}`);
  console.log(`会话 ID: ${session.sessionId}`);
  console.log(`初始状态: ${session.state}`);
  console.log(`初始置信度: ${(session.projectContext?.confidence * 100).toFixed(0)}%`);

  // ========== 1.2 获取第一个澄清问题 ==========
  console.log('\n【1.2】获取第一个澄清问题');
  console.log('-'.repeat(40));
  
  const question1 = smartBrainstormEngine.getNextQuestion(session.sessionId!);
  console.log(`问题类型: ${question1.type}`);
  console.log(`问题内容: ${question1.question}`);
  console.log(`问题上下文: ${question1.context || '无'}`);
  if (question1.options) {
    console.log('可选答案:');
    question1.options.slice(0, 4).forEach((opt, i) => {
      console.log(`  ${i + 1}. ${opt.label}: ${opt.description}`);
    });
  }

  // ========== 1.3 回答第一个问题 ==========
  console.log('\n【1.3】回答第一个问题');
  console.log('-'.repeat(40));
  
  // 模拟用户选择
  const answer1 = question1.options?.[0]?.id || 'option_1';
  smartBrainstormEngine.answerQuestion(session.sessionId!, question1.id, [answer1]);
  console.log(`选择: ${question1.options?.find(o => o.id === answer1)?.label}`);

  // ========== 1.4 获取第二个澄清问题 ==========
  console.log('\n【1.4】获取第二个澄清问题');
  console.log('-'.repeat(40));
  
  const question2 = smartBrainstormEngine.getNextQuestion(session.sessionId!);
  if (question2) {
    console.log(`问题类型: ${question2.type}`);
    console.log(`问题内容: ${question2.question}`);
    if (question2.options) {
      console.log('可选答案:');
      question2.options.slice(0, 4).forEach((opt, i) => {
        console.log(`  ${i + 1}. ${opt.label}: ${opt.description}`);
      });
    }
  } else {
    console.log('无更多问题');
  }

  // ========== 1.5 获取会话进度 ==========
  console.log('\n【1.5】获取会话进度');
  console.log('-'.repeat(40));
  
  const progress = smartBrainstormEngine.getProgress(session.sessionId!);
  console.log(`当前状态: ${progress.state}`);
  console.log(`已回答: ${progress.progress.answered}`);
  console.log(`总问题: ${progress.progress.total}`);
  console.log(`完成度: ${progress.progress.percentage}%`);

  // ========== 1.6 输出澄清结果 ==========
  console.log('\n【1.6】需求澄清结果');
  console.log('-'.repeat(40));
  
  console.log('\n✅ Brainstorm 阶段完成！');
  console.log('\n澄清的需求：');
  console.log('1. 游戏类型: 太空射击游戏 (Space Shooter)');
  console.log('2. 核心玩法: 飞船控制 + 敌机躲避 + 击落敌机');
  console.log('3. 道具系统: 支持多种道具 (火力升级、护盾、炸弹等)');
  console.log('4. Boss 战: 关卡 Boss 战斗');
  console.log('5. 技术栈: TypeScript (基于项目上下文推断)');

  console.log('\n下一步: 构建 5 层图谱架构...');
}

// 导出供其他模块使用
export { gddStep1_Brainstorm };

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  gddStep1_Brainstorm().catch(console.error);
}
