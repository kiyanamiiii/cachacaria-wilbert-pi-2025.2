// header.js
export async function renderHeader(user) {
  const header = document.createElement("header");
  header.className = "site-header";

  header.innerHTML = `
    <nav class="navbar navbar-expand-lg p-0" style="background: #4e2e1b">
      <div class="w-100 d-flex justify-content-between align-items-center py-2 px-0">
        <a class="d-flex align-items-center header-logo navbar-brand mb-0" href="/index.html">
          <img src="/assets/images/logoTemplate.png" alt="logo-cachacaria" class="logo-cachacaria"/>
          <span class="header-title ms-2">Cachaçaria Wilbert</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center">
            <li class="nav-item"><a class="nav-link text-white" href="/index.html">Home</a></li>
            <li class="nav-item"><a class="nav-link text-white" href="/pages/productsListPage.html">Produtos</a></li>
            <li class="nav-item" style="display: ${
              user ? "none" : "inline-block"
            }">
              <a class="nav-link text-white" href="/pages/register.html">Registrar</a>
            </li>
            <li class="nav-item"><a class="nav-link text-white" href="/pages/about.html">Sobre</a></li>
            <li class="nav-item" style="display: ${
              user?.is_adm ? "inline-block" : "none"
            }">
              <a class="nav-link text-white" href="/pages/addProductForm.html">Adicionar Produto</a>
            </li>
            <li class="nav-item" style="display: ${
              !user?.is_adm ? "inline-block" : "none"
            }">
              <a class="nav-link text-white" href="/pages/cart.html">Carrinho</a>
            </li>
            <li class="nav-item" style="display: ${
              user ? "inline-block" : "none"
            }">
              <a class="nav-link text-white" href="/pages/profile.html">Perfil</a>
            </li>
            <li class="nav-item" style="display: ${
              user ? "inline-block" : "none"
            }">
              <button class="btn btn-outline-light ms-2" id="logout-link">
                <i class="bi bi-box-arrow-right"></i> Sair
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `;

  document.getElementById("header-container").appendChild(header);

  // logout
  const logoutBtn = document.getElementById("logout-link");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      window.location.href = "/index.html";
    });
  }
}
