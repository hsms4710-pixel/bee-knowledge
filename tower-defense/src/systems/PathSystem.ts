/**
 * Tower Defense Game - PathSystem
 * GDD 生成: node_a1b43975
 */

export class PathSystem {
  private waypoints: { x: number; y: number }[] = [];
  
  constructor() {
    // 默认路径（从左到右的Z形路径）
    this.waypoints = [
      { x: 0, y: 300 },
      { x: 200, y: 300 },
      { x: 200, y: 100 },
      { x: 400, y: 100 },
      { x: 400, y: 300 },
      { x: 600, y: 300 },
      { x: 600, y: 100 },
      { x: 800, y: 100 },
      { x: 800, y: 300 },
      { x: 1000, y: 300 },
    ];
  }
  
  /** 获取路径点 */
  getWaypoints(): { x: number; y: number }[] {
    return this.waypoints;
  }
  
  /** 设置自定义路径 */
  setPath(waypoints: { x: number; y: number }[]): void {
    this.waypoints = waypoints;
  }
  
  /** 获取下一个路径点 */
  getNextWaypoint(currentIndex: number): { x: number; y: number } | null {
    if (currentIndex + 1 < this.waypoints.length) {
      return this.waypoints[currentIndex + 1];
    }
    return null;
  }
  
  /** 检查是否到达终点 */
  isAtEnd(currentIndex: number): boolean {
    return currentIndex >= this.waypoints.length - 1;
  }
  
  /** 绘制路径 */
  draw(ctx: CanvasRenderingContext2D, offsetX: number = 0, offsetY: number = 0): void {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const start = this.waypoints[0];
    ctx.moveTo(start.x + offsetX, start.y + offsetY);
    
    for (let i = 1; i < this.waypoints.length; i++) {
      const point = this.waypoints[i];
      ctx.lineTo(point.x + offsetX, point.y + offsetY);
    }
    
    ctx.stroke();
    
    // 绘制路径点
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (const point of this.waypoints) {
      ctx.beginPath();
      ctx.arc(point.x + offsetX, point.y + offsetY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /** 获取路径长度 */
  getPathLength(): number {
    let length = 0;
    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const current = this.waypoints[i];
      const next = this.waypoints[i + 1];
      length += Math.hypot(next.x - current.x, next.y - current.y);
    }
    return length;
  }
}
