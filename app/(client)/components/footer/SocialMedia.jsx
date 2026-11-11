"use client";

import Image from "next/image";

export const SocialMedia = () => {
  const socialMedia = [
    {
      href: "https://api.whatsapp.com/send/?phone=%2B51994078320",
      src: "/header_footer/WhatsApp_icon.webp",
      alt: "WhatsApp",
      title: "WhatsApp",
      neonColor: "#25D366",
      rgba: "37, 211, 102",
    },
    {
      href: "https://www.instagram.com/neonledpublicidad.peru",
      src: "/header_footer/Instagram_icon.webp",
      alt: "Instagram",
      title: "Instagram",
      neonColor: "#E1306C",
      rgba: "225, 48, 108",
    },
    {
      href: "https://www.facebook.com/profile.php?id=61578497411241",
      src: "/header_footer/Facebook_icon.webp",
      alt: "Facebook",
      title: "Facebook",
      neonColor: "#1877F2",
      rgba: "24, 119, 242",
    },
    {
      href: "https://www.linkedin.com/company/neonhouseled/about/",
      src: "/header_footer/LinkedIn_icon.webp",
      alt: "LinkedIn",
      title: "LinkedIn",
      neonColor: "#0A66C2",
      rgba: "10, 102, 194",
    },
    {
      href: "https://www.tiktok.com/@neonled.publicidad",
      src: "/header_footer/icono-tiktok.webp",
      alt: "TikTok",
      title: "TikTok",
      neonColor: "#00F2FE",
      rgba: "0, 242, 254",
    },
    {
      href: "https://www.youtube.com/@neonledpublicidadpe",
      src: "/header_footer/youtube_icon.webp",
      alt: "YouTube",
      title: "YouTube",
      neonColor: "#FF0000",
      rgba: "255, 0, 0",
    },
    {
      href: "https://mail.google.com/mail/?view=cm&to=Publicidadnls@gmail.com&su=Cotizaci%C3%B3n+Prioritaria%3A+Proyecto+de+Iluminaci%C3%B3n+LED+-+NLP&body=Hola+equipo+de+Neon+Led+Publicidad%2C%0A%0AEstoy+interesado+en+modernizar+la+iluminaci%C3%B3n+de+mi+establecimiento.+Me+gustar%C3%ADa+recibir+informaci%C3%B3n+y+una+cotizaci%C3%B3n+base+sobre%3A%0A%0AProducto(s)%3A%0ATipo+de+proyecto+(Gimnasio+%2F+Discoteca+%2F+Local+Comercial)%3A%0AMedidas+aproximadas%3A%0ACiudad%3A%0A%0AQuedo+atento+a+su+respuesta+para+coordinar+una+asesor%C3%ADa.+Saludos.",
      src: "/header_footer/icono_gmail.webp",
      alt: "Gmail",
      title: "Gmail",
      neonColor: "#EA4335",
      rgba: "234, 67, 53",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {socialMedia.map(({ href, src, alt, title, rgba }, index) => (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={title}
          aria-label={title}
          style={{
            borderColor: `rgba(${rgba}, 0.35)`,
            boxShadow: `0 0 10px rgba(${rgba}, 0.2), inset 0 0 8px rgba(${rgba}, 0.1)`,
          }}
          className="group w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] border transition-all duration-200 hover:scale-110 active:scale-95"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `rgba(${rgba}, 0.95)`;
            e.currentTarget.style.boxShadow = `0 0 20px rgba(${rgba}, 0.7), inset 0 0 12px rgba(${rgba}, 0.25)`;
            e.currentTarget.style.backgroundColor = `rgba(${rgba}, 0.15)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `rgba(${rgba}, 0.35)`;
            e.currentTarget.style.boxShadow = `0 0 10px rgba(${rgba}, 0.2), inset 0 0 8px rgba(${rgba}, 0.1)`;
            e.currentTarget.style.backgroundColor = `rgba(255, 255, 255, 0.04)`;
          }}
        >
          <div
            className="w-[26px] h-[26px] flex items-center justify-center transition-all duration-200"
            style={{
              filter: `drop-shadow(0 0 4px rgba(${rgba}, 0.7))`,
            }}
          >
            <Image
              src={src}
              alt={alt}
              title={title}
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
        </a>
      ))}
    </div>
  );
};
