/**
 * Space Shooter - 道具系统
 * 
 * GDD 生成代码 - L5_Task: n_l5_powerup_system
 */

import { PowerUp, PowerUpType } from '../entities/PowerUp';
import { Player } from '../entities/Player';

export class PowerUpSystem {
  private dropRate: number = 0.3; // 30% 掉率

  /**
   * 尝试掉落道具
   */
  public tryDropPowerUp(enemy: { x: number; y: number }): PowerUp | null {
    if (Math.random() < this.dropRate) {
      return PowerUp.random(enemy.x, enemy.y);
    }
    return null;
  }

  /**
   * 设置掉落率
   */
  public setDropRate(rate: number): void {
    this.dropRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * 收集道具
   */
  public collectPowerUp(player: Player, powerUp: PowerUp): void {
    const effect = powerUp.getEffect();
    this.applyEffect(player, effect);
  }

  /**
   * 应用道具效果
   */
  private applyEffect(player: Player, effect: { type: PowerUpType; duration?: number; value?: number }): void {
    switch (effect.type) {
      case PowerUpType.WEAPON:
        player.upgradeWeapon();
        console.log('武器升级！');
        break;

      case PowerUpType.SHIELD:
        player.gainShield(effect.duration || 5);
        console.log('获得护盾！');
        break;

      case PowerUpType.BOMB:
        // 炸弹效果 - 清屏
        console.log('使用炸弹！');
        break;

      case PowerUpType.LIFE:
        player.heal(effect.value || 1);
        console.log('恢复生命！');
        break;
    }
  }
}
