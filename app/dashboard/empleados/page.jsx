"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  PlusCircle,
  Users,
  Search,
  RefreshCw,
  Filter,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  BadgeCheck,
} from "lucide-react";

import Pagination from "../components/Pagination";
import Table from "../components/DataTable";
import ModalEmpleado from "./components/modal_empleado";
import empleado_service from "./services/empleado.service";
import user_service from "../users/services/user.service";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const headers = [
  "id_empleado",
  "nombre",
  "apellido",
  "email",
  "dni",
  "telefono",
  "rol",
];

import auth_service from "../users/services/auth.service";

const getEmployeeRoleName = (employee) => {
  const role =
    employee?.rol?.nombre ??
    employee?.rol?.name ??
    employee?.role?.nombre ??
    employee?.role?.name ??
    employee?.rol ??
    employee?.role ??
    employee?.rol_nombre ??
    employee?.nombreRol ??
    employee?.userRole;

  return typeof role === "string" && role.trim() ? role.trim() : "Sin rol";
};

const normalizeEmployee = (employee) => {
  const roleName = getEmployeeRoleName(employee);

  return {
    ...employee,
    id: employee.id_empleado,
    id_rol:
      employee.id_rol ??
      employee.rol?.id_rol ??
      employee.role?.id_rol ??
      employee.role?.id ??
      "",
    // La tabla y la card consumen el mismo valor normalizado.
    rol: roleName,
    rol_nombre: roleName,
  };
};

