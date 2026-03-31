/**
 * Draw Engine Service
 * Supports two modes:
 *  - random: standard lottery-style, 5 unique numbers from 1-45
 *  - algorithmic: weighted by score frequency (less common = higher weight)
 */

/**
 * Get frequency of each score across all active subscribers
 * @param {Array} allScores - flat array of score integers from active users
 * @returns {Object} frequency map { score: count }
 */
function buildFrequencyMap(allScores) {
  const freq = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;
  allScores.forEach(s => { if (s >= 1 && s <= 45) freq[s]++; });
  return freq;
}

/**
 * Random draw: generate 5 unique numbers 1-45
 */
export function randomDraw() {
  const numbers = [];
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers.sort((a, b) => a - b);
}

/**
 * Algorithmic draw: weighted by inverse frequency
 * Least common scores = higher draw probability
 * @param {Array} allScores - all user scores
 */
export function algorithmicDraw(allScores) {
  const freq = buildFrequencyMap(allScores);
  const maxFreq = Math.max(...Object.values(freq));
  // Inverse weight: numbers never scored get highest weight
  const weights = {};
  for (let i = 1; i <= 45; i++) {
    weights[i] = (maxFreq - freq[i]) + 1; // +1 ensures even max-freq numbers have a weight
  }
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const numbers = [];
  while (numbers.length < 5) {
    let rand = Math.random() * totalWeight;
    for (let i = 1; i <= 45; i++) {
      if (numbers.includes(i)) continue;
      rand -= weights[i];
      if (rand <= 0) { numbers.push(i); break; }
    }
  }
  return numbers.sort((a, b) => a - b);
}

/**
 * Check how many drawn numbers match a user's score array
 * @param {Array} userScores - user's last 5 scores
 * @param {Array} drawnNumbers - the 5 drawn numbers
 * @returns {number} count of matches (0-5)
 */
export function countMatches(userScores, drawnNumbers) {
  return userScores.filter(s => drawnNumbers.includes(s)).length;
}

/**
 * Classify match tier
 * @returns {number|null} 3, 4, 5 or null (no prize)
 */
export function classifyMatch(matchCount) {
  if (matchCount >= 5) return 5;
  if (matchCount === 4) return 4;
  if (matchCount === 3) return 3;
  return null;
}
