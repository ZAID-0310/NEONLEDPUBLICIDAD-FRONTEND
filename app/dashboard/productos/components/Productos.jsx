"use client";
import RouteGuard from "@/app/dashboard/components/RouteGuard";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Package,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Calendar,
  FileText,
  Pencil,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getProductos,
  createProducto,
  updateProducto,
} from "../service/ProductoConexion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Cálculo dinámico de items según la altura de la ventana
const calculateDynamicPerPage = () => {
  if (typeof window === "undefined") return 6;
  const reservedHeight = 380;
  const rowHeight = 68;
  const available = window.innerHeight - reservedHeight;
  const calculated = Math.floor(available / rowHeight);
  return Math.max(4, Math.min(15, calculated));
};

// Formateador de fecha legible
const formatDate = (dateStr) => {
  if (!dateStr) return "Sin fecha";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Obtener nombre completo del empleado creador
const getEmpleadoNombre = (empleado) => {
  if (!empleado) return "Sistema / Admin";
  const nombreCompleto = [empleado.nombre, empleado.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();
  return nombreCompleto || empleado.name || `Empleado #${empleado.id_empleado}`;
};

// Esquema de validación (solo nombre y descripción)
const productoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres"),
  descripcion: z
    .string()
    .trim()
    .min(5, "La descripción debe tener al menos 5 caracteres")
    .max(1000, "La descripción no puede exceder los 1000 caracteres"),
});

// Notificación flotante
const AlertNotification = ({ alert, onClose }) => {
  if (!alert.show) return null;

  const isError = alert.type === "error";

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300 w-[400px] max-w-[calc(100vw-2rem)]">
      <Alert
        variant={isError ? "destructive" : "default"}
        className={`relative pr-10 ${
          isError
            ? "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800"
            : "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {isError ? (
              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
            )}
          </div>
          <div className="flex-1">
            <AlertTitle>
              {isError
                ? "Error"
                : alert.type === "update"
                  ? "Producto actualizado"
                  : "Producto creado"}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
};

// Badge de estado
const EstadoBadge = ({ estado }) =>
  estado == 1 ? (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-emerald-500/20 border bg-green-100 text-green-800 backdrop-blur-sm">
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-rose-500/20  border bg-yellow-100 text-yellow-800 backdrop-blur-sm">
      Inactivo
    </span>
  );

// Card para vista móvil
const ProductoCard = ({ producto, onEdit }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
    <div className="flex items-center gap-2 mb-3">
      <div className="bg-blue-100 rounded-full p-2 dark:bg-blue-900">
        <Package size={16} className="text-blue-600 dark:text-blue-300" />
      </div>
      <span className="font-bold text-gray-900 dark:text-white">
        # {producto.id} - {producto.nombre}
      </span>
      <div className="accordion ml-auto">
        <EstadoBadge estado={producto.estado} />
      </div>
    </div>

    <div className="space-y-2 text-sm">
      <div className="flex items-start gap-2">
        <FileText size={14} className="text-gray-400 mt-1 shrink-0" />
        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
          {producto.descripcion}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <User size={14} className="text-gray-400 shrink-0" />
        <span className="text-gray-600 dark:text-gray-400">
          {producto.empleadoNombre}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar size={14} className="text-gray-400 shrink-0" />
        <span className="text-gray-600 dark:text-gray-400">
          {producto.fechaCreacion}
        </span>
      </div>
    </div>

    <Button
      size="sm"
      onClick={() => onEdit(producto)}
      className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
    >
      <Pencil size={14} className="mr-1" /> Editar
    </Button>
  </div>
);

// Tabla para Desktop
const ProductoTable = ({ productos, searchTerm, onEdit }) => (
  <Table>
    <TableHeader className="bg-blue-600">
      <TableRow className="hover:bg-blue-600">
        {[
          "id",
          "Nombre",
          "Descripción",
          "Creado por",
          "Fecha de Creación",
          "Estado",
          "Acciones",
        ].map((header) => (
          <TableHead
            key={header}
            className="text-white text-center font-medium px-6 py-5"
          >
            {header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody className="divide-y divide-gray-200 dark:divide-gray-700 text-center">
      {productos.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={7}
            className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
          >
            {searchTerm
              ? `No se encontraron resultados para "${searchTerm}"`
              : "No hay productos registrados"}
          </TableCell>
        </TableRow>
      ) : (
        productos.map((producto, index) => (
          <TableRow
            key={producto.id}
            className={
              index % 2 === 0
                ? "bg-white dark:bg-gray-900"
                : "bg-gray-50 dark:bg-gray-700"
            }
          >
            <TableCell className="px-6 py-5 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {producto.id}
            </TableCell>
            <TableCell className="px-6 py-5 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {producto.nombre}
            </TableCell>
            <TableCell className="px-6 py-5 text-gray-700 dark:text-gray-200 max-w-md">
              <p className="line-clamp-2" title={producto.descripcion}>
                {producto.descripcion}
              </p>
            </TableCell>
            <TableCell className="px-6 py-5 text-gray-900 text-center whitespace-nowrap dark:text-white">
              {producto.empleadoNombre}
            </TableCell>
            <TableCell className="px-6 py-5 text-gray-900 text-center whitespace-nowrap dark:text-white">
              {producto.fechaCreacion}
            </TableCell>
            <TableCell className="px-6 py-5 text-gray-900 text-center whitespace-nowrap dark:text-white">
              <EstadoBadge estado={producto.estado} />
            </TableCell>
            <TableCell className="px-6 py-5">
              <Button
                size="sm"
                onClick={() => onEdit(producto)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1 mx-auto"
              >
                <Pencil size={14} /> 
              </Button>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

// Paginación
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  return (
    <div className="flex justify-center items-center mt-6 flex-wrap gap-1">
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        label="&lt;"
      />
      {Array.from({ length: endPage - startPage + 1 }).map((_, i) => (
        <PageButton
          key={i}
          onClick={() => onPageChange(startPage + i)}
          active={startPage + i === currentPage}
          label={startPage + i}
        />
      ))}
      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        label="&gt;"
      />
    </div>
  );
};

const PageButton = ({ onClick, disabled, active, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1 mx-1 rounded ${
      active
        ? "bg-blue-600 text-white dark:bg-blue-700"
        : disabled
          ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
          : "bg-white text-gray-700 hover:bg-blue-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
    }`}
  >
    {label}
  </button>
);

