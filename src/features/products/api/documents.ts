export const PRODUCTS_QUERY = `
  query Products {
    products {
      id
      title
      price
      description
      images
      category {
        id
        name
      }
    }
  }
`;

export const PRODUCT_QUERY = `
  query Product($id: ID!) {
    product(id: $id) {
      id
      title
      price
      description
      images
      category {
        id
        name
      }
    }
  }
`;

export const CATEGORIES_QUERY = `
  query Categories {
    categories {
      id
      name
    }
  }
`;
