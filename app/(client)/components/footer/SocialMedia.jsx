"use client";

import Image from "next/image";

export const SocialMedia = () => {
  const socialMedia = [
    {
      href: "https://api.whatsapp.com/send/?phone=%2B51994078320",
      src: "/header_footer/Whatsapp.Neon.Led.Publicidad.webp",
      alt: "WhatsApp",
      title: "WhatsApp",
    },
    {
      href: "https://www.instagram.com/neonledpublicidad.peru",
      src: "/contacto/ig.png",
      alt: "Instagram",
      title: "Instagram",
    },
    {
      href: "https://www.facebook.com/profile.php?id=61578497411241",
      src: "/contacto/Facebook.png",
      alt: "Facebook",
      title: "Facebook",
    },
    {
      href: "https://www.linkedin.com/company/neonhouseled/about/",
      src: "/header_footer/Linkedin.Neon.Led.Publicidad2.webp",
      alt: "LinkedIn",
      title: "LinkedIn",
    },
    {
      href: "https://www.tiktok.com/@neonled.publicidad",
      src: "/contacto/Tiktok.png",
      alt: "TikTok",
      title: "TikTok",
    },
    {
      href: "https://www.youtube.com/@neonledpublicidadpe",
      src: "/contacto/yootube.png",
      alt: "YouTube",
      title: "YouTube",
    },
    {
      href: "https://mail.google.com/mail/?view=cm&to=Publicidadnls@gmail.com&su=Cotizaci%C3%B3n+Prioritaria%3A+Proyecto+de+Iluminaci%C3%B3n+LED+-+NLP&body=Hola+equipo+de+Neon+Led+Publicidad%2C%0A%0AEstoy+interesado+en+modernizar+la+iluminaci%C3%B3n+de+mi+establecimiento.+Me+gustar%C3%ADa+recibir+informaci%C3%B3n+y+una+cotizaci%C3%B3n+base+sobre%3A%0A%0AProducto(s)%3A%0ATipo+de+proyecto+(Gimnasio+%2F+Discoteca+%2F+Local+Comercial)%3A%0AMedidas+aproximadas%3A%0ACiudad%3A%0A%0AQuedo+atento+a+su+respuesta+para+coordinar+una+asesor%C3%ADa.+Saludos.",
      src: "/contacto/gmail.svg",
      alt: "Gmail",
      title: "Gmail",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2.5 items-center">
      {socialMedia.map(({ href, src, alt, title }, index) => (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={title}
          aria-label={title}
          className="group relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#48A8FF]/80 hover:bg-[#48A8FF]/10 transition-all duration-200 active:scale-95 hover:shadow-[0_0_18px_rgba(72,168,255,0.4)]"
        >
          <div className="w-[22px] h-[22px] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
            <Image
              src={src}
              alt={alt}
              title={title}
              width={22}
              height={22}
              className="object-contain brightness-100"
              unoptimized
            />
          </div>
        </a>
      ))}
    </div>
  );
};
