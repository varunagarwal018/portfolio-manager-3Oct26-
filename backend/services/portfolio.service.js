const { getDB } = require('../config/db');

async function getPortfolioSummary(userId) {
  const db = getDB();
  const investments = await db.all('SELECT * FROM investments WHERE user_id = ?', [userId]);

  let totalInvested = 0;
  let totalCurrentValue = 0;

  const enrichedInvestments = investments.map(inv => {
    // Current value = Invested amount * (1 + annual return/100) ^ years
    const currentValue = inv.amount * Math.pow(1 + inv.annual_return / 100, inv.years);
    const gain = currentValue - inv.amount;
    const returnPercent = (gain / inv.amount) * 100;

    totalInvested += inv.amount;
    totalCurrentValue += currentValue;

    return {
      ...inv,
      currentValue: parseFloat(currentValue.toFixed(2)),
      gain: parseFloat(gain.toFixed(2)),
      returnPercent: parseFloat(returnPercent.toFixed(2))
    };
  });

  const totalGain = totalCurrentValue - totalInvested;
  const overallReturnPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  // Group by type
  const typeBreakdown = enrichedInvestments.reduce((acc, inv) => {
    if (!acc[inv.type]) {
      acc[inv.type] = { type: inv.type, invested: 0, currentValue: 0 };
    }
    acc[inv.type].invested += inv.amount;
    acc[inv.type].currentValue += inv.currentValue;
    return acc;
  }, {});

  return {
    summary: {
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
      totalGain: parseFloat(totalGain.toFixed(2)),
      overallReturnPercent: parseFloat(overallReturnPercent.toFixed(2))
    },
    breakdown: Object.values(typeBreakdown).map(b => ({
      ...b,
      invested: parseFloat(b.invested.toFixed(2)),
      currentValue: parseFloat(b.currentValue.toFixed(2))
    })),
    investments: enrichedInvestments
  };
}

module.exports = { getPortfolioSummary };
