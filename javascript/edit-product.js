// ...existing code...
import { API_URL } from "./constants.js";

function getCookie(name) {
  const v = `; ${document.cookie}`;
  const parts = v.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

async function tryGetUser() {
  const token = getCookie("auth_token");
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Erro ao buscar usuário:", err);
    return null;
  }
}

function q(sel) {
  return document.querySelector(sel);
}

function formatCurrencyBR(value) {
  const n = Number(value || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function fetchProduct(id) {
  try {
    const res = await fetch(`${API_URL}/product/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Erro ao buscar produto:", err);
    return null;
  }
}

function renderImages(product) {
  const thumbnails = document.getElementById("thumbnails");
  const mainImage = document.getElementById("main-image");

  const imgs = product.photos || (product.photo ? [product.photo] : []) || [];
  if (imgs.length === 0) {
    mainImage.src = "https://placehold.co/1000x1000";
    return;
  }

  mainImage.src = imgs[0];
  thumbnails.innerHTML = "";
  imgs.forEach((src, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn p-0 border-0 bg-transparent";
    btn.innerHTML = `<img src="${src}" alt="thumb-${idx}" class="img-fluid rounded" style="max-width:72px; max-height:72px"/>`;
    btn.addEventListener("click", () => {
      mainImage.src = src;
    });
    thumbnails.appendChild(btn);
  });
}

function wireQtyAndTotal(product) {
  const qtyInput = document.getElementById("qty-input");
  const qtyInc = document.getElementById("qty-increase");
  const qtyDec = document.getElementById("qty-decrease");
  const totalPrice = document.getElementById("total-price");
  const addToCartBtn = document.getElementById("add-to-cart-btn");

  function updateTotal() {
    const qty = Number(qtyInput.value) || 1;
    const total = (Number(product.price) || 0) * qty;
    totalPrice.textContent = formatCurrencyBR(total);
  }

  qtyInc.addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value || 1) + 1);
    updateTotal();
  });
  qtyDec.addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value || 1) - 1);
    updateTotal();
  });
  qtyInput.addEventListener("input", () => {
    if (!qtyInput.value || Number(qtyInput.value) < 1) qtyInput.value = 1;
    updateTotal();
  });

  addToCartBtn.addEventListener("click", async () => {
    const qty = Number(qtyInput.value) || 1;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((c) => String(c.id) === String(product.id));
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));

    const alertEl = document.getElementById("cart-alert");
    alertEl.classList.remove("d-none");
    alertEl.classList.add("show");
    setTimeout(() => {
      alertEl.classList.remove("show");
      alertEl.classList.add("d-none");
    }, 1800);
  });

  updateTotal();
}

function injectEditButtonIfAdmin(user, productId) {
  if (!user?.is_adm) return;

  const buyContainer = document.querySelector(".flex-grow-1 > .d-grid");
  if (!buyContainer) return;

  const wrapper = document.createElement("div");
  wrapper.className = "d-flex gap-2";

  const buyBtn = buyContainer.querySelector("#add-to-cart-btn");
  if (!buyBtn) return;

  const editBtn = document.createElement("a");
  editBtn.className = "btn btn-outline-primary btn-lg";
  editBtn.href = `/pages/editProductForm.html?id=${encodeURIComponent(
    productId
  )}`;
  editBtn.innerHTML = '<i class="bi bi-pencil-square"></i> Editar';

  wrapper.appendChild(editBtn);
  wrapper.appendChild(buyBtn.cloneNode(true));

  buyContainer.replaceWith(wrapper);
}

function injectDeleteButtonIfAdmin(user, productId) {
  if (!user?.is_adm) return;
  const buyBtn = document.getElementById("add-to-cart-btn");
  if (!buyBtn) return;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn-danger btn-lg";
  deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Deletar';

  deleteBtn.addEventListener("click", async () => {
    const modalId = "confirmDeleteModal";
    let modalEl = document.getElementById(modalId);
    if (!modalEl) {
      modalEl = document.createElement("div");
      modalEl.id = modalId;
      modalEl.className = "modal fade";
      modalEl.tabIndex = -1;
      modalEl.setAttribute("aria-hidden", "true");
      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmar</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              <p>Confirma exclusão deste produto? Esta ação não pode ser desfeita.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger" id="${modalId}-confirm">Deletar</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    const bsModal = new bootstrap.Modal(modalEl);
    const confirmBtn = modalEl.querySelector(`#${modalId}-confirm`);

    const onConfirm = async () => {
      const token = getCookie("auth_token");

      function showResultModal(title, message, onOk) {
        const modalId = "operationResultModal";
        let modalEl = document.getElementById(modalId);
        if (!modalEl) {
          modalEl = document.createElement("div");
          modalEl.id = modalId;
          modalEl.className = "modal fade";
          modalEl.tabIndex = -1;
          modalEl.setAttribute("aria-hidden", "true");
          modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            <p></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" id="${modalId}-ok">OK</button>
          </div>
          </div>
        </div>
        `;
          document.body.appendChild(modalEl);
        }

        modalEl.querySelector(".modal-title").textContent = title;
        modalEl.querySelector(".modal-body p").textContent = message;

        const bsResult = new bootstrap.Modal(modalEl);
        const okBtn = modalEl.querySelector(`#${modalId}-ok`);
        okBtn.addEventListener(
          "click",
          () => {
            bsResult.hide();
            if (typeof onOk === "function") onOk();
          },
          { once: true }
        );
        bsResult.show();
      }

      try {
        const res = await fetch(
          `${API_URL}/product/${encodeURIComponent(productId)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        let data = null;
        try {
          data = await res.json();
        } catch (e) {}

        bsModal.hide();

        if (!res.ok) {
          showResultModal(
            "Erro",
            data?.message || `Erro ao deletar produto: ${res.status}`
          );
          return;
        }

        showResultModal("Sucesso", "Produto deletado com sucesso.", () => {
          window.location.href = "/";
        });
      } catch (err) {
        bsModal.hide();
        console.warn("Erro ao apagar produto:", err);
        showResultModal("Erro", "Erro ao apagar produto.");
      }
    };

    confirmBtn.addEventListener("click", onConfirm, { once: true });
    bsModal.show();
  });

  const parent = buyBtn.parentElement;
  if (!parent) return;

  if (parent.classList.contains("d-flex")) {
    parent.appendChild(deleteBtn);
  } else {
    const wrapper = document.createElement("div");
    wrapper.className = "d-flex gap-2";
    while (parent.firstChild) {
      wrapper.appendChild(parent.firstChild);
    }
    wrapper.appendChild(deleteBtn);
    parent.replaceWith(wrapper);
  }
}

// inicialização
(async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    const productNameEl = document.getElementById("product-name");
    if (productNameEl) productNameEl.textContent = "Produto não especificado";
    return;
  }

  const editForm = document.getElementById("editProductForm");
  if (editForm) {
    const product = await fetchProduct(id);
    if (!product) {
      const result = document.getElementById("formResult");
      if (result) result.textContent = "Produto não encontrado";
      return;
    }

    const productIdInput = document.getElementById("productId");
    const nameInput = document.getElementById("productName");
    const descInput = document.getElementById("productDescription");
    const stockInput = document.getElementById("productStock");
    const priceInput = document.getElementById("productPrice");
    const imageInput = document.getElementById("productImage");

    productIdInput.value = product.id ?? "";
    nameInput.value = product.name ?? "";
    descInput.value = product.description ?? "";
    stockInput.value = product.stock ?? 0;
    priceInput.value = product.price ?? "";

    const previewImage = document.getElementById("previewImage");
    const previewName = document.getElementById("previewName");
    const previewDesc = document.getElementById("previewDescription");
    const previewPrice = document.getElementById("previewPrice");
    const previewStock = document.getElementById("previewStock");

    const initialImg =
      (product.photos && product.photos.length && product.photos[0]) ||
      product.photo ||
      "https://placehold.co/1000x1000";

    previewImage.src = initialImg;
    previewName.textContent = product.name ?? "[Name]";
    previewDesc.textContent = product.description ?? "[Desc...]";
    previewPrice.textContent = formatCurrencyBR(product.price);
    previewStock.textContent = product.stock ?? 0;

    nameInput.addEventListener("input", () => {
      previewName.textContent = nameInput.value || "[Name]";
    });
    descInput.addEventListener("input", () => {
      previewDesc.textContent = descInput.value || "[Desc...]";
    });
    priceInput.addEventListener("input", () => {
      previewPrice.textContent = formatCurrencyBR(priceInput.value);
    });
    stockInput.addEventListener("input", () => {
      const v = stockInput.value;
      previewStock.textContent = v === "" ? "0" : v;
    });

    let objectUrl = null;
    imageInput.addEventListener("change", () => {
      const file = imageInput.files && imageInput.files[0];
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
      if (file) {
        objectUrl = URL.createObjectURL(file);
        previewImage.src = objectUrl;
      } else {
        previewImage.src = initialImg;
      }
    });

    editForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const result = document.getElementById("formResult");
      if (result) {
        const cookie = getCookie("auth_token");

        const response = await fetch(
          `${API_URL}/product/${encodeURIComponent(id)}`,
          {
            method: "PUT",
            body: new FormData(editForm),
            headers: {
              Authorization: `Bearer ${cookie}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          result.textContent =
            data?.message || `Erro ao atualizar produto: ${response.status}`;
          result.classList.add("text-danger");
          return;
        }

        if (data.status !== 0) {
          result.textContent = data.message || "Erro ao atualizar o produto.";
          result.classList.add("text-danger");
          return;
        }

        result.textContent = "Produto atualizado com sucesso!";
        result.classList.add("text-success");
      }
    });

    return;
  }

  const [user, product] = await Promise.all([tryGetUser(), fetchProduct(id)]);

  if (!product) {
    const productNameEl = document.getElementById("product-name");
    if (productNameEl) productNameEl.textContent = "Produto não encontrado";
    return;
  }

  document.getElementById("product-name").textContent = product.name || "";
  document.getElementById("product-description").textContent =
    product.description || "";
  document.getElementById("product-stock").textContent =
    (product.stock ?? 0) > 0 ? "Em estoque" : "Indisponível";
  document.getElementById("product-price").textContent = formatCurrencyBR(
    product.price
  );

  renderImages(product);

  injectEditButtonIfAdmin(user, id);
  injectDeleteButtonIfAdmin(user, id);

  if (user?.is_adm) {
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    if (addToCartBtn) {
      addToCartBtn.disabled = true;
      addToCartBtn.hidden = true;
    }
    return;
  }

  wireQtyAndTotal(product);
})();
