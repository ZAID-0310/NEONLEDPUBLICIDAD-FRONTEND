"use client";

import { useEffect, useMemo, useState } from "react";
import RouteGuard from "@/app/dashboard/components/RouteGuard";
import Swal from "sweetalert2";
import {
  Star,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Loader2,
  X,
  Camera,
  User,
  MessageSquareText,
  CalendarDays,
  Quote,
  Users,
  Sparkles,
} from "lucide-react";
import testimonios_service from "./services/testimonios_service";

/* ------------------------------------------------------------------ */
/*  Selector de estrellas (input)                                     */
/* ------------------------------------------------------------------ */
function StarRatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              size={26}
              className={
                active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300 dark:text-gray-600"
              }
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        {value} de 5
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Estrellas de solo lectura                                         */
/* ------------------------------------------------------------------ */
function StarRatingDisplay({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-gray-300 dark:text-gray-600"
          }
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Switch on/off                                                     */
/* ------------------------------------------------------------------ */
function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 select-none"
    >
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          checked ? "bg-[#8c52ff]" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span
          className={`inline-block h-4.5 w-4.5 h-[18px] w-[18px] transform rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? "translate-x-[22px]" : "translate-x-1"
          }`}
        />
      </span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal de creación / edición                                       */
/* ------------------------------------------------------------------ */
function TestimonioFormModal({ initialData, onClose, onSaved }) {
  const isEdit = Boolean(initialData);
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [texto, setTexto] = useState(initialData?.texto || "");
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [fecha, setFecha] = useState(
    initialData?.fecha || new Date().toISOString().slice(0, 10)
  );
  const [activo, setActivo] = useState(initialData?.activo ?? true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(initialData?.avatar_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const nombreLimpio = nombre.trim();
    const textoLimpio = texto.trim();

    if (!nombreLimpio || !textoLimpio) {
      setError("Nombre y texto del testimonio son obligatorios.");
      return;
    }

    if (nombreLimpio.length < 2) {
      setError("El nombre del cliente debe tener al menos 2 caracteres.");
      return;
    }

    // Debe contener al menos una letra y solo caracteres válidos para nombres
    const nombreRegex = /^(?=.*[\p{L}])[\p{L}\p{N}\s.,'\-&/]+$/u;
    if (!nombreRegex.test(nombreLimpio)) {
      setError(
        "El nombre contiene caracteres inválidos o no incluye ninguna letra válida."
      );
      return;
    }

    const hoy = new Date().toISOString().slice(0, 10);
    if (fecha && fecha > hoy) {
      setError("La fecha a mostrar no puede ser posterior a hoy.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: nombreLimpio,
        texto: textoLimpio,
        rating,
        fecha,
        activo,
        avatarFile,
      };

      if (isEdit) {
        await testimonios_service.update(initialData.id, payload);
      } else {
        await testimonios_service.create(payload);
      }

      Swal.fire({
        title: isEdit ? "Testimonio actualizado" : "Testimonio creado",
        icon: "success",
        confirmButtonColor: "#8c52ff",
        timer: 1600,
        showConfirmButton: false,
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#8c52ff] to-[#6d28d9] px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={20} />
            <h3 className="text-lg font-bold">
              {isEdit ? "Editar testimonio" : "Nuevo testimonio"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={
                  preview ||
                  "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(nombre || "?") +
                    "&background=8c52ff&color=fff"
                }
                alt="Preview avatar"
                className="h-20 w-20 rounded-full border-4 border-purple-100 object-cover shadow-sm dark:border-purple-900/40"
              />
              <label
                htmlFor="avatar-input"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#8c52ff] text-white shadow-md transition-colors hover:bg-[#7a3fe0]"
              >
                <Camera size={15} />
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Foto de perfil
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Ideal 400×400px, máx. 2MB. Si no subes nada, se usa un avatar
                genérico.
              </p>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <User size={15} className="text-[#8c52ff]" />
              Nombre del cliente
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              minLength={2}
              maxLength={150}
              placeholder="Ej: María Gonzáles"
              className="w-full rounded-lg border border-gray-200 p-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#8c52ff] dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Texto */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <MessageSquareText size={15} className="text-[#8c52ff]" />
              Testimonio
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={600}
              rows={4}
              placeholder="¿Qué dijo el cliente sobre el trabajo?"
              className="w-full resize-none rounded-lg border border-gray-200 p-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#8c52ff] dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              required
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {texto.length}/600
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Calificación
            </label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          {/* Fecha */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <CalendarDays size={15} className="text-[#8c52ff]" />
              Fecha a mostrar
            </label>
            <input
              type="date"
              value={fecha}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#8c52ff] dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-400">
              Máximo la fecha de hoy. En el carrusel se muestra como texto
              relativo (ej. "Hace 2 meses").
            </p>
          </div>

          {/* Activo */}
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <ToggleSwitch
              checked={activo}
              onChange={setActivo}
              label="Visible en el carrusel del sitio"
            />
          </div>

          {/* Botones */}
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#8c52ff] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#7a3fe0] disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tarjeta de estadística                                            */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className={`rounded-lg p-2.5 ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-xl font-bold text-gray-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tarjeta de testimonio                                             */
/* ------------------------------------------------------------------ */
function TestimonioRow({
  testimonio,
  index,
  total,
  reordenando,
  onMover,
  onToggle,
  onEdit,
  onDelete,
}) {
  const t = testimonio;

  return (
    <div
      className={`flex items-start gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all dark:bg-gray-800 ${
        t.activo
          ? "border-gray-100 dark:border-gray-700"
          : "border-gray-100 opacity-60 dark:border-gray-700"
      }`}
    >
      {/* Reordenar */}
      <div className="flex shrink-0 flex-col gap-1 pt-0.5">
        <button
          onClick={() => onMover(index, -1)}
          disabled={index === 0 || reordenando}
          title="Subir"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:bg-purple-50 hover:text-[#8c52ff] disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-600 dark:text-gray-400"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={() => onMover(index, 1)}
          disabled={index === total - 1 || reordenando}
          title="Bajar"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:bg-purple-50 hover:text-[#8c52ff] disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-600 dark:text-gray-400"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Avatar */}
      <img
        src={
          t.avatar_url ||
          "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(t.nombre) +
            "&background=8c52ff&color=fff"
        }
        alt={t.nombre}
        className="h-12 w-12 shrink-0 rounded-full border border-gray-100 object-cover dark:border-gray-700"
      />

      {/* Contenido */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-gray-800 dark:text-white">
            {t.nombre}
          </span>
          <StarRatingDisplay rating={t.rating} />
          {t.activo ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <Eye size={11} />
              Visible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              <EyeOff size={11} />
              Oculto
            </span>
          )}
        </div>
        <p className="mt-1 flex items-start gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Quote
            size={13}
            className="mt-0.5 shrink-0 text-gray-300 dark:text-gray-600"
          />
          <span className="line-clamp-2">{t.texto}</span>
        </p>
      </div>

      {/* Acciones */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => onToggle(t.id)}
          title={t.activo ? "Ocultar del carrusel" : "Mostrar en el carrusel"}
          className={`rounded-lg p-2 transition-colors ${
            t.activo
              ? "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
              : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
          }`}
        >
          {t.activo ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button
          onClick={() => onEdit(t)}
          title="Editar"
          className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(t.id)}
          title="Eliminar"
          className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Página principal                                                  */
/* ------------------------------------------------------------------ */
export default function TestimoniosPage() {
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [reordenando, setReordenando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await testimonios_service.getAll();
      setTestimonios(data);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los testimonios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const stats = useMemo(() => {
    const total = testimonios.length;
    const activos = testimonios.filter((t) => t.activo).length;
    const promedio = total
      ? (
          testimonios.reduce((acc, t) => acc + Number(t.rating || 0), 0) /
          total
        ).toFixed(1)
      : "0.0";
    return { total, activos, ocultos: total - activos, promedio };
  }, [testimonios]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar este testimonio?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await testimonios_service.remove(id);
      Swal.fire({
        title: "Eliminado",
        icon: "success",
        confirmButtonColor: "#8c52ff",
        timer: 1400,
        showConfirmButton: false,
      });
      cargar();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message || "Error al eliminar.",
        icon: "error",
        confirmButtonColor: "#8c52ff",
      });
    }
  };

  const handleToggle = async (id) => {
    try {
      await testimonios_service.toggleActivo(id);
      cargar();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message || "Error al cambiar el estado.",
        icon: "error",
        confirmButtonColor: "#8c52ff",
      });
    }
  };

  const mover = async (index, direccion) => {
    const destino = index + direccion;
    if (destino < 0 || destino >= testimonios.length) return;

    const nuevaLista = [...testimonios];
    [nuevaLista[index], nuevaLista[destino]] = [
      nuevaLista[destino],
      nuevaLista[index],
    ];
    setTestimonios(nuevaLista);

    const ordenPayload = nuevaLista.map((t, i) => ({ id: t.id, orden: i }));

    setReordenando(true);
    try {
      await testimonios_service.reordenar(ordenPayload);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message || "Error al reordenar.",
        icon: "error",
        confirmButtonColor: "#8c52ff",
      });
      cargar(); // revertir con la data real del servidor
    } finally {
      setReordenando(false);
    }
  };

  return (
    <RouteGuard>
    <main className="flex h-[100vh] w-full flex-1 flex-col overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900 md:p-6">
      {/* Header */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
              <Star className="text-[#8c52ff]" size={24} />
              Testimonios
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Estos testimonios aparecen en el carrusel de la página
              "Nosotros". Usa las flechas para cambiar el orden.
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-[#8c52ff] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#7a3fe0]"
          >
            <Plus size={18} />
            Nuevo testimonio
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 gap-3 flex flex-wrap justify-between">
          <StatCard
            icon={Users}
            label="Total"
            value={stats.total}
            colorClass="bg-purple-50 text-[#8c52ff] dark:bg-purple-900/20"
          />
          <StatCard
            icon={Eye}
            label="Visibles"
            value={stats.activos}
            colorClass="bg-green-50 text-green-600 dark:bg-green-900/20"
          />
          <StatCard
            icon={EyeOff}
            label="Ocultos"
            value={stats.ocultos}
            colorClass="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          />
          <StatCard
            icon={Star}
            label="Rating promedio"
            value={stats.promedio}
            colorClass="bg-amber-50 text-amber-500 dark:bg-amber-900/20"
          />
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#8c52ff]" />
          <p className="font-medium text-gray-500 dark:text-gray-400">
            Cargando testimonios...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-4 text-center font-medium text-red-600 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : testimonios.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm dark:bg-gray-800">
          <Quote className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mb-1 font-medium text-gray-500 dark:text-gray-400">
            Aún no hay testimonios
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Crea el primero con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {testimonios.map((t, index) => (
            <TestimonioRow
              key={t.id}
              testimonio={t}
              index={index}
              total={testimonios.length}
              reordenando={reordenando}
              onMover={mover}
              onToggle={handleToggle}
              onEdit={(t) => {
                setEditing(t);
                setShowModal(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <TestimonioFormModal
          initialData={editing}
          onClose={() => setShowModal(false)}
          onSaved={cargar}
        />
      )}
    </main>
     </RouteGuard>
  );
}