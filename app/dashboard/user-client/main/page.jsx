"use client";
import { useEffect, useRef, useState } from "react";
import { Calendar, Eye, Image as ImageIcon, Video } from "lucide-react";
import Slider from "./components/slider/SliderPropuesta";
import RouteGuard from "@/app/dashboard/components/RouteGuard";
import propuesta_cliente_service from "../services/propuesta.service";
import { getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { safeJsonParse } from "@/lib/safe-json";

export default function Page() {
  const [propuestas, setPropuestas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nombreCliente, setNombreCliente] = useState("Cliente");

  const router = useRouter();

  useEffect(() => {
    fetchPropuestas();

    const cliente = safeJsonParse(getCookie("cliente"), null);
    const user = safeJsonParse(getCookie("user"), null);
    const nombre = cliente?.nombre || user?.name;
    if (nombre) setNombreCliente(nombre);
  }, []);

  const fetchPropuestas = async () => {
    try {
      const data = await propuesta_cliente_service.getPropuestas();
      setPropuestas(data);
    } catch (error) {
      console.error("Error cargando propuestas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const visualizar = (id) => {
    setCookie("propuesta_id", id);
    router.push("/dashboard/user-client/propuesta/view");
  };

  return (
    <RouteGuard>
    <div className=" min-h-screen py-10 px-6 overflow-hidden w-full">
      {/* Header */}
      <div className="bg-[#CECECE4D] dark:bg-[#1E293B4D] rounded-3xl p-8 text-center max-w-xl mx-auto border-azul-principal border-2">
        <h2 className="text-2xl lg:text-4xl font-bold text-azul-principal">
          Bienvenido, {nombreCliente}
        </h2>
        <p className="mt-2 text-xs md:text-sm dark:text-white">
          Descubre las propuestas de decoración personalizadas que hemos creado
          especialmente para ti
        </p>
      </div>

      <h3 className="text-xl lg:text-3xl tracking-widest font-semibold text-center text-azul-principal my-8">
        Tus Propuestas de Decoración
      </h3>

      {/* Listado de propuestas */}
      <div className="mb-6 max-w-[25rem] sm:max-w-3xl lg:max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-primary"></div>
            <p className="ml-4 text-blue-primary">Cargando propuestas...</p>
          </div>
        ) : propuestas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-slate-500 dark:text-gray-300 font-medium">
              No se encontraron propuestas
            </p>
            <p className="text-slate-400 dark:text-gray-400 text-sm mt-1">
              Todavía no tienes propuestas de decoración asignadas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {propuestas.map((p) => (
              <div
                key={p.id}
                onClick={() => visualizar(p.id)}
                className="group w-full bg-white dark:bg-[#111c33] rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-azul-principal/20 hover:border-azul-principal transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none"
              >
                <div className="relative">
                  <Slider slides={p.images} />

                  <div className="absolute bottom-3 right-3 flex gap-2 z-10">
                    <span className="flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[11px] px-2 py-1 rounded-full">
                      <ImageIcon size={12} /> {p.cantidad_imagenes}
                    </span>
                    <span className="flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[11px] px-2 py-1 rounded-full">
                      <Video size={12} /> {p.cantidad_videos}
                    </span>
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  <h4 className="font-semibold text-base lg:text-lg text-azul-principal truncate">
                    {p.nombre}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{p.fecha_formateada}</span>
                  </div>

                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 min-h-[2.5em]">
                    {p.descripcion}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      visualizar(p.id);
                    }}
                    className="flex w-full justify-center items-center gap-2 px-3 py-2.5 text-xs md:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye size={16} /> Ver propuesta
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </RouteGuard>
  );
}
