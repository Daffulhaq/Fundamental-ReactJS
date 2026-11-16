// Contoh: formatPrice(12000) -> "Rp12.000"
export function formatPrice(value) {
  return "Rp" + new Intl.NumberFormat("id-ID").format(value);
}
