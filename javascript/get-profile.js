import { API_URL } from "./constants.js";

// Função para carregar o perfil do usuário
async function loadProfile() {
  try {
    const response = await fetch(`${API_URL}/auth/me`);
    if (!response.ok) {
      throw new Error("Erro ao carregar perfil");
    }
    const data = await response.json();

    // Preencher os campos do formulário com os dados recebidos
    document.getElementById("email").value = data.email || "";
    document.getElementById("cpf").value = data.cpf || "";
    document.getElementById("telefone").value = data.telefone || "";
    document.getElementById("senha").value = data.senha || "";

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
    cpf: document.getElementById("cpf").value,
    telefone: document.getElementById("telefone").value,
    senha: document.getElementById("senha").value
  };

  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: "PUT", // Método HTTP para atualizar
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData) // Envia os dados atualizados
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
