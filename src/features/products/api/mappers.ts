import type { Product, ProductDTO } from "../types";

export function toProduct(dto: ProductDTO): Product {
  return {
    id: dto.id,
    title: dto.title,
    price: dto.price,
    description: dto.description,
    category: {
      id: dto.category.id,
      name: dto.category.name,
    },
    images: dto.images,
  };
}

export function toProducts(dtos: ProductDTO[]): Product[] {
  return dtos.map(toProduct);
}
