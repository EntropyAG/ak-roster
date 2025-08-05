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

/**
 * Borrowed from: https://www.linkedin.com/pulse/combinations-typescript-emerson-souza
 * 
 * Returns all possible combinations of items within an array with a specified length.
 * E.g: For an array [1, 2, 3, 4] and size 2, the results would be:
 * [ [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4] ]
 * @param items: an array of objects to be combined. Can be any type.
 * @param size: the length of each combo.
 * @returns an array of all combinations based on initial objects
 */
export function combinations<T>(items: T[], size: number = items.length){
  const combinations: T[][] = [];
  const stack: number[] = [];
  let i = 0;

  size = Math.min(items.length, size);

  while (true) {
    if (stack.length === size) {
      combinations.push(stack.map((index) => items[index]));
      i = stack.pop()! + 1;
    }

    if (i >= items.length) {
      if (stack.length === 0) {
        break;
      }
      i = stack.pop()! + 1;
    } else {
      stack.push(i++);
    }
  }

  return combinations;
};