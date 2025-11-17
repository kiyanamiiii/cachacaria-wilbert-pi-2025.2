import { renderHeader } from "./header.js";
import { API_URL } from "./constants.js";

async function getUser() {
  const token = document.cookie
    .split("; ")
    .find((r) => r.startsWith("auth_token="))
    ?.split("=")[1];
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = await getUser();
  await renderHeader(user);
});
