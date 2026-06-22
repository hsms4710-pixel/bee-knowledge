/**
 * 背包系统
 * 管理物品、装备和消耗品
 */

import { GameSystem } from '../core/GameEngine';
import { eventBus } from '../core/EventBus';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  icon: string;
  stackable: boolean;
  maxStack: number;
  effects?: ItemEffect[];
}

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'material' | 'quest';

export interface ItemEffect {
  type: string;
  value: number;
  duration?: number;
}

export interface InventorySlot {
  itemId: string | null;
  quantity: number;
}

export interface InventoryConfig {
  slots: number;
  weightLimit: number;
}

export interface EquipmentSlot {
  helmet?: Item;
  chest?: Item;
  legs?: Item;
  boots?: Item;
  mainHand?: Item;
  offHand?: Item;
  ring1?: Item;
  ring2?: Item;
  necklace?: Item;
}

export class InventorySystem extends GameSystem {
  private inventory: Map<string, InventorySlot> = new Map();
  private equipment: EquipmentSlot = {};
  private config: InventoryConfig;
  private totalWeight: number = 0;

  constructor(config?: InventoryConfig) {
    super();
    this.config = {
      slots: 50,
      weightLimit: 100,
      ...config
    };
  }

  async initialize(): Promise<void> {
    eventBus.on('item.pickedUp', (data: { itemId: string; quantity: number }) => {
      this.addItem(data.itemId, data.quantity);
    });

    eventBus.on('item.used', (data: { itemId: string; quantity: number }) => {
      this.removeItem(data.itemId, data.quantity);
    });

    eventBus.on('item.equipped', (data: { itemId: string; slot: keyof EquipmentSlot }) => {
      this.equipItem(data.itemId, data.slot);
    });

    eventBus.on('item.unequipped', (data: { slot: keyof EquipmentSlot }) => {
      this.unequipItem(data.slot);
    });
  }

  update(_deltaTime: number): void {
    // 背包系统通常不需要每帧更新
  }

  /** 添加物品 */
  addItem(itemId: string, quantity: number = 1): boolean {
    const slot = this.inventory.get(itemId);

    if (slot) {
      const item = this.getItemDefinition(itemId);
      if (item && slot.quantity < item.maxStack) {
        slot.quantity += quantity;
        eventBus.emit('inventory.updated', { itemId, quantity: slot.quantity });
        return true;
      }
      return false;
    }

    if (this.inventory.size >= this.config.slots) {
      eventBus.emit('inventory.full');
      return false;
    }

    // 获取物品信息
    const item = this.getItemDefinition(itemId);
    if (!item) return false;

    this.inventory.set(itemId, {
      itemId: item.id,
      quantity
    });

    eventBus.emit('inventory.updated', { itemId, quantity });
    return true;
  }

  /** 移除物品 */
  removeItem(itemId: string, quantity: number = 1): boolean {
    const slot = this.inventory.get(itemId);
    if (!slot || slot.quantity < quantity) return false;

    slot.quantity -= quantity;
    if (slot.quantity <= 0) {
      this.inventory.delete(itemId);
    }

    eventBus.emit('inventory.updated', { itemId, quantity: slot.quantity });
    return true;
  }

  /** 装备物品 */
  equipItem(itemId: string, slot: keyof EquipmentSlot): boolean {
    const item = this.getItemDefinition(itemId);
    if (!item || item.type !== 'weapon' && item.type !== 'armor') {
      return false;
    }

    // 卸下当前装备
    const currentEquip = this.equipment[slot];
    if (currentEquip) {
      this.addItem(currentEquip.id, 1);
    }

    // 装备新物品
    this.equipment[slot] = item;
    this.removeItem(itemId, 1);

    eventBus.emit('equipment.changed', { slot, item });
    return true;
  }

  /** 卸下装备 */
  unequipItem(slot: keyof EquipmentSlot): boolean {
    const item = this.equipment[slot];
    if (!item) return false;

    if (!this.addItem(item.id, 1)) {
      return false;
    }

    this.equipment[slot] = undefined;
    eventBus.emit('equipment.changed', { slot, item: null });
    return true;
  }

  /** 获取物品定义 */
  private getItemDefinition(itemId: string): Item | null {
    // 实际项目中这里会从数据库或配置文件加载
    const items: Record<string, Item> = {
      'sword_iron': {
        id: 'sword_iron',
        name: '铁剑',
        description: '一把普通的铁剑',
        type: 'weapon',
        icon: '⚔️',
        stackable: false,
        maxStack: 1,
        effects: [{ type: 'attack', value: 15 }]
      },
      'potion_health': {
        id: 'potion_health',
        name: '生命药水',
        description: '恢复 50 点生命值',
        type: 'consumable',
        icon: '🧪',
        stackable: true,
        maxStack: 99,
        effects: [{ type: 'health', value: 50 }]
      },
      'helmet_leather': {
        id: 'helmet_leather',
        name: '皮甲头盔',
        description: '提供基础防护',
        type: 'armor',
        icon: '⛑️',
        stackable: false,
        maxStack: 1,
        effects: [{ type: 'defense', value: 5 }]
      }
    };

    return items[itemId] || null;
  }

  /** 获取背包内容 */
  getInventory(): Map<string, InventorySlot> {
    return new Map(this.inventory);
  }

  /** 获取装备 */
  getEquipment(): EquipmentSlot {
    return { ...this.equipment };
  }

  /** 检查物品是否存在 */
  hasItem(itemId: string, quantity: number = 1): boolean {
    const slot = this.inventory.get(itemId);
    return slot !== undefined && slot.quantity >= quantity;
  }

  /** 获取物品数量 */
  getItemCount(itemId: string): number {
    const slot = this.inventory.get(itemId);
    return slot?.quantity ?? 0;
  }
}
