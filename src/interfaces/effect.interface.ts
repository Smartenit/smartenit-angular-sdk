export interface IEffect {
  getEffectOptions(): any;

  getEffectAttribute(): string | null;

  getEffectMethod(context?: any): string | null;
}