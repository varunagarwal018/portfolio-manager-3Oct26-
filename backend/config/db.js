const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const path = require('path');

let db;

async function initDB() {
  db = await open({
    filename: path.join(__dirname, '../database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      years REAL NOT NULL,
      annual_return REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Seed data
  const user = await db.get('SELECT * FROM users WHERE email = ?', ['demo@example.com']);
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password', salt);
    const result = await db.run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', ['Demo User', 'demo@example.com', hash]);
    
    const userId = result.lastID;
    
    const sampleInvestments = [
      { type: 'FD', name: 'SBI FD', amount: 500000, years: 2, annual_return: 6.5 },
      { type: 'SIP', name: 'Nifty 50 SIP', amount: 300000, years: 3, annual_return: 12 },
      { type: 'Equity', name: 'Direct Stocks', amount: 200000, years: 1.5, annual_return: 15 },
      { type: 'Savings', name: 'HDFC Savings', amount: 100000, years: 1, annual_return: 3 },
      { type: 'Real Estate', name: 'Pune Plot', amount: 2500000, years: 5, annual_return: 8 }
    ];

    for (const inv of sampleInvestments) {
      await db.run(
        'INSERT INTO investments (user_id, type, name, amount, years, annual_return) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, inv.type, inv.name, inv.amount, inv.years, inv.annual_return]
      );
    }
  }
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB };
