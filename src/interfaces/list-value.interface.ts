export interface IListValue {
  getSelectedValues(): any[];
  selectValue(option: any, subscribe?: boolean): any;
}
