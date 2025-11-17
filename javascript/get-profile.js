import { API_URL } from "./constants.js";

function getToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];
}

async function loadProfile() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) throw new Error("Erro ao carregar perfil");

    const data = await response.json();

    document.getElementById("email").value = data.email || "";
    document.getElementById("phone").value = data.phone || "";
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    alert("Não foi possível carregar as informações do perfil.");
  }
}

async function saveProfile(event) {
  event.preventDefault();

  const updatedData = {
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
  };

  try {
    const response = await fetch(`${API_URL}/user/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) throw new Error("Erro ao salvar");

    alert("Perfil atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    alert("Não foi possível salvar as mudanças.");
  }
}

async function updatePassword(event) {
  event.preventDefault();

  const passwordData = {
    password: document.getElementById("current-password").value,
    new_password: document.getElementById("new-password").value,
    new_password_confirmation: document.getElementById("confirm-password").value,
  };

  try {
    const response = await fetch(`${API_URL}/auth/changePassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) throw new Error("Erro ao atualizar senha");

    const data = await response.json();

    if (data["status"] != 0) {
      alert(data["message"] || "Erro ao atualizar senha.");
      return;
    }

    alert("Senha atualizada com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    alert("Não foi possível atualizar a senha.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();

  // Form de dados do perfil
  document
    .getElementById("profile-form")
    ?.addEventListener("submit", saveProfile);

  // Form de atualizar senha
  document
    .getElementById("password-form")
    ?.addEventListener("submit", updatePassword);
});
