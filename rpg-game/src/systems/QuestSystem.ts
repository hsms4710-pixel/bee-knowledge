/**
 * 任务系统
 * 管理主线和支线任务
 */

import { GameSystem } from '../core/GameEngine';
import { eventBus } from '../core/EventBus';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  giverId?: string;
  rewards: QuestReward[];
  objectives: QuestObjective[];
  prerequisites: string[];
  dialogueId?: string;
}

export type QuestType = 'main' | 'side' | 'daily' | 'achievement';
export type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'claimed';

export interface QuestReward {
  type: 'gold' | 'item' | 'experience' | 'achievement';
  value: number;
  itemId?: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  target: number;
  current: number;
  completed: boolean;
}

export type ObjectiveType = 'kill' | 'collect' | 'talk' | 'reach' | 'useItem';

export interface QuestConfig {
  maxActiveQuests: number;
  autoAccept: boolean;
}

export class QuestSystem extends GameSystem {
  private quests: Map<string, Quest> = new Map();
  private activeQuests: string[] = [];
  private completedQuests: string[] = [];
  private config: QuestConfig;

  constructor(config?: QuestConfig) {
    super();
    this.config = {
      maxActiveQuests: 5,
      autoAccept: false,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 监听任务相关事件
    eventBus.on('quest.accept', (questId: string) => this.acceptQuest(questId));
    eventBus.on('quest.complete', (questId: string) => this.completeQuest(questId));
    eventBus.on('quest.claim', (questId: string) => this.claimReward(questId));

    // 初始化示例任务
    this.registerDefaultQuests();
  }

  update(_deltaTime: number): void {
    // 任务系统通常不需要每帧更新
  }

  /** 注册默认任务 */
  private registerDefaultQuests(): void {
    const defaultQuests: Quest[] = [
      {
        id: 'quest_tutorial_1',
        title: '新手试炼',
        description: '击败 3 只史莱姆来熟悉战斗系统',
        type: 'main',
        status: 'available',
        rewards: [
          { type: 'gold', value: 100 },
          { type: 'experience', value: 50 },
          { type: 'item', value: 1, itemId: 'sword_iron' }
        ],
        objectives: [
          {
            id: 'obj_kill_slimes',
            description: '击败 3 只史莱姆',
            type: 'kill',
            target: 3,
            current: 0,
            completed: false
          }
        ],
        prerequisites: []
      },
      {
        id: 'quest_tutorial_2',
        title: '收集材料',
        description: '收集 5 个草药来制作药水',
        type: 'side',
        status: 'available',
        rewards: [
          { type: 'item', value: 5, itemId: 'potion_health' }
        ],
        objectives: [
          {
            id: 'obj_collect_herbs',
            description: '收集 5 个草药',
            type: 'collect',
            target: 5,
            current: 0,
            completed: false
          }
        ],
        prerequisites: []
      },
      {
        id: 'quest_main_1',
        title: '黑暗之塔',
        description: '进入黑暗之塔，击败最终 Boss',
        type: 'main',
        status: 'locked',
        rewards: [
          { type: 'gold', value: 1000 },
          { type: 'experience', value: 200 }
        ],
        objectives: [
          {
            id: 'obj_enter_tower',
            description: '进入黑暗之塔',
            type: 'reach',
            target: 1,
            current: 0,
            completed: false
          },
          {
            id: 'obj_defeat_boss',
            description: '击败最终 Boss',
            type: 'kill',
            target: 1,
            current: 0,
            completed: false
          }
        ],
        prerequisites: ['quest_tutorial_1', 'quest_tutorial_2']
      }
    ];

    defaultQuests.forEach(quest => this.registerQuest(quest));
  }

  /** 注册任务 */
  registerQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
  }

  /** 接受任务 */
  acceptQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'available') {
      return false;
    }

    if (this.activeQuests.length >= this.config.maxActiveQuests) {
      eventBus.emit('quest.error', { message: '活跃任务已达上限' });
      return false;
    }

    // 检查前置任务
    for (const prereq of quest.prerequisites) {
      if (!this.completedQuests.includes(prereq)) {
        eventBus.emit('quest.error', { message: '前置任务未完成' });
        return false;
      }
    }

    quest.status = 'active';
    this.activeQuests.push(questId);

    eventBus.emit('quest.accepted', quest);
    return true;
  }

  /** 更新任务进度 */
  updateObjective(questId: string, objectiveId: string, increment: number = 1): void {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'active') return;

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) return;

    objective.current += increment;
    if (objective.current >= objective.target) {
      objective.completed = true;

      // 检查任务是否完成
      const allCompleted = quest.objectives.every(obj => obj.completed);
      if (allCompleted) {
        this.completeQuest(questId);
      }
    }
  }

  /** 完成任务 */
  completeQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'active') return;

    quest.status = 'completed';
    const index = this.activeQuests.indexOf(questId);
    if (index > -1) {
      this.activeQuests.splice(index, 1);
    }
    this.completedQuests.push(questId);

    eventBus.emit('quest.completed', quest);
  }

  /** 领取奖励 */
  claimReward(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'completed') {
      return false;
    }

    quest.status = 'claimed';
    eventBus.emit('quest.rewardClaimed', { questId, rewards: quest.rewards });

    // 分发奖励
    for (const reward of quest.rewards) {
      eventBus.emit(`reward.${reward.type}`, reward);
    }

    return true;
  }

  /** 获取任务 */
  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }

  /** 获取所有任务 */
  getAllQuests(): Quest[] {
    return Array.from(this.quests.values());
  }

  /** 获取活跃任务 */
  getActiveQuests(): Quest[] {
    return this.activeQuests
      .map(id => this.quests.get(id))
      .filter((q): q is Quest => q !== undefined);
  }

  /** 检查任务是否完成 */
  isQuestCompleted(questId: string): boolean {
    return this.completedQuests.includes(questId);
  }
}
