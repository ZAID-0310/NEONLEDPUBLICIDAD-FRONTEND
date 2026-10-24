"use client";

import { useEffect, useState } from "react";
import Pagination1 from "../components/Pagination1";
import PaginationMobile from "../components/PaginationMobile";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import user_service from "../users/services/user.service";
import url from "../../../api/url";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Search,
  Eye,
  ToggleLeft,
  Trash2,
  Loader2,
  Filter,
  Download,
  RefreshCw,
  Contact,
  Mail,
  Phone,
  Package,
} from "lucide-react";
import auth_service from "../users/services/auth.service";
import Link from "next/link";
import { set } from "react-hook-form";

const API_BASE_URL = `${url}/api/modales`;
const PRODUCTOS_URL = `${url}/api/productos`;
const ITEMS_PER_PAGE = 5;

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || 1;
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingModals, setIsLoadingModals] = useState(false);
  const [productsById, setProductsById] = useState({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // PROBLEMA: fetchProducts solo cargaba la página 1 (7 productos).
  // Los productos del 8 al 15 no estaban en el mapa → mostraban "No asignado".
  //
  // SOLUCIÓN: Iterar todas las páginas hasta tener los 15 productos completos.
  // No requiere cambios en el backend.
  // ══════════════════════════════════════════════════════════════════════════════

  async function fetchProducts() {
    setIsLoadingProducts(true);
    try {
      const headers = { Authorization: `Bearer ${getCookie("token")}` };
      const map = {};
      let page = 1;
      let lastPage = 1;

      // Iterar todas las páginas hasta tener todos los productos
      do {
        const res = await axios.get(`${PRODUCTOS_URL}?page=${page}`, {
          headers,
        });
        const payload = res.data;

        // Soporta múltiples formas de respuesta paginada
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.data?.data)
              ? payload.data.data
              : Array.isArray(payload?.productos)
                ? payload.productos
                : [];

        // Extraer last_page de la respuesta paginada de Laravel
        const meta = payload?.data ?? payload;
        lastPage = meta?.last_page ?? meta?.meta?.last_page ?? 1;

        for (const p of list) {
          map[p.id_producto] = p.nombre;
        }

        page++;
      } while (page <= lastPage);

      setProductsById(map);
    } catch (error) {
      console.error("Error al obtener productos:", error?.message);
      setProductsById({});
    } finally {
      setIsLoadingProducts(false);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // NOTA: Con 15 productos y 7 por página son solo 3 peticiones al montar
  // la página de modales — completamente aceptable.
  // ══════════════════════════════════════════════════════════════════════════════

  async function fetchModals(page = 1, isManualRefresh = false) {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoadingModals(true);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}?page=${page}`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });

      const data = response.data.data;

      setData(data);
      setFilteredData(data);
      setTotalPages(response.data.last_page || 1); // importante
      setTotalRecords(response.data.total ?? data?.length ?? 0);
    } catch (error) {
      console.error(error);
    } finally {
      if (isManualRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoadingModals(false);
      }
    }
  }

  async function deleteModal(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });

      if (response.status === 200) {
        Swal.fire({
          title: "Eliminado",
          text: "El modal ha sido eliminado exitosamente.",
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchModals(currentPage);
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el modal.",
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
          deleteCookie("modal");
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
        deleteModal(id);
      }
    });
  }

  function confirmarCambiarEstado(id, nuevoEstado) {
    Swal.fire({
      title: `¿Cambiar estado de modal a ${nuevoEstado == 0 ? "Inactivo" : "Activo"}?`,
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
        { estado: nuevoEstado },
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
          text: `El estado del modal se cambio a ${nuevoEstado == 0 ? "Inactivo" : "Activo"}`,
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchModals(currentPage);
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo cambiar el estado del modal.",
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
          deleteCookie("modal");
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
        setCookie("modal", JSON.stringify(response.data.data), {
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
            text: "El modal no existe en la base de datos.",
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
          deleteCookie("modal");
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
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchModals(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (modal) =>
          modal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          modal.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          modal.id_modalservicio.toString().includes(searchTerm),
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

    const headers = [
      "ID",
      "Nombre",
      "Correo",
      "Telefono",
      "Estado",
      "Servicio Contratado",
    ];

    const csvData = filteredData.map((modal) => [
      modal.id_modalservicio,
      modal.nombre,
      modal.correo,
      productsById[modal.id_producto] || "No asignado",
      modal.estado ? "Activo" : "Inactivo",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modales.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Componente Card para móvil
  const ModalCard = ({ modal }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 rounded-full p-2 dark:bg-blue-900">
            <span className="font-bold text-blue-600 dark:text-blue-300 text-sm">
              #{modal.id_modalservicio}
            </span>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            modal.estado
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {modal.estado ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Nombre:
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {modal.nombre}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400 break-all">
            {modal.correo}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {modal.telefono}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Package size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Producto: {productsById[modal.id_producto] || "No asignado"}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => visualizar(modal.id_modalservicio)}
          title="Visualizar"
          className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:text-amber-400"
        >
          <Eye size={18} />
        </button>

        <Link href={`./mails?id_modal=${modal.id_modalservicio}`}>
          <button
            title="Emails y WhatsApp"
            className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:text-amber-400"
          >
            <Contact size={18} />
          </button>
        </Link>

        <button
          onClick={() =>
            confirmarCambiarEstado(
              modal.id_modalservicio,
              `${modal.estado ? 0 : 1}`,
            )
          }
          title={`Cambiar a ${modal.estado ? "Inactivo" : "Activo"}`}
          className={`p-2 rounded-lg transition-colors ${
            modal.estado
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
              : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
          }`}
        >
          <ToggleLeft size={18} />
        </button>

        {auth_service.hasRole("administrador") && (
          <button
            onClick={() => confirmarEliminacion(modal.id_modalservicio)}
            title="Eliminar"
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <main className="p-3 sm:p-4 md:p-6 flex flex-col w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 dark:bg-gray-800 dark:text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Gestión de Modales
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo o ID..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0d6fdc] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-100 transition-colors dark:bg-green-900/20 dark:text-green-400"
                title="Exportar a CSV"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              <button
                onClick={() => fetchModals(currentPage, true)}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400 ${
                  isRefreshing ? "opacity-70 cursor-not-allowed" : ""
                }`}
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

        {isLoadingModals ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-[#0d6fdc] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Cargando modales...</p>
          </div>
        ) : (
          <>
            {/* Vista de Cards para móvil (visible en pantallas < 768px) */}
            <div className="block md:hidden space-y-3">
              {filteredData.length > 0 ? (
                filteredData.map((modal) => (
                  <ModalCard key={modal.id_modalservicio} modal={modal} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Filter className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium mb-1">
                    No hay datos disponibles
                  </p>
                  {searchTerm && (
                    <p className="text-gray-400 text-sm">
                      No se encontraron resultados para "{searchTerm}"
                    </p>
                  )}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-3 text-[#0d6fdc] text-sm font-medium hover:underline"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              )}
            </div>
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
                    <th
                      scope="col"
                      className="px-6 py-4 text-left font-medium text-sm"
                    >
                      Correo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left font-medium text-sm"
                    >
                      Telefono
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left font-medium text-sm"
                    >
                      Producto de Contrato
                    </th>
                    <th className="px-6 py-4 text-center font-medium text-sm">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center font-medium text-sm">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.length > 0 ? (
                    filteredData.map((modal, index) => {
                      const iniciales =
                        (modal.nombre?.charAt(0) || "") +
                        (modal.apellido?.charAt(0) || "");

                      return (
                        <tr
                          key={`${modal.id_modalservicio}-Row`}
                          className={
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {modal.id_modalservicio}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-white text-xs font-medium">
                                  {iniciales || "U"}
                                </span>
                              </div>
                              <div className="text-gray-900 dark:text-white font-medium">
                                {modal.nombre} {modal.apellido || ""}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {modal.correo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {modal.telefono}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {isLoadingProducts
                              ? "Cargando..."
                              : productsById[modal.id_producto] ||
                                "No asignado"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                modal.estado
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {modal.estado ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() =>
                                  visualizar(modal.id_modalservicio)
                                }
                                title="Visualizar"
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                              >
                                <Eye size={16} />
                              </button>

                              <Link
                                href={`./mails?id_modal=${modal.id_modalservicio}`}
                                title="Emails y WhatsApp"
                                className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors flex items-center justify-center"
                              >
                                <Contact size={16} />
                              </Link>

                              <button
                                onClick={() =>
                                  confirmarCambiarEstado(
                                    modal.id_modalservicio,
                                    `${modal.estado ? 0 : 1}`,
                                  )
                                }
                                title={`Cambiar a ${modal.estado ? "Inactivo" : "Activo"}`}
                                className={`p-2 rounded-full transition-colors ${
                                  modal.estado
                                    ? "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                    : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                }`}
                              >
                                <ToggleLeft size={16} />
                              </button>

                              {auth_service.hasRole("administrador") && (
                                <button
                                  onClick={() =>
                                    confirmarEliminacion(modal.id_modalservicio)
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
                        colSpan="7"
                        className="px-6 py-16 text-center bg-white dark:bg-gray-900"
                      >
                        <div className="flex flex-col items-center">
                          <Filter className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                            No hay datos disponibles
                          </p>
                          {searchTerm && (
                            <>
                              <p className="text-gray-400 dark:text-gray-500 text-sm">
                                No se encontraron resultados para "{searchTerm}"
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

            {/* Paginación completa (tablet y escritorio) */}
            <div className="hidden md:block">
              <Pagination1
                filteredData={filteredData}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                entityName="modales"
                totalItems={
                  searchTerm.trim() !== "" ? filteredData.length : totalRecords
                }
              />
            </div>

            {/* Paginación compacta (móvil) */}
            {filteredData.length > 0 && (
              <div className="md:hidden mt-6">
                <PaginationMobile
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => router.push(`?page=${page}`)}
                  showingCount={filteredData.length}
                  totalCount={
                    searchTerm.trim() !== ""
                      ? filteredData.length
                      : totalRecords
                  }
                  entityName="modales"
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
