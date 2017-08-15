import { IAutomationRule } from './automation-rule.interface';

export interface IIASACEServer extends IAutomationRule {
  setEmergency(type: string): void;

  arm(mode: number): void;

  disarm(): void;
}