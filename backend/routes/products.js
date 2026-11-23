const express = require("express");
const pool = require("../db/pool");
const validateProduct = require("../middleware/validateProduct");

const router = express.Router();

router.param("id", (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return res.status(400).json({ message: "ID tidak valid." });
  next();
});

router.get("/", async (req, res, next) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (query) {
      const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
      const { rows } = await pool.query(
        "SELECT id, name, price FROM products WHERE name ILIKE $1 ESCAPE '\\' ORDER BY id",
        [pattern]
      );
      return res.json(rows);
    }
    const { rows } = await pool.query("SELECT id, name, price FROM products ORDER BY id");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, price FROM products WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Produk tidak ditemukan." });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", validateProduct, async (req, res, next) => {
  try {
    const { name, price } = req.product;
    const { rows } = await pool.query(
      "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING id, name, price",
      [name, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validateProduct, async (req, res, next) => {
  try {
    const { name, price } = req.product;
    const { rows } = await pool.query(
      "UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING id, name, price",
      [name, price, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Produk tidak ditemukan." });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ message: "Produk tidak ditemukan." });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
