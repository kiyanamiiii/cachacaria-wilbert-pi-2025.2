import { API_URL } from "./constants.js";

const DEFAULT_PAGE_SIZE = 6;

function createProductCard(product) {
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

  return card;
}

function renderPage(products, page, pageSize, container) {
  container.innerHTML = "";
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const slice = products.slice(start, end);

  if (slice.length === 0) {
    container.innerHTML = `<p class="text-center text-muted">Nenhum produto encontrado.</p>`;
    return;
  }

  slice.forEach((product) => container.appendChild(createProductCard(product)));
}

function renderPagination(products, pageSize, paginationEl, onPageChange) {
  paginationEl.innerHTML = "";
  const total = Math.ceil(products.length / pageSize) || 1;

  const createPageItem = (label, page, disabled = false, active = false) => {
    const li = document.createElement("li");
    li.className = `page-item ${disabled ? "disabled" : ""} ${
      active ? "active" : ""
    }`.trim();
    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "#";
    a.textContent = label;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (!disabled && !active) onPageChange(page);
    });
    li.appendChild(a);
    return li;
  };

  // Prev
  paginationEl.appendChild(
    createPageItem("Anterior", 1, products.length === 0)
  );

  // Page numbers (limit visible pages to 7 with ellipsis)
  const maxVisible = 7;
  let startPage = 1;
  let endPage = total;
  if (total > maxVisible) {
    startPage = 1;
    endPage = maxVisible;
  }

  for (let i = startPage; i <= endPage; i++) {
    const li = createPageItem(i, i, false, false);
    paginationEl.appendChild(li);
  }

  // Next
  paginationEl.appendChild(
    createPageItem("Próximo", total, products.length === 0)
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const productList = document.getElementById("product-list");
  const paginationEl = document.getElementById("pagination");
  const searchInput = document.getElementById("search-input");

  try {
    const response = await fetch(`${API_URL}/product`);
    if (!response.ok) throw new Error("Erro ao buscar produtos");

    let products = await response.json();

    if (!products || products.length === 0) {
      if (productList)
        productList.innerHTML = `<p class="text-center text-muted">Nenhum produto encontrado.</p>`;
      return;
    }

    // If pagination controls are present on the page, enable client-side pagination
    if (paginationEl && productList) {
      let pageSize = DEFAULT_PAGE_SIZE;
      let currentPage = 1;

      const applyFiltersAndRender = () => {
        let filtered = products;
        const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
        if (q) {
          filtered = products.filter(
            (p) =>
              (p.name || "").toLowerCase().includes(q) ||
              (p.description || "").toLowerCase().includes(q)
          );
        }

        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;

        renderPage(filtered, currentPage, pageSize, productList);

        // Build pagination numbers
        paginationEl.innerHTML = "";

        const createItem = (label, page, disabled = false, active = false) => {
          const li = document.createElement("li");
          li.className = `page-item ${disabled ? "disabled" : ""} ${
            active ? "active" : ""
          }`.trim();
          const a = document.createElement("a");
          a.className = "page-link";
          a.href = "#";
          a.textContent = label;
          a.addEventListener("click", (e) => {
            e.preventDefault();
            if (!disabled && !active) {
              currentPage = page;
              applyFiltersAndRender();
            }
          });
          li.appendChild(a);
          return li;
        };

        // Prev
        paginationEl.appendChild(
          createItem(
            "Anterior",
            Math.max(1, currentPage - 1),
            currentPage === 1
          )
        );

        const total = Math.max(1, Math.ceil(filtered.length / pageSize));
        // Determine page window
        const maxVisible = 7;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(total, start + maxVisible - 1);
        if (end - start < maxVisible - 1)
          start = Math.max(1, end - maxVisible + 1);

        if (start > 1)
          paginationEl.appendChild(createItem("1", 1, false, false));
        if (start > 2) {
          const li = document.createElement("li");
          li.className = "page-item disabled";
          li.innerHTML = `<span class="page-link">&hellip;</span>`;
          paginationEl.appendChild(li);
        }

        for (let i = start; i <= end; i++) {
          paginationEl.appendChild(createItem(i, i, false, i === currentPage));
        }

        if (end < total - 1) {
          const li = document.createElement("li");
          li.className = "page-item disabled";
          li.innerHTML = `<span class="page-link">&hellip;</span>`;
          paginationEl.appendChild(li);
        }
        if (end < total)
          paginationEl.appendChild(createItem(total, total, false, false));

        // Next
        paginationEl.appendChild(
          createItem(
            "Próximo",
            Math.min(total, currentPage + 1),
            currentPage === total
          )
        );
      };

      // Bind search
      if (searchInput) {
        let timeout = null;
        searchInput.addEventListener("input", () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            currentPage = 1;
            applyFiltersAndRender();
          }, 300);
        });
      }

      applyFiltersAndRender();
    } else if (productList) {
      // Fallback: render all (original behavior)
      products.forEach((product) =>
        productList.appendChild(createProductCard(product))
      );
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    if (productList)
      productList.innerHTML = `<p class="text-center text-danger">Erro ao carregar produtos. Tente novamente mais tarde.</p>`;
  }
});
