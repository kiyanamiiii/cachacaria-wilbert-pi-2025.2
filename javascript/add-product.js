document.addEventListener("DOMContentLoaded", () => {
  console.log("add-product.js carregado");

  const form = document.getElementById("addProductForm");
  const feedback = document.getElementById("formResult");

  // Inputs
  const nameInput = document.getElementById("productName");
  const descInput = document.getElementById("productDescription");
  const priceInput = document.getElementById("productPrice");
  const imageInput = document.getElementById("productImage");
  const stockInput = document.getElementById("productStock");

  // Preview elements
  const previewName = document.getElementById("previewName");
  const previewDescription = document.getElementById("previewDescription");
  const previewPrice = document.getElementById("previewPrice");
  const previewImage = document.getElementById("previewImage");
  const previewStock = document.getElementById("previewStock");

  const DEFAULTS = {
    name: "[NAME]",
    description: "[DESC...]",
    price: "R$0.00",
    image: "https://placehold.co/1000x1000",
    stock: "0",
  };

  function formatPriceValue(value) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? `R$${n.toFixed(2)}` : DEFAULTS.price;
  }

  function formatStockValue(value) {
    const n = parseFloat(value);
    return Number.isFinite(n)
      ? Number.isInteger(n)
        ? String(n)
        : String(n)
      : DEFAULTS.stock;
  }

  // Preview updates
  if (nameInput && previewName) {
    nameInput.addEventListener("input", (e) => {
      previewName.textContent = e.target.value.trim() || DEFAULTS.name;
    });
  }

  if (descInput && previewDescription) {
    descInput.addEventListener("input", (e) => {
      previewDescription.textContent =
        e.target.value.trim() || DEFAULTS.description;
    });
  }

  if (priceInput && previewPrice) {
    priceInput.addEventListener("input", (e) => {
      previewPrice.textContent = formatPriceValue(e.target.value);
    });
  }

  if (stockInput && previewStock) {
    stockInput.addEventListener("input", (e) => {
      previewStock.textContent = formatStockValue(e.target.value);
    });
  }

  if (imageInput && previewImage) {
    imageInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          previewImage.src = evt.target.result || DEFAULTS.image;
        };
        reader.readAsDataURL(file);
      } else {
        previewImage.src = DEFAULTS.image;
      }
    });
  }

  // Form submit -> API
  if (form) {
    console.log("Formulário encontrado");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setFeedback("", "");

      const formData = new FormData(form);

      try {
        const response = await fetch("http://192.168.0.120:8080/products/add", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setFeedback("Produto adicionado com sucesso!", "green");
          form.reset();

          // Reset preview to defaults
          if (previewName) previewName.textContent = DEFAULTS.name;
          if (previewDescription)
            previewDescription.textContent = DEFAULTS.description;
          if (previewPrice) previewPrice.textContent = DEFAULTS.price;
          if (previewStock) previewStock.textContent = DEFAULTS.stock;
          if (previewImage) previewImage.src = DEFAULTS.image;
        } else {
          // Try to parse JSON error, fallback to generic message
          let errorText = "Erro ao adicionar produto.";
          try {
            const errorData = await response.json();
            errorText =
              errorData && errorData.message ? errorData.message : errorText;
          } catch {
            // ignore parse error
          }
          setFeedback(errorText, "red");
        }
      } catch (err) {
        console.error("Erro ao conectar:", err);
        setFeedback("Erro ao se conectar com o servidor.", "red");
      }
    });
  }
});
