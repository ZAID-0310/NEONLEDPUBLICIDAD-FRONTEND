"use client";

import { useEffect, useRef, useState } from "react";

// Construye el background según la vista
const getBg = (f, isMobile) =>
  isMobile
    ? f.mobile_service_color_2 &&
      f.mobile_service_color_2 !== f.mobile_service_color
      ? `linear-gradient(${f.mobile_gradient_direction}, ${f.mobile_service_color}, ${f.mobile_service_color_2})`
      : f.mobile_service_color
    : f.service_color_2 && f.service_color_2 !== f.service_color
      ? `linear-gradient(${f.gradient_direction}, ${f.service_color}, ${f.service_color_2})`
      : f.service_color;

export function PopupPreview({
  formData,
  imagePreviews,
  view,
  productoName,
  forceRealWidth = false,
}) {
  const isM = view === "mobile";
  const bg = getBg(formData, isM);

  // Colores independientes por vista
  const titleColor = isM ? formData.mobile_title_color : formData.title_color;
  const buttonColor = isM
    ? formData.mobile_button_color
    : formData.button_color;
  const triggerTime = isM
    ? formData.mobile_trigger_time
    : formData.trigger_time;

  const hasRightBg = !!imagePreviews.right;
  const hasMobileBg = !!imagePreviews.mobile;

  const containerRef = useRef(null);
  const popupRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [popupHeight, setPopupHeight] = useState(300);

  useEffect(() => {
    if (view !== "desktop") return;

    const recalc = () => {
      const containerW = containerRef.current?.offsetWidth || 680;
      const popupH = popupRef.current?.offsetHeight || 300;
      const s = forceRealWidth ? 1 : Math.min(1, containerW / 680);
      setScale(s);
      setPopupHeight(popupH);
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    if (popupRef.current) ro.observe(popupRef.current);
    return () => ro.disconnect();
  }, [view, formData, imagePreviews, forceRealWidth]);

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (isM) {
    return (
      <div className="flex flex-col items-center">
        <div
          className="relative w-[210px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-600 shadow-lg flex flex-col"
          style={{ background: bg, minHeight: 310 }}
        >
          <button className="absolute top-2 right-2 z-50 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
            ✕
          </button>

          <div className="relative flex flex-col justify-center gap-3 px-4 py-5 flex-1">
            {hasMobileBg && (
              <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
                <img
                  src={imagePreviews.mobile}
                  alt={formData.mobile_alt || productoName || "popup mobile"}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-white"
                  style={{ opacity: (100 - formData.mobile_opacity) / 100 }}
                />
              </div>
            )}
            <div className="relative z-10 flex flex-col gap-3 pt-2">
              <p
                className="text-sm font-extrabold text-center leading-tight"
                style={{ color: titleColor }}
              >
                {formData.mobile_title_text || "TÍTULO DEL POP-UP"}
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Nombre", placeholder: "Tu nombre completo" },
                  { label: "Teléfono", placeholder: "9 dígitos" },
                  { label: "Correo", placeholder: "tu@correo.com" },
                ].map(({ label, placeholder }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: titleColor }}
                    >
                      {label}
                    </span>
                    <input
                      readOnly
                      autoComplete="off"
                      placeholder={placeholder}
                      className="w-full rounded-full bg-white px-3 py-1.5 text-[10px] text-slate-700 outline-none"
                    />
                  </div>
                ))}
              </div>
              <button
                className="w-full rounded-full py-1.5 text-xs font-extrabold text-white"
                style={{ backgroundColor: buttonColor }}
              >
                {formData.mobile_button_text || "HAZLO YA"}
              </button>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
          Aparece a los <strong>{triggerTime}s</strong>
        </p>
      </div>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div
        ref={containerRef}
        style={{
          width: "100%",
          overflow: "hidden",
          height: `${popupHeight * scale}px`,
        }}
      >
        <div
          style={{
            width: "680px",
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          <div
            ref={popupRef}
            className="relative rounded-2xl overflow-hidden shadow-xl border border-white/10 flex items-stretch"
            style={{ background: bg, width: "680px" }}
          >
            {/* Imagen izquierda */}
            {imagePreviews.left && (
              <div className="relative w-56 flex-shrink-0 overflow-hidden z-10">
                <img
                  src={imagePreviews.left}
                  alt={formData.left_alt || productoName || ""}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-white"
                  style={{ opacity: (100 - formData.left_opacity) / 100 }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 55%, transparent 100%)",
                  }}
                />
                {productoName && (
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 z-10">
                    <p
                      className="text-white font-extrabold uppercase leading-tight"
                      style={{
                        fontSize: "0.9rem",
                        letterSpacing: "0.05em",
                        textShadow: "0 2px 10px rgba(0,0,0,0.95)",
                        lineHeight: 1.2,
                      }}
                    >
                      {productoName}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Panel del form */}
            <div className="relative z-10 flex-1 flex flex-col justify-center gap-5 p-7">
              {hasRightBg && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={imagePreviews.right}
                    alt={formData.right_alt || productoName || ""}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-white"
                    style={{ opacity: (100 - formData.right_opacity) / 100 }}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col gap-5">
                <button className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                  ✕
                </button>

                <p
                  className="text-2xl font-extrabold text-center leading-tight pr-6"
                  style={{ color: titleColor }}
                >
                  {formData.title_text || "TÍTULO DEL POP-UP"}
                </p>

                <div className="flex flex-col gap-3 w-full">
                  {[
                    { label: "Nombre", placeholder: "Tu nombre completo" },
                    { label: "Teléfono", placeholder: "9 dígitos" },
                    { label: "Correo", placeholder: "tu@correo.com" },
                  ].map(({ label, placeholder }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: titleColor }}
                      >
                        {label}
                      </span>
                      <input
                        readOnly
                        autoComplete="off"
                        placeholder={placeholder}
                        className="w-full rounded-full bg-white px-4 py-2.5 text-sm text-slate-800 outline-none border border-white/50 placeholder-slate-400"
                      />
                    </div>
                  ))}
                </div>

                <button
                  className="mt-1 w-full rounded-full py-3 text-base font-extrabold text-white"
                  style={{ backgroundColor: buttonColor }}
                >
                  {formData.button_text || "HAZLO YA"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
        Aparece a los <strong>{triggerTime}s</strong> de que el usuario entra a
        la página
      </p>
    </div>
  );
}
