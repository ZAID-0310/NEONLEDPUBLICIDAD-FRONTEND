"use client"

import { useState } from "react"
import Image from "next/image"
import Swal from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"
import API_URL from "@/api/url"
import { Inter } from "next/font/google"
import { 
  MapPin, 
  MessageSquare, 
  Clock, 
  Send, 
  ArrowRight 
} from "lucide-react"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
})

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    distrito: "",
    email: "",
    tipo_reclamo: "",
    mensaje: "",
  })

  const [status, setStatus] = useState(null)

  const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
  const numberRegex = /^\+?\d*$/
  const textTypeInputs = ["nombre", "apellido", "distrito"]

  const handleChange = (e) => {
    const { name, value } = e.target
    let newValue = value

    if (textTypeInputs.includes(String(name)) && textRegex.test(value)) {
      newValue = value
    } else if (String(name) === "telefono") {
      const soloDigitos = value.replace(/\D/g, "").slice(0, 9)
      newValue = soloDigitos
    } else if (["email", "tipo_reclamo", "mensaje"].includes(String(name))) {
      newValue = value
    } else {
      newValue = formData[name]
    }

    setFormData((prevData) => ({ ...prevData, [name]: newValue }))
  }

  const validateForm = () => {
  const errors = {}

  // Nombre
  if (!formData.nombre.trim()) {
    errors.nombre = "El nombre es obligatorio."
  } else if (formData.nombre.trim().length < 2) {
    errors.nombre = "El nombre debe tener al menos 2 letras."
  }

  // Apellido
  if (!formData.apellido.trim()) {
    errors.apellido = "El apellido es obligatorio."
  } else if (formData.apellido.trim().length < 2) {
    errors.apellido = "El apellido debe tener al menos 2 letras."
  }

  // Teléfono (Perú: 9 dígitos empezando por 9)
  const telefonoLimpio = formData.telefono.replace(/\s+/g, "")
  if (!telefonoLimpio) {
    errors.telefono = "El teléfono es obligatorio."
  } else if (!/^(\+?51)?9\d{8}$/.test(telefonoLimpio)) {
    errors.telefono = "Ingresa un teléfono válido (9 dígitos, ej. 994078320)."
  }

  // Distrito
  if (!formData.distrito.trim()) {
    errors.distrito = "El distrito es obligatorio."
  }

  // Email
  if (!formData.email.trim()) {
    errors.email = "El correo electrónico es obligatorio."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
    errors.email = "Ingresa un correo válido (ej. nombre@correo.com)."
  }

  // Motivo
  if (!formData.tipo_reclamo) {
    errors.tipo_reclamo = "Selecciona un motivo de contacto."
  }

  // Mensaje
  if (!formData.mensaje.trim()) {
    errors.mensaje = "El mensaje es obligatorio."
  } else if (formData.mensaje.trim().length < 10) {
    errors.mensaje = "El mensaje debe tener al menos 10 caracteres."
  }

  return errors
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    //Validación antes de enviar
  const validationErrors = validateForm()

  if (Object.keys(validationErrors).length > 0) {
    const primerCampo = Object.keys(validationErrors)[0]

  Swal.fire({
  title: "Revisa tus datos",
  html: `
    <ul style="text-align:left; margin:0 0 15px 0; padding-left:0; list-style-type: none;">
  ${Object.values(validationErrors)
    .map((msg) => `<li style="margin-bottom: 6px; display: flex; align-items: flex-start;">
        <span style="color: #06b6d4; margin-right: 10px; font-weight: bold; text-shadow: 0 0 8px #06b6d4;">•</span> 
        <span>${msg}</span>
      </li>`)
    .join("")}
</ul>
    
    <!-- BARRA DE PROGRESO PERSONALIZADA -->
    <div style="width: 100%; height: 6px; background: #1e293b; border-radius: 9999px; margin-top: 10px; overflow: hidden; position: relative;">
      <div style="height: 100%; width: 100%; background: #06b6d4; border-radius: 9999px; position: absolute; left: 0; top: 0; animation: customProgressBar 3s linear forwards;"></div>
    </div>
    
    <style>
      @keyframes customProgressBar {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      /* Asegurarnos de que el modal tenga espacio para la barra */
      .swal2-html-container {
        margin-bottom: 10px !important;
      }
    </style>
  `,
  icon: "warning",
  background: "#0b1220",
  color: "#ffffff",
  confirmButtonColor: "#06b6d4",
  timer: 3000,
  timerProgressBar: false,  
  showConfirmButton: false,   
  allowOutsideClick: false,
  allowEscapeKey: false,
}).then((result) => {
  document.getElementById(primerCampo)?.focus()
})

    return
  }
    
    setStatus("loading")

    try {
      const response = await fetch(`${API_URL}/api/contactanos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus("success")
        setFormData({
          nombre: "",
          apellido: "",
          telefono: "",
          distrito: "",
          email: "",
          tipo_reclamo: "",
          mensaje: "",
        })
        Swal.fire({
          title: "¡Mensaje enviado con éxito!",
          text: "Nos pondremos en contacto contigo a la brevedad.",
          icon: "success",
          background: "#0b1220",
          color: "#ffffff",
          confirmButtonColor: "#06b6d4",
          timer: 2500,
        })
      } else {
        setStatus("error")
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error al enviar el mensaje. Inténtalo de nuevo.",
          icon: "error",
          background: "#0b1220",
          color: "#ffffff",
          confirmButtonColor: "#06b6d4",
        })
      }
    } catch (error) {
      setStatus("error")
      Swal.fire({
        title: "Error",
        text: "Hubo un problema de conexión con el servidor.",
        icon: "error",
        background: "#0b1220",
        color: "#ffffff",
        confirmButtonColor: "#06b6d4",
      })
    } finally {
      setStatus(null)
    }
  }

  const SocialMediaSection = () => {
    const socialMediaLinks = [
      { href: "https://www.facebook.com/profile.php?id=61578497411241", src: "/contacto/Facebook.png", alt: "Facebook" },
      { href: "https://www.tiktok.com/@neonled.publicidad", src: "/contacto/Tiktok.png", alt: "TikTok" },
      { href: "https://www.instagram.com/neonledpublicidad.peru?igsh=a3RseGpuYXM5ZnZo", src: "/contacto/ig.png", alt: "Instagram" },
      { href: "https://www.youtube.com/@neonledpublicidadpe", src: "/contacto/yootube.png", alt: "YouTube" },
    ]

    return (
      <footer aria-labelledby="redes-sociales" className="w-full bg-[#050914] border-t border-cyan-500/15 py-10 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-2">Comunidad & Redes</p>
          <h3 id="redes-sociales" className="text-2xl sm:text-3xl font-extrabold mb-6 text-white tracking-tight">
            Síguenos en nuestras redes
          </h3>
          <div className="flex justify-center items-center gap-4 sm:gap-6">
            {socialMediaLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.alt}
                className="group relative p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all duration-200 active:scale-95 shadow-md hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
              >
                <div className="w-9 h-9 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                  <Image src={social.src} alt={social.alt} width={36} height={36} className="object-contain" unoptimized />
                </div>
              </a>
            ))}
          </div>
        </div>
      </footer>
    )
  }

  return (
    <main className={`min-h-screen bg-[#060a14] text-white ${inter.className} selection:bg-cyan-500 selection:text-black`}>
      <section className="relative min-h-screen overflow-hidden pb-16 pt-24 lg:pt-28" aria-labelledby="titulo-contacto">
        
        {/* Fondos originales con viñeta ambiental */}
        <div
          className="absolute top-0 left-0 w-full h-1/2 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none"
          style={{ backgroundImage: "url('/contacto/fondo contacto2.png')" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-full h-1/2 bg-cover bg-center bg-no-repeat opacity-35 pointer-events-none"
          style={{ backgroundImage: "url('/contacto/fondo contacto.jpg')" }}
          aria-hidden="true"
        />

        {/* Luces y resplandores neón ambientales */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a14]/90 via-[#060a14]/75 to-[#060a14] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[400px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none" />

        <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* Columna Izquierda: Canales e Información Real de la Empresa */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              
              {/* Encabezado limpio y directo */}
              <div className="space-y-3">
                <h1 id="titulo-contacto" className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white tracking-tight leading-[1.15]">
                  Contáctanos para fabricar tu{" "}
                  <span className="relative inline-block text-cyan-300 drop-shadow-[0_0_18px_rgba(6,182,212,0.95)]">
                    letrero luminoso
                  </span>{" "}
                  personalizado
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Comunícate directamente a través de nuestros canales oficiales o déjanos un mensaje en el formulario para coordinar tu proyecto.
                </p>
              </div>

              {/* Canales oficiales verificados */}
              <div className="space-y-3.5">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/+51994078320?text=Hola,%20quisiera%20más%20información%20de%20sus%20productos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-emerald-400/50 hover:bg-slate-900/90 transition-all duration-200 active:scale-[0.99] shadow-lg"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">WhatsApp</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">+51 994 078 320</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </a>

                {/* Dirección y Mapa */}
                <a
                  href="https://maps.app.goo.gl/jWD3Y4GgzaNj1WtY7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-cyan-400/50 hover:bg-slate-900/90 transition-all duration-200 active:scale-[0.99] shadow-lg"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">Dirección</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">Ate, Lima</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">Urb. Alameda La Rivera Mz F, Lt. 30</p>
                      <p className="text-xs text-slate-400">Santa Martha, Ate Vitarte, Perú</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </a>

                {/* Horario de Atención (Dato 100% verificado del Footer de la empresa) */}
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">Horario de Atención</span>
                    <p className="text-xs text-slate-300 mt-0.5">Lunes a Viernes: 9:00 a.m. – 6:00 p.m.</p>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Asistencia con Eon (Mascota oficial) */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/70 to-blue-950/60 border border-cyan-500/25 p-4 sm:p-5 shadow-lg flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    Atención Neón Led
                  </span>
                  <p className="text-sm font-bold text-white leading-snug">
                    ¿Tienes dudas sobre medidas o diseños?
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Escríbenos tus consultas o requerimientos y nuestro equipo te responderá a la brevedad.
                  </p>
                </div>
                <div className="relative shrink-0 w-20 sm:w-24 flex items-center justify-center">
                  <Image
                    src="/contacto/EON-INDICANDO.png"
                    alt="Eon la mascota oficial de Neon Led Publicidad"
                    width={100}
                    height={140}
                    className="w-auto h-28 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
                    priority
                  />
                </div>
              </div>

            </div>

            {/* Columna Derecha: Tarjeta de Formulario Neón */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="relative rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/25 shadow-[0_25px_60px_rgba(0,0,0,0.6),0_0_35px_rgba(6,182,212,0.15)] p-6 sm:p-8 overflow-hidden">
                
                {/* Resplandor neón superior */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

                <div className="mb-6 text-center">
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                    Solicita Información
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1">
                    Completa tus datos y nos comunicaremos contigo de inmediato.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Nombre y Apellido */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="nombre" className="text-xs font-bold text-slate-200">
                        Nombre <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        id="nombre"
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Ej. Carlos"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1a] border border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder:text-slate-500 text-sm transition-all duration-150 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="apellido" className="text-xs font-bold text-slate-200">
                        Apellido <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        id="apellido"
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        required
                        placeholder="Ej. Fernández"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1a] border border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder:text-slate-500 text-sm transition-all duration-150 outline-none"
                      />
                    </div>
                  </div>

                  {/* Teléfono y Distrito */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="telefono" className="text-xs font-bold text-slate-200">
                        Teléfono / WhatsApp <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        id="telefono"
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                        placeholder="999 999 999"
                        maxLength={9}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1a] border border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder:text-slate-500 text-sm transition-all duration-150 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="distrito" className="text-xs font-bold text-slate-200">
                        Distrito <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        id="distrito"
                        type="text"
                        name="distrito"
                        value={formData.distrito}
                        onChange={handleChange}
                        required
                        placeholder="Ej. Ate / Miraflores"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1a] border border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder:text-slate-500 text-sm transition-all duration-150 outline-none"
                      />
                    </div>
                  </div>

                  {/* Correo Electrónico */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-slate-200">
                      Correo Electrónico <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="nombre@correo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1a] border border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder:text-slate-500 text-sm transition-all duration-150 outline-none"
                    />
                  </div>

                  {/* Motivo de Contacto */}
                  <div className="space-y-1.5">
                    <label htmlFor="tipo_reclamo" className="text-xs font-bold text-slate-200">
                      Motivo de contacto <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="tipo_reclamo"
                        name="tipo_reclamo"
                        value={formData.tipo_reclamo}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1a] border border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white text-sm transition-all duration-150 outline-none appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-slate-900 text-slate-400">
                          Selecciona un motivo...
                        </option>
                        <option value="CONSULTA" className="bg-slate-900 text-white">Consulta</option>
                        <option value="SUGERENCIA" className="bg-slate-900 text-white">Sugerencia</option>
                        <option value="OTROS" className="bg-slate-900 text-white">Otros</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-cyan-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div className="space-y-1.5">
                    <label htmlFor="mensaje" className="text-xs font-bold text-slate-200">
                      Mensaje <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      placeholder="Escribe aquí tu mensaje detallando tus consultas o requerimientos..."
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1a] border border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder:text-slate-500 text-sm transition-all duration-150 outline-none resize-none h-[110px]"
                    />
                  </div>

                  {/* Botón de Enviar */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-extrabold text-sm tracking-wider text-white uppercase bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {status === "loading" ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <span>Enviar</span>
                          <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      <SocialMediaSection />
    </main>
  )
}

export default Contacto
