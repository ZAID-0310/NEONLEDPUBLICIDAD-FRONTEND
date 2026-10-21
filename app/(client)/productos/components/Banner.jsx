// "use client";
// import React, { useRef } from "react";
// import { motion, useInView } from "framer-motion";
// import { useRouter } from 'next/navigation';
// import styles from "./productoStyles.module.css";

// export default function Banner() {
//  const videoRef = useRef(null);
//  const isInView = useInView(videoRef, { triggerOnce: true, threshold: 0.5 });
//  const router = useRouter();

//   return (

//     <div className={`${styles["bg-black"]} bg-black w-full h-[600px] flex items-center justify-center relative overflow-hidden`}>



//       <video
//       ref={videoRef}
//       className="absolute inset-0 w-full h-full object-cover z-0"
//       autoPlay
//       loop
//       muted
//       playsInline
//       onError={(e) => console.log("Error cargando video:", e)}
//       >
//      <source src="/productos/video_banner.mp4" type="video/mp4" />
//      Tu navegador no soporta el elemento video o el video no se puede cargar.
//      </video>

//      <div className="absolute inset-0 bg-black bg-opacity-30 z-5"></div>




//       <motion.div

//        className="text-center space-y-1 z-10 relative"//

//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 4, ease: "easeOut" }}
//       >

//         <h1 className={`text-6xl ${styles["neon-text"]}`}> Catálogo de letreros luminosos LED y neón para negocios</h1>
//         {/* <p className={`text-6xl ${styles["neon-text"]}`}>PERFECTO PARA TU</p>
//          <p className={`text-6xl ${styles["neon-text"]}`}>NEGOCIO</p> */}
//          <p className={`text-5xl ${styles["neon-text"]}`}>Perfecto para tu negocio</p>


//         <br />

//         <button className={styles.boton} onClick={()=> router.push("/contacto")}>
//           PIDE YA
//           <div className={styles["arrow-wrapper"]}>

//           </div>
//         </button>
//       </motion.div>
//     </div>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./productoStyles.module.css";

export default function Banner() {
  const router = useRouter();

  return (
    <section
      className={`${styles["bg-black"]} relative w-full h-[500px] md:h-[600px] overflow-hidden flex items-center justify-center`}
    >
      {/* Imagen móvil */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/productosIndividuales/banner/Pantalla-led-portada.webp"
          alt="Catálogo de productos LED y neón"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Video desktop */}
      {/* <video
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src="/productos/video_banner.mp4" type="video/mp4" />
      </video> */}

      {/* Desktop only */}
      <div className="hidden md:block absolute inset-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
        >
          <source src="/productos/Video_Banner.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* Contenido */}
      <div className="relative z-10 text-center px-4">
        <h1
          className={`text-3xl md:text-5xl lg:text-6xl leading-tight ${styles["neon-text"]}`}
        >
          Catálogo de letreros luminosos LED y neón para negocios
        </h1>

        <p
          className={`mt-4 text-2xl md:text-4xl lg:text-5xl ${styles["neon-text"]}`}
        >
          Perfecto para tu negocio
        </p>

        <button
          className={`${styles.boton} mt-16`}
          onClick={() => router.push("/contacto")}
        >
          PIDE YA
        </button>
      </div>
    </section>
  );
}

