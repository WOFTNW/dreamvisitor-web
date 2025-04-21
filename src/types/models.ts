export interface User {
  collectionId: string;
  collectionName: string;
  id: string;
  discord_id: string;
  discord_img: string;
  mc_username: string;
  infractions: string[];
  inventory_items: string[];
  users_home: string[];
  claims: string[];
  claim_limit: number;
  play_time: number;
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
    users_home?: UserHome[];
    claims?: Location[];
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
  sendWarning: boolean;
  value: number;
  user: string;
  created: string;
  updated: string;
}

export interface Location {
  collectionId: string;
  collectionName: string;
  id: string;
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
  world: string;
  created: string;
  updated: string;
}

export interface UserClaim {
  collectionId: string;
  collectionName: string;
  id: string;
  expand?: {
    location?: Location;
  };
  size: number;
  created: string;
  updated: string;
}

export interface UserHome {
  collectionId: string;
  collectionName: string;
  id: string;
  name: string;
  location: string;
  user: string;
  created: string;
  updated: string;
  expand?: {
    location?: Location;
  };
}
