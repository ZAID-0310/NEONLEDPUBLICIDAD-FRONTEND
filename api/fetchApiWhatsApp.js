import { getCookie } from "cookies-next";
import { safeJsonParse } from "@/lib/safe-json";

// ✅ Laravel (campañas, BD, etc.)
const API_URL =
  process.env.NEXT_PUBLIC_API_URL_PROD || process.env.NEXT_PUBLIC_API_URL_DEV;

// ✅ WhatsApp-service (Node + Baileys)
const WS_URL =
  process.env.NEXT_PUBLIC_API_URL_WHATSAPP_PROD ||
  process.env.NEXT_PUBLIC_API_URL_WHATSAPP_DEV;

/**
 * ✅ Request hacia Laravel
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getCookie("token") || localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${cleanEndpoint}`;

  //console.log(`📡 (Laravel) ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();

  if (!contentType.includes("application/json")) {
    console.error(
      `Respuesta no es JSON de ${url}. Tipo: ${contentType}. Inicio: ${raw.substring(0, 120)}`,
    );
    return { success: response.ok, text: raw, status: response.status };
  }

  return safeJsonParse(raw, {
    success: response.ok,
    status: response.status,
    error: "JSON inválido en respuesta de Laravel",
    text: raw,
  });
};

/**
 * ✅ Helper interno para requests al WhatsApp-service
 */
const wsRequest = async (endpoint, options = {}) => {
  const token = getCookie("token") || localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${WS_URL}${cleanEndpoint}`;

  //console.log(`📡 (WS) ${url}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text();

  if (!contentType.includes("application/json")) {
    console.error(
      `Respuesta no es JSON de ${url}. Tipo: ${contentType}. Inicio: ${raw.substring(0, 120)}`,
    );
    return { success: res.ok, text: raw, status: res.status };
  }

  return safeJsonParse(raw, {
    success: res.ok,
    status: res.status,
    error: "JSON inválido en respuesta de WhatsApp service",
    text: raw,
  });
};

export const whatsappApi = {
  // ✅ Genera/renueva QR (tu router lo expone como /api/whatsapp/restart)
  restart: async () => {
    return wsRequest("/api/whatsapp/restart", { method: "POST" });
  },

  // ✅ Alternativa directa para pedir QR
  requestNewQr: async () => {
    return wsRequest("/api/whatsapp/qr-request", { method: "POST" });
  },

  // ✅ Estado de conexión
  getStatus: async () => {
    return wsRequest("/api/whatsapp/status", { method: "GET" });
  },

  // ✅ Estado del QR (si lo usas)
  getQrStatus: async () => {
    return wsRequest("/api/whatsapp/qr-status", { method: "GET" });
  },
};

// ─── POP-UPS agregamos esto ─────────────────────────────────────────────
export const popupApi = {
  // Productos (para el selector)
  getProductos: () =>
    apiRequest("/api/productos/activos-selector", { method: "GET" }),

  // Popup Configs
  getAll: () => apiRequest("/api/popup-configs", { method: "GET" }),

  getByProducto: (idProducto) =>
    apiRequest(`/api/popup-configs/producto/${idProducto}`, { method: "GET" }),

  create: (formData) =>
    apiRequest("/api/popup-configs", { method: "POST", body: formData }),

  update: (id, formData) =>
    apiRequest(`/api/popup-configs/${id}/actualizar`, {
      method: "POST",
      body: formData,
    }),

  destroy: (id) => apiRequest(`/api/popup-configs/${id}`, { method: "DELETE" }),
};
