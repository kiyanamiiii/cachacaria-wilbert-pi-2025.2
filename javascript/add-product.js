document.addEventListener("DOMContentLoaded", () => {
  console.log("add-product.js carregado");

  const form = document.getElementById("addProductForm");
  const feedback = document.getElementById("formResult");

  // Pré-visualização dinâmica do produto
  const nameInput = document.getElementById("productName");
  const descInput = document.getElementById("productDescription");
  const priceInput = document.getElementById("productPrice");
  const imageInput = document.getElementById("productImage");

  const previewName = document.getElementById("previewName");
  const previewDescription = document.getElementById("previewDescription");
  const previewPrice = document.getElementById("previewPrice");
  const previewImage = document.getElementById("previewImage");

  if (nameInput && previewName) {
    nameInput.addEventListener("input", function (e) {
      previewName.textContent = e.target.value || "Nome do Produto";
    });
  }

  if (descInput && previewDescription) {
    descInput.addEventListener("input", function (e) {
      previewDescription.textContent =
        e.target.value || "Descrição do produto...";
    });
  }

  if (priceInput && previewPrice) {
    priceInput.addEventListener("input", function (e) {
      const value = e.target.value;
      previewPrice.textContent = value
        ? `R$${parseFloat(value).toFixed(2)}`
        : "R$0.00";
    });
  }

  if (imageInput && previewImage) {
    imageInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          previewImage.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        previewImage.src = "";
      }
    });
  }

  // Envio do formulário
  if (form) {
    console.log("Formulário encontrado");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);

      try {
        const response = await fetch("http://localhost:8080/products/add", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          feedback.textContent = "Produto adicionado com sucesso!";
          feedback.style.color = "green";
          form.reset();

          // Reset preview
          previewName.textContent = "Nome do Produto";
          previewDescription.textContent = "Descrição do produto...";
          previewPrice.textContent = "R$0.00";
          previewImage.src = "/assets/img/coqueiro.png";
        } else {
          const errorData = await response.json();
          feedback.textContent =
            errorData.message || "Erro ao adicionar produto.";
          feedback.style.color = "red";
        }
      } catch (err) {
        console.error("Erro ao conectar:", err);
        feedback.textContent = "Erro ao se conectar com o servidor.";
        feedback.style.color = "red";
      }
    });
  }
});
