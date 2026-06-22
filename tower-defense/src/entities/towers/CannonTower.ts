/**
 * Tower Defense Game - CannonTower
 * GDD 生成: node_c52114bb
 * 继承自: node_b633c78e (Tower)
 */

import { Tower, TowerConfig, Enemy } from '../Tower';

export class CannonTower extends Tower {
  private explosionParticles: Particle[] = [];
  
  constructor(x: number, y: number) {
    super({
      id: 'cannon_tower',
      name: '炮塔',
      cost: 200,
      damage: 50,
      range: 100,
      rate: 0.5,
      color: '#FF5722',
    }, x, y);
  }
  
  findTarget(enemies: Enemy[]): Enemy | null {
    // 选择血量最多的敌人（优先攻击坦克）
    let toughest: Enemy | null = null;
    let maxHealth = 0;
    
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist <= this.getStats().range && enemy.maxHealth > maxHealth) {
        maxHealth = enemy.maxHealth;
        toughest = enemy;
      }
    }
    
    return toughest;
  }
  
  attack(target: Enemy): void {
    // 炮弹造成大量伤害
    target.takeDamage(this.getStats().damage);
    
    // 创建爆炸粒子
    this.explosionParticles.push(new Particle(target.x, target.y, '#FF5722'));
    
    // 对周围敌人造成30%伤害
    for (const enemy of document.game?.enemies || []) {
      if (!enemy.isAlive || enemy === target) continue;
      
      const dist = Math.hypot(enemy.x - target.x, enemy.y - target.y);
      if (dist < 60) {
        enemy.takeDamage(this.getStats().damage * 0.3);
        this.explosionParticles.push(new Particle(enemy.x, enemy.y, '#FF9800'));
      }
    }
  }
  
  update(deltaTime: number, enemies: Enemy[]): void {
    super.update(deltaTime, enemies);
    
    // 更新粒子
    const activeParticles: Particle[] = [];
    for (const particle of this.explosionParticles) {
      particle.update(deltaTime);
      if (particle.life > 0) {
        activeParticles.push(particle);
      }
    }
    this.explosionParticles = activeParticles;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    const stats = this.getStats();
    
    // 底座（圆形）
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 28, 0, Math.PI * 2);
    ctx.fill();
    
    // 炮管
    ctx.fillStyle = '#424242';
    ctx.fillRect(this.x - 28, this.y - 6, 40, 12);
    
    // 炮口
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(this.x - 28, this.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 等级指示
    ctx.fillStyle = '#FFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Lv${this.level}`, this.x, this.y + 38);
    
    // 绘制粒子
    for (const particle of this.explosionParticles) {
      particle.draw(ctx);
    }
  }
}

// 粒子类
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number = 1;
  color: string;
  
  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;
    
    // 随机方向和速度
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 200 + 100;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
  }
  
  update(deltaTime: number): void {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vy += 500 * deltaTime; // 重力
    this.life -= deltaTime * 2;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    const alpha = Math.max(0, this.life);
    ctx.fillStyle = `rgba(255, 87, 34, ${alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
