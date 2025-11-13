import { API_URL } from "./constants.js";

// Função para carregar o perfil do usuário
async function loadProfile() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("auth_token="))
            ?.split("=")[1]
        }`,
      },
    });
    if (!response.ok) {
      throw new Error("Erro ao carregar perfil");
    }
    const data = await response.json();

    // Preencher os campos do formulário com os dados recebidos
    document.getElementById("email").value = data.email || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("password").value = data.password || "";
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    alert("Não foi possível carregar as informações do perfil.");
  }
}

// Função para salvar as mudanças do perfil
async function saveProfile(event) {
  event.preventDefault(); // Impede o envio do formulário

  const updatedData = {
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    password: document.getElementById("password").value,
  };

  try {
    const response = await fetch(`${API_URL}/user/`, {
      method: "PUT", // Método HTTP para atualizar
      headers: {
        authorization: `Bearer ${
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("auth_token="))
            ?.split("=")[1]
        }`,
      },
      body: JSON.stringify(updatedData), // Envia os dados atualizados
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar as mudanças");
    }

    alert("Perfil atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    alert("Não foi possível salvar as mudanças.");
  }
}

// Função para configurar o comportamento do botão "Salvar mudanças"
document.addEventListener("DOMContentLoaded", () => {
  loadProfile(); // Carrega o perfil quando a página for carregada

  // Event listener para o botão "Salvar mudanças"
  const form = document.querySelector("form");
  form.addEventListener("submit", saveProfile);
});
