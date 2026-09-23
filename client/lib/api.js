const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("queueskip_token");
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("queueskip_token", token);
  else window.localStorage.removeItem("queueskip_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  listVehicles: () => request("/vehicles"),
  createVehicle: (payload) => request("/vehicles", { method: "POST", body: payload }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: "DELETE" }),

  issueToken: (vehicleId) => request("/queue/tokens", { method: "POST", body: { vehicleId } }),
  listTokens: () => request("/queue/tokens"),
  getToken: (id) => request(`/queue/tokens/${id}`),
  cancelToken: (id) => request(`/queue/tokens/${id}/cancel`, { method: "POST" }),
};
