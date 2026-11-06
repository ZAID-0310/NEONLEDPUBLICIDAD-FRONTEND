import Link from "next/link";
import { SocialMedia } from "./SocialMedia";

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
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/letras-acrilico" className="hover:text-[#48A8FF] transition-colors">Letras de Acrílico</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/letras-doradas" className="hover:text-[#48A8FF] transition-colors">Letras de Aluminio Doradas 3D</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/letras-plateadas" className="hover:text-[#48A8FF] transition-colors">Letras de Aluminio Plateadas 3D</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/letreros-luminosos" className="hover:text-[#48A8FF] transition-colors">Letreros Luminosos</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/neon-led" className="hover:text-[#48A8FF] transition-colors">Neón LED</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/cajas-luminosas" className="hover:text-[#48A8FF] transition-colors">Cajas Luminosas</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/letras-neon" className="hover:text-[#48A8FF] transition-colors">Letras de Neón en Tubos de Vidrio</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wide">
                Pantallas y Soluciones Digitales
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-gray-300">
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/displays" className="hover:text-[#48A8FF] transition-colors">Monitores de Publicidad</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/pantalla-led" className="hover:text-[#48A8FF] transition-colors">Pantallas LED</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/holografico" className="hover:text-[#48A8FF] transition-colors">Holográfico</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/pixel-led" className="hover:text-[#48A8FF] transition-colors">Pixel LED</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/techos-led" className="hover:text-[#48A8FF] transition-colors">Techos LED</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wide">
                Impresión de Gran Formato
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-gray-300">
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/impresion-vinilo" className="hover:text-[#48A8FF] transition-colors">Impresión en Vinilo</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/menu-board" className="hover:text-[#48A8FF] transition-colors">Menú Board</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wide">
                Mobiliario y Ambientación
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-gray-300">
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/sillas-luminosas" className="hover:text-[#48A8FF] transition-colors">Sillas Luminosas</Link></li>
                <li className="flex items-start gap-2"><span className="text-[#48A8FF] mt-1">•</span> <Link href="/productos/letras-pintadas" className="hover:text-[#48A8FF] transition-colors">Letras Pintadas en MDF</Link></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================
          SECCIÓN INFERIOR: LOGO, LEGALES Y REDES
          ========================================= */}
      <div className="border-t border-gray-800 py-12 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            
            {/* Bloque Izquierdo: Logo + Teléfono */}
            <div className="flex flex-col items-start">
              <img
                src="/header_footer/Logo.oficial.Neon.Led.Publicidad.webp"
                alt="Logo Neon Led Publicidad"
                width="213"
                height="75"
                className="w-[200px] h-auto mb-6"
              />
              
              <div className="flex items-center gap-3 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="https://wa.me/51994078320" target="_blank" rel="noopener noreferrer" className="hover:text-[#48A8FF] transition-colors">
                  +51 994 078 320
                </a>
              </div>
            </div>

            {/* Bloque Central: Legales */}
            <div>
              <h3 className="text-white text-sm font-bold mb-6 uppercase tracking-wide">
                Legales
              </h3>
              <ul className="flex flex-col gap-4 text-sm text-gray-300">
                <li>
                  <Link href="/politica-privacidad" className="hover:text-[#48A8FF] transition-colors">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terminosycondiciones" className="hover:text-[#48A8FF] transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/reclamaciones" className="hover:text-[#48A8FF] transition-colors flex items-center gap-2">
                    Libro de reclamaciones
                  </Link>
                </li>
                <li>
                  <Link href="/trabaja-con-nosotros" className="hover:text-[#48A8FF] transition-colors">
                    Trabaja con nosotros
                  </Link>
                </li>
              </ul>
            </div>

            {/* Bloque Derecho: Redes Sociales */}
            <div>
              <h3 className="text-white text-sm font-bold mb-6 uppercase tracking-wide">
                Redes Sociales
              </h3>
              <div className="scale-110 origin-left">
                <SocialMedia />
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
