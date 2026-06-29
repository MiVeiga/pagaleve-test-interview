export function formatPrice(
  price: number,
  locale = "pt-BR",
  currency = "USD",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(price);
}
