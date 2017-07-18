export interface INumericValue {
  setValue(value: number, attribute?: string): void;

  getValue(attribute?: string): number;

  getConditionAttribute(): string;

  getEffectAttribute(): string | null;

  getEffectMethod(context?: any): string | null;
  
  getUnit(attribute?: string): string;
}