import { formatPrice } from "../utils/formatPrice.js";

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <article className="card">
      <small>ID: {product.id}</small>
      <h3>{product.name}</h3>
      <p className="price">{formatPrice(product.price)}</p>
      <div className="actions">
        <button className="btn btn-outline" onClick={() => onEdit(product)}>
          Edit
        </button>
        <button className="btn btn-outline-danger" onClick={() => onDelete(product)}>
          Hapus
        </button>
      </div>
    </article>
  );
}
