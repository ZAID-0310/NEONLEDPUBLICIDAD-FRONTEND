// import Banner from "./components/Banner";
// import NuestrosProductos from "./components/NuestrosProductos";
// import Productos from "./components/ProductosPrincipal";

// import PreguntasFrecPrincipal from "./components/PreguntasFrecPrincipal";
// {
//   /*ESTO ES EL DE /PRODUCTOS */
// }

// export default function Home() {
//   return (
//     <div className="relative bg-[#0e1721] min-h-screen">
//       {/* Luz colocada primero para quedar debajo */}
//       {/* <NeonBackground /> */}
//       <div className="relative z-10">
//         <Banner />
//         <div className="px-4 md:px-12 lg:px-8 mt-10 md:mt-20 mb-10">
//           <NuestrosProductos />
//         </div>
//         <Productos />
//         <PreguntasFrecPrincipal />
//       </div>
//     </div>
//   );
// }

import dynamic from "next/dynamic";
import Banner from "./components/Banner";
import NuestrosProductos from "./components/NuestrosProductos";

const Productos = dynamic(
  () => import("./components/ProductosPrincipal"),
  {
    loading: () => <div className="h-[400px]" />,
  }
);

const PreguntasFrecPrincipal = dynamic(
  () => import("./components/PreguntasFrecPrincipal"),
  {
    loading: () => (
      <div id="preguntas-frecuentes" className="h-[300px] scroll-mt-[110px]" />
    ),
  }
);

export default function Home() {
  return (
    <div className="relative bg-[#0e1721] min-h-screen overflow-hidden">
      <div className="relative z-10">
        <Banner />

        <div className="px-4 md:px-12 lg:px-8 mt-10 md:mt-20 mb-10">
          <NuestrosProductos />
        </div>

        <Productos />

        <PreguntasFrecPrincipal />
      </div>
    </div>
  );
}

