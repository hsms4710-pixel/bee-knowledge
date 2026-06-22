/**
 * Space Shooter - Canvas 渲染器
 * 
 * GDD 生成代码 - L5_Task: n_l5_renderer
 */

export class Renderer {
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private stars: { x: number; y: number; size: number; speed: number }[] = [];
  private starOffset: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // 初始化星星背景
    this.initStars();
  }

  /**
   * 初始化星星
   */
  private initStars(): void {
    const count = 100;
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 2 + 1
      });
    }
  }

  /**
   * 清空画布
   */
  public clear(): void {
    this.ctx.fillStyle = '#000022';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 绘制背景
   */
  public drawBackground(): void {
    // 深蓝色渐变背景
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(1, '#000022');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 绘制星星
   */
  public drawStars(): void {
    this.starOffset += 0.5;
    
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    }
  }

  /**
   * 绘制玩家飞船
   */
  public drawPlayer(player: { x: number; y: number; width: number; height: number; weaponLevel: number; hasShield: boolean }): void {
    const { x, y, width, height } = player;
    const ctx = this.ctx;

    // 护盾
    if (player.hasShield) {
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, width / 2 + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 飞船主体
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(x, y - height / 2);
    ctx.lineTo(x + width / 2, y);
    ctx.lineTo(x, y + height / 2 - 10);
    ctx.lineTo(x - width / 2, y);
    ctx.closePath();
    ctx.fill();

    // 引擎火焰
    const flameSize = 10 + player.weaponLevel * 3;
    const gradient = ctx.createLinearGradient(0, y + height / 2, 0, y + height / 2 + flameSize);
    gradient.addColorStop(0, '#ff6600');
    gradient.addColorStop(1, '#ff0000');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + height / 2 - 5);
    ctx.lineTo(x, y + height / 2 + flameSize);
    ctx.lineTo(x + 5, y + height / 2 - 5);
    ctx.closePath();
    ctx.fill();

    // 武器升级指示器
    if (player.weaponLevel > 1) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`LV${player.weaponLevel}`, x, y - height / 2 - 5);
    }
  }

  /**
   * 绘制敌人
   */
  public drawEnemy(enemy: { x: number; y: number; width: number; height: number; type: string; health: number; maxHealth: number }): void {
    const { x, y, width, height, type, health, maxHealth } = enemy;
    const ctx = this.ctx;

    // 敌人颜色
    const colors: Record<string, string> = {
      basic: '#ff6600',
      fast: '#ff3366',
      tank: '#cc0000',
      shooter: '#ff9900'
    };
    const color = colors[type] || '#ff6600';

    // 敌人主体
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, width / 2, 0, Math.PI * 2);
    ctx.fill();

    // 内圈
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(x, y, width / 2 - 4, 0, Math.PI * 2);
    ctx.fill();

    // 生命条
    const healthPercent = health / maxHealth;
    ctx.fillStyle = '#333333';
    ctx.fillRect(x - width / 2 - 3, y - height / 2 - 8, width + 6, 4);
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffaa00' : '#ff0000';
    ctx.fillRect(x - width / 2 - 3, y - height / 2 - 8, (width + 6) * healthPercent, 4);
  }

  /**
   * 绘制 Boss
   */
  public drawBoss(boss: { x: number; y: number; width: number; height: number; health: number; maxHealth: number; phase: number }): void {
    const { x, y, width, height, health, maxHealth, phase } = boss;
    const ctx = this.ctx;

    // Boss 主体
    ctx.fillStyle = '#9900ff';
    ctx.beginPath();
    ctx.arc(x, y, width / 2, 0, Math.PI * 2);
    ctx.fill();

    // 外圈
    ctx.strokeStyle = '#ff66ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, width / 2 + 5, 0, Math.PI * 2);
    ctx.stroke();

    // 阶段指示
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(x, y, width / 2 - 10, 0, Math.PI * 2 * phase);
    ctx.fill();

    // 生命条 (大)
    const healthPercent = health / maxHealth;
    const barWidth = 200;
    const barHeight = 10;
    const barX = (this.canvas.width - barWidth) / 2;
    const barY = 20;

    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    const healthColor = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffaa00' : '#ff0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Boss 标签
    ctx.fillStyle = '#ff66ff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`BOSS PHASE ${phase}`, this.canvas.width / 2, barY - 5);
  }

  /**
   * 绘制子弹
   */
  public drawBullet(bullet: { x: number; y: number; size: number; type: string }): void {
    const { x, y, size, type } = bullet;
    const ctx = this.ctx;

    if (type === 'player') {
      // 玩家子弹 - 蓝绿色
      const gradient = ctx.createRadialGradient(x - size / 2, y - size / 2, 0, x, y, size);
      gradient.addColorStop(0, '#00ff88');
      gradient.addColorStop(1, '#00aa66');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 敌人子弹 - 红色
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * 绘制道具
   */
  public drawPowerUp(powerUp: { x: number; y: number; size: number; type: string }): void {
    const { x, y, size, type } = powerUp;
    const ctx = this.ctx;

    // 道具颜色
    const colors: Record<string, string> = {
      weapon: '#ffff00',
      shield: '#00bfff',
      bomb: '#ff4444',
      life: '#ff69b4'
    };
    const color = colors[type] || '#ffffff';

    // 道具主体
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // 外圈光晕
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size / 2 + 4, 0, Math.PI * 2);
    ctx.stroke();

    // 类型符号
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const symbols: Record<string, string> = {
      weapon: 'W',
      shield: 'S',
      bomb: 'B',
      life: '+'
    };
    ctx.fillText(symbols[type] || '?', x, y);
  }

  /**
   * 绘制关卡信息
   */
  public drawLevelInfo(level: number): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`关卡 ${level}`, 10, 40);
  }

  /**
   * 绘制暂停提示
   */
  public drawPaused(): void {
    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('暂停', this.canvas.width / 2, this.canvas.height / 2);

    this.ctx.font = '18px Arial';
    this.ctx.fillText('按 P 或 ESC 继续', this.canvas.width / 2, this.canvas.height / 2 + 40);
  }
}
