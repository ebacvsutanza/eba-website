require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Neon
  },
});

pool.connect((err) => {
  if (err) throw err;
  console.log("Connected to Database");
});

module.exports = pool;
