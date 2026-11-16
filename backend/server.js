require("dotenv").config();
const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/products");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);

// Penanganan error terpusat
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? "Terjadi kesalahan pada server." : "Permintaan tidak valid.",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API berjalan di http://localhost:${PORT}`));
