function eloChange(ratingA, ratingB, winA) {
  const K = 32;
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const scoreA = winA ? 1 : 0;
  return Math.round(K * (scoreA - expectedA));
}

module.exports = { eloChange };