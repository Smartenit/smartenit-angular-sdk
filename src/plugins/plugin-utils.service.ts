import { Injectable } from "@angular/core";

@Injectable()
export class PluginUtilsService {
  getValueFromPercentage(value: number, lowerLimit: number, upperLimit: number) {
    return Math.round((upperLimit - lowerLimit) * (value / 100));
  }

  getValueToPercentage(value: number, lowerLimit: number, upperLimit: number) {
    return Math.round((value / (upperLimit - lowerLimit)) * 100);
  }

  getValueByMultiplying(value: number, multiplicand: number) {
    return Math.round(value * multiplicand);
  }

  getValueByDividing(value: number, dividend: number) {
    return Math.round(value / dividend);
  }
}