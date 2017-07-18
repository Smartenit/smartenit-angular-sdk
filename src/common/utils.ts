/**
 * Recursively, change the value from another inside an object
 * @param obj Object
 * @param newVal New value
 * @param oldVal Old value
 */
export function changeValueInObject(obj: any, newVal: any, oldVal: any) {
  for (let k in obj) if (obj.hasOwnProperty(k)) {
    if (typeof obj[k] === 'object') {
      changeValueInObject(obj[k], newVal, oldVal);
    } else {
      if (obj[k] === oldVal) obj[k] = newVal;
    }
  }
};
