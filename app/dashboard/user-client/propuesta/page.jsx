"use client";

import { useEffect, useState } from "react";
import RouteGuard from "@/app/dashboard/components/RouteGuard";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import propuesta_cliente_service from "../services/propuesta.service";
import { Eye } from "lucide-react";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [propuestas, setPropuestas] = useState([]);

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
    <div className="container mx-auto px-4 py-6 max-w-7xl ">
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-[rgb(17,87,211)] to-[rgb(14,70,170)] text-white rounded-t-lg pb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2">
                Tabla de mis propuestas
              </CardTitle>
              <CardDescription className="text-white/80 mt-1 text-xs sm:text-sm">
                Vera el listado de todas las propuestas que tenemos para usted
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 dark:bg-gray-800 overflow-y-auto max-h-[470px]">
          <div className="mb-6 space-y-4">
            {/* <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar empleado..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchEmpleados}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Cargando..." : "Actualizar"}
              </Button>
            </div> */}

            {/* Filtro por rol */}
            {/* <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 dark:bg-blue-900/20">
              <Filter className="h-4 w-4 text-blue-primary" />
              <div className="text-sm font-medium">Filtrar por rol:</div>
              <Select value={selectedRole} onValueChange={setSelectedRole} className="w-[180px] bg-white dark:bg-gray-800">
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {roles.map((rol) => (
                    <SelectItem key={rol.id_rol} value={rol.id_rol} > 
                      {formatRoleName(rol.nombre)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRole !== "all" && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedRole("all")} className="h-8 px-2 text-xs">
                  Limpiar filtro
                </Button>
              )}

              <div className="ml-auto text-xs text-gray-500 dark:text-gray-200">
                {filteredData.length} {filteredData.length === 1 ? "empleado" : "empleados"} encontrados
              </div>
            </div> */}
          </div>

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
            <>
              <div className="bg-white dark:bg-[#00000040] rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full border border-blue-600">
                    <thead>
                      <tr className="bg-blue-600 border-b border-blue-600 text-center ">
                        <th className="px-3 py-2 md:px-6 md:py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                          Nombre de la Propuesta
                        </th>
                        <th className="px-3 py-2 md:px-6 md:py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-3 py-2 md:px-6 md:py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-3 py-2 md:px-6 md:py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                          Imagenes
                        </th>

                        <th className="px-3 py-2 md:px-6 md:py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                          Videos
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {propuestas.map((propuesta, index) => (
                        <tr
                          key={`propuesta-${propuesta.id}`}
                          className={`hover:bg-slate-50 transition-colors ${
                            index !== propuestas.length - 1
                              ? "border-b border-slate-100"
                              : ""
                          }`}
                        >
                          <td className="px-3 py-3 md:px-6 md:py-4 text-xs sm:text-sm text-center text-slate-700 dark:text-white max-w-[200px] truncate">
                            {propuesta.nombre}
                          </td>
                          <td className="px-3 py-3 md:px-6 md:py-4 text-xs sm:text-sm text-center text-slate-700 dark:text-white max-w-[300px] truncate">
                            {propuesta.descripcion}
                          </td>
                          <td className="px-3 py-3 md:px-6 md:py-4 text-xs sm:text-sm text-center text-slate-700 dark:text-white max-w-[300px] truncate">
                            {propuesta.fecha_formateada}
                          </td>
                          <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-xs sm:text-sm text-center text-slate-700 dark:text-white ">
                            <div className="flex gap-4 justify-center items-center">
                              <span>{propuesta.cantidad_imagenes}</span>
                              <Eye
                                size={16}
                                onClick={() => visualizar(propuesta.id)}
                                className="cursor-pointer"
                              />
                            </div>
                          </td>

                          <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-700 dark:text-white ">
                            <div className="flex gap-4 justify-center items-center">
                              <span>{propuesta.cantidad_videos}</span>
                              <Eye
                                size={16}
                                onClick={() => visualizar(propuesta.id)}
                                className="cursor-pointer"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </RouteGuard>
  );
}
