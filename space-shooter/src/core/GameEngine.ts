/**
 * Space Shooter - 游戏引擎
 * 
 * GDD 生成代码 - L5_Task: n_l5_game_engine
 */

import { Player } from '../entities/Player';
import { Enemy, EnemyType } from '../entities/Enemy';
import { Bullet, BulletType } from '../entities/Bullet';
import { PowerUp, PowerUpType } from '../entities/PowerUp';
import { Boss } from '../entities/Boss';
import { Level } from '../levels/Level';
import { EnemySpawner } from '../systems/EnemySpawner';
import { WeaponSystem } from '../systems/WeaponSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { PowerUpSystem } from '../systems/PowerUpSystem';
import { Renderer } from './Renderer';
import { HUD } from '../ui/HUD';
import { Menu } from '../ui/Menu';

// 游戏状态
type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

// 游戏配置
interface GameConfig {
  width: number;
  height: number;
  fps: number;
  debug: boolean;
}

/**
 * 游戏引擎 - 核心类
 */
export class GameEngine {
  // 配置
  private config: GameConfig = {
    width: 800,
    height: 600,
    fps: 60,
    debug: false
  };

  // 游戏状态
  private state: GameState = 'menu';
  private lastTime: number = 0;
  private deltaTime: number = 0;

  // 核心对象
  private player: Player | null = null;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private powerUps: PowerUp[] = [];
  private bosses: Boss[] = [];

  // 系统
  private enemySpawner: EnemySpawner;
  private weaponSystem: WeaponSystem;
  private collisionSystem: CollisionSystem;
  private powerUpSystem: PowerUpSystem;

  // 渲染和 UI
  private renderer: Renderer;
  private hud: HUD;
  private menu: Menu;

  // 关卡
  private currentLevel: Level | null = null;
  private levelIndex: number = 0;

  // 输入状态
  private keys: Set<string> = new Set();

  // 统计
  private score: number = 0;
  private highScore: number = 0;
  private spawnTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    // 设置画布
    this.config.width = canvas.width;
    this.config.height = canvas.height;

    // 初始化系统
    this.enemySpawner = new EnemySpawner(this.config.width, this.config.height);
    this.weaponSystem = new WeaponSystem();
    this.collisionSystem = new CollisionSystem();
    this.powerUpSystem = new PowerUpSystem();

    // 初始化渲染和 UI
    this.renderer = new Renderer(canvas);
    this.hud = new HUD(this.config.width, this.config.height);
    this.menu = new Menu(this.config.width, this.config.height);

    // 加载最高分
    this.highScore = parseInt(localStorage.getItem('spaceShooterHighScore') || '0', 10);

