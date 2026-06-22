/**
 * Tower Defense Game - MagicTower
 * GDD 生成: node_1dcb1f37
 * 继承自: node_b633c78e (Tower)
 */

import { Tower, TowerConfig, Enemy } from '../Tower';

export class MagicTower extends Tower {
  private lastTarget: Enemy | null = null;
  
  constructor(x: number, y: number) {
    super({
      id: 'magic_tower',
      name: '魔法塔',
      cost: 150,
      damage: 25,
      range: 120,
      rate: 2,
      color: '#9C27B0',
    }, x, y);
  }
  
  findTarget(enemies: Enemy[]): Enemy | null {
    // 优先攻击上次目标，否则攻击最近的敌人
    if (this.lastTarget && this.lastTarget.isAlive) {
      const dist = Math.hypot(this.lastTarget.x - this.x, this.lastTarget.y - this.y);
      if (dist <= this.getStats().range) {
        return this.lastTarget;
      }
    }
    
    // 找最近的敌人
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
    
    this.lastTarget = closest;
    return closest;
  }
  
  attack(target: Enemy): void {
    // 魔法伤害（AOE）
    target.takeDamage(this.getStats().damage);
    
    // 对附近敌人造成50%伤害
    for (const enemy of document.game?.enemies || []) {
      if (!enemy.isAlive || enemy === target) continue;
      
      const dist = Math.hypot(enemy.x - target.x, enemy.y - target.y);
      if (dist < 50) {
        enemy.takeDamage(this.getStats().damage * 0.5);
      }
    }
  }
  
  update(deltaTime: number, enemies: Enemy[]): void {
    super.update(deltaTime, enemies);
    
    // 如果目标死亡，清除引用
    if (this.lastTarget && !this.lastTarget.isAlive) {
      this.lastTarget = null;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    const stats = this.getStats();
    
    // 魔法光环
    ctx.strokeStyle = `rgba(156, 39, 176, 0.3)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, stats.range, 0, Math.PI * 2);
    ctx.stroke();
    
    // 底座
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 22, 0, Math.PI * 2);
    ctx.fill();
    
    // 塔身（菱形）
    ctx.fillStyle = '#7B1FA2';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 18);
    ctx.lineTo(this.x + 12, this.y);
    ctx.lineTo(this.x, this.y + 18);
    ctx.lineTo(this.x - 12, this.y);
    ctx.closePath();
    ctx.fill();
    
    // 顶部宝石
    ctx.fillStyle = '#E040FB';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 20, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 等级指示
    ctx.fillStyle = '#FFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Lv${this.level}`, this.x, this.y + 30);
  }
}
