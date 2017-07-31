export interface IListValue {
  getSelectedValues(context?: string): any[];
  selectValue(option: any, subscribe?: boolean, context?: string): any;
}
