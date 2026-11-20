"use client";
import url from "../../../../api/url";

const api_url = `${url}/api/empleados`;
const api_def = `${url}/api`;
import { getCookie } from "cookies-next";
import Swal from "sweetalert2";

const handlePermissionError = (response) => {
  if (response.status === 403) {
    Swal.fire({
      icon: "error",
      title: "Acceso denegado",
      text: "No tienes los permisos necesarios para realizar esta acción.",
      confirmButtonColor: "#6f4be8",
    });
    return true;
  }
  return false;
};

const empleado_service = {
  empleadosByPage: async (page, limit = 5) => {
    try {
      const response = await fetch(`${api_url}?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${getCookie("token")}`,
        },
      });

      if (!response.ok) {
        return { status: response.status, error: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      return { error: true, message: error.message };
    }
  },

  empleadoById: async (id) => {
    try {
      if (!id) {
        return { status: 400, error: true, message: "ID no proporcionado" };
      }

      const response = await fetch(`${api_url}/${id}`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${getCookie("token")}`,
        },
      });

      if (response.status === 500) {
        console.error("Error del servidor al obtener empleado:", id);
        return {
          status: 500,
          error: true,
          message: "Error interno del servidor",
        };
      }

      if (!response.ok) {
        return { status: response.status, error: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener empleado por ID:", error);
      return { error: true, message: error.message };
    }
  },

  create: async (form) => {
    try {
      const response = await fetch(`${api_url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          data.errors?.email?.[0] ||
          data.errors?.dni?.[0] ||
          data.errors?.telefono?.[0] ||
          data.errors?.apellido?.[0] ||
          data.errors?.nombre?.[0] ||
          data.message;
        return { status: response.status, error: true, message };
      }

      return data;
    } catch (error) {
      console.error("Error al crear empleado:", error);
      return { status: 500, error: true, message: error.message };
    }
  },

  update: async (form, id) => {
    try {
      const response = await fetch(`${api_url}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          data.errors?.email?.[0] ||
          data.errors?.dni?.[0] ||
          data.errors?.telefono?.[0] ||
          data.errors?.apellido?.[0] ||
          data.errors?.nombre?.[0] ||
          data.message;
        return { status: response.status, error: true, message };
      }
      return data;
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      return { status: 500, error: true, message: error.message };
    }
  },

  updatePass: async (form, id) => {
    try {
      const requestBody = { ...form };
      if (!requestBody.id) {
        requestBody.id = id;
      }

      //console.log('Enviando solicitud de cambio de contraseña:', requestBody);

      const response = await fetch(`${api_url}/pass/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify(requestBody),
      });

      //console.log('Respuesta del servidor (status):', response.status);

      return response;
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: true,
          message: "Error de conexión al servidor",
        }),
        { status: 500 },
      );
    }
  },

  verifyPassword: async (data) => {
    try {
      const response = await fetch(`${api_url}/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error("Error al verificar contraseña:", error);
      return new Response(
        JSON.stringify({
          error: true,
          message: "Error de conexión al servidor",
        }),
        { status: 500 },
      );
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${api_url}/${id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${getCookie("token")}`,
        },
      });

      // verifica permisos
      if (handlePermissionError(response)) {
        return { error: true, status: 403 };
      }

      // éxito
      if (!response.ok) {
        return { status: response.status, error: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      return { error: true, message: error.message };
    }
  },

  getRoles: async () => {
    try {
      const response = await fetch(`${api_def}/roles`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${getCookie("token")}`,
        },
      });

      if (!response.ok) {
        return { status: response.status, error: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener roles:", error);
      return { error: true, message: error.message };
    }
  },

    cambiarEstado: async (id, estado) => {
    try {
      const response = await fetch(`${api_url}/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify({ estado }),
      });

      if (handlePermissionError(response)) {
        return { error: true, status: 403 };
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          status: response.status,
          error: true,
          message: data.errors?.estado?.[0] || data.message,
        };
      }

      return data;
    } catch (error) {
      console.error("Error al cambiar estado del empleado:", error);
      return { status: 500, error: true, message: error.message };
    }
  },
};

export default empleado_service;
