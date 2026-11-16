import { useState } from "react";
import { formatPrice } from "../utils/formatPrice.js";

export default function DeleteConfirmModal({ product, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm(product);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal center" onClick={(e) => e.stopPropagation()}>
        <button className="close" aria-label="Tutup" onClick={onClose}>
          ×
        </button>
        <div className="trash">🗑️</div>
        <h2>Hapus Produk?</h2>
        <p className="muted">Produk yang dihapus tidak dapat dikembalikan.</p>
        <div className="summary">
          <small>ID: {product.id}</small>
          <strong>{product.name}</strong>
          <span className="price">{formatPrice(product.price)}</span>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="actions end">
          <button className="btn btn-outline" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={busy}>
            Hapus Produk
          </button>
        </div>
      </div>
    </div>
  );
}
