import { Header, Footer } from "./components/index";

export const metadata = {
  title: "Empresa que realiza letreros neón led personalizados para negocios | Publicidad Impactante",
  description: "Transforma tu marca con Neones LED, Pantallas publicitarias, vinilos personalizados y más. Diseños innovadores, instalación profesional y atención local. Letreros neón LED, vinilos decorativos y pantallas publicitarias para tu negocio.",
  
  keywords: [
    "letreros neón led",
    "publicidad luminosa Lima",
    "pantallas publicitarias Perú",
    "vinilos personalizados",
    "neones led personalizados",
    "letreros luminosos",
    "publicidad LED",
    "señalética luminosa",
    "letras corporeas",
    "iluminación comercial"
  ],
  
  alternates: {
    canonical: "https://ledneonpublicidad.com/",
  },
  
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://ledneonpublicidad.com/",
    siteName: "LedNeonPublicidad",
    title: "Letreros Neón LED Personalizados | Publicidad Impactante",
    description: "Transforma tu marca con Neones LED, Pantallas publicitarias y vinilos personalizados. Diseños innovadores en Lima, Perú.",
    images: [
      {
        url: "/header_footer/logo_azul_letraBlanco_ledneonpublicidad2.webp",
        width: 1200,
        height: 630,
        alt: "LedNeonPublicidad - Letreros Neón LED",
      }
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Letreros Neón LED Personalizados | LedNeonPublicidad",
    description: "Transforma tu marca con Neones LED y pantallas publicitarias en Lima, Perú.",
    images: ["/header_footer/logo_azul_letraBlanco_ledneonpublicidad2.webp"],
  },
};

export default function ClientLayout({ children }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "LedNeonPublicidad",
    "image": "https://ledneonpublicidad.com/header_footer/logo_azul_letraBlanco_ledneonpublicidad2.webp",
    "@id": "https://ledneonpublicidad.com/",
    "url": "https://ledneonpublicidad.com/",
    "telephone": "+51994078320",
    "priceRange": "$$",
    "address": [
      {
        "@type": "PostalAddress",
        "streetAddress": "Jr. Paruro 1404. S130",
        "addressLocality": "Lima",
        "addressRegion": "Lima",
        "postalCode": "15001",
        "addressCountry": "PE"
      },
      {
        "@type": "PostalAddress",
        "streetAddress": "Urb. Alameda La Rivera Mz. F Lt. 30 Santa Marta",
        "addressLocality": "Ate Vitarte",
        "addressRegion": "Lima",
        "postalCode": "15012",
        "addressCountry": "PE"
      }
    ],
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -12.0574298,
      "longitude": -77.0260788
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "08:00",
      "closes": "19:00"
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61578497411241",
      "https://www.instagram.com/neonledpublicidad.peru/",
      "https://www.tiktok.com/@neonled.publicidad",
      "https://www.youtube.com/@neonledpublicidadpe"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "120"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://ledneonpublicidad.com/#website",
    "url": "https://ledneonpublicidad.com/",
    "name": "LedNeonPublicidad",
    "description": "Letreros neón LED personalizados y publicidad luminosa en Lima, Perú",
    "publisher": {
      "@id": "https://ledneonpublicidad.com/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://ledneonpublicidad.com/productos/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

        return (

    <div className="bg-[--azul_oscuro] min-h-screen"> 
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      
      <Header />
      <main>
        {children}
      </main>
      
     
      <div className="bg-[##ffaabb] rounded-t-[40px] overflow-hidden w-full mt-10">
        <Footer /> 
      </div>

    </div>
  );
}