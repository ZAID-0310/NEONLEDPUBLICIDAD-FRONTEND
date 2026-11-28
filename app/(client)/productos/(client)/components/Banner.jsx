"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

export default function Banner({ titulo, video, imagen }) {
  const videoRef = useRef(null);

  // Asegura la reproducción en navegadores estrictos tras la hidratación de Next.js
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!video || !videoEl) return;

    videoEl.muted = true;
    videoEl.defaultMuted = true;

    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const handleInteraction = () => {
          videoEl.play().catch(() => { });
          window.removeEventListener("touchstart", handleInteraction);
          window.removeEventListener("click", handleInteraction);
        };
        window.addEventListener("touchstart", handleInteraction, {
          once: true,
          passive: true,
        });
        window.addEventListener("click", handleInteraction, {
          once: true,
          passive: true,
        });
      });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoEl.play().catch(() => { });
        } else {
          videoEl.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(videoEl);

    return () => {
      observer.disconnect();
    };
  }, [video]);

  const handleArrowClick = () => {
    document.getElementById("banner-contenido")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full">
      {/* FILA 1: Video o imagen (Ocupa exactamente el mismo espacio que ocupaba tu imagen) */}
      <div className="relative h-[45vh] sm:h-[50vh] md:h-[calc(60vh-120px)] lg:h-[calc(80vh-100px)] xl:h-[calc(90vh-80px)] overflow-hidden bg-black">
        {video ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover select-none pointer-events-none"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            controls={false}
          >
            <source src={video} type="video/mp4" />
            Tu navegador no soporta videos.
          </video>
        ) : imagen ? (
          <Image
            src={imagen}
            alt={typeof titulo === "string" ? titulo : "Banner"}
            fill
            priority
            sizes="100vw"
            className="object-cover select-none"
          />
        ) : null}

        {/* Overlay sutil sobre el video/imagen */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      </div>

      {/* FILA 2: Franja separada con texto (Se mantiene idéntica a tu original) */}
      <div className="bg-gradient-to-b from-[#0b0b3a] to-[#1f1d77] text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-12 text-center">
          <p className="text-xs md:text-sm tracking-widest font-semibold opacity-90 font-inter">
            CONOCE MÁS SOBRE NUESTROS
          </p>

          <h1 className="mt-2 font-inter font-extrabold uppercase text-lg sm:text-2xl md:text-3xl whitespace-pre-line">
            {titulo}
          </h1>

          <p className="mt-2 text-xs md:text-sm tracking-widest font-semibold opacity-90 font-inter">
            EN NUESTRA PÁGINA
          </p>

          {/* Flecha */}
          <button
            type="button"
            onClick={handleArrowClick}
            aria-label="Bajar"
            className="mt-6 inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/90 hover:bg-sky-500 transition"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v12m0 0l-6-6m6 6l6-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ANCLA destino del scroll */}
      <div id="banner-contenido" />
    </section>
  );
}
