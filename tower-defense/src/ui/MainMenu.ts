/**
 * Tower Defense Game - MainMenu
 * GDD 生成: node_a2d8c665
 */

export class MainMenu {
  private canvas: HTMLCanvasElement;
  private gameEngine: any;
  
  constructor(canvas: HTMLCanvasElement, gameEngine: any) {
    this.canvas = canvas;
    this.gameEngine = gameEngine;
  }
  
  /** 显示主菜单 */
  show(): void {
    const ctx = this.canvas.getContext('2d');
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, w, h);
    
    // 标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('塔防游戏', w / 2, h / 2 - 150);
    
    // 副标题
    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.fillText('Tower Defense Game', w / 2, h / 2 - 100);
    
    // 开始游戏按钮
    const startY = h / 2 - 20;
    this.drawButton(ctx, w / 2 - 150, startY, 300, 60, '开始游戏', '#4CAF50');
    
    // 说明
    ctx.fillStyle = '#AAA';
    ctx.font = '18px Arial';
    ctx.fillText('放置防御塔，阻止敌人入侵城堡！', w / 2, h / 2 + 50);
    ctx.fillText('完成所有波次即可胜利！', w / 2, h / 2 + 80);
    
    // 操作说明
    ctx.fillStyle = '#888';
    ctx.font = '16px Arial';
    ctx.fillText('点击地图放置防御塔', w / 2, h / 2 + 130);
    ctx.fillText('箭塔(100金)、魔法塔(150金)、炮塔(200金)', w / 2, h / 2 + 155);
  }
  
  private drawButton(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    
    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
  }
  
  /** 检查开始按钮点击 */
  checkStartClick(x: number, y: number): boolean {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const buttonX = w / 2 - 150;
    const buttonY = h / 2 - 20;
    
    return x >= buttonX && x <= buttonX + 300 && y >= buttonY && y <= buttonY + 60;
  }
}
