import { API_URL } from "./constants.js";

function getToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];
}

function showFeedback(id, message, isSuccess = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.style.color = isSuccess ? "green" : "red";
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
    showFeedback(
      "profile-feedback",
      "Não foi possível carregar as informações do perfil.",
      false
    );
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

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showFeedback(
        "profile-feedback",
        `Erro: ${data.message || "erro desconhecido"}`,
        false
      );
      return;
    }

    if (data["status"] != 0) {
      showFeedback(
        "profile-feedback",
        data.message || "Erro ao salvar perfil.",
        false
      );
      return;
    }

    showFeedback("profile-feedback", "Perfil atualizado com sucesso!", true);
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    showFeedback(
      "profile-feedback",
      "Não foi possível salvar as mudanças.",
      false
    );
  }
}

async function updatePassword(event) {
  event.preventDefault();

  const passwordData = {
    password: document.getElementById("current-password").value,
    new_password: document.getElementById("new-password").value,
    new_password_confirmation:
      document.getElementById("confirm-password").value,
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

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showFeedback(
        "password-feedback",
        `Erro: ${data.message || "erro desconhecido"}`,
        false
      );
      return;
    }

    if (data["status"] != 0) {
      showFeedback(
        "password-feedback",
        data.message || "Erro ao atualizar senha.",
        false
      );
      return;
    }

    showFeedback("password-feedback", "Senha atualizada com sucesso!", true);
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    showFeedback(
      "password-feedback",
      "Não foi possível atualizar a senha.",
      false
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();

  document
    .getElementById("profile-form")
    ?.addEventListener("submit", saveProfile);

  document
    .getElementById("password-form")
    ?.addEventListener("submit", updatePassword);
});
