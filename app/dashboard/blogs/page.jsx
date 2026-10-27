"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import Swal from "sweetalert2";
import axios from "axios";
import Link from "next/link";
import { getCookie } from "cookies-next";
import HistorialAuditoria from "./components/HistorialAuditoria";
import { useAuth } from "../../context/AutContext";
import Borradores from "./borradores/page";
import url from "../../../api/url";
import { safeJsonParse } from "@/lib/safe-json";
import {
  Search,
  Eye,
  Trash2,
  Loader2,
  Filter,
  RefreshCw,
  Pencil,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  X,
  PlusCircleIcon,
  History,
  FilePen,
} from "lucide-react";
import auth_service from "../users/services/auth.service";

export default function Page() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [displayedBlogs, setDisplayedBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce de 300ms

  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [page, setPage] = useState(1);
  const blogsPerPage = 5;

  const empleadoCookie = safeJsonParse(getCookie("empleado"), null);
  const id_empleado = empleadoCookie?.id_empleado ?? -1;
  const { isAuthenticated, user, hasPermission } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (user === null) return; // Espera a que se cargue el usuario

    if (!hasPermission("ver-blogs")) {
      Swal.fire({
        title: "Acceso denegado",
        text: "No tienes permisos para ver esta sección",
        icon: "error",
        confirmButtonText: "Aceptar",
      }).then(() => {
        router.replace("/dashboard/main");
      });
    } else {
      fetchData(); // Solo ejecuta si tiene permiso
    }
  }, [user]);

  useEffect(() => {
    filterBlogs();
  }, [activeFilter, debouncedSearchQuery, allBlogs, myBlogs]);

  useEffect(() => {
    paginateBlogs();
  }, [filteredBlogs, currentPage]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const goTo = (page) => {
    const pageNumber = Number(page);

    if (
      Number.isInteger(pageNumber) &&
      pageNumber >= 1 &&
      pageNumber <= totalPages
    ) {
      setCurrentPage(pageNumber);
      setPageInput(String(pageNumber));
    }
  };

  const filterBlogs = () => {
    const sourceData = activeFilter === "all" ? allBlogs : myBlogs;

    if (!debouncedSearchQuery.trim()) {
      setFilteredBlogs(sourceData);
      setCurrentPage(1);
      return;
    }

    // Validar mínimo 3 caracteres antes de filtrar
    if (debouncedSearchQuery.trim().length < 3) {
      setFilteredBlogs([]);
      setCurrentPage(1);
      return;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    const filtered = sourceData.filter((blog) =>
      blog.titulo.toLowerCase().includes(query),
    );

    setFilteredBlogs(filtered);
    setCurrentPage(1);
  };

  const paginateBlogs = () => {
    const startIndex = (currentPage - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;
    setDisplayedBlogs(filteredBlogs.slice(startIndex, endIndex));
  };

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredBlogs.length / blogsPerPage));
  }, [filteredBlogs]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  async function fetchData() {
    try {
      setIsRefreshing(true);

      const [responseTodos, responseMe] = await Promise.all([
        axios.get(`${url}/api/cards/blog`, {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }),
        axios.get(`${url}/api/cards/blog/${id_empleado}`, {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }),
      ]);

      if (responseTodos.status === 200 && responseMe.status === 200) {
        // Filtramos solo los publicados
        const publicadosTodos = responseTodos.data.filter(
          (blog) => blog.estado_publicacion === 1,
        );
        const publicadosMios = responseMe.data.filter(
          (blog) => blog.estado_publicacion === 1,
        );

        setAllBlogs(publicadosTodos);
        setMyBlogs(publicadosMios);
        setFilteredBlogs(
          activeFilter === "all" ? publicadosTodos : publicadosMios,
        );
        setCurrentPage(1);
      } else {
        showError("Ocurrió un error al cargar los blogs.");
      }
    } catch (error) {
      showError("Ocurrió un error inesperado.");
      console.error(error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }

  function confirmDelete(id) {
    Swal.fire({
      title: "¿Eliminar este blog?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      buttonsStyling: true,
      customClass: {
        confirmButton: "!px-6",
        cancelButton: "!px-6",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBlog(id, id_empleado);
      }
    });
  }

  async function deleteBlog(id, id_empleado) {
    try {
      const response = await axios.delete(`${url}/api/blogs/${id}`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
        data: {
          id_empleado: id_empleado,
        },
      });

      if (response.status === 200) {
        Swal.fire({
          title: "Blog eliminado",
          text: "El blog ha sido eliminado exitosamente",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#0ea5e9",
        });
        fetchData();
      } else {
        showError("No se pudo eliminar el blog.");
      }
    } catch (error) {
      showError("Ocurrió un error al eliminar el blog.");
      console.error(error);
    }
  }

  function showError(message) {
    Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#0ea5e9",
    });
  }

  const EmptyState = ({ message, icon }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
        No hay blogs disponibles
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
        {message}
      </p>
      <Link
        href="/edition"
        className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Crear nuevo blog
      </Link>
    </div>
  );

  // Componente para la vista de tarjetas (móvil)
  const BlogCard = ({ blog }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
              ID: {blog.id_card}
            </span>
          </div>
          <h3 className="font-medium mb-1 line-clamp-2">{blog.titulo}</h3>
          <p className="text-sm line-clamp-2 mb-2">{blog.descripcion}</p>
        </div>
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 ml-3 flex-shrink-0">
          <img
            src={blog.public_image || "/placeholder.svg"}
            alt={blog.titulo}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm ">
            <span className="font-medium">Autor:</span>{" "}
            {blog.empleado?.nombre || "Desconocido"}
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/blog/plantilla${blog.id_plantilla}/${blog.blog.link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors text-sm"
            title="Ver blog"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/edition?mode=edit&id=${blog.id_blog}`}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm"
            title="Editar blog"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          {auth_service.hasRole("administrador") && (
            <button
              onClick={() => confirmDelete(blog.id_blog)}
              className="flex items-center justify-center p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
              title="Eliminar blog"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  return (
    <main className="p-6 flex flex-col w-full max-h-svh bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              Gestión de Blogs
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Administra y visualiza todos los blogs de la plataforma
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 w-full max-w-full min-w-0 lg:w-auto">
            {/* Buscador */}
            <div className="w-full lg:w-64 lg:flex-shrink-0 min-w-0">
              <div className="relative w-full min-w-0">
                <input
                  type="text"
                  placeholder="Buscar por título (mín. 3 caracteres)..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full min-w-0 pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />

                {/* Lupa centrada verticalmente */}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtros y acciones */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:flex-1 min-w-0">
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                  activeFilter === "all"
                    ? "bg-sky-50 dark:bg-sky-900 text-sky-600 border-sky-200 dark:border-sky-700"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Todos</span>
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange("mine")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                  activeFilter === "mine"
                    ? "bg-sky-50 dark:bg-sky-900 text-sky-600 border-sky-200 dark:border-sky-700"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Mis blogs</span>
              </button>

              <button
                type="button"
                onClick={fetchData}
                disabled={isRefreshing}
                title="Actualizar datos"
                aria-label="Actualizar datos"
                className={`flex items-center justify-center p-2 rounded-lg border transition-colors shrink-0 ${
                  isRefreshing
                    ? "opacity-70 cursor-not-allowed bg-slate-50 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>

              <Link
                href="/edition"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors whitespace-nowrap"
              >
                <PlusCircleIcon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Crear Nuevo</span>
              </Link>

              {auth_service.hasRole("administrador") && (
                <>
                  <Link
                    href="/dashboard/blogs/historial"
                    title="Historial de cambios"
                    aria-label="Historial de cambios"
                    className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center justify-center shrink-0"
                  >
                    <History className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/dashboard/blogs/borradores"
                    title="Borradores"
                    aria-label="Borradores"
                    className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center justify-center shrink-0"
                  >
                    <FilePen className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
          <Loader2 className="h-10 w-10 text-sky-600 animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Cargando blogs...
          </p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
          <EmptyState
            message={
              activeFilter === "all"
                ? "No hay blogs disponibles en la plataforma. ¡Crea el primero!"
                : "No has creado ningún blog todavía. ¡Comienza a compartir tu conocimiento!"
            }
            icon={
              activeFilter === "all" ? (
                <FileText className="w-6 h-6 text-slate-400" />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-6">
            {/* Vista de Tabla para desktop */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-sm">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-sm">
                      Título
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-sm">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-sm">
                      Imagen
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-sm">
                      Autor
                    </th>
                    <th className="px-6 py-4 text-center font-medium text-sm">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displayedBlogs.length > 0 ? (
                    displayedBlogs.map((blog, index) => {
                      const autorNombre =
                        blog.empleado?.nombre || "Desconocido";
                      const autorApellido = blog.empleado?.apellido || "";
                      const iniciales =
                        (autorNombre.charAt(0) || "") +
                        (autorApellido.charAt(0) || "");

                      return (
                        <tr
                          key={`blog-${blog.id_card}`}
                          className={
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {blog.id_card}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                            {blog.titulo}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-[300px] truncate">
                            {blog.descripcion}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                              <img
                                src={blog.public_image || "/placeholder.svg"}
                                alt={blog.titulo}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-white text-xs font-medium">
                                  {iniciales || "A"}
                                </span>
                              </div>
                              <div className="font-medium text-gray-900 dark:text-white truncate">
                                {autorNombre} {autorApellido}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center gap-1">
                              <Link
                                href={`/blog/plantilla${blog.id_plantilla}/${blog.blog?.link || ""}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-full transition-colors flex items-center justify-center"
                                title="Ver blog"
                              >
                                <Eye size={16} />
                              </Link>

                              <Link
                                href={`/edition?mode=edit&id=${blog.id_blog}`}
                                className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors flex items-center justify-center"
                                title="Editar blog"
                              >
                                <Pencil size={16} />
                              </Link>

                              {auth_service.hasRole("administrador") && (
                                <button
                                  onClick={() => confirmDelete(blog.id_blog)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors flex items-center justify-center"
                                  title="Eliminar blog"
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
                        colSpan="6"
                        className="px-6 py-16 text-center bg-white dark:bg-gray-900"
                      >
                        <div className="flex flex-col items-center">
                          <Filter className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                            No hay blogs disponibles
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="hidden lg:flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-6">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Mostrando{" "}
                <span className="font-medium">{displayedBlogs.length}</span> de{" "}
                <span className="font-medium">{filteredBlogs.length}</span>
                blogs
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border ${
                    currentPage === 1
                      ? "bg-slate-50 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600 cursor-not-allowed"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={`page-desktop-${page}`}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg border ${
                        currentPage === page
                          ? "bg-sky-50 dark:bg-sky-900 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-700"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border ${
                    currentPage === totalPages
                      ? "bg-slate-50 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600 cursor-not-allowed"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Vista de tarjetas para pantallas pequeñas y medianas */}
          <div className="lg:hidden space-y-4 mb-6">
            {displayedBlogs.map((blog) => (
              <BlogCard key={`blog-card-${blog.id_card}`} blog={blog} />
            ))}

            {/* Paginación (móvil) */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sticky bottom-0">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Mostrando{" "}
                  <span className="font-medium">{displayedBlogs.length}</span>{" "}
                  de <span className="font-medium">{filteredBlogs.length}</span>{" "}
                  blogs
                </div>

                <div className="flex flex-wrap gap-2 justify-center max-w-full overflow-hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${
                      currentPage === 1
                        ? "bg-slate-50 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600 cursor-not-allowed"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = Number(pageInput);

                          if (value >= 1 && value <= totalPages) {
                            goTo(value);
                          } else {
                            setPageInput(String(currentPage));
                          }
                        }
                      }}
                      onBlur={() => {
                        const value = Number(pageInput);

                        if (value >= 1 && value <= totalPages) {
                          goTo(value);
                        } else {
                          setPageInput(String(currentPage));
                        }
                      }}
                      className="w-16 text-center px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700
               bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                      aria-label="Número de página"
                    />
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${
                      currentPage === totalPages
                        ? "bg-slate-50 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600 cursor-not-allowed"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <b>Página {currentPage}</b> de <b>{totalPages}</b>
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {mostrarHistorial && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mt-6">
          <HistorialAuditoria />
        </div>
      )}
    </main>
  );
}
