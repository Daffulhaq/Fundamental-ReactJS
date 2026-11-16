const BASE = "/api/products";

async function request(url = BASE, options) {
  let res;
  try {
    res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  } catch {
    throw new Error("Tidak dapat terhubung ke server.");
  }
  if (res.status === 204) return null;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.errors ? Object.values(body.errors).join(" ") : body.message || "Permintaan gagal.");
  }
  return body;
}

export const getProducts = () => request();
export const createProduct = (data) => request(BASE, { method: "POST", body: JSON.stringify(data) });
export const updateProduct = (id, data) => request(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct = (id) => request(`${BASE}/${id}`, { method: "DELETE" });
