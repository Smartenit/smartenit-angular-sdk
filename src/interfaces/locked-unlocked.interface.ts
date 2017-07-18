export interface ILockedUnlocked {
  lock(): void;

  unlock(): void;

  isLocked(): boolean;

  isUnlocked(): boolean;

  getConditionOptions(): any;

  getConditionAttribute(): string;

  getEffectOptions(): any;

  getEffectAttribute(): string | null;

  getEffectMethod(context?: any): string | null;

  getLastUpdateTimestamp(): number;
}