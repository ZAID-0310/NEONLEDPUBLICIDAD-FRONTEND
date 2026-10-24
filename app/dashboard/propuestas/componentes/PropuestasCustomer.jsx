"use client";

import { BookText, Search, RefreshCw, Plus, Eye, Edit, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { proposalApi, customerApi } from "../Services/PropuestasConexion";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import DeletePropuesta from "./DeletePropuesta";
import NotificacionesPropuesta from "./NotificacionesPropuesta";

const PropuestasCustomer = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const loadData = async (signal = null) => {
    setLoading(true);
    try {
      const [proposalsResponse, customersResponse] = await Promise.all([
        proposalApi.getAll(signal),
        customerApi.getAll().catch((e) => []),
      ]);

      const propuestasData = Array.isArray(proposalsResponse)
        ? proposalsResponse
        : [];

      const propuestasFormateadas = propuestasData.map((propuesta) => ({
        ...propuesta,
        cliente_nombre:
          propuesta.cliente_nombre || propuesta.cliente?.nombre || "",
        cliente_apellido:
          propuesta.cliente_apellido || propuesta.cliente?.apellido || "",
        cliente_email:
          propuesta.cliente_email || propuesta.cliente?.email || "",
        images: propuesta.images || [],
      }));

      const clientesData = Array.isArray(customersResponse)
        ? customersResponse.map((c) => ({
            id: c.id_cliente || c.id,
            nombre: c.nombre || "",
            apellido: c.apellido || "",
            email: c.email || "",
          }))
        : [];

      setProposals(propuestasFormateadas);
      setCustomers(clientesData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    loadData(abortController.signal);

    return () => abortController.abort();
  }, []);

  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente");

  useEffect(() => {
    if (clienteId && customers.length > 0) {
      setSelectedCustomer(clienteId);
      const cliente = customers.find((c) => c.id.toString() === clienteId);
      if (cliente) {
        setCustomerSearchTerm(`${cliente.nombre} ${cliente.apellido}`);
      }
    }
  }, [clienteId, customers]);

  useEffect(() => {
    if (customerSearchTerm) {
      const filtered = customers.filter((cliente) =>
        `${cliente.nombre} ${cliente.apellido} ${cliente.email}`
          .toLowerCase()
          .includes(customerSearchTerm.toLowerCase()),
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customerSearchTerm, customers]);

  const handleCustomerSelect = (cliente) => {
    setSelectedCustomer(cliente.id);
    setCustomerSearchTerm(`${cliente.nombre} ${cliente.apellido}`);
    setShowCustomerDropdown(false);
  };

  const clearCustomerSelection = () => {
    setSelectedCustomer("");
    setCustomerSearchTerm("");
  };

  const formatDateForComparison = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const formatDateForDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString("es-ES");
    } catch {
      return dateString;
    }
  };

  const filteredProposals = proposals.filter((proposal) => {
    if (!proposal || typeof proposal !== "object") return false;

    const nombre = proposal.nombre || proposal.nombre_propuesta || "";
    const matchesSearch = searchTerm
      ? nombre.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCustomer = selectedCustomer
      ? proposal.id_cliente?.toString() === selectedCustomer.toString()
      : true;

    const matchesDate = selectedDate
      ? formatDateForComparison(proposal.created_at) === selectedDate
      : true;

    return matchesSearch && matchesCustomer && matchesDate;
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("deleted") === "true") {
      setNotification({
        type: "delete",
        message: "Propuesta eliminada exitosamente",
      });
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-3 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-6 py-4">
        {/* Header */}

        <div className="bg-blue-600 rounded-lg p-4 sm:p-6 mb-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Título y Descripción */}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
                <BookText size={24} className="shrink-0" />
                <span className="break-words">Gestión de Propuestas</span>
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Administra las propuestas de decoración para clientes
              </p>
            </div>

            {/* Botón "+ Nueva Propuesta" */}
            <Link
              href="/dashboard/propuestas/crear"
              className="w-full sm:w-auto bg-white text-blue-600 px-4 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm shrink-0 shadow-sm"
            >
              <Plus size={16} />
              <span>Nueva Propuesta</span>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                BUSCAR POR NOMBRE
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Nombre de la propuesta"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                BUSCAR POR CLIENTE
              </label>
              <div className="relative">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Buscar por nombre de cliente o email"
                    value={customerSearchTerm}
                    onChange={(e) => {
                      setCustomerSearchTerm(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowCustomerDropdown(false), 200)
                    }
                    className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
                  />
                  {customerSearchTerm && (
                    <button
                      type="button"
                      onClick={clearCustomerSelection}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredCustomers.map((cliente) => (
                      <li
                        key={cliente.id}
                        onMouseDown={() => handleCustomerSelect(cliente)}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer dark:text-white"
                      >
                        <div className="font-medium">
                          {cliente.nombre} {cliente.apellido}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {cliente.email}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                FECHA
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end items-center">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                onClick={() => loadData()}
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden w-full">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <RefreshCw className="animate-spin text-blue-600" size={24} />
            </div>
          ) : filteredProposals.length > 0 ? (
            <>
              {/*  VISTA MÓVIL (TARJETAS / CARDS)*/}
              <div className="block md:hidden p-4 space-y-4">
                {filteredProposals.map((proposal, index) => {
                  const iniciales =
                    (proposal.cliente_nombre?.charAt(0) || "") +
                    (proposal.cliente_apellido?.charAt(0) || "");

                  return (
                    <div
                      key={proposal.id}
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs px-2.5 py-1 rounded-full">
                            #{index + 1}
                          </span>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug">
                            {proposal.nombre}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 py-1">
                        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-semibold">
                            {iniciales}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {proposal.cliente_nombre}{" "}
                            {proposal.cliente_apellido}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {proposal.cliente_email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl text-gray-600 dark:text-gray-300">
                        <div>
                          <span className="block text-gray-400 text-[10px] uppercase font-bold">
                            Fecha
                          </span>
                          <span>
                            {formatDateForDisplay(proposal.created_at)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-gray-400 text-[10px] uppercase font-bold">
                            Multimedia
                          </span>
                          <span>
                            📷 {proposal.images?.length || 0} | 🎥{" "}
                            {proposal.videos?.length || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                          onClick={() =>
                            router.push(
                              "/dashboard/propuestas/detalle-propuesta?id=" +
                                proposal.id,
                            )
                          }
                          title="Ver Detalle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors"
                          onClick={() =>
                            router.push(
                              `/dashboard/propuestas/editar-propuesta?id=${proposal.id}`,
                            )
                          }
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <DeletePropuesta
                          proposal={proposal}
                          loadProposals={loadData}
                          setNotification={setNotification}
                          variant="icon"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VISTA ESCRITORIO (TABLA TRADICIONAL*/}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-center font-medium w-[30%]">
                        Nombre Propuesta
                      </th>
                      <th className="px-6 py-4 text-center font-medium w-[20%]">
                        Cliente
                      </th>
                      <th className="px-6 py-4 text-center font-medium w-[15%]">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-center font-medium w-[10%]">
                        Imágenes
                      </th>
                      <th className="px-6 py-4 text-center font-medium w-[10%]">
                        Videos
                      </th>
                      <th className="px-6 py-4 text-center font-medium w-[15%]">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProposals.map((proposal, index) => {
                      const iniciales =
                        (proposal.cliente_nombre?.charAt(0) || "") +
                        (proposal.cliente_apellido?.charAt(0) || "");

                      return (
                        <tr
                          key={proposal.id}
                          className={
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                              : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                          }
                        >
                          <td className="px-6 py-4 text-gray-900 dark:text-white w-[30%]">
                            {proposal.nombre}
                          </td>
                          <td className="px-6 py-4 w-[20%]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {iniciales}
                                </span>
                              </div>
                              <div className="truncate">
                                <div className="text-gray-900 dark:text-white font-medium truncate">
                                  {proposal.cliente_nombre}{" "}
                                  {proposal.cliente_apellido}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm truncate">
                                  {proposal.cliente_email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900 text-center dark:text-white w-[15%]">
                            {formatDateForDisplay(proposal.created_at)}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300 w-[10%]">
                            <span>{proposal.images?.length || 0}</span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300 w-[10%]">
                            <span>{proposal.videos?.length || 0}</span>
                          </td>
                          <td className="px-6 py-4 w-[15%]">
                            <div className="flex justify-center gap-1">
                              <button
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                onClick={() =>
                                  router.push(
                                    "/dashboard/propuestas/detalle-propuesta?id=" +
                                      proposal.id,
                                  )
                                }
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/propuestas/editar-propuesta?id=${proposal.id}`,
                                  )
                                }
                              >
                                <Edit size={16} />
                              </button>
                              <DeletePropuesta
                                proposal={proposal}
                                loadProposals={loadData}
                                setNotification={setNotification}
                                variant="icon"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* Estado sin resultados */
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {proposals.length === 0
                ? "No hay propuestas disponibles"
                : "No se encontraron resultados"}
            </div>
          )}
        </div>
      </div>
      {notification && (
        <NotificacionesPropuesta
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default PropuestasCustomer;
