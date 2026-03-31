/**
 * Prize Calculator Service
 * PRD Distribution:
 *   5-Match (Jackpot): 40% — rolls over if no winner
 *   4-Match: 35%
 *   3-Match: 25%
 * Prizes split equally among winners in same tier
 */

const POOL_SHARES = {
  5: 0.40,
  4: 0.35,
  3: 0.25,
};

/**
 * Calculate prize pools from total pool amount
 * @param {number} totalPool
 * @param {number} rolledOverJackpot - amount carried from previous month
 */
export function calculatePools(totalPool, rolledOverJackpot = 0) {
  return {
    jackpot: totalPool * POOL_SHARES[5] + rolledOverJackpot,
    fourMatch: totalPool * POOL_SHARES[4],
    threeMatch: totalPool * POOL_SHARES[3],
  };
}

/**
 * Calculate monthly total prize pool from active subscriber count
 * @param {number} subscriberCount
 * @param {number} monthlyContribution - portion of subscription fee to pool (e.g. $8)
 */
export function calculateTotalPool(subscriberCount, monthlyContribution = 8) {
  return subscriberCount * monthlyContribution;
}

/**
 * Distribute prizes per tier
 * @param {Object} pools - { jackpot, fourMatch, threeMatch }
 * @param {Object} winnerCounts - { 5: n, 4: n, 3: n }
 * @param {boolean} jackpotWon - if false, jackpot rolls over
 * @returns {Object} { prizes: { 5: amount, 4: amount, 3: amount }, rollover: number }
 */
export function distributePrizes(pools, winnerCounts, jackpotWon) {
  const prizes = {};
  let rollover = 0;

  if (jackpotWon && winnerCounts[5] > 0) {
    prizes[5] = pools.jackpot / winnerCounts[5];
  } else {
    rollover = pools.jackpot;
    prizes[5] = 0;
  }

  prizes[4] = winnerCounts[4] > 0 ? pools.fourMatch / winnerCounts[4] : 0;
  prizes[3] = winnerCounts[3] > 0 ? pools.threeMatch / winnerCounts[3] : 0;

  return { prizes, rollover };
}
