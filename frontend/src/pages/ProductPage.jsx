import { useState } from "react";
import useProducts from "../hooks/useProducts.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductFormModal from "../components/ProductFormModal.jsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";

export default function ProductPage() {
  const { products, loading, error, addProduct, editProduct, removeProduct } = useProducts();
  const [search, setSearch] = useState("");
  // null = tidak ada pop-up; { type: "form" | "delete", product? }
  const [modal, setModal] = useState(null);

  const keyword = search.trim().toLowerCase();
  const visible = products.filter((p) => p.name.toLowerCase().includes(keyword));
  const close = () => setModal(null);

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>Manajemen Produk</h1>
          <p className="muted">Kelola daftar produk dan harga dalam satu tempat.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: "form" })}>
          + Tambah Produk
        </button>
      </header>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Cari nama produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="muted">{products.length} produk</span>
      </div>

      {loading && <p className="muted">Memuat data...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && visible.length === 0 && <p className="muted">Produk tidak ditemukan.</p>}

      <section className="grid">
        {visible.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onEdit={(product) => setModal({ type: "form", product })}
            onDelete={(product) => setModal({ type: "delete", product })}
          />
        ))}
      </section>

      {!loading && !error && (
        <p className="muted">
          Menampilkan {visible.length} dari {products.length} produk
        </p>
      )}

      {modal?.type === "form" && (
        <ProductFormModal
          product={modal.product}
          onClose={close}
          onSave={async (data) => {
            if (modal.product) await editProduct(modal.product.id, data);
            else await addProduct(data);
            close();
          }}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteConfirmModal
          product={modal.product}
          onClose={close}
          onConfirm={async (product) => {
            await removeProduct(product.id);
            close();
          }}
        />
      )}
    </main>
  );
}
