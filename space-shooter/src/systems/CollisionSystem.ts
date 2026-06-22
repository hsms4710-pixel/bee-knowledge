/**
 * Space Shooter - 碰撞系统
 * 
 * GDD 生成代码 - L5_Task: n_l5_collision_system
 */

export class CollisionSystem {
  /**
   * 检查两个对象是否碰撞 (矩形碰撞)
   */
  public checkCollision(obj1: { x: number; y: number; width: number; height: number }, obj2: { x: number; y: number; width: number; height: number }): boolean {
    return !(
      obj1.x + obj1.width / 2 < obj2.x - obj2.width / 2 ||
      obj1.x - obj1.width / 2 > obj2.x + obj2.width / 2 ||
      obj1.y + obj1.height / 2 < obj2.y - obj2.height / 2 ||
      obj1.y - obj1.height / 2 > obj2.y + obj2.height / 2
    );
  }

  /**
   * 检查圆形碰撞
   */
  public checkCircleCollision(circle1: { x: number; y: number; radius: number }, circle2: { x: number; y: number; radius: number }): boolean {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
  }

  /**
   * 检查子弹与敌人的碰撞
   */
  public checkBulletEnemyCollision(bullet: { x: number; y: number; size: number }, enemy: { x: number; y: number; width: number; height: number }): boolean {
    const bulletRadius = bullet.size / 2;
    return this.checkCircleCollision(
      { x: bullet.x, y: bullet.y, radius: bulletRadius },
      { x: enemy.x, y: enemy.y, radius: enemy.width / 2 }
    );
  }

  /**
   * 检查玩家与敌人的碰撞
   */
  public checkPlayerEnemyCollision(player: { x: number; y: number; width: number; height: number }, enemy: { x: number; y: number; width: number; height: number }): boolean {
    // 使用稍微缩小的碰撞框，让游戏更宽容
    const playerWidth = player.width * 0.7;
    const playerHeight = player.height * 0.7;
    
    return this.checkCollision(
      { x: player.x, y: player.y, width: playerWidth, height: playerHeight },
      { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height }
    );
  }

  /**
   * 检查玩家与道具的碰撞
   */
  public checkPlayerPowerUpCollision(player: { x: number; y: number; width: number; height: number }, powerUp: { x: number; y: number; size: number }): boolean {
    const powerUpRadius = powerUp.size / 2;
    return this.checkCircleCollision(
      { x: player.x, y: player.y, radius: player.width / 2 },
      { x: powerUp.x, y: powerUp.y, radius: powerUpRadius }
    );
  }
}
