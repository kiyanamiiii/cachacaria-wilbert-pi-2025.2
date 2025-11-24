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
    // implementação simples de carrinho local
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

  // localizar o container do botão de compra e transformar em flex para posicionar ao lado
  const buyContainer = document.querySelector(".flex-grow-1 > .d-grid");
  if (!buyContainer) return;

  // criar wrapper flex
  const wrapper = document.createElement("div");
  wrapper.className = "d-flex gap-2";

  // mover o botão de compra existente para o wrapper
  const buyBtn = buyContainer.querySelector("#add-to-cart-btn");
  if (!buyBtn) return;

  // criar botão editar
  const editBtn = document.createElement("a");
  editBtn.className = "btn btn-outline-primary btn-lg";
  editBtn.href = `/pages/editProductForm.html?id=${encodeURIComponent(
    productId
  )}`;
  editBtn.innerHTML = '<i class="bi bi-pencil-square"></i> Editar';

  // substituir o buyContainer's content pelo wrapper contendo edit + buy
  wrapper.appendChild(editBtn);
  wrapper.appendChild(buyBtn.cloneNode(true));

  buyContainer.replaceWith(wrapper);

  // reaplicar o listener do botão clonado: substituir com delegation ao invés de clonar listener
  // remover original buyBtn (está agora clonado), rewire listener below in caller if needed
}

// inicialização
(async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    // se estiver em página de detalhe sem id
    const productNameEl = document.getElementById("product-name");
    if (productNameEl) productNameEl.textContent = "Produto não especificado";
    return;
  }

  // detectar se estamos na página de edição (form presente)
  const editForm = document.getElementById("editProductForm");
  if (editForm) {
    // página de edição: buscar produto e preencher formulário + preview em tempo real
    const product = await fetchProduct(id);
    if (!product) {
      const result = document.getElementById("formResult");
      if (result) result.textContent = "Produto não encontrado";
      return;
    }

    // preencher campos do formulário
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

    // preview elements
    const previewImage = document.getElementById("previewImage");
    const previewName = document.getElementById("previewName");
    const previewDesc = document.getElementById("previewDescription");
    const previewPrice = document.getElementById("previewPrice");
    const previewStock = document.getElementById("previewStock");

    // helper para obter imagem inicial (do produto)
    const initialImg =
      (product.photos && product.photos.length && product.photos[0]) ||
      product.photo ||
      "https://placehold.co/1000x1000";

    previewImage.src = initialImg;
    previewName.textContent = product.name ?? "[Name]";
    previewDesc.textContent = product.description ?? "[Desc...]";
    previewPrice.textContent = formatCurrencyBR(product.price);
    previewStock.textContent = product.stock ?? 0;

    // atualizar preview quando usuário edita os campos
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

    // imagem: ao selecionar arquivo, mostrar preview; se limpar, voltar à imagem inicial
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

    // (opcional) interceptar submissão do formulário para mostrar resultado - sem alterar API
    editForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      // aqui você pode implementar a chamada para atualizar o produto via fetch/PUT com FormData
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

  // se não for página de edição, comportamento original (detalhe do produto)
  const [user, product] = await Promise.all([tryGetUser(), fetchProduct(id)]);

  if (!product) {
    const productNameEl = document.getElementById("product-name");
    if (productNameEl) productNameEl.textContent = "Produto não encontrado";
    return;
  }

  // popular campos
  document.getElementById("product-name").textContent = product.name || "";
  document.getElementById("product-description").textContent =
    product.description || "";
  document.getElementById("product-stock").textContent =
    (product.stock ?? 0) > 0 ? "Em estoque" : "Indisponível";
  document.getElementById("product-price").textContent = formatCurrencyBR(
    product.price
  );

  renderImages(product);

  // primeiro cria o botão de compra padrão (o listener será ligado em wireQtyAndTotal).
  // o HTML original já tem o botão; se injetarmos o botão de editar substituímos o container,
  // por isso chamamos injectEditButtonIfAdmin antes de wired listeners para restaurar listeners corretamente.

  injectEditButtonIfAdmin(user, id);

  // se for admin, desabilitar compra completamente
  if (user?.is_adm) {
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    if (addToCartBtn) {
      addToCartBtn.disabled = true;
      addToCartBtn.hidden = true;
    }
    return; // impedir wireQtyAndTotal de ligar o listener de compra
  }

  // após possivelmente alterar o DOM, ligar lógica de quantidade/total e listener de compra
  wireQtyAndTotal(product);
})();
