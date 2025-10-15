import { API_URL } from "./constants.js";

document.addEventListener("DOMContentLoaded", async () => {
  const productList = document.getElementById("product-list");

  try {
    const response = await fetch(`${API_URL}/product`);
    if (!response.ok) throw new Error("Erro ao buscar produtos");

    const products = await response.json();

    if (!products || products.length === 0) {
      productList.innerHTML = `<p class="text-center text-muted">Nenhum produto encontrado.</p>`;
      return;
    }

    products.forEach((product) => {
      const imgSrc =
        product.photos && product.photos.length > 0
          ? `${product.photos[0]}`
          : "/assets/images/default.png";
      const card = document.createElement("div");
      card.classList.add("col-md-6", "col-lg-4", "mb-4");

      card.innerHTML = `
            <div class="card shadow-sm h-100 img-transition" style="max-width: 540px;">
              <div class="row g-0">
                <div class="col-md-4 d-flex align-items-center">
                  <img src="${imgSrc}" class="img-fluid rounded-start" alt="${
        product.name
      }">
                </div>
                <div class="col-md-8">
                  <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-truncate">${
                      product.description || "Sem descrição disponível."
                    }</p>
                    <p class="card-text">
                      <small class="text-muted">R$ ${product.price.toFixed(
                        2
                      )}</small>
                    </p>
                    <div class="buy-container text-center">
                      <a href="/pages/productPage.html?id=${
                        product.id
                      }" class="btn btn-success">Comprar</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;

      productList.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    productList.innerHTML = `<p class="text-center text-danger">Erro ao carregar produtos. Tente novamente mais tarde.</p>`;
  }
});
