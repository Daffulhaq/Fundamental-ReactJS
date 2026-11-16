CREATE TABLE IF NOT EXISTS products (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0)
);

-- Data awal (hanya diisi jika tabel masih kosong)
INSERT INTO products (name, price)
SELECT * FROM (VALUES
  ('Pulpen', 5000),
  ('Buku Tulis', 12000),
  ('Spidol', 8000),
  ('Penggaris', 6000),
  ('Penghapus', 3000)
) AS v(name, price)
WHERE NOT EXISTS (SELECT 1 FROM products);