// Modal reutilizable (crear / editar)
const ProductoFormModal = ({
  form,
  show,
  onClose,
  onSubmit,
  isLoading,
  title = "Nuevo Producto",
  description = "Ingresa el nombre y la descripción para registrar el nuevo producto.",
  submitText = "Crear Producto",
  loadingText = "Creando...",
}) => (
  <Dialog open={show} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-gray-900 dark:text-white">
          {title}
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-300">
          {description}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Nombre del Producto <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Letrero Neón LED Personalizado"
                    {...field}
                    className="bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Descripción <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <textarea
                    rows={4}
                    placeholder="Describe brevemente el producto o servicio..."
                    {...field}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? loadingText : submitText}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
);

export default function Productos() {
  const [perPage, setPerPage] = useState(() => calculateDynamicPerPage());
  const [state, setState] = useState({
    productos: [],
    searchTerm: "",
    showCreateModal: false,
    showEditModal: false,
    editingProducto: null,
    isRefreshing: true,
    currentPage: 1,
    totalPages: 1,
    isCreating: false,
    isUpdating: false,
  });

  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
  });

  const createForm = useForm({
    resolver: zodResolver(productoSchema),
    mode: "onBlur",
    defaultValues: { nombre: "", descripcion: "" },
  });

  const editForm = useForm({
    resolver: zodResolver(productoSchema),
    mode: "onBlur",
    defaultValues: { nombre: "", descripcion: "" },
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 5000);
  };

  const loadProductos = useCallback(
    async (page = 1, itemsPerPage = perPage, search = state.searchTerm) => {
      try {
        setState((prev) => ({ ...prev, isRefreshing: true }));
        const response = await getProductos(page, itemsPerPage, search);

        setState((prev) => ({
          ...prev,
          productos: (response.data || []).map((p) => ({
            id: p.id_producto,
            nombre: p.nombre,
            descripcion: p.descripcion,
            empleadoNombre: getEmpleadoNombre(p.empleado),
            fechaCreacion: formatDate(p.created_at),
            estado: p.estado,
          })),
          totalPages: response.lastPage || 1,
          currentPage: response.currentPage || page,
          isRefreshing: false,
        }));
      } catch (error) {
        console.error("Error cargando productos:", error);
        setState((prev) => ({
          ...prev,
          productos: [],
          totalPages: 1,
          currentPage: 1,
          isRefreshing: false,
        }));
      }
    },
    [perPage, state.searchTerm],
  );

  // Recalcular filas al redimensionar ventana
  useEffect(() => {
    let timeoutId = null;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newPerPage = calculateDynamicPerPage();
        setPerPage((prev) => (prev !== newPerPage ? newPerPage : prev));
      }, 400);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Cargar productos cuando cambia la búsqueda o el tamaño de página
  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      loadProductos(1, perPage, state.searchTerm);
    }, 300);
    return () => clearTimeout(debounceSearch);
  }, [perPage, state.searchTerm, loadProductos]);

  const handleCreateSubmit = async (formData) => {
    try {
      setState((prev) => ({ ...prev, isCreating: true }));
      await createProducto(formData);
      showAlert("create", "El producto ha sido registrado exitosamente.");
      setState((prev) => ({ ...prev, showCreateModal: false }));
      createForm.reset();
      await loadProductos(1, perPage, state.searchTerm);
    } catch (error) {
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            createForm.setError(field, {
              type: "server",
              message: messages[0],
            });
          }
        });
      } else {
        showAlert("error", error.message || "No se pudo crear el producto");
      }
    } finally {
      setState((prev) => ({ ...prev, isCreating: false }));
    }
  };

  const handleOpenEdit = (producto) => {
    editForm.reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
    });
    setState((prev) => ({
      ...prev,
      showEditModal: true,
      editingProducto: producto,
    }));
  };

  const handleEditSubmit = async (formData) => {
    try {
      setState((prev) => ({ ...prev, isUpdating: true }));
      await updateProducto(state.editingProducto.id, {
        ...formData,
        estado: state.editingProducto.estado,
      });
      showAlert("update", "El producto ha sido actualizado exitosamente.");
      setState((prev) => ({
        ...prev,
        showEditModal: false,
        editingProducto: null,
      }));
      await loadProductos(state.currentPage, perPage, state.searchTerm);
    } catch (error) {
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            editForm.setError(field, { type: "server", message: messages[0] });
          }
        });
      } else {
        showAlert("error", error.message || "No se pudo actualizar el producto");
      }
    } finally {
      setState((prev) => ({ ...prev, isUpdating: false }));
    }
  };

  return (
    <RouteGuard>
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white p-3 sm:p-4 md:p-6 lg:p-8">
      <AlertNotification
        alert={alert}
        onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
      />

      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-t-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
                <Package size={24} />
                Gestión de Productos
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Administra el catálogo de productos y servicios de la empresa
              </p>
            </div>
            <Button
              onClick={() =>
                setState((prev) => ({ ...prev, showCreateModal: true }))
              }
              className="bg-white text-blue-600 hover:bg-blue-50 flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus size={16} />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Contenedor Principal */}
        <div className="bg-white dark:bg-gray-800 rounded-b-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          {/* Búsqueda y Actualizar */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="flex-1 sm:max-w-md">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  BUSCAR
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={20}
                  />
                  <Input
                    type="text"
                    placeholder="Nombre o descripción del producto..."
                    value={state.searchTerm}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        searchTerm: e.target.value,
                      }))
                    }
                    className="w-full pl-10 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  loadProductos(state.currentPage, perPage, state.searchTerm)
                }
                disabled={state.isRefreshing}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 w-full sm:w-auto"
              >
                <RefreshCw
                  size={16}
                  className={state.isRefreshing ? "animate-spin" : ""}
                />
                Actualizar
              </Button>
            </div>
          </div>

          {state.isRefreshing ? (
            <div
              className="flex justify-center items-center py-20"
              role="status"
              aria-live="polite"
            >
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"
                aria-hidden="true"
              />
              <p className="ml-4 text-blue-600">Cargando productos...</p>
            </div>
          ) : (
            <>
              {/* Cards para móvil */}
              <div className="block md:hidden">
                {state.productos.length > 0 ? (
                  state.productos.map((producto) => (
                    <ProductoCard
                      key={producto.id}
                      producto={producto}
                      onEdit={handleOpenEdit}
                    />
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {state.searchTerm
                        ? `No se encontraron resultados para "${state.searchTerm}"`
                        : "No hay productos registrados"}
                    </p>
                  </div>
                )}
              </div>

              {/* Tabla para desktop */}
              <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                <ProductoTable
                  productos={state.productos}
                  searchTerm={state.searchTerm}
                  onEdit={handleOpenEdit}
                />
              </div>
            </>
          )}

          {/* Paginación */}
          {!state.isRefreshing && state.productos.length > 0 && (
            <Pagination
              currentPage={state.currentPage}
              totalPages={state.totalPages}
              onPageChange={(page) =>
                loadProductos(page, perPage, state.searchTerm)
              }
            />
          )}
        </div>

        {/* Modal Crear Producto */}
        <ProductoFormModal
          form={createForm}
          show={state.showCreateModal}
          onClose={() =>
            setState((prev) => ({ ...prev, showCreateModal: false }))
          }
          onSubmit={handleCreateSubmit}
          isLoading={state.isCreating}
        />

        {/* Modal Editar Producto */}
        <ProductoFormModal
          form={editForm}
          show={state.showEditModal}
          onClose={() =>
            setState((prev) => ({
              ...prev,
              showEditModal: false,
              editingProducto: null,
            }))
          }
          onSubmit={handleEditSubmit}
          isLoading={state.isUpdating}
          title="Editar Producto"
          description="Modifica el nombre y la descripción del producto."
          submitText="Guardar Cambios"
          loadingText="Guardando..."
        />
      </div>
    </div>
    </RouteGuard>
  );
}