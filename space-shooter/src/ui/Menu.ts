/**
 * Space Shooter - 菜单
 * 
 * GDD 生成代码 - L5_Task: n_l5_menu
 */

export class Menu {
  private width: number;
  private height: number;
  private selectedOption: number = 0;
  private options: string[] = ['开始游戏', '继续', '退出'];
  private stars: { x: number; y: number; size: number; speed: number }[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initStars();
  }

  /**
   * 初始化星星背景
   */
  private initStars(): void {
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.5
      });
    }
  }

  /**
   * 显示菜单
   */
  public show(): void {
    this.selectedOption = 0;
  }

  /**
   * 隐藏菜单
   */
  public hide(): void {
    // 隐藏逻辑
  }

  /**
   * 显示游戏结束
   */
  public showGameOver(score: number, highScore: number): void {
    this.selectedOption = 0;
    console.log(`游戏结束！得分: ${score}, 最高分: ${highScore}`);
  }

  /**
   * 显示胜利
   */
  public showVictory(score: number): void {
    this.selectedOption = 0;
    console.log(`恭喜通关！最终得分: ${score}`);
  }

  /**
   * 处理输入
   */
  public handleInput(key: string, onStart: () => void): void {
    if (key === 'enter') {
      if (this.selectedOption === 0) {
        onStart();
      }
    }
  }

  /**
   * 渲染菜单
   */
  public render(ctx: CanvasRenderingContext2D, onStart: () => void): void {
    // 绘制背景
    this.drawBackground(ctx);

    // 绘制标题
    this.drawTitle(ctx);

    // 绘制选项
    this.drawOptions(ctx);

    // 绘制提示
    this.drawHint(ctx);
  }

  /**
   * 绘制背景
   */
  private drawBackground(ctx: CanvasRenderingContext2D): void {
    // 深蓝色渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(1, '#000022');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // 绘制星星
    for (const star of this.stars) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
  }

  /**
   * 绘制标题
   */
  private drawTitle(ctx: CanvasRenderingContext2D): void {
    const x = this.width / 2;
    const y = this.height / 2 - 100;

    // 标题
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE SHOOTER', x, y);

    // 副标题
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.fillText('太空射击游戏', x, y + 40);
  }

  /**
   * 绘制选项
   */
  private drawOptions(ctx: CanvasRenderingContext2D): void {
    const x = this.width / 2;
    const startY = this.height / 2;

    ctx.textAlign = 'center';

    for (let i = 0; i < this.options.length; i++) {
      const y = startY + i * 50;
      const isSelected = i === this.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 24px Arial';
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
      }

      ctx.fillText(`> ${this.options[i]}`, x, y);
    }
  }

  /**
   * 绘制提示
   */
  private drawHint(ctx: CanvasRenderingContext2D): void {
    const x = this.width / 2;
    const y = this.height - 50;

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('按 ENTER 开始游戏', x, y);
    ctx.fillText('方向键 / WASD 移动，空格键射击', x, y + 25);
  }
}
