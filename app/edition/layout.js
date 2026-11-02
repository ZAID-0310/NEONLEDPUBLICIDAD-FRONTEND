"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { EditionActionsProvider } from "./components/EditionActionsContext";
import { Button } from "@/components/ui/button";
import {
  Save,
  Loader2,
  Layout,
  FootprintsIcon as FooterIcon,
  House,
  BookTemplate,
  Pencil,
  Menu, //AGREGAR PARA EL MENU HAMBURGUESA
  X, //PARA CERRAR EL MENU HAMBURGUESA
} from "lucide-react";

export default function EditionLayout({ children }) {
  const [selectedSection, setSelectedSection] = useState("header");
  const [sidebarOpen, setSidebarOpen] = useState(false); // 1. ESTADO DEL MENU AGREGADO

  const observerRef = useRef(null);
  const isNavigatingRef = useRef(false);
  const sectionsRef = useRef(null);
  const [actions, setActions] = useState({
    onSave: null,
    disabled: true,
    loading: false,
    label: "",
  });

  const registerActions = useCallback((nextActions = {}) => {
    setActions((prev) => ({
      onSave:
        nextActions.onSave !== undefined ? nextActions.onSave : prev.onSave,
      disabled:
        typeof nextActions.disabled === "boolean"
          ? nextActions.disabled
          : prev.disabled,
      loading:
        typeof nextActions.loading === "boolean"
          ? nextActions.loading
          : prev.loading,
      label: nextActions.label !== undefined ? nextActions.label : prev.label,
    }));
  }, []);

  // 2. BLOQUEAR SCROLL EN MOBILE AL ABRIR MENU
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleSectionClick = (id) => {
    setSelectedSection(id);
    setSidebarOpen(false); // Cierra el menú en móvil al hacer click

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    isNavigatingRef.current = true;

    const targetElement = document.getElementById(id);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => {
      if (document.getElementById(id)) {
        setupObserver();
        isNavigatingRef.current = false;
      }
    }, 1000);
  };

  const setupObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!sectionsRef.current) {
      sectionsRef.current = document.querySelectorAll(
        "#header, #body, #footer",
      );
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (!isNavigatingRef.current) {
          let mostVisibleSection = null;
          let maxVisibility = 0;

          entries.forEach((entry) => {
            const visibility =
              entry.intersectionRect.height * entry.intersectionRect.width;
            if (visibility > maxVisibility) {
              maxVisibility = visibility;
              mostVisibleSection = entry.target.id;
            }
          });

          if (mostVisibleSection) {
            setSelectedSection(mostVisibleSection);
          }
        }
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
        rootMargin: "-5% 0px -5% 0px",
      },
    );

    if (sectionsRef.current) {
      sectionsRef.current.forEach((section) => {
        observerRef.current.observe(section);
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      sectionsRef.current = document.querySelectorAll(
        "#header, #body, #footer",
      );
      setupObserver();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isNavigatingRef.current) return;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <EditionActionsProvider value={{ actions, registerActions }}>
      <div className="flex flex-col min-h-screen">
        <Header />

        {/* BOTÓN HAMBURGUESA (Solo Móvil) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-20 left-4 z-40 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-800 text-white shadow-lg"
          aria-label="Abrir menú de edición"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* OVERLAY OSCURO (Solo Móvil al abrir) */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
          />
        )}

        <div className="flex flex-1">
          {/* SIDEBAR ADAPTADO (Fijo en PC, Drawer desplazable en Móvil) */}
          <div
            className={`w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white fixed top-0 left-0 h-full pt-20 shadow-xl z-50 transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
          >
            <div className="px-6 py-4 border-b border-slate-700/50 relative">
              {/* Botón X para cerrar en móvil */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center justify-center">
                <Link href="/">
                  <img
                    src="/header_footer/logo.png"
                    alt="NeonLedPublicidad"
                    width="50"
                    height="50"
                    className="h-auto"
                  />
                </Link>
              </div>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <h1 className="text-lg tracking-wide font-extrabold">
                  MODO EDICION
                </h1>
                <Pencil className="mb-1 h-4 w-4" />
              </div>
            </div>

            <div className="p-6 overflow-y-auto h-[calc(100%-140px)]">
              <h2 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-4 flex items-center">
                <span className="h-px flex-grow bg-slate-700 mr-2"></span>
                Estructura
                <span className="h-px flex-grow bg-slate-700 ml-2"></span>
              </h2>

              <div className="space-y-3 w-full mb-auto">
                <button
                  className={`section group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                    selectedSection === "header"
                      ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                      : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1"
                  }`}
                  onClick={() => handleSectionClick("header")}
                >
                  <Layout
                    className={`mr-3 h-4 w-4 ${
                      selectedSection === "header"
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  Header
                </button>

                <button
                  className={`section group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                    selectedSection === "body"
                      ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                      : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1"
                  }`}
                  onClick={() => handleSectionClick("body")}
                >
                  <Layout
                    className={`mr-3 h-4 w-4 ${
                      selectedSection === "body"
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  Body
                </button>

                <button
                  className={`section group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                    selectedSection === "footer"
                      ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                      : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1"
                  }`}
                  onClick={() => handleSectionClick("footer")}
                >
                  <FooterIcon
                    className={`mr-3 h-4 w-4 ${
                      selectedSection === "footer"
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  Footer
                </button>
              </div>

              <h2 className="text-xs mt-3 font-medium uppercase tracking-wider text-slate-400 mb-4 flex items-center">
                <span className="h-px flex-grow bg-slate-700 mr-2"></span>
                OPCIONES
                <span className="h-px flex-grow bg-slate-700 ml-2"></span>
              </h2>

              <button className="group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1">
                <Link href="/dashboard/blogs" className="flex items-center">
                  <House className="mr-3 h-4 w-4 text-slate-400 group-hover:text-white" />
                  Inicio
                </Link>
              </button>

              <button className="group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1">
                <Link href="/edition/" className="flex items-center">
                  <BookTemplate className="mr-3 h-4 w-4 text-slate-400 group-hover:text-white" />
                  Plantillas
                </Link>
              </button>

              <h2 className="text-xs mt-6 font-medium uppercase tracking-wider text-slate-400 mb-3 flex items-center">
                <span className="h-px flex-grow bg-slate-700 mr-2"></span>
                Acciones
                <span className="h-px flex-grow bg-slate-700 ml-2"></span>
              </h2>

              <Button
                onClick={() => actions.onSave?.()}
                disabled={!actions.onSave || actions.disabled}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                {actions.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {actions.label || "Guardar"}
                  </>
                )}
              </Button>
              <p className="mt-2 text-[11px] leading-4 text-slate-300">
                El boton se habilita cuando el formulario esta listo para
                guardar.
              </p>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL (Adaptado a ml-0 en Móvil y ml-64 en PC) */}
          <div className="flex-1 p-6 ml-0 lg:ml-64 bg-slate-50 overflow-auto w-full pt-20 lg:pt-6">
            {children}
          </div>
        </div>
        <div>
          <Footer />
        </div>
      </div>
    </EditionActionsProvider>
  );
}
