export interface User {
  collectionId: string;
  collectionName: string;
  id: string;
  discord_id: string;
  mc_username: string;
  infractions: string[];
  inventory_items: string[];
  balance: number;
  daily_streak: number;
  last_work: string;
  last_daily: string;
  is_suspended: boolean;
  is_banned: boolean;
  created: string;
  updated: string;
  expand?: {
    infractions?: Infraction[];
    inventory_items?: UserInventoryItem[];
  };
}

export interface UserInventoryItem {
  collectionId: string;
  collectionName: string;
  id: string;
  user: string;
  item: string;
  quantity: number;
  created: string;
  updated: string;
  expand?: {
    item?: Item;
  };
}

export interface Item {
  collectionId: string;
  collectionName: string;
  id: string;
  name: string;
  description: string;
  price: number;
  sale_percent: number;
  quantity: number;
  gifting_enabled: boolean;
  enabled: boolean;
  max_allowed: number;
  use_disabled: boolean;
  use_on_purchase: boolean;
  on_use_groups_add: string;
  on_use_groups_remove: string;
  on_use_roles_add: string;
  on_use_roles_remove: string;
  on_use_console_commands: string;
  created: string;
  updated: string;
}

export interface Infraction {
  collectionId: string;
  collectionName: string;
  id: string;
  reason: string;
  expired: boolean;
  warn_channel_id: number;
  value: number;
  user: string;
  created: string;
  updated: string;
}
