/**
 * Tower Defense Game - Renderer
 * GDD 生成: node_dc230ccd
 */

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameEngine: any;
  
  constructor(canvas: HTMLCanvasElement, gameEngine: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gameEngine = gameEngine;
  }
  
  /** 渲染游戏 */
  render(): void {
    this.gameEngine.draw();
  }
  
  /** 显示游戏菜单 */
  showMenu(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, w, h);
    
    // 标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('tower defense', w / 2, h / 2 - 100);
    
    // 副标题
    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.fillText('放置防御塔，阻止敌人入侵！', w / 2, h / 2 - 50);
    
    // 开始按钮
    const buttonY = h / 2;
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(w / 2 - 100, buttonY - 25, 200, 50);
    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText('开始游戏', w / 2, buttonY);
    
    // 说明
    ctx.fillStyle = '#AAA';
    ctx.font = '16px Arial';
    ctx.fillText('点击绿色按钮开始游戏', w / 2, h / 2 + 50);
  }
  
  /** 显示游戏结束 */
  showGameOver(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, w, h);
    
    // 游戏结束
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', w / 2, h / 2 - 50);
    
    // 统计
    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.fillText(`到达波次: ${this.gameEngine.waveManager.getCurrentWaveIndex() + 1}`, w / 2, h / 2);
    ctx.fillText(`最终金币: ${this.gameEngine.gold}`, w / 2, h / 2 + 30);
    
    // 重新开始
    const buttonY = h / 2 + 80;
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(w / 2 - 100, buttonY - 25, 200, 50);
    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText('重新开始', w / 2, buttonY);
  }
  
  /** 显示胜利 */
  showVictory(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, w, h);
    
    // 胜利
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('胜利！', w / 2, h / 2 - 50);
    
    // 统计
    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.fillText(`最终金币: ${this.gameEngine.gold}`, w / 2, h / 2);
    
    // 重新开始
    const buttonY = h / 2 + 80;
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(w / 2 - 100, buttonY - 25, 200, 50);
    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText('重新开始', w / 2, buttonY);
  }
}
