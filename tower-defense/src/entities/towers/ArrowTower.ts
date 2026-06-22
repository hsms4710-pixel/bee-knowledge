/**
 * Tower Defense Game - ArrowTower
 * GDD 生成: node_d4eee613
 * 继承自: node_b633c78e (Tower)
 */

import { Tower, TowerConfig, Enemy } from '../Tower';

export class ArrowTower extends Tower {
  private bullets: Bullet[] = [];
  
  constructor(x: number, y: number) {
    super({
      id: 'arrow_tower',
      name: '箭塔',
      cost: 100,
      damage: 10,
      range: 150,
      rate: 1,
      color: '#4CAF50',
    }, x, y);
  }
  
  findTarget(enemies: Enemy[]): Enemy | null {
    // 选择距离塔最近的敌人
    let closest: Enemy | null = null;
    let closestDist = this.getStats().range;
    
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist < closestDist) {
        closestDist = dist;
        closest = enemy;
      }
    }
    
    return closest;
  }
  
  attack(target: Enemy): void {
    this.bullets.push(new Bullet(this.x, this.y, target.x, target.y, this.getStats().damage, '#8BC34A'));
  }
  
  update(deltaTime: number, enemies: Enemy[]): void {
    super.update(deltaTime, enemies);
    
    // 更新子弹
    const activeBullets: Bullet[] = [];
    for (const bullet of this.bullets) {
      const hit = bullet.update(deltaTime, enemies);
      if (hit) {
        // 子弹命中
      } else if (bullet.isActive) {
        activeBullets.push(bullet);
      }
    }
    this.bullets = activeBullets;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    const stats = this.getStats();
    
    // 底座
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // 塔身
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // 等级指示
    ctx.fillStyle = '#FFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Lv${this.level}`, this.x, this.y + 35);
    
    // 范围（调试模式）
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.2)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, stats.range, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制子弹
    for (const bullet of this.bullets) {
      bullet.draw(ctx);
    }
  }
}

// 子弹类
class Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  speed: number = 500;
  isActive: boolean = true;
  
  constructor(startX: number, startY: number, targetX: number, targetY: number, damage: number, color: string) {
    this.x = startX;
    this.y = startY;
    this.damage = damage;
    this.color = color;
    
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy);
    
    this.vx = (dx / dist) * this.speed;
    this.vy = (dy / dist) * this.speed;
  }
  
  update(deltaTime: number, enemies: Enemy[]): boolean {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // 检查是否击中敌人
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist < 15) {
        enemy.takeDamage(this.damage);
        this.isActive = false;
        return true;
      }
    }
    
    return false;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
