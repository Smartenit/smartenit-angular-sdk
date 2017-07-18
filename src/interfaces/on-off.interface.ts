export interface IOnOff {
  on(): void;

  off(): void;

  toggle(): void;

  isOn(): boolean;

  isOff(): boolean;

  getConditionOptions(): any;

  getConditionAttribute(): string;

  getEffectOptions(): any;

  getEffectAttribute(): string;

  getEffectMethod(context?: any): string | null;
}