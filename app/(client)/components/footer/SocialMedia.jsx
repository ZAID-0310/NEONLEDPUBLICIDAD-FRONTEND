"use client";

import Image from "next/image";

export const SocialMedia = () => {
  const socialMedia = [
    {
      href: "https://api.whatsapp.com/send/?phone=%2B51994078320",
      src: "/header_footer/WhatsApp_icon.webp",
      alt: "WhatsApp",
      title: "WhatsApp",
    },
    {
      href: "https://www.instagram.com/neonledpublicidad.peru",
      src: "/header_footer/Instagram_icon.webp",
      alt: "Instagram",
      title: "Instagram",
    },
    {
      href: "https://www.facebook.com/profile.php?id=61578497411241",
      src: "/header_footer/Facebook_icon.webp",
      alt: "Facebook",
      title: "Facebook",
    },
    {
      href: "https://www.linkedin.com/company/neonhouseled/about/",
      src: "/header_footer/LinkedIn_icon.webp",
      alt: "LinkedIn",
      title: "LinkedIn",
    },
    {
      href: "https://www.tiktok.com/@neonled.publicidad",
      src: "/header_footer/icono-tiktok.webp",
      alt: "TikTok",
      title: "TikTok",
    },
    {
      href: "https://www.youtube.com/@neonledpublicidadpe",
      src: "/header_footer/youtube_icon.webp",
      alt: "YouTube",
      title: "YouTube",
    },
    {
      href: "https://mail.google.com/mail/?view=cm&to=Publicidadnls@gmail.com&su=Cotizaci%C3%B3n+Prioritaria%3A+Proyecto+de+Iluminaci%C3%B3n+LED+-+NLP&body=Hola+equipo+de+Neon+Led+Publicidad%2C%0A%0AEstoy+interesado+en+modernizar+la+iluminaci%C3%B3n+de+mi+establecimiento.+Me+gustar%C3%ADa+recibir+informaci%C3%B3n+y+una+cotizaci%C3%B3n+base+sobre%3A%0A%0AProducto(s)%3A%0ATipo+de+proyecto+(Gimnasio+%2F+Discoteca+%2F+Local+Comercial)%3A%0AMedidas+aproximadas%3A%0ACiudad%3A%0A%0AQuedo+atento+a+su+respuesta+para+coordinar+una+asesor%C3%ADa.+Saludos.",
      src: "/header_footer/icono_gmail.webp",
      alt: "Gmail",
      title: "Gmail",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3.5 items-center">
      {socialMedia.map(({ href, src, alt, title }, index) => (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={title}
          aria-label={title}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-[#48A8FF]/60 hover:bg-[#48A8FF]/10 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <div className="w-[28px] h-[28px] flex items-center justify-center">
            <Image
              src={src}
              alt={alt}
              title={title}
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
        </a>
      ))}
    </div>
  );
};
