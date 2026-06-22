/**
 * Space Shooter - 游戏入口
 * 
 * GDD 生成代码 - L5_Task: n_l5_game_engine
 */

import { GameEngine } from './core/GameEngine';

// 获取画布
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) {
  // 创建画布
  const newCanvas = document.createElement('canvas');
  newCanvas.id = 'game-canvas';
  newCanvas.width = 800;
  newCanvas.height = 600;
  document.body.appendChild(newCanvas);
}

// 设置画布大小
canvas.width = 800;
canvas.height = 600;

// 创建游戏引擎
const game = new GameEngine(canvas);

// 启动游戏
game.start();

// 导出游戏对象 (用于调试)
(window as any).game = game;
