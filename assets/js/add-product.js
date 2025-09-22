document.addEventListener("DOMContentLoaded", () => {
  console.log("add-product.js carregado");

  const form = document.getElementById("addProductForm");
  const feedback = document.getElementById("formResult");

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
