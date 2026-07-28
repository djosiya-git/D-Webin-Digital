const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const TOKEN_KEY = "portfolio-auth-token";
const USER_KEY = "portfolio-auth-user";

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request gagal.");
  }

  return response.json();
}

export function getStoredSession() {
  const storedUser = localStorage.getItem(USER_KEY);
  const token = localStorage.getItem(TOKEN_KEY);

  if (!storedUser || !token) {
    return null;
  }

  return JSON.parse(storedUser);
}

export async function login(username, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } catch {
    // Session lokal tetap dibersihkan meskipun server sedang tidak aktif.
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function getProjects() {
  return request("/projects");
}

export function createProject(project) {
  return request("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
}

export function updateProject(projectId, project) {
  return request(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(project),
  });
}

export function deleteProject(projectId) {
  return request(`/projects/${projectId}`, { method: "DELETE" });
}

export function getMessages() {
  return request("/messages");
}

export function createMessage(message) {
  return request("/messages", {
    method: "POST",
    body: JSON.stringify(message),
  });
}

export function updateMessage(messageId, message) {
  return request(`/messages/${messageId}`, {
    method: "PUT",
    body: JSON.stringify(message),
  });
}

export function deleteMessage(messageId) {
  return request(`/messages/${messageId}`, { method: "DELETE" });
}

export function getContentItems(type) {
  return request(`/content/${type}`);
}

export function createContentItem(type, item) {
  return request(`/content/${type}`, {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export function updateContentItem(type, itemId, item) {
  return request(`/content/${type}/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(item),
  });
}

export function deleteContentItem(type, itemId) {
  return request(`/content/${type}/${itemId}`, { method: "DELETE" });
}

export function getSettings() {
  return request("/settings");
}

export function updateSettings(settings) {
  return request("/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}
