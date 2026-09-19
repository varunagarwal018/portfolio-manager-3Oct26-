const portfolioService = require('../services/portfolio.service');

async function getSummary(req, res) {
  try {
    const userId = req.user.userId;
    const summary = await portfolioService.getPortfolioSummary(userId);
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getSummary };
