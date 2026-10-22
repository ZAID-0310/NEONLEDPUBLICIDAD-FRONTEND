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
  ToggleLeft,
  Trash2,
  Loader2,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Pagination1 from "../components/Pagination1";

import url from "../../../api/url";

const URL_API = `${url}/api/contactanos`;
const ITEMS_PER_PAGE = 5;

export default function Page() {
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || 1;
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  async function fetchContacts() {
    setIsRefreshing(true);
    let page = 1;
    let allData = [];
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        const response = await axios.get(`${URL_API}?page=${page}`, {
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
            deleteCookie("contacto");
            user_service.logoutClient(router);
          });
        }
      }
    }

    setData(allData);
    setFilteredData(allData);
    setTotalPages(Math.ceil(allData.length / ITEMS_PER_PAGE));
    setIsLoading(false);
    setIsRefreshing(false);
  }

  function formatearFecha(fecha) {
  if (!fecha) return "-";
  const fechaTexto = String(fecha).replace("T", " ");
  const [parteFecha, parteHora] = fechaTexto.split(" ");

  if (!parteFecha) return "-";
  const [anio, mes, dia] = parteFecha.split("-");

  if (!anio || !mes || !dia) return fecha;
  const hora = parteHora ? parteHora.substring(0, 5) : "";

  return `${dia}/${mes}/${anio}${hora ? ` ${hora}` : ""}`;
}


  async function deleteContact(id) {
    try {
      const response = await axios.delete(`${URL_API}/${id}`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });

      if (response.status === 200) {
        Swal.fire({
          title: "Eliminado",
          text: "El mensaje ha sido eliminado exitosamente.",
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchContacts(currentPage);
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el mensaje.",
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
          deleteCookie("contacto");
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
        deleteContact(id);
      }
    });
  }

  function confirmarCambiarEstado(id, nuevoEstado) {
    Swal.fire({
      title: `¿Cambiar estado de mensaje a ${nuevoEstado == 0 ? "Pendiente" : "Atendido"}?`,
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
        `${URL_API}/${id}`,
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
          text: `El estado del mensaje se cambio a ${nuevoEstado == 0 ? "Pendiente" : "Atendido"}`,
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchContacts(currentPage);
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo cambiar el estado del mensaje.",
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
          deleteCookie("contacto");
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
      const response = await axios.get(`${URL_API}/${id}`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      if (response.status === 200 && response.data) {
        setCookie("contacto", JSON.stringify(response.data.data), {
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
            text: "El contacto no existe en la base de datos.",
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
          deleteCookie("contacto");
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
    fetchContacts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const termino = searchTerm.toLowerCase();  

      const filtered = data.filter((contacto) =>
        `${contacto.nombre || ""} ${contacto.apellido || ""}`
          .toLowerCase()
          .includes(termino) ||
        String(contacto.detalle_reclamacion || "")
          .toLowerCase()
          .includes(termino) ||
        String(contacto.id_contactanos || "").includes(termino)
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
      "Fecha",
      "Cliente",
      "Motivo de contacto",
      "Mensaje",
      "Estado",
    ];

    const csvData = filteredData.map((contacto) => [
      contacto.id_contactanos,
      contacto.fecha,
      `${contacto.nombre || ""} ${contacto.apellido || ""}`.trim(),
      contacto.detalle_reclamacion  || "-",
      contacto.mensaje || "-",
      contacto.estado ? "Atendido" : "Pendiente",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "contactos.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ContactCard = ({ contacto }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 rounded-full p-2 dark:bg-blue-900">
            <span className="font-bold text-blue-600 dark:text-blue-300 text-sm">
              #{contacto.id_contactanos}
            </span>
          </div>
        </div>

        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            contacto.estado
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}
        >
          {contacto.estado ? "Atendido" : "Pendiente"}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Cliente:</span>{" "}
            {contacto.nombre} {contacto.apellido}
          </span>
        </div>

        <div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Fecha
          </span>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {formatearFecha(contacto.fecha_hora)}
          </p>
        </div>

        <div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Motivo de contacto
          </span>

          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {contacto.detalle_reclamacion || "-"}
          </p>
        </div>

        <div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Mensaje
          </span>

          <p className="text-sm text-gray-700 dark:text-gray-200 break-words">
            {contacto.mensaje || "-"}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        {/* Visualizar */}
        <button
          onClick={() => visualizar(contacto.id_contactanos)}
          title="Visualizar"
          className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:text-amber-400"
        >
          <Eye size={18} />
        </button>

        {/* Cambiar estado */}
        <button
          onClick={() =>
            confirmarCambiarEstado(
              contacto.id_contactanos,
              contacto.estado ? 0 : 1
            )
          }
          title={`Cambiar a ${
            contacto.estado ? "Pendiente" : "Atendido"
          }`}
          className={`p-2 rounded-lg transition-colors ${
            contacto.estado
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
              : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
          }`}
        >
          <ToggleLeft size={18} />
        </button>

        {/* Eliminar */}
        {auth_service.hasRole("administrador") && (
          <button
            onClick={() =>
              confirmarEliminacion(contacto.id_contactanos)
            }
            title="Eliminar"
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );

  const paginatedData = filteredData.slice(
    (Number(currentPage) - 1) * ITEMS_PER_PAGE,
    Number(currentPage) * ITEMS_PER_PAGE,
  );

  return (
    <main className="p-3 sm:p-4 md:p-6 flex flex-col w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 dark:bg-gray-800 dark:text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Gestión de Mensajes de Contacto
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, motivo o ID..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8c52ff] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                onClick={() => fetchContacts()}
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-[#0d6fdc] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Cargando contactos...</p>
          </div>
        ) : (
          <>
            {/* Cards para móvil (block en móvil, hidden en desktop) */}
            <div className="block md:hidden space-y-3">
              {paginatedData.length > 0 ? (
                paginatedData.map((contacto) => (
                  <ContactCard
                    key={contacto.id_contactanos}
                    contacto={contacto}
                  />
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

            {/* Tabla para desktop (hidden en móvil, block en desktop) */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0d6fdc] dark:bg-[#2563eb]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Fecha y hora
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Motivo de contacto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Mensaje
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((contacto) => (
                      <tr
                        key={contacto.id_contactanos}
                        className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800 dark:text-white"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {contacto.id_contactanos}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-white">
                          {formatearFecha(contacto.fecha_hora)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-white">
                          {contacto.nombre} {contacto.apellido}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {contacto.detalle_reclamacion || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 dark:text-white max-w-xs">
                          <span
                            className="block truncate"
                            title={contacto.mensaje || ""}
                          >
                            {contacto.mensaje || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-left">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contacto.estado
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {contacto.estado ? "Atendido" : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                visualizar(contacto.id_contactanos)
                              }
                              title="Visualizar"
                              className="p-1.5 bg-amber-50 text-[#0d6fdc] rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() =>
                                confirmarCambiarEstado(
                                  contacto.id_contactanos,
                                  contacto.estado ? 0 : 1,
                                )
                              }
                              title={`Cambiar a ${contacto.estado ? "Pendiente" : "Atendido"}`}
                              className={`p-1.5 rounded-lg transition-colors ${
                                contacto.estado
                                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                            >
                              <ToggleLeft size={18} />
                            </button>
                            {auth_service.hasRole("administrador") && (
                              <button
                                onClick={() =>
                                  confirmarEliminacion(contacto.id_contactanos)
                                }
                                title="Eliminar"
                                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
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
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination1
              filteredData={filteredData}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )}
      </div>
    </main>
  );
}
