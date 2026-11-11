import url from "../../../../api/url";
import { getCookie } from "cookies-next";
import { safeJsonParse } from "@/lib/safe-json";

const getToken = () =>
  getCookie("token") ||
  (typeof window !== "undefined" ? localStorage.getItem("token") : null);

const getEmpleadoId = () => {
  const empleado = safeJsonParse(getCookie("empleado"), null);
  if (empleado?.id_empleado) return empleado.id_empleado;
  const user = safeJsonParse(getCookie("user"), null);
  return user?.id_empleado || user?.empleado?.id_empleado || null;
};

const fetchApi = async (endpoint, method = "GET", body = null) => {
  const token = getToken();
  const response = await fetch(`${url}/api${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || `Error ${response.status}`);
    if (data.errors) error.errors = data.errors;
    throw error;
  }
  return data;
};

export const getProductos = async (page = 1, perPage = 6, searchTerm = "") => {
  try {
    const query = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });

    if (searchTerm.trim()) {
      query.set("search", searchTerm.trim());
    }

    const response = await fetchApi(`/productos?${query.toString()}`);
    // Laravel paginate() viene dentro de response.data
    const paginator = response.data || {};

    return {
      data: paginator.data || [],
      total: paginator.total || 0,
      lastPage: paginator.last_page || 1,
      currentPage: paginator.current_page || 1,
      perPage: paginator.per_page || perPage,
    };
  } catch (error) {
    console.error("Error en getProductos:", error);
    return { data: [], total: 0, lastPage: 1, currentPage: 1, perPage };
  }
};

export const createProducto = async (productoData) => {
  const id_empleado = getEmpleadoId();
  const payload = {
    nombre: productoData.nombre,
    descripcion: productoData.descripcion,
    estado: 1,
    ...(id_empleado ? { id_empleado } : {}),
  };

  return await fetchApi("/productos", "POST", payload);
};

export const updateProducto = async (id, productoData) => {
  const id_empleado = getEmpleadoId();
  const payload = {
    nombre: productoData.nombre,
    descripcion: productoData.descripcion,
    ...(productoData.estado !== undefined ? { estado: productoData.estado } : {}),
    ...(id_empleado ? { id_empleado } : {}),
  };

  return await fetchApi(`/productos/${id}`, "PUT", payload);
};
