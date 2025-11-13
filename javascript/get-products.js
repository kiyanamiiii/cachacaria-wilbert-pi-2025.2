import { API_URL } from './constants.js';
class Product {
  id;
  name;
  description;
  price;
  stock;
  photos;
}

async function fetchProducts() {
  const prods = [];

  try {
    const response = await fetch(`${API_URL}/product`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
    }
    const products = await response.json();

    for (const productData of products) {
      const product = new Product();
      product.id = productData.id;
      product.name = productData.name;
      product.description = productData.description;
      product.price = productData.price;
      product.stock = productData.stock;
      product.photos = productData.photos;
      prods.push(product);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return [];
  }

  return prods;
}

document.addEventListener("DOMContentLoaded", async () => {
  const products = await fetchProducts();
});
