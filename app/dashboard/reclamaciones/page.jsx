"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import user_service from "../users/services/user.service";
import Swal from "sweetalert2";
import auth_service from "../users/services/auth.service";
import {
  Search,
  Eye,
  CheckCircle,
  Trash2,
  Loader2,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Hash,
  User,
  Mail,
} from "lucide-react";
import Pagination1 from "../components/Pagination1";

import url from "../../../api/url";

const API_BASE_URL = `${url}/api/reclamaciones`;

export default function Page() {
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || 1;
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 700);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  async function fetchReclamacion() {
    setIsRefreshing(true);
    let page = 1;
    let allData = [];
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        const response = await axios.get(`${API_BASE_URL}?page=${page}`, {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        });

        if (response.data.data.length === 0) {
          hasMorePages = false;
          break;
        }

        allData = [...allData, ...response.data.data];
        page++;
      } catch (error) {
        hasMorePages = false;
        console.error("Error al obtener los datos:", error.message);

        if (error.response && error.response.status === 401) {
          Swal.fire({
            title: "Sesión Expirada",
            text: "Por favor, inicia sesión nuevamente.",
            icon: "warning",
            confirmButtonText: "OK",
          }).then(() => {
            deleteCookie("reclamacion");
            user_service.logoutClient(router);
          });
        }
      }
    }

    setData(allData);
    setFilteredData(allData);
    setTotalPages(Math.ceil(allData.length / 4));
    setIsLoading(false);
    setIsRefreshing(false);
  }

  async function deleteReclamacion(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });

      if (response.status === 200) {
        Swal.fire({
          title: "Eliminado",
          text: "La reclamación ha sido eliminada exitosamente.",
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchReclamacion(currentPage);
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar la reclamación.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Swal.fire({
          title: "Sesión Expirada",
          text: "Por favor, inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => {
          deleteCookie("reclamacion");
          user_service.logoutClient(router);
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error inesperado.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  }

  function confirmarEliminacion(id) {
    Swal.fire({
      title: "¿Estás seguro en eliminar este registro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteReclamacion(id);
      }
    });
  }

  function confirmarCambiarEstado(id, nuevoEstado) {
    Swal.fire({
      title: `¿Cambiar estado de reclamación a ${nuevoEstado}?`,
      text: "¡Puedes cambiarlo después nuevamente!",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        cambiarEstado(id, nuevoEstado);
      }
    });
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${id}`,
        { estadoReclamo: nuevoEstado },
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );
      if (response.status === 200) {
        Swal.fire({
          title: "Estado Cambiado",
          text: `El estado de la reclamación se cambió a ${nuevoEstado}`,
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchReclamacion(currentPage);
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo cambiar el estado de la reclamación",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Swal.fire({
          title: "Sesión Expirada",
          text: "Por favor, inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => {
          deleteCookie("reclamacion");
          user_service.logoutClient(router);
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error inesperado.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  }

  async function visualizar(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      if (response.status === 200 && response.data) {
        setCookie("reclamacion", JSON.stringify(response.data.data), {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
        router.push(`./view/`);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          Swal.fire({
            title: "No Encontrado",
            text: "La reclamación no existe",
            icon: "warning",
            confirmButtonText: "OK",
          });
        } else if (error.response.status === 401) {
          Swal.fire({
            title: "Sesión Expirada",
            text: "Por favor, inicia sesión nuevamente.",
            icon: "warning",
            confirmButtonText: "OK",
          });
          deleteCookie("reclamacion");
          router.push("/login");
        } else {
          Swal.fire({
            title: "Error",
            text: "Ocurrió un error al obtener los datos.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } else {
        Swal.fire({
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  }

  useEffect(() => {
    fetchReclamacion(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (reclamacion) =>
          (reclamacion.nombre &&
            reclamacion.nombre
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (reclamacion.apellido &&
            reclamacion.apellido
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (reclamacion.email &&
            reclamacion.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (reclamacion.id_reclamacion &&
            reclamacion.id_reclamacion.toString().includes(searchTerm)),
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, data]);

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      Swal.fire({
        title: "Sin datos",
        text: "No hay datos para exportar",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    // Crear encabezados CSV
    const headers = ["ID", "Nombre", "Apellido", "Correo", "Estado"];

    // Convertir datos a formato CSV
    const csvData = filteredData.map((reclamacion) => [
      reclamacion.id_reclamacion,
      reclamacion.nombre,
      reclamacion.apellido,
      reclamacion.email,
      reclamacion.estadoReclamo,
    ]);

    // Combinar encabezados y datos
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "reclamaciones.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ReclamacionCard = ({ reclamacion }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 rounded-full p-2 dark:bg-blue-900">
            <Hash size={16} className="text-blue-600 dark:text-blue-300" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">
            #{reclamacion.id_reclamacion}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            reclamacion.estadoReclamo === "ATENDIDO"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          }`}
        >
          {reclamacion.estadoReclamo === "ATENDIDO" ? (
            <CheckCircle size={12} />
          ) : (
            <AlertCircle size={12} />
          )}
          {reclamacion.estadoReclamo}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Nombre:</span> {reclamacion.nombre}{" "}
            {reclamacion.apellido}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300 break-all">
            <span className="font-medium">Email:</span> {reclamacion.email}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => visualizar(reclamacion.id_reclamacion)}
          title="Visualizar"
          className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30"
        >
          <Eye size={18} />
        </button>

        <button
          onClick={() =>
            confirmarCambiarEstado(
              reclamacion.id_reclamacion,
              reclamacion.estadoReclamo === "PENDIENTE"
                ? "ATENDIDO"
                : "PENDIENTE",
            )
          }
          title={`Cambiar a ${
            reclamacion.estadoReclamo === "PENDIENTE" ? "ATENDIDO" : "PENDIENTE"
          }`}
          className={`p-2 rounded-lg transition-colors ${
            reclamacion.estadoReclamo === "PENDIENTE"
              ? "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
              : "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
          }`}
        >
          <CheckCircle size={18} />
        </button>

        {auth_service.hasRole("administrador") && (
          <button
            onClick={() => confirmarEliminacion(reclamacion.id_reclamacion)}
            title="Eliminar"
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );

  const paginatedData = filteredData.slice(
    (Number(currentPage) - 1) * 4,
    Number(currentPage) * 4,
  );

  return (
    <main className="p-4 md:p-6 flex flex-col w-full h-[100vh] bg-gray-50 dark:bg-gray-900">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 dark:bg-gray-800 dark:text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white ">
            Gestión de Reclamaciones
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo o ID..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8c52ff] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                title="Exportar a CSV"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              <button
                onClick={() => fetchReclamacion()}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors ${isRefreshing ? "opacity-70 cursor-not-allowed" : ""}`}
                title="Actualizar datos"
              >
                {isRefreshing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-[#8c52ff] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">
              Cargando reclamaciones...
            </p>
          </div>
        ) : (
          <>
            {/* Cards en móvil, Tabla en desktop */}
            {isMobile ? (
              <div className="space-y-3">
                {paginatedData.length > 0 ? (
                  paginatedData.map((reclamacion) => (
                    <ReclamacionCard
                      key={reclamacion.id_reclamacion}
                      reclamacion={reclamacion}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Filter className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium mb-1">
                      No hay reclamaciones disponibles
                    </p>
                    {searchTerm && (
                      <p className="text-gray-400 text-sm">
                        No se encontraron resultados para "{searchTerm}"
                      </p>
                    )}
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-3 text-[#8c52ff] text-sm font-medium hover:underline"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="block w-full overflow-x-auto">
                {/* Vista de Tabla para desktop (visible en pantallas ≥ 768px) */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-medium text-sm">
                          ID
                        </th>
                        <th className="px-6 py-4 text-left font-medium text-sm">
                          Nombres
                        </th>
                        <th className="px-6 py-4 text-left font-medium text-sm hidden sm:table-cell">
                          Correo
                        </th>
                        <th className="px-6 py-4 text-left font-medium text-sm">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-center font-medium text-sm">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((reclamacion, index) => {
                          const iniciales =
                            (reclamacion.nombre?.charAt(0) || "") +
                            (reclamacion.apellido?.charAt(0) || "");

                          return (
                            <tr
                              key={reclamacion.id_reclamacion}
                              className={
                                index % 2 === 0
                                  ? "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {reclamacion.id_reclamacion}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-medium">
                                      {iniciales || "U"}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {reclamacion.nombre}{" "}
                                      {reclamacion.apellido}
                                    </div>
                                    <div className="text-xs text-gray-500 sm:hidden mt-0.5">
                                      {reclamacion.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                                {reclamacion.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-left">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    reclamacion.estadoReclamo === "ATENDIDO"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                  }`}
                                >
                                  {reclamacion.estadoReclamo === "ATENDIDO" ? (
                                    <CheckCircle size={12} />
                                  ) : (
                                    <AlertCircle size={12} />
                                  )}
                                  {reclamacion.estadoReclamo}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <div className="flex justify-center gap-1">
                                  <button
                                    onClick={() =>
                                      visualizar(reclamacion.id_reclamacion)
                                    }
                                    title="Visualizar"
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                  >
                                    <Eye size={16} />
                                  </button>

                                  <button
                                    onClick={() =>
                                      confirmarCambiarEstado(
                                        reclamacion.id_reclamacion,
                                        reclamacion.estadoReclamo ===
                                          "PENDIENTE"
                                          ? "ATENDIDO"
                                          : "PENDIENTE",
                                      )
                                    }
                                    title={`Cambiar a ${
                                      reclamacion.estadoReclamo === "PENDIENTE"
                                        ? "ATENDIDO"
                                        : "PENDIENTE"
                                    }`}
                                    className={`p-2 rounded-full transition-colors ${
                                      reclamacion.estadoReclamo === "PENDIENTE"
                                        ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                    }`}
                                  >
                                    <CheckCircle size={16} />
                                  </button>

                                  {auth_service.hasRole("administrador") && (
                                    <button
                                      onClick={() =>
                                        confirmarEliminacion(
                                          reclamacion.id_reclamacion,
                                        )
                                      }
                                      title="Eliminar"
                                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-16 text-center bg-white dark:bg-gray-900"
                          >
                            <div className="flex flex-col items-center">
                              <Filter className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                                No hay reclamaciones disponibles
                              </p>
                              {searchTerm && (
                                <>
                                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                                    No se encontraron resultados para "
                                    {searchTerm}"
                                  </p>
                                  <button
                                    onClick={() => setSearchTerm("")}
                                    className="mt-3 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                                  >
                                    Limpiar búsqueda
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Pagination1
              filteredData={filteredData}
              currentPage={currentPage}
              totalPages={totalPages}
              entityName="reclamaciones"
            />
          </>
        )}
      </div>
    </main>
  );
}
