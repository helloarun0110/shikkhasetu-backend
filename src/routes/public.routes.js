const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/subjects", async (req, res) => {
  const [rows] = await pool.execute(`SELECT name FROM subjects ORDER BY name`);
  res.json({ success: true, data: rows.map(r => r.name) });
});

router.get("/classes", async (req, res) => {
  const [rows] = await pool.execute(`SELECT name FROM classes ORDER BY id`);
  res.json({ success: true, data: rows.map(r => r.name) });
});

module.exports = router;