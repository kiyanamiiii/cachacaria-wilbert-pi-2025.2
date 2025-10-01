async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (el) {
    try {
      const resp = await fetch(file);
      if (!resp.ok) throw new Error(`Erro ao carregar ${file}`);
      const html = await resp.text();
      el.innerHTML = html;
    } catch (err) {
      console.error(err);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadComponent("header-container", "/assets/components/header.html");
  loadComponent("footer-container", "/assets/components/footer.html");
});
