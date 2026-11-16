import { useEffect, useState } from "react";
import * as api from "../api.js";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function addProduct(data) {
    const created = await api.createProduct(data);
    setProducts((list) => [...list, created]);
  }

  async function editProduct(id, data) {
    const updated = await api.updateProduct(id, data);
    setProducts((list) => list.map((p) => (p.id === id ? updated : p)));
  }

  async function removeProduct(id) {
    await api.deleteProduct(id);
    setProducts((list) => list.filter((p) => p.id !== id));
  }

  return { products, loading, error, addProduct, editProduct, removeProduct };
}
