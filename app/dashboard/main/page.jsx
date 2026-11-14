"use client";
import { useEffect, useState } from "react";
import RouteGuard from "@/app/dashboard/components/RouteGuard";
import { getCookie, deleteCookie, setCookie } from "cookies-next";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  BadgeIcon,
  Shield,
  ArrowLeft,
  Edit,
  KeyRound,
  Loader2,
} from "lucide-react";

import ModalEmpleado from "../empleados/components/modal_empleado";
import ModalCliente from "../user-client/components/modal_cliente";

import ModalUpdatePass from "../empleados/components/modal_update_password";
import ProfileImageUpload from "../empleados/components/profile_image_upload";

import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CldImage } from "next-cloudinary";

import url from "@/api/url";
import { safeJsonParse } from "@/lib/safe-json";

export default function Page() {
  const [userData, setUserData] = useState(null);
  const [empleadoData, setEmpleadoData] = useState(null);
  const [userRole, setUserRole] = useState("Usuario");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [imageUrl, setImageUrl] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const empleadoId = searchParams.get("id_empleado");
  const api_url = `${url}/api/empleados`;

  const [showEditModalCliente, setShowEditModalCliente] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const loadData = async () => {
      //console.log(empleadoId);

      // ============================================================
      // CASO 1: Hay un id_empleado en la URL
      // Esto significa que un ADMIN está viendo el perfil de OTRO empleado
      // Aquí SÍ se necesita fetch y SÍ debe validar que sea admin
      // ============================================================
      if (empleadoId) {
        const userRole = getCookie("rol");
        if (userRole !== "administrador") {
          Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "No tienes permiso para ver este perfil.",
            confirmButtonColor: "var(--azul_cobalto)",
          });
          setIsLoading(false);
          return;
        }

        try {
          const token = getCookie("token");
          if (!token) {
            throw new Error("No se encontró el token de autenticación");
          }

          const response = await fetch(`${api_url}/${empleadoId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              deleteCookie("token");
              router.push("/login");
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.status === 200) {
            setEmpleadoData(data.data);
            setUserRole(data.data.rol?.nombre || "Usuario");
            setImageUrl(
              data.data.imagen_perfil_url ||
                "https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png",
            );
          } else {
            console.error("Empleado no encontrado:", data.message);
          }
        } catch (error) {
          console.error("Error API:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al cargar el perfil del empleado.",
            confirmButtonColor: "var(--azul_cobalto)",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        try {
          const token = getCookie("token");
          if (!token) {
            throw new Error("No se encontró el token de autenticación");
          }

          const empleadoCookie = getCookie("empleado");
          const clienteCookie = getCookie("cliente");
          if (empleadoCookie && empleadoCookie !== "null") {
            const empleado = safeJsonParse(empleadoCookie, null);
            if (!empleado)
              throw new Error("No se pudo interpretar la cookie de empleado");
            const idEmpleado = empleado.id_empleado;

            if (idEmpleado) {
              const response = await fetch(`${api_url}/${idEmpleado}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
              });

              if (!response.ok) {
                if (response.status === 401) {
                  deleteCookie("token");
                  router.push("/login");
                }
                throw new Error(
                  `Error ${response.status}: ${response.statusText}`,
                );
              }

              const data = await response.json();

              if (data.status === 200) {
                setEmpleadoData(data.data);
                setUserRole(data.data.rol?.nombre || "Usuario");
                setImageUrl(
                  data.data.imagen_perfil_url ||
                    "https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png",
                );

                setCookie("empleado", JSON.stringify(data.data));
              } else {
                console.error(
                  "Error al obtener datos del empleado:",
                  data.message,
                );
                setEmpleadoData(empleado);
                setImageUrl(empleado.imagen_perfil_url);
              }
            }
          }

          const userCookie = getCookie("user");
          const rolCookie = getCookie("rol");

          // Cargar datos de cliente desde cookie (tiene prioridad: incluye
          // nombre, apellido, telefono; la cookie "user" solo trae id/name/email)
          const cliente =
            clienteCookie && clienteCookie !== "null"
              ? safeJsonParse(clienteCookie, null)
              : null;

          if (cliente) {
            setUserData(cliente);
          } else if (userCookie) {
            setUserData(safeJsonParse(userCookie, null));
          }

          if (rolCookie) setUserRole(rolCookie);
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);

          // Fallback: intentar cargar desde cookies nuevamente
          const empleadoCookie = getCookie("empleado");
          const userCookie = getCookie("user");
          const rolCookie = getCookie("rol");

          if (empleadoCookie) {
            const empleado = safeJsonParse(empleadoCookie, null);
            if (empleado) {
              setEmpleadoData(empleado);
              setImageUrl(empleado.imagen_perfil_url);
            }
          }

          if (userCookie) setUserData(safeJsonParse(userCookie, null));
          if (rolCookie) setUserRole(rolCookie);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [empleadoId, router]);

  const handleUpdateSuccess = (updatedData) => {
    setEmpleadoData(updatedData);
    setImageUrl(updatedData.imagen_perfil_url);
  };

  const handleDeleteProfileImage = async () => {
    try {
      const confirmResult = await Swal.fire({
        title: "¿Eliminar foto de perfil?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1056d2",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!confirmResult.isConfirmed) return;

      const token = getCookie("token");
      const empleadoIdToUpdate = empleadoId || empleadoData?.id_empleado;

      const response = await fetch(`${api_url}/${empleadoIdToUpdate}/image`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      setImageUrl(
        "https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png",
      );
      setEmpleadoData((prev) => {
        const updated = {
          ...prev,
          imagen_perfil: null,
          imagen_perfil_url: null,
        };
        setCookie("empleado", JSON.stringify(updated), {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
        return updated;
      });

      Swal.fire({
        icon: "success",
        title: "Foto eliminada",
        text: "La foto de perfil se ha eliminado correctamente",
        confirmButtonColor: "var(--azul_cobalto)",
      });
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la foto de perfil",
        confirmButtonColor: "var(--azul_cobalto)",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[70vh] flex flex-col justify-center items-center">
        <Loader2 className="h-10 w-10 text-[#1056d2] animate-spin mb-3" />
        <p className="text-[#1056d2] font-medium text-sm">Cargando perfil...</p>
      </div>
    );
  }

  //console.log(userData);
  const nombre = empleadoData?.nombre || userData?.nombre || "No disponible";
  const apellido =
    empleadoData?.apellido || userData?.apellido || "No disponible";
  const dni = empleadoData?.dni || userData?.dni || "No disponible";
  const displayName = `${nombre} ${apellido}`;
  const email = empleadoData?.email || userData?.email || "No disponible";
  const telefono =
    empleadoData?.telefono || userData?.telefono || "No disponible";

  const getRolePermissions = (role) => {
    switch (role.toLowerCase()) {
      case "administrador":
        return [
          "Acceso Total",
          "Gestión de Empleados",
          "Reportes",
          "Configuración",
        ];
      case "marketing":
        return ["Gestión de Contenido", "Campañas", "Análisis"];
      case "ventas":
        return ["Registro de Ventas", "Clientes", "Cotizaciones"];
      default:
        return ["Acceso Básico"];
    }
  };

  const permissions = getRolePermissions(userRole);

  return (
    <RouteGuard>
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <Card className="overflow-hidden border-none shadow-md dark:bg-gray-800/95 dark:border dark:border-gray-700">
        <div className="bg-[#1056d2] p-4 text-white">
          <div className="flex justify-between items-center">
            {empleadoId && (
              <h1 className="text-xl md:text-2xl font-bold">
                Perfil del Empleado
              </h1>
            )}
            {!empleadoId && (
              <h1 className="text-xl md:text-2xl font-bold">Mi Perfil</h1>
            )}
            {empleadoId && (
              <Button
                variant="secondary"
                size="sm"
                className="text-[#1056d2] bg-white hover:bg-gray-100"
                onClick={() => router.push("/dashboard/empleados")}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Volver
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 md:p-5 ">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile sidebar */}
            <div className="md:w-1/3">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {empleadoData?.imagen_perfil_url &&
                  empleadoData?.imagen_perfil ? (
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-[#03c4ff] shadow-md">
                      <CldImage
                        width={280}
                        height={280}
                        src={empleadoData.imagen_perfil}
                        alt={`${nombre} ${apellido}`}
                        className="w-full h-full object-cover"
                        priority
                        crop="fill"
                        gravity="faces"
                        quality="auto"
                        fetchPriority="high"
                        sizes="(max-width: 768px) 100vw, 280px"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#1056d2] flex items-center justify-center text-white text-3xl font-bold shadow-md border-2 border-[#03c4ff]">
                      {nombre.charAt(0)}
                      {apellido.charAt(0)}
                    </div>
                  )}
                  <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 py-0.5 text-xs bg-[#4450f8] text-white">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>

                  {!empleadoId && userRole !== "cliente" && (
                    <div className="mt-2">
                      <ProfileImageUpload
                        empleadoId={empleadoData?.id_empleado}
                        onImageUpload={(url, publicId) => {
                          setImageUrl(url);
                          setEmpleadoData((prev) => {
                            const updated = {
                              ...prev,
                              imagen_perfil: publicId,
                              imagen_perfil_url: url,
                            };
                            setCookie("empleado", JSON.stringify(updated), {
                              maxAge: 30 * 24 * 60 * 60,
                              path: "/",
                            });
                            return updated;
                          });
                        }}
                      />
                    </div>
                  )}
                </div>

                <h2 className="mt-3 text-xl font-bold text-gray-800 dark:text-white">
                  {displayName}
                </h2>
                <p className="text-gray-500 text-sm dark:text-gray-300">
                  {email}
                </p>

                {!empleadoId && (
                  <div className="mt-4 w-full space-y-2">
                    <div className="flex w-full gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          userRole === "cliente"
                            ? setShowEditModalCliente(true)
                            : setShowEditModal(true)
                        }
                        className="flex-1 text-sm dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Editar Perfil
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={handleDeleteProfileImage}
                        title="Eliminar foto de perfil"
                        disabled={!empleadoData?.imagen_perfil}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                        >
                          <defs>
                            <mask id="ipTPeopleDeleteOne0">
                              <g
                                fill="none"
                                stroke="#fff"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="4"
                              >
                                <path
                                  fill="#555555"
                                  d="M19 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14"
                                />
                                <path d="m42 15l-8 8m0-8l8 8" />
                                <path
                                  fill="#555555"
                                  d="M4 40.8V42h30v-1.2c0-4.48 0-6.72-.872-8.432a8 8 0 0 0-3.496-3.496C27.92 28 25.68 28 21.2 28h-4.4c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C4 34.08 4 36.32 4 40.8"
                                />
                              </g>
                            </mask>
                          </defs>
                          <path
                            fill="#03c4ff"
                            d="M0 0h48v48H0z"
                            mask="url(#ipTPeopleDeleteOne0)"
                          />
                        </svg>
                      </Button>
                    </div>
                    <Button
                      className="w-full text-sm bg-[#f0ebff] text-[#1056d2] hover:bg-[#e4d9ff] border-[#1056d2] border dark:bg-[#4450f8]/40 dark:text-[#03c4ff] dark:hover:bg-[#4450f8]/60 dark:border-[#03c4ff]"
                      variant="secondary"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                      Cambiar Contraseña
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="md:w-2/3 ">
              <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800/80">
                <CardHeader className="py-3 px-4 ">
                  <CardTitle className="text-base text-[#1056d2] dark:text-[#03c4ff]">
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-1 px-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-[#1056d2] dark:text-[#03c4ff] mr-2.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Nombre Completo
                      </p>
                      <p className="font-medium text-sm dark:text-gray-200">
                        {displayName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <BadgeIcon className="h-4 w-4 text-[#1056d2] dark:text-[#03c4ff] mr-2.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        DNI
                      </p>
                      <p className="font-medium text-sm dark:text-gray-200">
                        {dni}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-[#1056d2] dark:text-[#03c4ff] mr-2.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Correo Electrónico
                      </p>
                      <p className="font-medium text-sm dark:text-gray-200">
                        {email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-[#1056d2] dark:text-[#03c4ff] mr-2.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Teléfono
                      </p>
                      <p className="font-medium text-sm dark:text-gray-200">
                        {telefono}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-800/80">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base text-[#1056d2] dark:text-[#03c4ff]">
                    Acceso al Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-1 px-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-[#f0ebff] dark:bg-[#4450f8]/30 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-[#1056d2] dark:text-[#03c4ff]" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium dark:text-gray-300">
                        Rol de Usuario
                      </h3>
                      <p className="text-[#1056d2] dark:text-[#03c4ff] font-semibold text-sm">
                        {userRole}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Permisos
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {permissions.map((permission, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-2 py-0.5 text-xs bg-[#f0ebff] text-[#1056d2] border-[#d9c6ff] dark:bg-[#4450f8]/30 dark:text-[#03c4ff] dark:border-[#4450f8]"
                        >
                          {permission}
                        </Badge>
                      ))}
                      <Badge
                        variant="outline"
                        className="px-2 py-0.5 text-xs bg-[#f0ebff] text-[#1056d2] border-[#d9c6ff] dark:bg-[#4450f8]/30 dark:text-[#03c4ff] dark:border-[#4450f8]"
                      >
                        Reclamaciones
                      </Badge>
                      <Badge
                        variant="outline"
                        className="px-2 py-0.5 text-xs bg-[#f0ebff] text-[#1056d2] border-[#d9c6ff] dark:bg-[#4450f8]/30 dark:text-[#03c4ff] dark:border-[#4450f8]"
                      >
                        Modales
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Card>

      {/* Modales */}
      {showEditModal && (
        <ModalEmpleado
          isVisible={showEditModal}
          onClose={() => setShowEditModal(false)}
          data={empleadoData}
          onUpdateSuccess={handleUpdateSuccess}
          isProfileEdit={true}
        />
      )}
      {showPasswordModal && (
        <ModalUpdatePass
          isVisible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showEditModalCliente && (
        <ModalCliente
          isVisible={showEditModalCliente}
          onClose={() => setShowEditModalCliente(false)}
          data={userData}
          onUpdateSuccessClient={(updatedClient) => {
            setUserData(updatedClient);
          }}
        />
      )}
    </div>
    </RouteGuard>
  );
}