// Componente Card para móvil
const EmployeeCard = ({ employee, onShow, onUpdate, onDelete }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
    <div className="flex flex-wrap-reverse justify-center gap-2 items-center mb-3">
      <div className="flex items-center gap-2">
        <div className="bg-blue-100 rounded-full p-2 dark:bg-blue-900">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
        </div>
        <span className="min-w-0 break-words font-bold text-gray-900 dark:text-white">
          {employee.nombre} {employee.apellido}
        </span>
      </div>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        {employee.rol || employee.rol?.nombre || "Sin rol"}
      </span>
    </div>

    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2">
        <Mail size={14} className="text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400 break-all">
          {employee.email}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Phone size={14} className="text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {employee.telefono || "No registrado"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <BadgeCheck size={14} className="text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          DNI: {employee.dni || "No registrado"}
        </span>
      </div>
    </div>

    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
      <button
        onClick={() => onShow(employee.id_empleado)}
        title="Ver perfil"
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-gray-700 dark:text-blue-400"
      >
        <Eye size={16} />
      </button>
      <button
        onClick={() => onUpdate(employee.id_empleado)}
        title="Editar"
        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors dark:hover:bg-gray-700 dark:text-yellow-400"
      >
        <Edit size={16} />
      </button>
      {auth_service.hasPermission("eliminar-empleados") && (
        <button
          onClick={() => onDelete(employee.id_empleado)}
          title="Eliminar"
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-gray-700 dark:text-red-400"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  </div>
);

export default function Page() {
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || 1;
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [dataUpd, setDataUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("all");
  const router = useRouter();

  const handleShow = async (id) => {
    try {
      router.push(`/dashboard/main?id_empleado=${id}`);
    } catch (error) {
      console.error("Error al cargar el perfil del empleado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al cargar el perfil del empleado.",
        confirmButtonColor: "rgb(17, 87, 211)",
      });
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await empleado_service.getRoles();
      if (response.status === 200) {
        setRoles(response.data || []);
      }
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };

  async function setEmpleados() {
    setIsLoading(true);
    try {
      const itemsPerPage = 5;
      const response = await empleado_service.empleadosByPage(1, itemsPerPage);
      if (response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Sesión expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          confirmButtonColor: "rgb(17, 87, 211)",
        }).then(() => {
          user_service.logoutClient(router);
        });
        return;
      } else if (response.status === 500) {
        user_service.logoutClient(router);
        return;
      }

      if (Number.parseInt(response.status) === 200) {
        const totalPages = Math.ceil(response.total / itemsPerPage);
        const remainingResponses = await Promise.all(
          Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
            empleado_service.empleadosByPage(index + 2, itemsPerPage),
          ),
        );
        if (
          remainingResponses.some(
            (pageResponse) => Number.parseInt(pageResponse.status) !== 200,
          )
        ) {
          throw new Error("No se pudieron cargar todos los empleados");
        }
        const allEmployees = [
          ...(response.data || []),
          ...remainingResponses.flatMap((pageResponse) =>
            Number.parseInt(pageResponse.status) === 200
              ? pageResponse.data || []
              : [],
          ),
        ];
        const transformedData = allEmployees.map(normalizeEmployee);
        setData(transformedData);
      }
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al obtener los datos.",
        confirmButtonColor: "rgb(17, 87, 211)",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function onDelete(id) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "rgb(17, 87, 211)",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        empleado_service
          .delete(id)
          .then((response) => {
            if (response.error) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un error al eliminar el empleado.",
                confirmButtonColor: "rgb(17, 87, 211)",
              });
            } else if (response.status === 200) {
              Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "El empleado ha sido eliminado correctamente.",
                confirmButtonColor: "rgb(17, 87, 211)",
              });
              fetchEmpleados();
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un error al eliminar el empleado.",
                confirmButtonColor: "rgb(17, 87, 211)",
              });
            }
          })
          .catch((error) => {
            console.error("Error al eliminar empleado:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un error al eliminar el empleado.",
              confirmButtonColor: "rgb(17, 87, 211)",
            });
          });
      }
    });
  }

  function onUpdate(idUpdate) {
    const selectedData = data.find((r) => r.id == idUpdate);
    const preparedData = {
      ...selectedData,
      id_empleado: selectedData.id || selectedData.id_empleado,
      id_rol: selectedData.id_rol ? String(selectedData.id_rol) : "",
    };
    setDataUpdate(preparedData);
    setModal(true);
  }

  const handleUpdateSuccess = (updatedData) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === updatedData.id_empleado
          ? normalizeEmployee({ ...item, ...updatedData })
          : item,
      ),
    );
  };

  const fetchEmpleados = async () => {
    await setEmpleados();
  };

  const filteredData = data.filter((item) => {
    const normalizeRole = (value) => value?.trim().toLowerCase() || "";
    const matchesSearch =
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dni?.toLowerCase().includes(searchTerm.toLowerCase());

    const selectedRoleData = roles.find(
      (role) => String(role.id_rol) === String(selectedRole),
    );
    const employeeRoleId = item.id_rol || item.rol?.id_rol;
    const employeeRoleName =
      typeof item.rol === "string"
        ? item.rol
        : item.rol?.nombre || item.rol_nombre;
    const matchesRole =
      selectedRole === "all" ||
      String(employeeRoleId) === String(selectedRole) ||
      normalizeRole(employeeRoleName) ===
        normalizeRole(selectedRoleData?.nombre);

    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    fetchEmpleados();
    fetchRoles();
  }, []);

  const formatRoleName = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Paginación manual para cards
  const itemsPerPage = 5;
  const filteredPageCount = Math.max(
    1,
    Math.ceil(filteredData.length / itemsPerPage),
  );
  const activePage = Math.min(
    Math.max(1, Number(currentPage) || 1),
    filteredPageCount,
  );
  const paginatedData = filteredData.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-[rgb(17,87,211)] to-[rgb(14,70,170)] text-white rounded-t-lg pb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6" />
                Gestión de Empleados
              </CardTitle>
              <CardDescription className="text-white/80 mt-1">
                Administra la información de los empleados de la empresa
              </CardDescription>
            </div>
            {auth_service.hasPermission("crear-empleados") && (
              <Button
                className="bg-white text-blue-primary hover:bg-gray-100 transition-colors shadow-sm w-full md:w-auto"
                onClick={() => {
                  setDataUpdate(null);
                  setModal(true);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Añadir empleado
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 dark:bg-gray-800">
          {/* Filtros y controles */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
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
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Cargando..." : "Actualizar"}
              </Button>
            </div>

            {/* Filtro por rol */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-primary" />
                <span className="text-sm font-medium">Filtrar por rol:</span>
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {roles.map((rol) => (
                    <SelectItem key={rol.id_rol} value={String(rol.id_rol)}>
                      {formatRoleName(rol.nombre)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRole !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRole("all")}
                  className="h-8 px-2 text-xs"
                >
                  Limpiar filtro
                </Button>
              )}

              <div className="ml-auto text-xs text-gray-500 dark:text-gray-200">
                {filteredData.length}{" "}
                {filteredData.length === 1 ? "empleado" : "empleados"}{" "}
                encontrados
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="ml-4 text-blue-600">Cargando empleados...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {searchTerm || selectedRole !== "all"
                ? "No se encontraron resultados para tu búsqueda"
                : "No hay empleados registrados"}
            </div>
          ) : (
            <>
              {/* Cards para móvil */}
              <div className="block md:hidden">
                {paginatedData.map((employee) => (
                  <EmployeeCard
                    key={employee.id_empleado}
                    employee={employee}
                    onShow={handleShow}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </div>

              {/* Tabla para desktop */}
              <div className="hidden md:block rounded-lg border overflow-hidden">
                {auth_service.hasPermission("ver-empleados") && (
                  <Table
                    headers={headers}
                    data={paginatedData}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onShow={handleShow}
                  />
                )}
              </div>

              <div className="mt-4">
                <Pagination count={filteredData.length} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ModalEmpleado
        isVisible={modal}
        data={dataUpd || null}
        onClose={() => {
          setModal(false);
          setDataUpdate(null);
          fetchEmpleados();
        }}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
}
