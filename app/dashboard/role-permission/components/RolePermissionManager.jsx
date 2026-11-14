"use client";
import RouteGuard from "@/app/dashboard/components/RouteGuard";
import { useEffect, useState } from "react";
import {
  Check,
  Filter,
  Lock,
  Plus,
  Save,
  Search,
  Shield,
  Trash,
  Users,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import role_service from "../services/role_service";

const PERMISSION_CATEGORIES = {
  "Ver ": {
    nombre: "Visualización",
    icon: <Search className="h-4 w-4" />,
    keywords: ["Ver"],
  },
  "Crear ": {
    nombre: "Creación",
    icon: <Plus className="h-4 w-4" />,
    keywords: ["Crear"],
  },
  "Editar ": {
    nombre: "Edición",
    icon: <Check className="h-4 w-4" />,
    keywords: ["Editar"],
  },
  "Eliminar ": {
    nombre: "Eliminación",
    icon: <Trash className="h-4 w-4" />,
    keywords: ["Eliminar"],
  },
  "Enviar ": {
    nombre: "Enviar",
    icon: <Send className="h-4 w-4" />,
    keywords: ["Enviar"],
  },
  other: {
    nombre: "Otras Operaciones",
    icon: <Shield className="h-4 w-4" />,
  },
};

export default function RolePermissionManager() {
  const [roles, setRoles] = useState([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [permisosRol, setPermisosRol] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const esAdmin = rolSeleccionado?.nombre?.toLowerCase() === "administrador";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const rolesData = await role_service.getRoles();
        //console.log("Roles obtenidos RolePManager:", rolesData)

        setRoles(rolesData);

        const permisosData = await role_service.getPermisos();
        setPermisosDisponibles(permisosData.permisos);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos. Intente nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSelectRol = async (rolId) => {
    try {
      setIsLoading(true);
      const selected = roles.find((r) => r.id_rol === parseInt(rolId));
      setRolSeleccionado(selected);

      const res = await role_service.getPermisosDelRol(rolId);
      setPermisosRol(
        res && res.permisos ? res.permisos.map((p) => p.id_permiso) : [],
      );
    } catch (error) {
      console.error("Error selecting role:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los permisos del rol.",
        variant: "destructive",
      });
      setPermisosRol([]);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermiso = (permisoId) => {
    if (esAdmin) return;

    setPermisosRol((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId],
    );
  };

  const handleGuardar = async () => {
    if (!rolSeleccionado || esAdmin) return;

    if (permisosRol.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un permiso antes de guardar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const res = await role_service.syncPermisos(
        rolSeleccionado.id_rol,
        permisosRol,
      );

      toast({
        title: "Éxito",
        description: res.message || "Permisos actualizados correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPermissions = Array.isArray(permisosDisponibles)
    ? permisosDisponibles.filter((permiso) => {
        if (!permiso || !permiso.nombre) return false;

        const matchesSearch = permiso.nombre
          .toLowerCase()
          .includes((searchTerm || "").toLowerCase());

        if (activeCategory === "all") {
          return matchesSearch;
        }

        let belongsToCategory = false;
        for (const prefix in PERMISSION_CATEGORIES) {
          if (
            prefix !== "other" &&
            permiso.nombre.startsWith(prefix) &&
            prefix === activeCategory
          ) {
            belongsToCategory = true;
            break;
          }
        }

        if (activeCategory === "other") {
          belongsToCategory = true;
          for (const prefix in PERMISSION_CATEGORIES) {
            if (prefix !== "other" && permiso.nombre.startsWith(prefix)) {
              belongsToCategory = false;
              break;
            }
          }
        }

        return matchesSearch && belongsToCategory;
      })
    : [];

  const getPermissionStats = () => {
    if (!rolSeleccionado) return { total: 0, assigned: 0, percentage: 0 };

    const total = permisosDisponibles.length;
    const assigned = permisosRol.length;
    const percentage = Math.round((assigned / total) * 100);

    return { total, assigned, percentage };
  };

  const stats = getPermissionStats();

  return (
    <RouteGuard>
    <Card className="border-none shadow-md dark:bg-gray-800/95 dark:border dark:border-gray-700">
      <CardHeader className="bg-gradient-to-r from-[rgb(17,87,211)] to-[rgb(14,70,170)] text-white pb-4">
        <div className="flex flex-col-reverse gap-2 justify-center items-center text-center">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold">
              Gestión de Roles y Permisos
            </CardTitle>
            <CardDescription className="text-gray-100 mt-1">
              Administra los permisos asignados a cada rol del sistema
            </CardDescription>
          </div>
          <div className="bg-white/20 p-2 rounded-full">
            <Shield className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Seleccionar Rol
              </label>
              <Select disabled={isLoading} onValueChange={handleSelectRol}>
                <SelectTrigger className="w-full border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Selecciona un rol..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles Disponibles</SelectLabel>
                    {Array.isArray(roles) && roles.length > 0 ? (
                      roles.map((rol) => (
                        <SelectItem key={rol.id_rol} value={String(rol.id_rol)}>
                          <div className="flex items-center">
                            <span>{rol.nombre}</span>
                            {rol.nombre?.toLowerCase() === "administrador" && (
                              <Badge className="ml-2 bg-blue-700 text-white text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-roles" disabled>
                        No hay roles disponibles
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {rolSeleccionado && (
              <div className="w-full md:w-2/3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h3 className="font-medium text-blue-primary dark:text-blue-300 flex items-center">
                      <Users className="h-4 w-4 mr-1.5" />
                      Rol:{" "}
                      <span className="font-bold ml-1">
                        {rolSeleccionado.nombre}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {esAdmin
                        ? "Tiene acceso completo al sistema"
                        : `${stats.assigned} de ${stats.total} permisos asignados (${stats.percentage}%)`}
                    </p>
                  </div>

                  {esAdmin ? (
                    <Badge className="bg-blue-700 text-white flex items-center px-3 py-1">
                      <Lock className="h-3 w-3 mr-1" />
                      Permisos Bloqueados
                    </Badge>
                  ) : (
                    <Button
                      onClick={handleGuardar}
                      disabled={isSaving || isLoading}
                      className="bg-blue-primary hover:bg-blue-dark text-white"
                    >
                      {isSaving ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "linear",
                            }}
                            className="mr-1.5"
                          >
                            <Shield className="h-4 w-4" />
                          </motion.div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1.5" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {rolSeleccionado && (
            <>
              <Separator className="my-2" />

              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-full md:w-1/4">
                  <div className="sticky top-4">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Filter className="h-4 w-4 mr-1.5" />
                      Filtrar por Categoría
                    </h3>

                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-sm font-normal",
                          activeCategory === "all" &&
                            "bg-blue-50 text-blue-primary dark:bg-blue-900/20 dark:text-blue-300",
                        )}
                        onClick={() => setActiveCategory("all")}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Todos los permisos
                      </Button>

                      {Object.entries(PERMISSION_CATEGORIES || {}).map(
                        ([key, category]) => (
                          <Button
                            key={key}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-sm font-normal",
                              activeCategory === key &&
                                "bg-blue-50 text-blue-primary dark:bg-blue-900/20 dark:text-blue-300",
                            )}
                            onClick={() => setActiveCategory(key)}
                          >
                            {category.icon}
                            <span className="ml-2">{category.nombre}</span>
                          </Button>
                        ),
                      )}
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1 text-sm">
                        Estadísticas
                      </h3>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Progreso
                          </span>
                          <span className="text-xs font-medium text-blue-primary dark:text-blue-300">
                            {esAdmin ? "100%" : `${stats.percentage}%`}
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-primary h-2 rounded-full"
                            style={{
                              width: esAdmin ? "100%" : `${stats.percentage}%`,
                            }}
                          ></div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                          <div className="bg-white dark:bg-gray-800 p-2 rounded">
                            <div className="text-blue-primary dark:text-blue-300 font-bold">
                              {esAdmin
                                ? permisosDisponibles.length
                                : stats.assigned}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Asignados
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-2 rounded">
                            <div className="text-gray-700 dark:text-gray-300 font-bold">
                              {stats.total}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Total
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-3/4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                      Permisos{" "}
                      {activeCategory !== "all" &&
                        `- ${PERMISSION_CATEGORIES[activeCategory]?.nombre || "Otros"}`}
                    </h3>

                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar permisos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full md:w-64 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                      >
                        <Shield className="h-8 w-8 text-blue-primary dark:text-blue-300" />
                      </motion.div>
                      <span className="ml-2 text-blue-primary dark:text-blue-300">
                        Cargando permisos...
                      </span>
                    </div>
                  ) : (
                    <>
                      {filteredPermissions.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <Search className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400">
                            No se encontraron permisos con ese filtro
                          </p>
                          <Button
                            variant="link"
                            className="text-blue-primary dark:text-blue-300 mt-1"
                            onClick={() => {
                              setSearchTerm("");
                              setActiveCategory("all");
                            }}
                          >
                            Limpiar filtros
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Array.isArray(filteredPermissions) &&
                          filteredPermissions.length > 0 ? (
                            filteredPermissions.map((permiso) => {
                              // Determine which category this permission belongs to
                              let category = "other";
                              for (const prefix in PERMISSION_CATEGORIES) {
                                if (
                                  prefix !== "other" &&
                                  permiso?.nombre?.startsWith(prefix)
                                ) {
                                  category = prefix;
                                  break;
                                }
                              }

                              const isChecked =
                                esAdmin ||
                                (Array.isArray(permisosRol) &&
                                  permisosRol.includes(permiso.id_permiso));

                              return (
                                
                                <div
                                  key={permiso.id_permiso}
                                  className={cn(
                                    "flex items-center p-3 rounded-md border",
                                    isChecked
                                      ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/70"
                                      : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700",
                                  )}
                                >
                                  <Checkbox
                                    id={`permiso-${permiso.id_permiso}`}
                                    checked={isChecked}
                                    onCheckedChange={() =>
                                      togglePermiso(permiso.id_permiso)
                                    }
                                    disabled={esAdmin || isLoading}
                                    className={cn(
                                      esAdmin && "opacity-60",
                                      isChecked &&
                                        "bg-blue-primary border-blue-primary dark:bg-blue-primary dark:border-blue-primary",
                                    )}
                                  />
                                  <div className="ml-3 flex-1">
                                    <label
                                      htmlFor={`permiso-${permiso.id_permiso}`}
                                      className={cn(
                                        "text-sm font-medium cursor-pointer",
                                        esAdmin && "cursor-not-allowed",
                                      )}
                                    >
                                      {permiso.nombre}
                                    </label>
                                    <Badge
                                      variant="outline"
                                      className="ml-2 text-xs bg-white text-blue-primary border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/70"
                                    >
                                      {PERMISSION_CATEGORIES[category]
                                        ?.nombre || "Otro"}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="col-span-2 text-center py-4">
                              <p className="text-gray-500">
                                No se encontraron permisos
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {!rolSeleccionado && !isLoading && (
            <div className="text-center py-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="h-12 w-12 text-blue-primary dark:text-blue-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-blue-primary dark:text-blue-300 mb-1">
                Selecciona un Rol
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Selecciona un rol del menú desplegable para ver y administrar
                sus permisos
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </RouteGuard>
  );
}
