"use client";

import Link from "next/link";
import Image from "next/image";
import NuestrosProductos from "./productos/components/NuestrosProductos";
import dynamic from "next/dynamic";
import Testimonials from "./nosotros/components/Testimonials";
import Slider from "./components/slider/Slider";
import WhyUs from "./components/whyUs/WhyUs";

const Slider2 = dynamic(() => import("./components/slider2/Slider2"), {
  ssr: false,
});

const FilaProductosModificado = ({ productos, isFirstRow = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 justify-items-center w-full max-w-[1300px] mx-auto">
      {productos.map((producto, index) => {
        const isFirstProduct = isFirstRow && index === 0;
        const mobileImageSrc = producto.imgSrcMobile || producto.imgSrc;

        return (
          <Link
            key={index}
            href={producto.route}
            className="bg-white rounded-3xl p-1 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer w-full max-w-[320px] flex flex-col"
            style={{ contain: "layout style" }}
          >
            <div className="rounded-2xl overflow-hidden flex flex-col h-full">
              <div
                className="relative w-full"
                style={{
                  aspectRatio: "4/3",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {/* 1. VERSIÓN MÓVIL: Se muestra solo en pantallas chicas (CSS puro, sin JS) */}
                <div className="block md:hidden relative w-full h-full">
                  <Image
                    src={mobileImageSrc}
                    alt={producto.altText}
                    title={producto.title}
                    fill
                    sizes="100vw"
                    className="object-cover object-center transition-transform duration-300 hover:scale-105"
                    priority={isFirstProduct}
                    loading={isFirstProduct ? "eager" : "lazy"}
                    quality={75}
                  />
                </div>

                {/* 2. VERSIÓN ESCRITORIO: Se muestra solo en tablets y PC */}
                <div className="hidden md:block relative w-full h-full">
                  <Image
                    src={producto.imgSrc}
                    alt={producto.altText}
                    title={producto.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    quality={75}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex justify-center items-center h-[70px]">
                <h3 className="text-white font-bold text-sm md:text-base text-center leading-tight">
                  {producto.description}
                </h3>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default function Home() {
  const fila1 = [
    {
      imgSrc: "/productosPrincipal/Letrero-Crocs-Acrilico.webp",
      imgSrcMobile: "/productosPrincipal/Letrero-Crocs-Acrilico-Mobile2.webp",
      altText: "Letras acrílicas verdes y negras con bordes blancas de la marca Crocs",
      title: "Letrero de Crocs",
      description: "LETRAS DE ACRÍLICO",
      route: "/productos/letras-acrilico",
    },
    {
      imgSrc: "/productosPrincipal/Letras-acrilicas-Lux-Nails-Neon-Led-Publicidad.webp",
      imgSrcMobile: "/productosPrincipal/Letras-acrilicas-Lux-Nails-Neon-Led-Publicidad.webp",
      altText: "Letras corporeas doradas con iluminación led elegante sobre un fondo oscuro",
      title: "Letras corporeas doradas con iluminación para estudios estéticos",
      description: "LETRAS DE ALUMINIO DORADAS 3D",
      route: "/productos/letras-doradas",
    },
    {
      imgSrc: "/productosPrincipal/Letras-Acrilicas-Farmacia.webp",
      imgSrcMobile: "/productosPrincipal/Letras-Acrilicas-Farmacia-Mobile2.webp",
      altText: "Letrero color verde con letras acrílicas blancas con el nombre de FARMACIA en mayúsculas y un símbolo de cruz verde luminosa.",
      title: "Letras acrílicas color blanco para variedad de tiendas y marcas",
      description: "LETREROS LUMINOSOS",
      route: "/productos/letreros-luminosos",
    },
    {
      imgSrc: "/productosPrincipal/Letrero-Works-licoreria-led-neo-led-publicidad.webp",
      imgSrcMobile: "/productosPrincipal/Letrero-Works-licoreria-led-neo-led-publicidad.webp",
      altText: "Letrero led verde con la palabra woks y cerveza artesanal en letras finas, diseñado para negocio de bebidas",
      title: "Letrero led en diversas tipografías para licorerías",
      description: "LETRAS DE NEÓN",
      route: "/productos/letras-neon",
    },
  ];

  const slidesData = [
    {
      imgSrc: "/home/imagen_subway_HD_final_2560x1532.webp",
      imgSrcMobile: "/home/imagen_subway_mobile.webp",
      imgSrcIcon: "/home/imagen_subway_icon.webp",
      altText: "Letras grandes corpóreas doradas con iluminación y fondo blanco",
      title: "Letras corporeas doradas con iluminación",
    },
    {
      imgSrc: "/home/imagen_mario_dalmasi_HD.webp",
      imgSrcMobile: "/home/imagen_mario_dalmasi_mobile.webp",
      imgSrcIcon: "/home/imagen_mario_dalmasi_icon.webp",
      altText: "Letras corporeas con gran iluminación de la marca Bembos",
      title: "Letras Bembos con iluminación led",
    },
    {
      imgSrc: "/home/imagen_botella.webp",
      imgSrcMobile: "/home/imagen_botella_mobile.webp",
      imgSrcIcon: "/home/imagen_botella_icon.webp",
      altText: "Letrero led amarillo con la palabra tattoo y máquina de tatuar led roja en fachada de estudio de tatuaje",
      title: "Letrero led tattoo para estudio de tatuaje",
    },
    {
      imgSrc: "/home/imagen_deltaco_final_2560x1532.webp",
      imgSrcMobile: "/home/imagen_deltaco_mobile.webp",
      imgSrcIcon: "/home/imagen_deltaco_icon.webp",
      altText: "Letrero luminoso de Tambo con fondo amarillo y letras magenta",
      title: "Letrero luminoso de la marca Tambo Perú",
    },
  ];

  const clientLogos = [
    {
      imgSrc: "/home/Jockeyplaza_Logo_transparent2.png",
      width: 275,
      height: 194,
      altText: "Logo Jockey Plaza",
      title: "Logo Jockey Plaza",
    },
    {
      imgSrc: "/home/Malldelsur_Logo_transparent2.png",
      width: 2005,
      height: 454,
      altText: "Logo Mall del Sur",
      title: "Logo Mall del Sur",
    },
    {
      imgSrc: "/home/logo_lk_transparent2.webp",
      width: 266,
      height: 117,
      altText: "Logo L&K Constructora e Inversiones",
      title: "Logo L&K Constructora e Inversiones",
    },
    {
      imgSrc: "/home/Crisol_Logo_transparent2.png",
      width: 218,
      height: 88,
      altText: "Logo Crisol",
      title: "Logo Crisol",
    },
    {
      imgSrc: "/home/BancodelaNacion_Logo_transparent2.png",
      width: 1003,
      height: 352,
      altText: "Logo Banco de la Nación",
      title: "Logo Banco de la Nación",
    },
  ];

  return (
    <div className="bg-[--azul_oscuro] overflow-hidden">
      <Slider slides={slidesData} />

      <section
        className="px-4 lg:px-8 mt-12 md:mt-20 mb-12 md:mb-24"
        aria-labelledby="productos-heading"
        style={{ contain: "layout style" }}
      >
        <NuestrosProductos />
        <div className="mt-8">
          <FilaProductosModificado productos={fila1} isFirstRow={true} />
        </div>
      </section>

      <section className="flex justify-center items-center mb-11 md:mb-22 px-4">
        <Link
          href="/contacto"
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-xl sm:text-3xl md:text-4xl py-4 sm:py-8 md:py-10 px-8 sm:px-16 md:px-20 rounded-full shadow-lg hover:scale-105 transition-transform text-center w-full sm:w-auto inline-block max-w-full"
        >
          ¡CONTÁCTANOS!
        </Link>
      </section>

      <Slider2 slides={clientLogos} />

      <WhyUs />
      <Testimonials />
    </div>
  );
}