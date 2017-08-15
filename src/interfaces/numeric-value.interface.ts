import { IAutomationRule } from './automation-rule.interface';

export interface INumericValue extends IAutomationRule {
  setValue(value: number, attribute?: string): void;

  getValue(attribute?: string): number;

  getUnit(attribute?: string): string;
}