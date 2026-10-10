"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API_URL from "@/api/url";

const DEPARTAMENTOS_PERU = [
  "Amazonas",
  "Áncash",
  "Apurímac",
  "Arequipa",
  "Ayacucho",
  "Cajamarca",
  "Callao",
  "Cusco",
  "Huancavelica",
  "Huánuco",
  "Ica",
  "Junín",
  "La Libertad",
  "Lambayeque",
  "Lima",
  "Loreto",
  "Madre de Dios",
  "Moquegua",
  "Pasco",
  "Piura",
  "Puno",
  "San Martín",
  "Tacna",
  "Tumbes",
  "Ucayali",
];

const initialFormData = {
  nombre: "",
  apellido: "",
  tipoDocumento: "",
  dni: "",
  email: "",
  telefono: "",
  departamento: "",
  direccion: "",
  distrito: "",
  id_servicio: "",
  tipoReclamo: "",
  fechaIncidente: "",
  montoReclamado: "",
  descripcionServicio: "",
  checkReclamoForm: false,
  aceptaPoliticaPrivacidad: false,
  estado: "Pendiente",
};

export default function Page() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanValue =
      name === "montoReclamado" ? value.replace(/-/g, "") : value;
    setFormData((prevData) => ({ ...prevData, [name]: cleanValue }));
    // se limpia el error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validaciones generales
  const rules = [
    {
      field: "nombre",
      test: (v) => v.trim() !== "",
      message: "El nombre es obligatorio.",
    },
    {
      field: "apellido",
      test: (v) => v.trim() !== "",
      message: "El apellido es obligatorio.",
    },
    {
      field: "tipoDocumento",
      test: (v) => v !== "",
      message: "Debes indicar el tipo de documento.",
    },
    {
      field: "email",
      test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: "El email no tiene un formato válido.",
    },
    {
      field: "telefono",
      test: (v) => /^\d{6,15}$/.test(v),
      message: "El teléfono debe tener entre 6 y 15 dígitos.",
    },
    {
      field: "departamento",
      test: (v) => v.trim() !== "",
      message: "El departamento es obligatorio.",
    },
    {
      field: "direccion",
      test: (v) => v.trim() !== "",
      message: "La dirección es obligatoria.",
    },
    {
      field: "distrito",
      test: (v) => v.trim() !== "",
      message: "El distrito es obligatorio.",
    },
    {
      field: "id_servicio",
      test: (v) => v !== "",
      message: "Debes seleccionar un servicio.",
    },
    {
      field: "tipoReclamo",
      test: (v) => v !== "",
      message: "Debes indicar si es un reclamo o una queja.",
    },
    {
      field: "fechaIncidente",
      test: (v) => v !== "" && new Date(v) <= new Date(),
      message: "La fecha no es válida.",
    },
    {
      field: "descripcionServicio",
      test: (v) => v.trim().length >= 20 && v.length <= 1050,
      message: "La descripción debe tener entre 20 y 1050 caracteres.",
    },
    {
      field: "checkReclamoForm",
      test: (v) => v === true,
      message: "Debes confirmar que los datos son veraces.",
    },
    {
      field: "aceptaPoliticaPrivacidad",
      test: (v) => v === true,
      message: "Debes aceptar la política de privacidad.",
    },
  ];

  // validaciones de DNI
  function validateDni(data) {
    if (!data.dni.trim()) return "El número de documento es obligatorio.";
    if (data.tipoDocumento === "DNI" && !/^\d{8}$/.test(data.dni))
      return "El DNI debe tener 8 dígitos y no contener letras.";
    if (data.tipoDocumento === "CE" && !/^[a-zA-Z0-9]{9,12}$/.test(data.dni))
      return "El CE debe tener entre 9 y 12 caracteres.";
    if (
      data.tipoDocumento === "Pasaporte" &&
      !/^[a-zA-Z0-9]{5,20}$/.test(data.dni)
    )
      return "El pasaporte debe tener entre 5 y 20 caracteres.";
    return null;
  }

  function validate(data) {
    const errors = {};
    rules.forEach(({ field, test, message }) => {
      if (!test(data[field])) errors[field] = message;
    });
    const dniError = validateDni(data);
    if (dniError) errors.dni = dniError;
    return errors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      Swal.fire({
        title: "Revisa el formulario",
        text: "Hay campos incompletos o incorrectos.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(`${API_URL}/api/reclamaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData(initialFormData);
        setErrors({});

        Swal.fire({
          title: "¡Solicitud enviada con éxito!",
          icon: "success",
          confirmButtonColor: "#0c1a27",
        });
      } else {
        setStatus("error");
        const data = await response.json().catch(() => null);
        const backendErrors = data?.errors;
        const primerError = backendErrors
          ? Object.values(backendErrors)[0][0]
          : "Ocurrió un error al enviar el mensaje.";

        if (backendErrors) {
          const mapped = {};
          Object.entries(backendErrors).forEach(([key, msgs]) => {
            mapped[key] = msgs[0];
          });
          setErrors((prev) => ({ ...prev, ...mapped }));
        }

        Swal.fire({
          title: "Error",
          text: primerError,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#0c1a27",
        });
      }
    } catch (error) {
      setStatus("error");
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al enviar el mensaje. Intenta nuevamente.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#0c1a27",
      });
    }
  };

  return (
    <>
      <main
        className="relative flex p-4 sm:p-8 justify-center items-center text-white min-h-[300px] md:min-h-[500px] lg:min-h-[600px] overflow-hidden"
        style={{
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: "url('/reclamaciones/hero-background.png')",
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

        <div className="relative z-20 flex items-center justify-center">
          <div className="text-center md:text-left max-w-4xl px-4 mt-8 md:mt-0">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-cyan-400">COMPROMETIDOS</span>{" "}
              <span className="text-white">CON TU MARCA,</span>
              <br />
              <span className="text-white">APASIONADOS POR EL DISEÑO</span>
            </h1>
          </div>
        </div>
      </main>
      <section className="p-4 sm:p-8 text-[#b2b2b2] md:border-2 my-8 md:my-16 border-[#b2b2b2] max-w-3xl mx-auto">
        <h2 className="text-center text-white md:text-left text-lg md:text-xl font-semibold mb-4 text-balance">
          Déjanos tus datos para poder atender tu reclamo
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <h3 className="text-xl text-center mb-4 mt-2 text-white md:text-left">
            Identidad del consumidor reclamante
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre*"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={errors.nombre}
            />
            <Input
              label="Apellido*"
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              error={errors.apellido}
            />

            <Select
              label="Tipo de documento*"
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              error={errors.tipoDocumento}
              options={[
                { value: "DNI", label: "DNI" },
                { value: "CE", label: "Carné de Extranjería" },
                { value: "Pasaporte", label: "Pasaporte" },
              ]}
            />

            <Input
              label="Número de documento*"
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              maxLength={15}
              error={errors.dni}
            />

            <Input
              label="Email*"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label="Teléfono*"
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              error={errors.telefono}
            />
            <Input
              label="Departamento*"
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              error={errors.departamento}
            />
            <Input
              label="Dirección*"
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              error={errors.direccion}
            />
            <Input
              label="Distrito*"
              type="text"
              name="distrito"
              value={formData.distrito}
              onChange={handleChange}
              error={errors.distrito}
            />
          </div>

          <h3 className="text-xl text-center mb-4 mt-8 text-white md:text-left">
            Información del servicio
          </h3>

          {/* Tipo de solicitud */}
          <div className="mb-2">
            <p className="text-sm mb-2 text-white md:text-[#b2b2b2]">
              Tipo de solicitud*
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RadioCard
                name="tipoReclamo"
                value="Reclamo"
                checked={formData.tipoReclamo === "Reclamo"}
                onChange={handleChange}
                title="Reclamo"
                description="Disconformidad con el producto o servicio"
              />
              <RadioCard
                name="tipoReclamo"
                value="Queja"
                checked={formData.tipoReclamo === "Queja"}
                onChange={handleChange}
                title="Queja"
                description="Malestar con la atención al cliente"
              />
            </div>
            {errors.tipoReclamo && <ErrorText>{errors.tipoReclamo}</ErrorText>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Select
              label="Servicio*"
              name="id_servicio"
              value={formData.id_servicio}
              onChange={handleChange}
              error={errors.id_servicio}
              options={[
                { value: 1, label: "Diseño Web y Desarrollo Web" },
                { value: 2, label: "Gestión de Redes Sociales" },
                { value: 3, label: "Marketing y Gestión Digital" },
                { value: 4, label: "Branding y Diseño" },
              ]}
            />

            <Input
              label="Fecha del incidente*"
              type="date"
              name="fechaIncidente"
              value={formData.fechaIncidente}
              onChange={handleChange}
              error={errors.fechaIncidente}
            />

            <Input
              label="Monto reclamado"
              type="number"
              min="0"
              name="montoReclamado"
              value={formData.montoReclamado}
              onChange={handleChange}
              error={errors.montoReclamado}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm mb-1 text-white md:text-[#b2b2b2]">
              Descripción del servicio*
            </label>
            <textarea
              name="descripcionServicio"
              value={formData.descripcionServicio}
              onChange={handleChange}
              className={`border-2 p-2 w-full bg-white text-black ${
                errors.descripcionServicio
                  ? "border-red-500"
                  : "border-[#b2b2b2]"
              }`}
              rows={5}
              placeholder="Cuéntanos qué ocurrió, con el mayor detalle posible..."
            />
            <div className="flex justify-between">
              {errors.descripcionServicio ? (
                <ErrorText>{errors.descripcionServicio}</ErrorText>
              ) : (
                <span />
              )}
              <span className="text-xs text-[#b2b2b2]">
                {formData.descripcionServicio.length}/1050
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Checkbox
              name="checkReclamoForm"
              checked={formData.checkReclamoForm}
              onChange={handleCheckboxChange}
              error={errors.checkReclamoForm}
            >
              Doy fe que los datos e información proporcionados son veraces*
            </Checkbox>

            <Checkbox
              name="aceptaPoliticaPrivacidad"
              checked={formData.aceptaPoliticaPrivacidad}
              onChange={handleCheckboxChange}
              error={errors.aceptaPoliticaPrivacidad}
            >
              Acepto la{" "}
              <a
                className="text-[#007bf9] underline"
                href="/politica-privacidad"
              >
                Política de Privacidad y Protección de Datos Personales
              </a>
              *
            </Checkbox>
          </div>

          <p className="mt-6 text-sm">
            Neon Led Publicidad deberá dar respuesta al reclamo o queja en un
            plazo no mayor a quince (15) días hábiles.
          </p>

          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#0c1a27] rounded-full p-4 px-8 md:px-16 w-full md:w-auto font-bold block m-auto text-white mt-6 disabled:opacity-60"
          >
            {status === "loading" ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </section>
    </>
  );
}

function ErrorText({ children }) {
  return <p className="text-red-500 text-xs mt-1">{children}</p>;
}
function Input({ label, type, name, value, onChange, maxLength, error }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-sm mb-1 text-white md:text-[#b2b2b2]">
          {label}
        </label>
      )}
      <input
        className={`border-2 p-2 bg-white text-black ${
          error ? "border-red-500" : "border-[#b2b2b2]"
        }`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function Select({ label, name, value, onChange, options, error }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-sm mb-1 text-white md:text-[#b2b2b2]">
          {label}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`border-2 p-2 bg-white text-black ${
          error ? "border-red-500" : "border-[#b2b2b2]"
        }`}
      >
        <option value="" disabled>
          Selecciona una opción
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function RadioCard({ name, value, checked, onChange, title, description }) {
  return (
    <label
      className={`flex flex-col gap-1 cursor-pointer rounded-lg border-2 p-4 transition-colors ${
        checked
          ? "border-cyan-400 bg-[#0c1a27] text-white"
          : "border-[#b2b2b2] bg-white text-black hover:border-cyan-400"
      }`}
    >
      <div className="flex items-center gap-2">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 accent-cyan-400"
        />
        <span className="font-semibold">{title}</span>
      </div>
      <span
        className={`text-sm ${checked ? "text-[#b2b2b2]" : "text-gray-600"}`}
      >
        {description}
      </span>
    </label>
  );
}

function Checkbox({ name, checked, onChange, error, children }) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="w-5 h-5 mt-0.5 accent-cyan-400"
        />
        <span className="text-sm md:text-base">{children}</span>
      </label>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
