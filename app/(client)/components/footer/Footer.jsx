
import Link from "next/link";
import { SocialMedia } from "./SocialMedia";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  BookOpen,
  Building2,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#000017] text-white rounded-t-[40px] overflow-hidden">
      {/* =========================================
          SECCIÓN SUPERIOR: SERVICIOS (4 COLUMNAS)
          ========================================= */}
      <div className="py-12 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wide">
                Rotulación y Letreros Luminosos
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/letras-acrilico"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Letras de Acrílico
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/letras-doradas"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Letras de Aluminio Doradas 3D
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/letras-plateadas"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Letras de Aluminio Plateadas 3D
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/letreros-luminosos"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Letreros Luminosos
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/neon-led"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Neón LED
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/cajas-luminosas"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Cajas Luminosas
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/letras-neon"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Letras de Neón en Tubos de Vidrio
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wide">
                Pantallas y Soluciones Digitales
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/displays"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Monitores de Publicidad
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/pantalla-led"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Pantallas LED
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/holografico"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Holográfico
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/pixel-led"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Pixel LED
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/techos-led"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Techos LED
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wide">
                Impresión de Gran Formato
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/impresion-vinilo"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Impresión en Vinilo
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/menu-board"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Menú Board
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wide">
                Mobiliario y Ambientación
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/sillas-luminosas"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Sillas Luminosas
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#48A8FF] leading-[1.5] shrink-0">•</span>
                  <Link
                    href="/productos/letras-pintadas"
                    className="hover:text-[#48A8FF] transition-colors"
                  >
                    Letras Pintadas en MDF
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          SECCIÓN INFERIOR: MARCA, LEGALES Y REDES
          ========================================= */}
      <div className="border-t border-gray-800/80 py-12 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.1fr] gap-10 lg:gap-12 items-start">
            {/* -----------------------------------------
                COLUMNA 1: Marca & Contacto Rápido
                ----------------------------------------- */}
            <div className="flex flex-col items-start gap-4">
              <Link href="/" className="inline-block group">
                <img
                  src="/header_footer/logo_vertical_neon_led_publicidad.webp"
                  alt="Logo Neon Led Publicidad"
                  width="799"
                  height="415"
                  className="w-[155px] h-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </Link>

              <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
                Especialistas en ingeniería visual, letreros luminosos de alto
                impacto, acrílico 3D y tecnología neón LED para marcas en todo
                el Perú.
              </p>

              <div className="flex flex-col gap-2.5 w-full max-w-md">
                {/* Atención al cliente */}
                <a
                  href="https://wa.me/51994078320"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#48A8FF]/50 hover:bg-[#48A8FF]/10 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#48A8FF]/10 text-[#48A8FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] tracking-wider uppercase text-gray-400 font-medium">
                      Atención al Cliente
                    </span>
                    <span className="text-xs font-semibold text-white group-hover:text-[#48A8FF] transition-colors truncate">
                      +51 994 078 320
                    </span>
                  </div>
                </a>

                {/* Cotizaciones & Correo */}
                <a
                  href="https://mail.google.com/mail/?view=cm&to=Publicidadnls@gmail.com&su=Cotizaci%C3%B3n+Prioritaria%3A+Proyecto+de+Iluminaci%C3%B3n+LED+-+NLP&body=Hola+equipo+de+Neon+Led+Publicidad%2C%0A%0AEstoy+interesado+en+modernizar+la+iluminaci%C3%B3n+de+mi+establecimiento.+Me+gustar%C3%ADa+recibir+informaci%C3%B3n+y+una+cotizaci%C3%B3n+base+sobre%3A%0A%0AProducto(s)%3A%0ATipo+de+proyecto+(Gimnasio+%2F+Discoteca+%2F+Local+Comercial)%3A%0AMedidas+aproximadas%3A%0ACiudad%3A%0A%0AQuedo+atento+a+su+respuesta+para+coordinar+una+asesor%C3%ADa.+Saludos."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#48A8FF]/50 hover:bg-[#48A8FF]/10 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#48A8FF]/10 text-[#48A8FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] tracking-wider uppercase text-gray-400 font-medium">
                      Cotizaciones & Correo
                    </span>
                    <span className="text-xs font-semibold text-white group-hover:text-[#48A8FF] transition-colors truncate">
                      Publicidadnls@gmail.com
                    </span>
                  </div>
                </a>

                {/* Taller & Fábrica */}
                <a
                  href="https://www.google.com/maps/place/Neon+LED+Publicidad+-+Letreros+Ne%C3%B3n+y+Letreros+Luminosos/@-12.0255704,-76.9423141,96m/data=!3m1!1e3!4m10!1m2!2m1!1sneo+led+publicidad!3m6!1s0x9105c9c0370c5717:0x31763021f0f0a705!8m2!3d-12.0255704!4d-76.9420164!15sChJuZW8gbGVkIHB1YmxpY2lkYWRaFCISbmVvIGxlZCBwdWJsaWNpZGFkkgEObmVvbl9zaWduX3Nob3CaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnBDVTFFeldrVlViRkpoV2xSb05GSXhaR3RsUjFvd1RsUkJlR016WXhBQuABAPoBBAgAEEc!16s%2Fg%2F11qpz5s0m5?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#48A8FF]/50 hover:bg-[#48A8FF]/10 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#48A8FF]/10 text-[#48A8FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] tracking-wider uppercase text-gray-400 font-medium">
                      Taller & Fábrica
                    </span>
                    <span className="text-xs font-semibold text-white group-hover:text-[#48A8FF] transition-colors leading-tight line-clamp-2">
                      Urb. Alameda La Rivera Mz F Lot 30, Ate
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* -----------------------------------------
                COLUMNA 2: Legales y Empresa
                ----------------------------------------- */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-[#48A8FF] shadow-[0_0_8px_#48A8FF]" />
                <h3 className="text-white text-xs font-bold uppercase tracking-wider">
                  Legales y Empresa
                </h3>
              </div>

              <ul className="flex flex-col gap-2 text-xs text-gray-300">
                <li>
                  <Link
                    href="/politica-privacidad"
                    className="flex items-center justify-between py-1.5 hover:text-[#48A8FF] transition-colors group"
                  >
                    <span>Política de privacidad</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#48A8FF] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terminosycondiciones"
                    className="flex items-center justify-between py-1.5 hover:text-[#48A8FF] transition-colors group"
                  >
                    <span>Términos y Condiciones</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#48A8FF] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reclamaciones"
                    className="flex items-center justify-between py-1.5 hover:text-[#48A8FF] transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      Libro de reclamaciones
                    </span>
                    <span className="text-[10px] font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
                      Virtual
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/nosotros"
                    className="flex items-center justify-between py-1.5 hover:text-[#48A8FF] transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#48A8FF]" />
                      Sobre Nosotros
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#48A8FF] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* -----------------------------------------
                COLUMNA 3: Redes Sociales & Horario
                ----------------------------------------- */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-[#48A8FF] shadow-[0_0_8px_#48A8FF]" />
                <h3 className="text-white text-xs font-bold uppercase tracking-wider">
                  Redes y Contacto
                </h3>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Descubre nuestros últimos trabajos, proyectos instalados y
                videos del proceso de fabricación en vivo.
              </p>

              {/* Grilla de Redes Sociales */}
              <SocialMedia />

              {/* Card Horario de Atención */}
              <div className="mt-2 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#48A8FF]/10 text-[#48A8FF] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">
                    Horario de Producción y Ventas
                  </span>
                  <span className="text-[11px] text-gray-300 mt-0.5">
                    Lunes a Sábado: 8:30 AM - 6:30 PM
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Domingos y feriados: Atención previa cita
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-footer con Copyright */}
          <div className="mt-12 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>
              © {new Date().getFullYear()} Neon LED Publicidad. Todos los
              derechos reservados.
            </p>
            <p className="text-gray-500">
              Ate, Lima - Envíos e instalaciones a todo el Perú
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

