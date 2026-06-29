export type Product = {
  id: string;
  title: string;
  price: number;
  description: string;
  category: {
    id: string;
    name: string;
  };
  images: string[];
};

export type ProductCategory = {
  id: string;
  name: string;
};

export type ProductDTO = {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: {
    id: string;
    name: string;
    image?: string;
  };
};

export type ProductsResponseDTO = {
  products: ProductDTO[];
};

export type ProductResponseDTO = {
  product: ProductDTO;
};

export type CategoriesResponseDTO = {
  categories: Array<{
    id: string;
    name: string;
  }>;
};

export type ProductFilters = {
  categoryId?: string;
  search?: string;
};
