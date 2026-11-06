"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PreguntasFrecIndividual from "./PreguntasFrecIndividual";

const linkStyles =
  "text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-semibold transition-colors";

const faqData = [
  {
    category: "Sobre el producto",
    items: [
      {
        question: "¿Hacen diseños personalizados?",
        answer: (
          <>
            ¡Sí! Somos especialistas en fabricar{" "}
            <Link href="/productos/letreros-luminosos" className={linkStyles}>
              letreros personalizados
            </Link>
            . Adaptamos cualquier idea, frase o logotipo a la tecnología{" "}
            <Link href="/productos/neon-led" className={linkStyles}>
              Neón LED
            </Link>{" "}
            según tus requerimientos.
          </>
        ),
      },
      {
        question: "¿Qué tipo de letrero conviene para mi negocio?",
        answer: (
          <>
            Depende de tu rubro: para restaurantes recomendamos neones cálidos y vibrantes; para oficinas,{" "}
            <Link href="/productos/letras-acrilico" className={linkStyles}>
              logotipos en acrílico
            </Link>{" "}
            y{" "}
            <Link href="/productos/letras-plateadas" className={linkStyles}>
              aluminio plateado 3D
            </Link>{" "}
            para proyectar elegancia y seriedad.
          </>
        ),
      },
      {
        question: "¿Qué es un letrero de neón LED?",
        answer: (
          <>
            Es una solución de iluminación moderna que utiliza mangueras de silicona flexible y diodos LED para replicar el brillo del{" "}
            <Link href="/productos/neon-led" className={linkStyles}>
              neón clásico
            </Link>{" "}
            de forma segura y ecológica.
          </>
        ),
      },
      {
        question:
          "¿Cuál es la diferencia entre el Neón LED y el Neón en tubo de vidrio tradicional?",
        answer: (
          <>
            El{" "}
            <Link href="/productos/neon-led" className={linkStyles}>
              Neón LED
            </Link>{" "}
            es irrompible, consume hasta un 70% menos energía, no emite calor ni gases tóxicos y tiene un costo de mantenimiento mucho menor que el{" "}
            <Link href="/productos/letras-neon" className={linkStyles}>
              Neón en tubo de vidrio tradicional
            </Link>
            .
          </>
        ),
      },
      {
        question: "¿Los letreros pueden ir en exteriores?",
        answer: (
          <>
            Sí. Fabricamos{" "}
            <Link href="/productos/letreros-luminosos" className={linkStyles}>
              letreros luminosos
            </Link>{" "}
            con protección IP65 (sellado especial para intemperie) que resisten lluvia y polvo.
          </>
        ),
      },
      {
        question: "¿Qué materiales usan?",
        answer: (
          <>
            Utilizamos bases de{" "}
            <Link href="/productos/letras-acrilico" className={linkStyles}>
              acrílico
            </Link>{" "}
            de alta densidad, mangueras LED de silicona de primera calidad y transformadores certificados.
          </>
        ),
      },
      {
        question: "¿Cuál es la duración de un neón LED?",
        answer: (
          <>
            Nuestros productos de{" "}
            <Link href="/productos/neon-led" className={linkStyles}>
              neón LED
            </Link>{" "}
            tienen una vida útil de hasta 50,000 horas (aproximadamente 5 a 10 años).
          </>
        ),
      },
      {
        question: "¿Los letreros de neón LED son seguros?",
        answer:
          "Sí. Funcionan con bajo voltaje (12V), son fríos al tacto y no contienen materiales frágiles como el cristal.",
      },
    ],
  },
  {
    category: "Sobre el servicio",
    items: [
      {
        question: "¿Cómo puedo solicitar una cotización?",
        answer:
          "Nos envías tu idea o logo, definimos medidas y materiales, y te entregamos una propuesta visual junto al presupuesto.",
      },
      {
        question: "¿Se puede cotizar por WhatsApp?",
        answer: (
          <>
            Sí, puedes escribirnos al{" "}
            <a
              href="https://wa.me/51994078320"
              target="_blank"
              rel="noopener noreferrer"
              className={linkStyles}
            >
              +51 994 078 320
            </a>{" "}
            para recibir atención personalizada.
          </>
        ),
      },
      {
        question: "¿Pueden replicar mi logotipo exactamente igual?",
        answer:
          "Sí. Utilizamos corte láser y diseño vectorial para replicar fielmente la identidad visual de tu marca.",
      },
      {
        question: "¿Ofrecen servicio de diseño gratuito?",
        answer:
          "Sí, ofrecemos asesoría técnica y una propuesta visual básica sin costo adicional.",
      },
      {
        question: "¿Cuánto demora la fabricación de un letrero?",
        answer:
          "El tiempo promedio es de 3 a 5 días hábiles dependiendo del proyecto.",
      },
      {
        question: "¿Aceptan pedidos urgentes?",
        answer:
          "Sí, contamos con servicio prioritario sujeto a disponibilidad.",
      },
      {
        question: "¿Instalan los letreros?",
        answer:
          "Sí, contamos con personal especializado para instalaciones en Lima y provincias.",
      },
      {
        question: "¿Qué métodos de pago aceptan?",
        answer:
          "Aceptamos transferencias, Yape, Plin y tarjetas Visa/MasterCard.",
      },
      {
        question: "¿Ofrecen garantía en sus productos?",
        answer:
          "Sí, todos nuestros productos cuentan con garantía por fallas de fábrica.",
      },
      {
        question: "¿Qué mantenimiento requieren los letreros?",
        answer:
          "Solo limpieza ocasional con un paño de microfibra seco.",
      },
    ],
  },
  {
    category: "Envíos y devoluciones",
    items: [
      {
        question: "¿Realizan envíos a todo el país?",
        answer:
          "Sí, realizamos envíos seguros a todo el Perú mediante agencias confiables.",
      },
      {
        question:
          "¿Cómo vienen protegidos los letreros para envíos a provincia?",
        answer:
          "Usamos embalaje reforzado con plástico burbuja, cartón y estructuras de madera para piezas grandes.",
      },
      {
        question: "¿Cuál es el tiempo de entrega?",
        answer:
          "Generalmente entre 24 y 48 horas adicionales al tiempo de fabricación.",
      },
      {
        question: "¿Cuál es la política de devolución?",
        answer:
          "Aceptamos cambios o reparaciones por defectos de fabricación o daños durante el transporte.",
      },
      {
        question: "¿Hacen envíos internacionales?",
        answer:
          "Sí, gestionamos envíos internacionales bajo cotización previa.",
      },
    ],
  },
];

