const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

/** "three" for 3, "Three" to start a sentence; digits from ten up. */
export function countWord(n: number, capitalized = false): string {
  const word = WORDS[n] ?? String(n);
  return capitalized ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}
