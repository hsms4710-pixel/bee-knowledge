/**
 * Space Shooter - HUD
 * 
 * GDD 生成代码 - L5_Task: n_l5_hud
 */

export class HUD {
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * 更新 HUD 数据
   */
  public update(player: { health: number; maxHealth: number; weaponLevel: number; hasShield: boolean }, score: number, highScore: number): void {
    this.render(player, score, highScore);
  }

  /**
   * 渲染 HUD
   */
  public render(ctx: CanvasRenderingContext2D, player: { health: number; maxHealth: number; weaponLevel: number; hasShield: boolean }, score: number, highScore: number): void {
    // 生命值
    this.drawHealth(ctx, player);

    // 武器等级
    this.drawWeaponLevel(ctx, player);

    // 护盾状态
    this.drawShieldStatus(ctx, player);

    // 分数
    this.drawScore(ctx, score, highScore);
  }

  /**
   * 绘制生命值
   */
  private drawHealth(ctx: CanvasRenderingContext2D, player: { health: number; maxHealth: number }): void {
    const x = 10;
    const y = 10;
    const heartSize = 20;
    const spacing = 5;

    // 绘制生命值
    for (let i = 0; i < player.maxHealth; i++) {
      const heartX = x + i * (heartSize + spacing);
      
      if (i < player.health) {
        // 满血 - 红色
        ctx.fillStyle = '#ff4444';
      } else {
        // 空血 - 灰色
        ctx.fillStyle = '#555555';
      }

      // 绘制心形
      this.drawHeart(ctx, heartX, y, heartSize);
    }
  }

  /**
   * 绘制心形
   */
  private drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, size / 2);
    ctx.bezierCurveTo(-size / 2, 0, -size / 2, -size / 2, 0, -size / 2);
    ctx.bezierCurveTo(size / 2, -size / 2, size / 2, 0, 0, size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * 绘制武器等级
   */
  private drawWeaponLevel(ctx: CanvasRenderingContext2D, player: { weaponLevel: number }): void {
    const x = 10;
    const y = 60;

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`武器等级: ${player.weaponLevel}`, x, y);
  }

  /**
   * 绘制护盾状态
   */
  private drawShieldStatus(ctx: CanvasRenderingContext2D, player: { hasShield: boolean }): void {
    const x = 10;
    const y = 80;

    if (player.hasShield) {
      ctx.fillStyle = '#00bfff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('护盾激活!', x, y);
    }
  }

  /**
   * 绘制分数
   */
  private drawScore(ctx: CanvasRenderingContext2D, score: number, highScore: number): void {
    const x = this.width - 10;
    const y = 20;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`分数: ${score}`, x, y);

    if (highScore > 0) {
      ctx.fillStyle = '#ffaa00';
      ctx.font = '12px Arial';
      ctx.fillText(`最高: ${highScore}`, x, y + 20);
    }
  }
}
