/**
 * Tower Defense Game - HUD
 * GDD 生成: node_7e147d8e
 */

export class HUD {
  private canvas: HTMLCanvasElement;
  private gameEngine: any;
  
  constructor(canvas: HTMLCanvasElement, gameEngine: any) {
    this.canvas = canvas;
    this.gameEngine = gameEngine;
  }
  
  /** 绘制 HUD */
  draw(): void {
    const ctx = this.canvas.getContext('2d');
    const w = this.canvas.width;
    
    // 顶部状态栏背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, w, 60);
    
    // 生命值
    this.drawLives(ctx, 20, 20);
    
    // 金币
    this.drawGold(ctx, 200, 20);
    
    // 波次信息
    this.drawWaveInfo(ctx, w / 2, 20);
    
    // 塔选择面板
    this.drawTowerPanel(ctx, w - 250, 20);
    
    // 游戏状态提示
    if (this.gameEngine.gameState === 'paused') {
      this.drawPausedOverlay(ctx);
    }
  }
  
  private drawLives(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`❤️ 生命: ${this.gameEngine.lives}`, x, y);
  }
  
  private drawGold(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#FFD700';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`💰 金币: ${this.gameEngine.gold}`, x, y);
  }
  
  private drawWaveInfo(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const wave = this.gameEngine.waveManager.getCurrentWaveIndex() + 1;
    const total = this.gameEngine.waveManager.getTotalWaves();
    
    ctx.fillStyle = '#4FC3F7';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`波次: ${wave} / ${total}`, x, y);
  }
  
  private drawTowerPanel(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // 面板背景
    ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
    ctx.beginPath();
    ctx.roundRect(x, y, 230, 40, 5);
    ctx.fill();
    
    // 箭塔
    this.drawTowerButton(ctx, x + 10, y + 8, '箭塔', '100', '#4CAF50', this.gameEngine.gold >= 100);
    
    // 魔法塔
    this.drawTowerButton(ctx, x + 75, y + 8, '魔法', '150', '#9C27B0', this.gameEngine.gold >= 150);
    
    // 炮塔
    this.drawTowerButton(ctx, x + 140, y + 8, '炮塔', '200', '#FF5722', this.gameEngine.gold >= 200);
  }
  
  private drawTowerButton(ctx: CanvasRenderingContext2D, x: number, y: number, name: string, cost: string, color: string, enabled: boolean): void {
    // 按钮背景
    ctx.fillStyle = enabled ? color : '#555';
    ctx.fillRect(x, y, 55, 24);
    
    // 名称
    ctx.fillStyle = '#FFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x + 6, y + 12);
    
    // 价格
    ctx.textAlign = 'right';
    ctx.fillText(cost, x + 50, y + 12);
  }
  
  private drawPausedOverlay(ctx: CanvasRenderingContext2D): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = '#FFF';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏暂停', w / 2, h / 2);
    
    ctx.font = '18px Arial';
    ctx.fillStyle = '#AAA';
    ctx.fillText('按空格键继续', w / 2, h / 2 + 40);
  }
}