    // 设置事件监听
    this.setupInput();
  }

  /**
   * 设置输入监听
   */
  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      
      // 快捷键
      if (e.key === 'p' || e.key === 'Escape') {
        this.togglePause();
      }
      if (e.key === 'Enter' && this.state === 'gameover') {
        this.restart();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    // 防止页面滚动
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  /**
   * 开始游戏
   */
  public start(): void {
    // 初始化玩家
    this.player = new Player(
      this.config.width / 2,
      this.config.height - 100,
      this.weaponSystem
    );

    // 加载第一关
    this.loadLevel(0);

    // 启动游戏循环
    this.lastTime = performance.now();
    this.gameLoop();
  }

  /**
   * 游戏主循环
   */
  private gameLoop = (): void => {
    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // 更新
    this.update(this.deltaTime);

    // 渲染
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  /**
   * 更新游戏状态
   */
  private update(deltaTime: number): void {
    // 更新玩家
    if (this.player && this.state === 'playing') {
      this.updatePlayer(deltaTime);
    }

    // 更新敌人
    this.updateEnemies(deltaTime);

    // 更新子弹
    this.updateBullets(deltaTime);

    // 更新道具
    this.updatePowerUps(deltaTime);

    // 更新 Boss
    this.updateBosses(deltaTime);

    // 生成敌人
    if (this.state === 'playing') {
      this.spawnTimer += deltaTime;
      if (this.spawnTimer >= this.enemySpawner.getSpawnInterval()) {
        this.spawnTimer = 0;
        this.spawnEnemy();
      }
    }

    // 更新 HUD
    if (this.player) {
      this.hud.update(this.player, this.score, this.highScore);
    }
  }

  /**
   * 更新玩家
   */
  private updatePlayer(deltaTime: number): void {
    if (!this.player) return;

    // 处理输入
    let dx = 0;
    let dy = 0;

    if (this.keys.has('arrowleft') || this.keys.has('a')) dx -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) dx += 1;
    if (this.keys.has('arrowup') || this.keys.has('w')) dy -= 1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) dy += 1;

    // 射击
    if (this.keys.has(' ')) {
      this.player.shoot();
    }

    // 更新玩家
    this.player.update(dx, dy, deltaTime, this.config.width, this.config.height);

    // 生成玩家子弹
    const newBullets = this.player.getNewBullets();
    for (const bullet of newBullets) {
      this.bullets.push(bullet);
    }
  }

  /**
   * 更新敌人
   */
  private updateEnemies(deltaTime: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(deltaTime);

      // 生成敌人子弹
      const enemyBullets = enemy.getNewBullets();
      for (const bullet of enemyBullets) {
        this.bullets.push(bullet);
      }

      // 检查敌人是否超出屏幕
      if (enemy.y > this.config.height + 50) {
        this.enemies.splice(i, 1);
      }
    }

    // 碰撞检测
    this.checkCollisions();
  }

  /**
   * 更新子弹
   */
  private updateBullets(deltaTime: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(deltaTime);

      // 移除超出屏幕的子弹
      if (bullet.isOffScreen(this.config.width, this.config.height)) {
        this.bullets.splice(i, 1);
      }
    }
  }

  /**
   * 更新道具
   */
  private updatePowerUps(deltaTime: number): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update(deltaTime);

      // 移除超出屏幕的道具
      if (powerUp.y > this.config.height + 50) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  /**
   * 更新 Boss
   */
  private updateBosses(deltaTime: number): void {
    for (const boss of this.bosses) {
      boss.update(deltaTime);

      // 生成 Boss 子弹
      const bossBullets = boss.getNewBullets();
      for (const bullet of bossBullets) {
        this.bullets.push(bullet);
      }
    }

    // Boss 碰撞检测
    this.checkBossCollisions();
  }

  /**
   * 生成敌人
   */
  private spawnEnemy(): void {
    if (!this.currentLevel) return;

    const enemy = this.enemySpawner.spawnEnemy(this.currentLevel.getEnemyTypes());
    this.enemies.push(enemy);
  }

  /**
   * 碰撞检测
   */
  private checkCollisions(): void {
    if (!this.player) return;

    // 玩家子弹 vs 敌人
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (bullet.type !== BulletType.PLAYER) continue;

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        
        if (this.collisionSystem.checkCollision(bullet, enemy)) {
          // 造成伤害
          const damage = this.player ? this.player.getWeaponDamage() : 10;
          enemy.takeDamage(damage);
          
          // 移除子弹
          this.bullets.splice(i, 1);
          
          // 检查敌人是否死亡
          if (enemy.isDestroyed()) {
            this.enemies.splice(j, 1);
            this.score += enemy.getScoreValue();
            
            // 可能掉落道具
            const powerUp = this.powerUpSystem.tryDropPowerUp(enemy);
            if (powerUp) {
              this.powerUps.push(powerUp);
            }
          }
          return;
        }
      }
    }

    // 玩家 vs 敌人子弹
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (bullet.type === BulletType.PLAYER) continue;

      if (this.collisionSystem.checkCollision(bullet, this.player)) {
        this.player.takeDamage(bullet.damage);
        this.bullets.splice(i, 1);
        
        if (this.player.isDestroyed()) {
          this.gameOver();
        }
        return;
      }
    }

    // 玩家 vs 敌人 (碰撞)
    for (const enemy of this.enemies) {
      if (this.collisionSystem.checkCollision(this.player, enemy)) {
        this.player.takeDamage(enemy.damage);
        enemy.takeDamage(this.player.getWeaponDamage());
        
        if (this.player.isDestroyed()) {
          this.gameOver();
        }
        if (enemy.isDestroyed()) {
          this.enemies = this.enemies.filter(e => e !== enemy);
          this.score += enemy.getScoreValue();
        }
        return;
      }
    }

    // 玩家 vs 道具
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      if (this.collisionSystem.checkCollision(this.player, powerUp)) {
        this.powerUpSystem.collectPowerUp(this.player, powerUp);
        this.powerUps.splice(i, 1);
      }
    }
  }

  /**
   * Boss 碰撞检测
   */
  private checkBossCollisions(): void {
    if (!this.player) return;

    for (const boss of this.bosses) {
      // 玩家子弹 vs Boss
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        if (bullet.type !== BulletType.PLAYER) continue;

        if (this.collisionSystem.checkCollision(bullet, boss)) {
          boss.takeDamage(this.player.getWeaponDamage());
          this.bullets.splice(i, 1);
          
          if (boss.isDestroyed()) {
            this.score += boss.getScoreValue();
            this.bosses = this.bosses.filter(b => b !== boss);
            
            // Boss 击败，进入下一关
            setTimeout(() => this.nextLevel(), 2000);
          }
          return;
        }
      }

      // 玩家 vs Boss 子弹
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        if (bullet.type === BulletType.PLAYER) continue;
        if (bullet.sourceType !== 'boss') continue;

        if (this.collisionSystem.checkCollision(bullet, this.player)) {
          this.player.takeDamage(bullet.damage);
          this.bullets.splice(i, 1);
          
          if (this.player.isDestroyed()) {
            this.gameOver();
          }
          return;
        }
      }
    }
  }

  /**
   * 加载关卡
   */
  private loadLevel(index: number): void {
    this.currentLevel = new Level(index);
    this.levelIndex = index;
    
    // 设置生成间隔
    this.enemySpawner.setSpawnInterval(this.currentLevel.getSpawnInterval());
    
    console.log(`关卡 ${index + 1} 加载完成`);
  }

  /**
   * 下一关
   */
  private nextLevel(): void {
    this.levelIndex++;
    if (this.levelIndex >= 5) {
      // 游戏胜利
      console.log('恭喜通关！');
      this.state = 'menu';
      this.menu.showVictory(this.score);
    } else {
      this.loadLevel(this.levelIndex);
    }
  }

  /**
   * 游戏结束
   */
  private gameOver(): void {
    this.state = 'gameover';
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('spaceShooterHighScore', this.highScore.toString());
    }

    this.menu.showGameOver(this.score, this.highScore);
  }

  /**
   * 暂停/继续
   */
  private togglePause(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
    } else if (this.state === 'paused') {
      this.state = 'playing';
    }
  }

  /**
   * 重新开始
   */
  public restart(): void {
    // 重置状态
    this.state = 'playing';
    this.score = 0;
    this.spawnTimer = 0;
    this.enemies = [];
    this.bullets = [];
    this.powerUps = [];
    this.bosses = [];

    // 重新创建玩家
    this.player = new Player(
      this.config.width / 2,
      this.config.height - 100,
      this.weaponSystem
    );

    // 重载关卡
    this.loadLevel(0);

    // 隐藏菜单
    this.menu.hide();
  }

  /**
   * 开始新游戏
   */
  public startNewGame(): void {
    this.restart();
  }

  /**
   * 渲染
   */
  private render(): void {
    // 清空画布
    this.renderer.clear();

    // 绘制背景
    this.renderer.drawBackground();

    // 绘制游戏元素
    if (this.state === 'playing' || this.state === 'paused') {
      // 绘制星星背景
      this.renderer.drawStars();

      // 绘制敌人
      for (const enemy of this.enemies) {
        this.renderer.drawEnemy(enemy);
      }

      // 绘制 Boss
      for (const boss of this.bosses) {
        this.renderer.drawBoss(boss);
      }

      // 绘制子弹
      for (const bullet of this.bullets) {
        this.renderer.drawBullet(bullet);
      }

      // 绘制道具
      for (const powerUp of this.powerUps) {
        this.renderer.drawPowerUp(powerUp);
      }

      // 绘制玩家
      if (this.player) {
        this.renderer.drawPlayer(this.player);
      }

      // 绘制 HUD
      this.hud.render(this.renderer.ctx);

      // 绘制关卡信息
      this.renderer.drawLevelInfo(this.levelIndex + 1);
    }

    // 绘制菜单
    if (this.state === 'menu' || this.state === 'gameover') {
      this.menu.render(this.renderer.ctx, this.startNewGame.bind(this));
    }

    // 绘制暂停提示
    if (this.state === 'paused') {
      this.renderer.drawPaused();
    }
  }
}
