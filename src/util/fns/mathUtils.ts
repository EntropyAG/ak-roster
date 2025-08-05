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

/**
 * For a given scaling effect and a period of time, returns the weighted average of that stat over
 * that period of time.
 * Example: If you get 2% clue speed per hour with a maximum of 5 stacks and you want the 12h avg,
 * you would call this function as: weightedTimeAverage(2, 5, 12).
 * 
 * @param scalingPerHour: How much % of a stat is gained per hour
 * @param maxStacks: How many times a % increase for that stat can stack
 * @param period: Over how long should the weighted time be considered
 * @returns 
 */
export function weightedTimeAverage(scalingPerHour: number, maxStacks: number, period: number){
  let maxScale = scalingPerHour * maxStacks;
  let cumulativeValue = 0;
  for(let i=0; i<period; i++){
    cumulativeValue += Math.min(i * scalingPerHour, maxScale);
  }
  return cumulativeValue / period;
};