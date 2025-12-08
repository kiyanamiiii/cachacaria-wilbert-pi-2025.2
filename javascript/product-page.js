import { API_URL } from "./constants.js";

async function getAuthToken() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];
  return token;
}

document.addEventListener("DOMContentLoaded", async () => {
  if (document.documentElement.dataset.productPageInit) return;
  document.documentElement.dataset.productPageInit = "1";

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id") || 1;

  try {
    const res = await fetch(`${API_URL}/product/${productId}`);
    if (!res.ok) throw new Error("Erro ao carregar produto");

    const product = await res.json();

    document.getElementById("page-title").innerText = product.name;
    document.getElementById("product-name").innerText = product.name;
    document.getElementById("product-description").innerText =
      product.description || "";
    document.getElementById("product-price").innerText =
      "R$ " + (product.price || 0).toFixed(2);
    document.getElementById("product-stock").innerText = product.stock ?? 0;

    const mainImage = document.getElementById("main-image");
    if (product.photos?.length > 0) {
      mainImage.src = product.photos[0];
    } else {
      mainImage.src = "/assets/img/default.png";
    }

    const thumbsContainer = document.getElementById("thumbnails");
    thumbsContainer.innerHTML = "";
    if (product.photos?.length > 0) {
      for (let photo of product.photos) {
        const img = document.createElement("img");
        img.src = photo;
        img.classList.add("img-fluid", "rounded", "thumb-img");
        img.alt = product.name;
        img.addEventListener("click", () => (mainImage.src = img.src));
        thumbsContainer.appendChild(img);
      }
    }

    const addToCartBtn = document.getElementById("add-to-cart-btn");
    const cartAlert = document.getElementById("cart-alert");
    const qtyInput = document.getElementById("qty-input");
    const qtyDec = document.getElementById("qty-decrease");
    const qtyInc = document.getElementById("qty-increase");
    const totalPriceEl = document.getElementById("total-price");

    const STEP = 1;

    const formatBR = (v) =>
      "R$ " +
      Number(v || 0)
        .toFixed(2)
        .replace(".", ",");

    function sanitizeQtyValue(raw) {
      let n = Number(raw);
      if (Number.isNaN(n)) n = 1;
      n = Math.trunc(n);
      n = Math.max(1, n);
      if (typeof product.stock === "number") {
        n = Math.min(n, product.stock);
      }
      return n;
    }

    function updateTotalFromQty() {
      const q = sanitizeQtyValue(qtyInput.value);
      qtyInput.value = q;
      totalPriceEl.innerText = formatBR((product.price || 0) * q);
    }

    function safeAddListener(el, ev, fn) {
      const mark = `listener_${ev}`;
      if (el.dataset[mark]) return;
      el.addEventListener(ev, fn);
      el.dataset[mark] = "1";
    }

    safeAddListener(qtyDec, "click", (e) => {
      e.preventDefault();
      const current = sanitizeQtyValue(qtyInput.value);
      qtyInput.value = Math.max(1, current - STEP);
      updateTotalFromQty();
    });

    safeAddListener(qtyInc, "click", (e) => {
      e.preventDefault();
      const current = sanitizeQtyValue(qtyInput.value);
      const max = typeof product.stock === "number" ? product.stock : 9999;
      qtyInput.value = Math.min(max, current + STEP);
      updateTotalFromQty();
    });

    safeAddListener(qtyInput, "input", () => {
      qtyInput.value = qtyInput.value.replace(/[^\d-]/g, "");
    });

    safeAddListener(qtyInput, "change", () => {
      updateTotalFromQty();
    });

    updateTotalFromQty();

    safeAddListener(addToCartBtn, "click", async () => {
      const token = await getAuthToken();
      if (!token) {
        alert("Você precisa estar logado para adicionar ao carrinho.");
        window.location.href = "/pages/login.html";
        return;
      }

      const quantity = sanitizeQtyValue(qtyInput.value);

      try {
        const res = await fetch(`${API_URL}/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity: quantity,
          }),
        });

        if (!res.ok) {
          console.error(await res.text());
          throw new Error("Erro ao adicionar ao carrinho");
        }

        const data = await res.json();

        if (data["status"] !== 0) {
          alert(data["message"]);
          return;
        }

        cartAlert.classList.remove("d-none", "fade");
        cartAlert.classList.add("show");
        setTimeout(() => {
          cartAlert.classList.remove("show");
          cartAlert.classList.add("fade");
          setTimeout(() => cartAlert.classList.add("d-none"), 300);
        }, 3000);
      } catch (err) {
        console.error(err);
        alert("Falha ao adicionar ao carrinho.");
      }
    });
  } catch (err) {
    console.error(err);
  }
});