export default function PreguntasFrecPrincipal() {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    const scrollToFaq = () => {
      if (
        typeof window !== "undefined" &&
        window.location.hash === "#preguntas-frecuentes"
      ) {
        const el = document.getElementById("preguntas-frecuentes");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    scrollToFaq();
    const t1 = setTimeout(scrollToFaq, 300);
    const t2 = setTimeout(scrollToFaq, 800);

    window.addEventListener("hashchange", scrollToFaq);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("hashchange", scrollToFaq);
    };
  }, []);

  let globalIndex = 0;

  return (
    <section
      id="preguntas-frecuentes"
      className="mt-10 md:mt-20 pb-10 px-4 md:px-8 scroll-mt-[110px]"
    >
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Image
                src="/productos/preguntas/Eón-Pensativo.png"
                alt="Preguntas frecuentes"
                width={140}
                height={140}
              />

              <div>
                <h2 className="text-white text-2xl md:text-4xl font-bold">
                  Preguntas Frecuentes
                </h2>

                <div className="w-24 h-1 bg-[#44b0f8] mx-auto mt-6 rounded-full" />
              </div>
            </div>
          </div>

          {faqData.map((section, sectionIndex) => {
            return (
              <div
                key={section.category}
                className="pb-10"
              >
                <h3 className="text-white text-xl md:text-2xl font-semibold mb-4 pl-3">
                  {section.category}
                </h3>

                <div className="space-y-3">
                  {section.items.map((item) => {
                    const currentIndex = globalIndex++;

                    return (
                      <PreguntasFrecIndividual
                        key={currentIndex}
                        id={currentIndex}
                        question={item.question}
                        answer={item.answer}
                        isOpen={activeIndex === currentIndex}
                        onToggle={() => handleToggle(currentIndex)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
    </section>
  );
}
