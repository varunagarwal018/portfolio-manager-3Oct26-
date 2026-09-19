const { getDB } = require('../config/db');

async function getInvestments(req, res) {
  try {
    const db = getDB();
    const userId = req.user.userId;
    const investments = await db.all('SELECT * FROM investments WHERE user_id = ?', [userId]);
    res.json(investments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createInvestment(req, res) {
  try {
    const db = getDB();
    const userId = req.user.userId;
    const { type, name, amount, years, annual_return } = req.body;

    if (!type || !name || amount == null || years == null || annual_return == null) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await db.run(
      'INSERT INTO investments (user_id, type, name, amount, years, annual_return) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, type, name, amount, years, annual_return]
    );

    const newInvestment = await db.get('SELECT * FROM investments WHERE id = ?', [result.lastID]);
    res.status(201).json(newInvestment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateInvestment(req, res) {
  try {
    const db = getDB();
    const userId = req.user.userId;
    const investmentId = req.params.id;
    const { type, name, amount, years, annual_return } = req.body;

    if (!type || !name || amount == null || years == null || annual_return == null) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check ownership
    const existing = await db.get('SELECT * FROM investments WHERE id = ? AND user_id = ?', [investmentId, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    await db.run(
      'UPDATE investments SET type = ?, name = ?, amount = ?, years = ?, annual_return = ? WHERE id = ?',
      [type, name, amount, years, annual_return, investmentId]
    );

    const updatedInvestment = await db.get('SELECT * FROM investments WHERE id = ?', [investmentId]);
    res.json(updatedInvestment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteInvestment(req, res) {
  try {
    const db = getDB();
    const userId = req.user.userId;
    const investmentId = req.params.id;

    // Check ownership
    const existing = await db.get('SELECT * FROM investments WHERE id = ? AND user_id = ?', [investmentId, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    await db.run('DELETE FROM investments WHERE id = ?', [investmentId]);
    res.json({ message: 'Investment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getInvestments, createInvestment, updateInvestment, deleteInvestment };
