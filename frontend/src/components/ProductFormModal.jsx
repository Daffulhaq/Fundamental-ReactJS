import { useState } from "react";

export default function ProductFormModal({ product, onSave, onClose }) {
  const isEdit = Boolean(product);
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function clearError(key) {
    if (!errors[key] && !errors.form) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next.form;
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!name.trim()) next.name = "Nama produk wajib diisi.";
    if (!Number.isInteger(Number(price)) || Number(price) <= 0) {
      next.price = "Harga harus lebih dari 0.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await onSave({ name: name.trim(), price: Number(price) });
    } catch (err) {
      setErrors({ form: err.message });
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} noValidate>
        <button type="button" className="close" aria-label="Tutup" onClick={onClose}>
          ×
        </button>
        <h2>{isEdit ? "Edit Produk" : "Tambah Produk"}</h2>
        <p className="muted">
          {isEdit ? "Perbarui informasi produk yang dipilih." : "Masukkan informasi produk baru."}
        </p>
        {isEdit && <small>ID: {product.id}</small>}

        <label>
          Nama Produk
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError("name");
            }}
            placeholder="Contoh: Pulpen"
          />
        </label>
        {errors.name && <p className="error">{errors.name}</p>}

        <label>
          Harga (Rp)
          <input
            type="number"
            step="1"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              clearError("price");
            }}
            placeholder="Contoh: 5000"
          />
        </label>
        <p className={errors.price ? "error" : "hint"}>{errors.price ?? "Harga harus lebih dari 0."}</p>
        {errors.form && <p className="error">{errors.form}</p>}

        <div className="actions end">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {isEdit ? "Simpan Perubahan" : "Simpan Produk"}
          </button>
        </div>
      </form>
    </div>
  );
}
