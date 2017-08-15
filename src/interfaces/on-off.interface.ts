import { IAutomationRule } from './automation-rule.interface';

export interface IOnOff extends IAutomationRule {
  on(): void;

  off(): void;

  toggle(): void;

  isOn(): boolean;

  isOff(): boolean;
}