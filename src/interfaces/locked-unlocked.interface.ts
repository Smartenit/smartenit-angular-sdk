import { IAutomationRule } from './automation-rule.interface';

export interface ILockedUnlocked extends IAutomationRule {
  lock(): void;

  unlock(): void;

  isLocked(): boolean;

  isUnlocked(): boolean;

  getLastUpdateTimestamp(): number;
}