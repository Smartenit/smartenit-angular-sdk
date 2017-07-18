export interface IIASACEServer {
  setEmergency(type: string): void;

  arm(mode: number): void;

  disarm(): void;

  getConditionOptions(): any;

  getConditionAttribute(): string | null;

  getEffectOptions(): any;

  getEffectAttribute(): string | null;

  getEffectMethod(context?: any): string | null;
}