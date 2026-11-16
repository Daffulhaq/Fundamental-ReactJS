function validateProduct(req, res, next) {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const rawPrice = req.body.price;
  const price =
    typeof rawPrice === "number"
      ? rawPrice
      : typeof rawPrice === "string" && rawPrice.trim() !== ""
        ? Number(rawPrice)
        : NaN;
  const errors = {};

  if (!name) errors.name = "Nama produk wajib diisi.";
  else if (name.length > 100) errors.name = "Nama produk maksimal 100 karakter.";

  if (!Number.isInteger(price) || price <= 0) errors.price = "Harga harus lebih dari 0.";
  else if (price > 2000000000) errors.price = "Harga terlalu besar.";

  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  req.product = { name, price };
  next();
}

module.exports = validateProduct;
