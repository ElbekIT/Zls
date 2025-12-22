
export enum KeyStatus {
  NOT_STARTED = 'not started yet',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  BLOCKED = 'blocked'
}

export interface LicenseKey {
  id: string;
  game: string;
  keyString: string;
  deviceLimit: number;
  deviceCount: number;
  durationMinutes: number;
  durationLabel: string;
  status: KeyStatus;
  userId: string;
  createdAt: number;
  expiresAt: number | null;
  isActive: boolean;
}

export interface UserData {
  uid: string;
  username: string;
  isAdmin: boolean;
  isVIP: boolean;
  vipUntil: number | null;
  keysCreated: number;
  invitedBy?: string;
}

export interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  useCount: number;
  maxUses: number;
  createdAt: number;
}
