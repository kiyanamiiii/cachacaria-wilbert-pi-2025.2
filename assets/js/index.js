const container = document.querySelector(".product-container");
const addBtn = document.getElementById("add-product-btn");

addBtn.addEventListener("click", () => {
  const template = container.querySelector(".product").cloneNode(true);

  const count = container.querySelectorAll(".product").length + 1;
  template.querySelector(".product-title").textContent = `[Produto ${count}]`;

  container.appendChild(template);
});
