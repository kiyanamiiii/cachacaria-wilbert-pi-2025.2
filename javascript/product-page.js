document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id") || 1;

  async function fetchImageBlob(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Não foi possível carregar a imagem");
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return "/assets/img/default.png"; // fallback
    }
  }

  try {
    const res = await fetch(`http://192.168.0.120:8080/products/${productId}`);
    if (!res.ok) throw new Error("Erro ao carregar produto");

    const product = await res.json();

    // Dados do produto
    document.getElementById("page-title").innerText = product.name;
    document.getElementById("product-name").innerText = product.name;
    document.getElementById("product-description").innerText =
      product.description || "";
    1;
    document.getElementById("product-price").innerText =
      "R$ " + product.price.toFixed(2);
    document.getElementById("product-stock").innerText =
      product.stock > 0 ? "Em estoque" : "Indisponível";

    const mainImage = document.getElementById("main-image");
    if (product.photos && product.photos.length > 0) {
      mainImage.src = await fetchImageBlob(
        `http://192.168.0.120:8080/images/${product.photos[0]}`
      );
    } else {
      mainImage.src = "/assets/img/default.png";
    }

    // Miniaturas
    const thumbsContainer = document.getElementById("thumbnails");
    thumbsContainer.innerHTML = "";
    if (product.photos && product.photos.length > 0) {
      for (let photo of product.photos) {
        const img = document.createElement("img");
        img.src = await fetchImageBlob(
          `http://192.168.0.120:8080/images/${photo}`
        );
        img.classList.add("img-fluid", "rounded", "thumb-img");
        img.alt = product.name;
        img.addEventListener("click", () => (mainImage.src = img.src));
        thumbsContainer.appendChild(img);
      }
    }

    // Carrinho
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    const cartAlert = document.getElementById("cart-alert");

    addToCartBtn.addEventListener("click", () => {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const imageUrl = `http://192.168.0.120:8080/images/${product.photos[0]}`; // Direct URL
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        qty: 1,
        image: imageUrl, // Store the direct URL
      });
      localStorage.setItem("cart", JSON.stringify(cart));

      cartAlert.classList.remove("d-none", "fade");
      cartAlert.classList.add("show");
      setTimeout(() => {
        cartAlert.classList.remove("show");
        cartAlert.classList.add("fade");
        setTimeout(() => cartAlert.classList.add("d-none"), 300);
      }, 3000);
    });
  } catch (err) {
    console.error(err);
  }
});
