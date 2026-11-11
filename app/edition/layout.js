"use client";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { EditionActionsProvider } from "./components/EditionActionsContext";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
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

function EditionLayoutInner({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const searchParams = useSearchParams();
  const [selectedSection, setSelectedSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // 1. ESTADO DEL MENU AGREGADO
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [savingBeforeLeave, setSavingBeforeLeave] = useState(false);
  const [navigationSaveError, setNavigationSaveError] = useState("");

  const observerRef = useRef(null);
  const scrollFrameRef = useRef(null);
  const isNavigatingRef = useRef(false);
  const sectionsRef = useRef(null);
  const isHomeActive =
    normalizedPathname === "/dashboard/blogs" ||
    normalizedPathname.startsWith("/dashboard/blogs/");
  const editingBlogId = searchParams.get("id") || searchParams.get("id_blog");
  const isTemplatesActive =
    normalizedPathname === "/edition" &&
    ((searchParams.get("mode") === "edit" &&
      searchParams.get("view") === "templates") ||
      (searchParams.get("mode") !== "edit" && !searchParams.has("template")));
  const [actions, setActions] = useState({
    onSave: null,
    disabled: true,
    loading: false,
    label: "",
    isDirty: false,
    formLoading: false,
    plantillaId: null,
    clearDraft: null,
  });
  const activeTemplateId =
    actions.plantillaId ?? searchParams.get("template");
  const templatesHref =
    searchParams.get("mode") === "edit" && editingBlogId
      ? `/edition?mode=edit&id=${encodeURIComponent(editingBlogId)}${
          activeTemplateId
            ? `&template=${encodeURIComponent(activeTemplateId)}`
            : ""
        }&view=templates`
      : "/edition/";

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
      isDirty:
        typeof nextActions.isDirty === "boolean"
          ? nextActions.isDirty
          : prev.isDirty,
      formLoading:
        typeof nextActions.formLoading === "boolean"
          ? nextActions.formLoading
          : prev.formLoading,
      plantillaId:
        nextActions.plantillaId !== undefined
          ? nextActions.plantillaId
          : prev.plantillaId,
      clearDraft:
        nextActions.clearDraft !== undefined
          ? nextActions.clearDraft
          : prev.clearDraft,
    }));
  }, []);

  const requestNavigation = useCallback((destination) => {
    setNavigationSaveError("");
    setPendingNavigation(destination);
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (!actions.isDirty) return undefined;

    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [actions.isDirty]);

  const handleDashboardNavigation = (event) => {
    event.preventDefault();
    setSidebarOpen(false);

    if (actions.isDirty) {
      requestNavigation("/dashboard/blogs");
      return;
    }

    router.push("/dashboard/blogs");
  };

  const handleSaveBeforeLeave = async () => {
    if (!actions.onSave) {
      setNavigationSaveError(
        "No se pudo acceder al formulario para guardar los cambios.",
      );
      return;
    }

    setSavingBeforeLeave(true);
    setNavigationSaveError("");

    try {
      const saved = await actions.onSave();
      if (saved) {
        setPendingNavigation(null);
      } else {
        setNavigationSaveError(
          "No se pudieron guardar los cambios. Revisa el formulario e inténtalo nuevamente.",
        );
      }
    } finally {
      setSavingBeforeLeave(false);
    }
  };

  const handleLeaveWithoutSaving = async () => {
    const destination = pendingNavigation;
    if (actions.clearDraft) {
      setSavingBeforeLeave(true);
      setNavigationSaveError("");
      try {
        const cleared = await actions.clearDraft();
        if (!cleared) {
          setNavigationSaveError(
            "No se pudo descartar el borrador local. Inténtalo nuevamente.",
          );
          return;
        }
      } finally {
        setSavingBeforeLeave(false);
      }
    }

    setPendingNavigation(null);
    if (destination) {
      router.push(destination);
    }
  };

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
    if (isTemplatesActive || actions.formLoading) return;

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

  const updateSelectedSection = useCallback(() => {
    if (isTemplatesActive || actions.formLoading) return;

    sectionsRef.current = document.querySelectorAll("#header, #body, #footer");
    if (sectionsRef.current.length !== 3) {
      setSelectedSection(null);
      return;
    }

    const viewportTop = window.innerHeight * 0.05;
    const viewportBottom = window.innerHeight * 0.95;
    let mostVisibleSection = null;
    let maxVisibility = 0;

    sectionsRef.current.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop),
      );
      const visibleWidth = Math.max(
        0,
        Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0),
      );
      const visibility = visibleHeight * visibleWidth;

      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        mostVisibleSection = section.id;
      }
    });

    setSelectedSection(mostVisibleSection);
  }, [actions.formLoading, isTemplatesActive]);

  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    sectionsRef.current = document.querySelectorAll("#header, #body, #footer");
    if (sectionsRef.current.length !== 3) return false;

    observerRef.current = new IntersectionObserver(
      updateSelectedSection,
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

    return true;
  }, [updateSelectedSection]);

  useEffect(() => {
    if (isTemplatesActive || actions.formLoading) {
      observerRef.current?.disconnect();
      sectionsRef.current = null;
      setSelectedSection(null);
      return;
    }

    const observerReady = setupObserver();
    const sectionMountObserver = observerReady
      ? null
      : new MutationObserver(() => {
          if (setupObserver()) {
            sectionMountObserver.disconnect();
          }
        });

    sectionMountObserver?.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      sectionMountObserver?.disconnect();
      observerRef.current?.disconnect();
    };
  }, [actions.formLoading, isTemplatesActive, setupObserver]);

  useEffect(() => {
    const handleScroll = () => {
      if (isNavigatingRef.current || scrollFrameRef.current !== null) return;

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        updateSelectedSection();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [actions.formLoading, isTemplatesActive, updateSelectedSection]);

  return (
    <EditionActionsProvider
      value={{ actions, registerActions, requestNavigation }}
    >
      <div className="flex flex-col min-h-screen">
        <Header onNavigate={handleDashboardNavigation} />

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
                    !isTemplatesActive &&
                    !actions.formLoading &&
                    selectedSection === "header"
                      ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                      : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1 disabled:cursor-not-allowed disabled:opacity-50"
                  }`}
                  disabled={isTemplatesActive || actions.formLoading}
                  onClick={() => handleSectionClick("header")}
                >
                  <Layout
                    className={`mr-3 h-4 w-4 ${
                      !isTemplatesActive &&
                      !actions.formLoading &&
                      selectedSection === "header"
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  Header
                </button>

                <button
                  className={`section group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                    !isTemplatesActive &&
                    !actions.formLoading &&
                    selectedSection === "body"
                      ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                      : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1 disabled:cursor-not-allowed disabled:opacity-50"
                  }`}
                  disabled={isTemplatesActive || actions.formLoading}
                  onClick={() => handleSectionClick("body")}
                >
                  <Layout
                    className={`mr-3 h-4 w-4 ${
                      !isTemplatesActive &&
                      !actions.formLoading &&
                      selectedSection === "body"
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  Body
                </button>

                <button
                  className={`section group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                    !isTemplatesActive &&
                    !actions.formLoading &&
                    selectedSection === "footer"
                      ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                      : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1 disabled:cursor-not-allowed disabled:opacity-50"
                  }`}
                  disabled={isTemplatesActive || actions.formLoading}
                  onClick={() => handleSectionClick("footer")}
                >
                  <FooterIcon
                    className={`mr-3 h-4 w-4 ${
                      !isTemplatesActive &&
                      !actions.formLoading &&
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

              <Link
                href="/dashboard/blogs"
                onClick={handleDashboardNavigation}
                aria-current={isHomeActive ? "page" : undefined}
                className={`group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                  isHomeActive
                    ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                    : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1"
                }`}
              >
                <House
                  className={`mr-3 h-4 w-4 ${isHomeActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"}`}
                />
                Inicio
              </Link>

              <Link
                href={templatesHref}
                onClick={(event) => {
                  if (actions.formLoading) {
                    event.preventDefault();
                    return;
                  }
                  setSidebarOpen(false);
                }}
                aria-current={isTemplatesActive ? "page" : undefined}
                className={`group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                  isTemplatesActive
                    ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                    : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1"
                }`}
              >
                <BookTemplate
                  className={`mr-3 h-4 w-4 ${isTemplatesActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"}`}
                />
                Plantillas
              </Link>

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
      {pendingNavigation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-blog-changes-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 bg-slate-800 px-6 py-5 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <h2
                  id="unsaved-blog-changes-title"
                  className="text-lg font-semibold"
                >
                  Cambios sin guardar
                </h2>
                <p className="text-sm text-slate-300">                {searchParams.get("mode") === "edit"
                  ? "Estás editando un blog"
                  : "Estás creando un blog"}</p>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <p className="text-sm leading-6 text-slate-600">
                ¿Quieres guardar los cambios antes de regresar a la lista de blogs?
              </p>
              {navigationSaveError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {navigationSaveError}
                </p>
              )}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPendingNavigation(null);
                    setNavigationSaveError("");
                  }}
                  disabled={savingBeforeLeave}
                  className="min-h-[62px] rounded-xl bg-slate-600 px-4 py-3 text-sm font-bold leading-tight text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
                >
                  Seguir editando
                </button>
                <button
                  type="button"
                  onClick={handleLeaveWithoutSaving}
                  disabled={savingBeforeLeave}
                  className="min-h-[62px] rounded-xl bg-red-700 px-4 py-3 text-sm font-bold leading-tight text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
                >
                  Salir sin guardar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBeforeLeave}
                  disabled={savingBeforeLeave}
                  className="inline-flex min-h-[62px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold leading-tight text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
                >
                  {savingBeforeLeave ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5 shrink-0" />
                  )}
                  {savingBeforeLeave ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </EditionActionsProvider>
  );
}

export default function EditionLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <EditionLayoutInner>{children}</EditionLayoutInner>
    </Suspense>
  );
}
