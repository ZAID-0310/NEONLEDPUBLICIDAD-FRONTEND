"use client";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { safeJsonParse } from "@/lib/safe-json";
import {
  ArrowLeft,
  FileText,
  Mail,
  User,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  MapPin,
  Calendar,
  Tag,
  Package,
} from "lucide-react";

const SERVICIOS = {
  1: "Diseño Web y Desarrollo Web",
  2: "Gestión de Redes Sociales",
  3: "Marketing y Gestión Digital",
  4: "Branding y Diseño",
};

export default function Page() {
  const router = useRouter();
  const [reclamacion, setReclamacion] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const infoReclamacion = getCookie("reclamacion");
  if (infoReclamacion) {
    setReclamacion(safeJsonParse(infoReclamacion, null));
  }
  setLoading(false);
}, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-[#8c52ff] border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-700 dark:text-gray-300 font-medium">
            Cargando datos...
          </p>
        </div>
      </div>
    );
  }

  if (!reclamacion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-200">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <AlertTriangle className="w-16 h-16 text-amber-500 mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            No se encontraron datos
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-5 text-center">
            No se pudo cargar la información de la reclamación
          </p>
          <button
            className="bg-[#8c52ff] text-white px-4 py-2 rounded-lg hover:bg-[#7b45e0] transition duration-300 flex items-center justify-center w-full"
            onClick={() => router.push("/dashboard/reclamaciones")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    return status === "ATENDIDO"
      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800"
      : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
  };

  const getStatusIcon = (status) => {
    return status === "ATENDIDO" ? (
      <CheckCircle className="w-4 h-4 mr-1" />
    ) : (
      <Clock className="w-4 h-4 mr-1" />
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-3 md:p-4 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="mb-3">
          <button
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300 flex items-center shadow-sm text-sm"
            onClick={() => router.push("/dashboard/reclamaciones/")}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Volver a la lista
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* Header */}
          <div className="border-b border-gray-100 dark:border-gray-700 p-4 bg-gradient-to-r from-[#8c52ff]/5 to-white dark:from-[#8c52ff]/10 dark:to-gray-800">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center">
                <div className="bg-[#8c52ff]/10 p-2.5 rounded-lg mr-3">
                  <FileText className="w-5 h-5 text-[#8c52ff]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                    Reclamación #{reclamacion.id_reclamacion}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {reclamacion.tipoReclamo} - {reclamacion.servicioContratado}
                  </p>
                </div>
              </div>

              <div className="flex items-center mt-2 sm:mt-0">
                <span
                  className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(reclamacion.estadoReclamo)}`}
                >
                  {getStatusIcon(reclamacion.estadoReclamo)}
                  {reclamacion.estadoReclamo}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-3 p-4">
            {/* Customer Information */}
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                <User className="w-4 h-4 mr-1.5 text-[#8c52ff]" />
                Información del Cliente
              </h2>

              <div className="space-y-2.5">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Nombre:
                    </span>
                  </div>
                  <div className="flex-grow">
                    <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                      {reclamacion.nombre} {reclamacion.apellido}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Mail className="w-3 h-3 mr-1 text-gray-400" />
                      Email:
                    </span>
                  </div>
                  <div className="flex-grow">
                    <a
                      href={`mailto:${reclamacion.email}?subject=Respuesta%20a%20su%20contacto&body=Hola%20${reclamacion.nombre},%0A%0A`}
                      className="text-xs font-medium text-[#8c52ff] hover:underline break-all flex items-center group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {reclamacion.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <FileText className="w-3 h-3 mr-1 text-gray-400" />
                      Documento:
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs text-gray-800 dark:text-gray-200">
                      {reclamacion.tipoDocumento} - {reclamacion.dni}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Phone className="w-3 h-3 mr-1 text-gray-400" />
                      Teléfono:
                    </span>
                  </div>
                  <div className="flex">
                    {reclamacion.telefono ? (
                    <a
                    href={`https://wa.me/+51${reclamacion.telefono.replace(/\D/g, "")}`}
                    className="text-xs font-medium text-[#8c52ff] hover:underline flex items-center group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {reclamacion.telefono}
                  </a>
                ) : (
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    No proporcionado
                  </p>
                )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                      Dirección:
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs text-gray-800 dark:text-gray-200">
                      {reclamacion.direccion}, {reclamacion.distrito},{" "}
                      {reclamacion.departamento}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Claim Details */}
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                <FileCheck className="w-4 h-4 mr-1.5 text-[#8c52ff]" />
                Detalles de la Reclamación
              </h2>

              <div className="space-y-2.5">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-32">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      Fecha Reclamo:
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs text-gray-800 dark:text-gray-200">
                      {reclamacion.fechaReclamo}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-32">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      Fecha Incidente:
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs text-gray-800 dark:text-gray-200">
                      {reclamacion.fechaIncidente}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-32">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center whitespace-nowrap">
                      <Tag className="w-3 h-3 mr-1 text-gray-400" />
                      Tipo Reclamo:
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs text-gray-800 dark:text-gray-200">
                      {reclamacion.tipoReclamo}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Package className="w-3 h-3 mr-1 text-gray-400" />
                      Servicio:
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs text-gray-800 dark:text-gray-200">
                      {SERVICIOS[reclamacion.id_servicio] ?? "No especificado"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Message */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
              <Mail className="w-4 h-4 mr-1.5 text-[#8c52ff]" />
              Mensaje de Reclamo
            </h2>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-300 dark:border-gray-700 max-h-48 overflow-y-auto min-h-[60px]">
              <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {reclamacion.descripcionServicio &&
                reclamacion.descripcionServicio.trim() !== "" ? (
                  reclamacion.descripcionServicio
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    Sin mensaje registrado
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
