/**
 * Dynamic Scoring Engine for CodeDuel
 * Configurable scoring rules comparing correctness, speed, and memory efficiency.
 */

const scoringConfig = {
  basePoints: 100,
  speedBonusMax: 20,
  speedThresholds: [
    { maxTimeMs: 15, bonus: 20 },
    { maxTimeMs: 60, bonus: 15 },
    { maxTimeMs: 150, bonus: 10 },
    { maxTimeMs: 500, bonus: 5 },
    { maxTimeMs: Infinity, bonus: 2 }
  ],
  memoryBonusMax: 10,
  memoryThresholds: [
    { maxKb: 2048, bonus: 10 },  // Under 2 MB
    { maxKb: 10240, bonus: 7 }, // Under 10 MB
    { maxKb: 25600, bonus: 4 }, // Under 25 MB
    { maxKb: Infinity, bonus: 1 }
  ],
  wrongSubmissionPenalty: 2 // Deduct 2 points per failed submission (min 0)
};

/**
 * Calculates score for a submission
 * @param {Object} params
 * @param {string} params.verdict - 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded'
 * @param {number} params.passedTestCases
 * @param {number} params.totalTestCases
 * @param {number} params.executionTimeMs
 * @param {number} params.memoryKb
 * @param {number} params.submissionCount - Number of prior submissions
 */
function calculateScore({
  verdict,
  passedTestCases = 0,
  totalTestCases = 1,
  executionTimeMs = 0,
  memoryKb = 0,
  submissionCount = 1
}) {
  let baseScore = 0;
  let speedBonus = 0;
  let memoryBonus = 0;
  let penalty = 0;

  if (verdict === 'Accepted') {
    baseScore = scoringConfig.basePoints;

    // Calculate speed bonus
    const speedTier = scoringConfig.speedThresholds.find(t => executionTimeMs <= t.maxTimeMs);
    speedBonus = speedTier ? speedTier.bonus : 0;

    // Calculate memory bonus
    const memTier = scoringConfig.memoryThresholds.find(t => memoryKb <= t.maxKb);
    memoryBonus = memTier ? memTier.bonus : 0;

    // Small penalty for excessive wrong submissions prior to Accepted
    if (submissionCount > 1) {
      penalty = Math.min(20, (submissionCount - 1) * scoringConfig.wrongSubmissionPenalty);
    }
  } else if (verdict === 'Wrong Answer') {
    // Proportional partial credit for passed test cases
    if (totalTestCases > 0) {
      baseScore = Math.floor((passedTestCases / totalTestCases) * scoringConfig.basePoints * 0.7);
    }
    speedBonus = 0;
    memoryBonus = 0;
  } else {
    // Runtime Error or Time Limit Exceeded
    baseScore = 0;
    speedBonus = 0;
    memoryBonus = 0;
  }

  const totalScore = Math.max(0, baseScore + speedBonus + memoryBonus - penalty);

  return {
    totalScore,
    breakdown: {
      baseScore,
      speedBonus,
      memoryBonus,
      penalty
    },
    verdict,
    passedTestCases,
    totalTestCases,
    executionTimeMs,
    memoryKb,
    submissionCount
  };
}

/**
 * Compare two players to determine the winner and tie-breaker
 */
function determineDuelWinner(player1, player2) {
  // If player1 score > player2 score
  if (player1.score > player2.score) {
    return {
      winnerUserId: player1.userId,
      winnerUsername: player1.username,
      tie: false,
      reason: `${player1.username} scored higher (${player1.score} vs ${player2.score} pts)`
    };
  }

  // If player2 score > player1 score
  if (player2.score > player1.score) {
    return {
      winnerUserId: player2.userId,
      winnerUsername: player2.username,
      tie: false,
      reason: `${player2.username} scored higher (${player2.score} vs ${player1.score} pts)`
    };
  }

  // If both have equal scores:
  // If both are Accepted, check execution time as tie-breaker
  if (player1.verdict === 'Accepted' && player2.verdict === 'Accepted') {
    if (player1.executionTimeMs < player2.executionTimeMs) {
      return {
        winnerUserId: player1.userId,
        winnerUsername: player1.username,
        tie: false,
        reason: `Tie-breaker! Both solved correctly, but ${player1.username} executed faster (${player1.executionTimeMs}ms vs ${player2.executionTimeMs}ms)`
      };
    } else if (player2.executionTimeMs < player1.executionTimeMs) {
      return {
        winnerUserId: player2.userId,
        winnerUsername: player2.username,
        tie: false,
        reason: `Tie-breaker! Both solved correctly, but ${player2.username} executed faster (${player2.executionTimeMs}ms vs ${player1.executionTimeMs}ms)`
      };
    }
  }

  // If both have equal score and equal time or both zero
  if (player1.score === 0 && player2.score === 0) {
    return {
      winnerUserId: null,
      winnerUsername: null,
      tie: true,
      reason: 'Draw: Neither player scored points.'
    };
  }

  return {
    winnerUserId: null,
    winnerUsername: null,
    tie: true,
    reason: `Even Match! Both players tied at ${player1.score} points.`
  };
}

module.exports = {
  calculateScore,
  determineDuelWinner,
  scoringConfig
};
