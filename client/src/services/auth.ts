import api from "./api";

export async function loginWithGoogle(id_token: string) {
  const res = await api.post("api/auth/google", { id_token });
  return res.data;
}

export async function loginWithEmail(email: string, password: string) {
  const res = await api.post("api/auth/login", { email, password });
  return res.data;
}

export async function refreshAccessToken() {
  const res = await api.post("api/auth/refresh");
  return res.data.accessToken;
}

export async function logout() {
  await api.post("api/auth/logout");
}
