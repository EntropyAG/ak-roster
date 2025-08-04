/**
 * Round a given number to a certain number of decimals, as defined by the second argument.
 * E.G:
 * 1.2345 | 2 => 1,23
 * 1.2345 | 3 => 1,235
 * @param num: number that needs to be rounded
 * @param digits: significant digits that should be kept
 * @returns rounded number
 */
export function roundTo(num: number, digits: number) {
  if(!digits){
      digits = 0;
  }
  return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
};