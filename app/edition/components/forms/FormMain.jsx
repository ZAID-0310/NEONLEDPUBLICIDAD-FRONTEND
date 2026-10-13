"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Save,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  MessageSquareQuote,
  Images,
  FileText,
} from "lucide-react";
import useBlogData from "../../hooks/useBlogData";
import FormHeader from "./FormHeader";
import FormBody from "./FormBody";
import FormFooter from "./FormFooter";
import { useEditionActions } from "../EditionActionsContext";

// Configuración de plantillas
import {
  PLANTILLA_IDS,
  DEFAULT_HEADER_VALIDATION_CONFIG,
  DEFAULT_FOOTER_VALIDATION_CONFIG,
  DEFAULT_BODY_VALIDATION_CONFIG,
  getPlantillaConfig,
} from "../../config/index";

// Componentes de preview
import TemplateSelector from "../preview/TemplateSelector";
import TemplateRenderer from "../preview/TemplateRenderer";

/** REFERENCIA GLOBAL PARA ACCIONAR BOTÓN DESDE FUERA */
export const externalSaveRef = { current: null };

/**
 * FormMain - Componente orquestador del workflow completo de blogs
 */
export default function FormMain({
  plantillaId = PLANTILLA_IDS.CLASICA,
  blogId = null,
  mode = "create",

  // Props de callbacks
  onSuccess,
  onCancel,
  onPreview,
  onPlantillaChange,

  // Props de UI
  showPreview = true,
  showCancel = true,
  showTemplateSelector: showTemplateSelectorProp = false, // Mostrar selector de plantillas
  className = "",

  // Props adicionales
  autoSave = false,
  autoSaveInterval = 30000, // 30 segundos
}) {
  const {
    // Configuración
    plantillaConfig,
    isCreateMode,
    isEditMode,

    // Estados principales
    loading,
    error,
    isDirty,
    isFormValid,

    // Estados de formularios (compatibilidad completa)
    formEncabezadoHeader,
    setFormEncabezadoHeader,
    formImagenHeader,
    setFormImagenHeader,

    formEncabezadoBody,
    setFormEncabezadoBody,
    formCommendBody,
    setFormCommendBody,
    formGaleryBody,
    setFormGaleryBody,
    formInfoBody,
    setFormInfoBody,

    formEncabezadoFooter,
    setFormEncabezadoFooter,
    formImagenFooter,
    setFormImagenFooter,

    setFileHeader,
    setFileBodyHeader,
    setFileBodyFile1,
    setFileBodyFile2,
    setFileFooterFile1,
    setFileFooterFile2,
    setFileFooterFile3,

    setValidacionHeader,
    setValidacionBody,
    setValidacionFooter,

    // Servicios (solo para enlaces en tarjetas)
    servicios,

    // Acciones
    saveBlog,
    resetForm,

    // Utilidades
    setError,
    clearError,
    setLoading,
  } = useBlogData(plantillaId, blogId, mode);

  const { registerActions } = useEditionActions();

  const footerDataRef = useRef(formEncabezadoFooter);

  // Estados locales del componente
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  // Estado del switch de publicación
  const [isPublicado, setIsPublicado] = useState(
    formEncabezadoFooter?.estado_publicacion === 1,
  );

  // Sincroniza el switch con los datos del blog cuando formEncabezadoFooter cambia
  useEffect(() => {
    if (formEncabezadoFooter) {
      setIsPublicado(formEncabezadoFooter.estado_publicacion === 1);
    }
  }, [formEncabezadoFooter]);

  // Estados para el sistema de preview
  const [viewMode, setViewMode] = useState("edit"); // 'edit' | 'preview' | 'template-select'
  const [selectedPlantilla, setSelectedPlantilla] = useState(plantillaId);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const [sectionsVisibility, setSectionsVisibility] = useState({
    consejos: formEncabezadoBody?.flag_consejos ?? true,
    galeria: formEncabezadoBody?.flag_galeria ?? true,
    informacion: formEncabezadoBody?.flag_informacion ?? true,
  });

  const currentPlantillaConfig = getPlantillaConfig(plantillaId);
  const mergedSectionsConfig = currentPlantillaConfig?.sectionsConfig || {
    consejos: { enabled: true },
    galeria: { enabled: true },
    informacion: { enabled: true },
  };

  const [activePreviewTab, setActivePreviewTab] = useState("informacion");

  //Referencias para scroll a secciones
  const headerRef = useRef(null);
  const bodyRef = useRef(null);
  const footerRef = useRef(null);

  /** REFERENCIA LOCAL DEL BOTÓN GUARDAR */
  const saveButtonRef = useRef(null);

  // Generar datos para preview
  const getBlogDataForPreview = useCallback(() => {
    return {
      header: {
        ...formEncabezadoHeader,
        ...formImagenHeader,
      },
      body: {
        header: {
          ...formEncabezadoBody,
          flag_consejos: formEncabezadoBody?.flag_consejos ?? true,
          flag_galeria: formEncabezadoBody?.flag_galeria ?? true,
          flag_informacion: formEncabezadoBody?.flag_informacion ?? true,
        },
        consejos: formCommendBody || {},
        galeria: formGaleryBody || {},
        informacion: formInfoBody || [],
      },
      footer: {
        ...formEncabezadoFooter,
        ...formImagenFooter,
        estado_publicacion:
          formEncabezadoFooter?.estado_publicacion ?? (isPublicado ? 1 : 0),
      },
    };
  }, [
    formEncabezadoHeader,
    formImagenHeader,
    formEncabezadoBody,
    formCommendBody,
    formGaleryBody,
    formInfoBody,
    formEncabezadoFooter,
    formImagenFooter,
  ]);

  useEffect(() => {
    setSectionsVisibility({
      consejos: formEncabezadoBody?.flag_consejos ?? true,
      galeria: formEncabezadoBody?.flag_galeria ?? true,
      informacion: formEncabezadoBody?.flag_informacion ?? true,
    });
  }, [
    formEncabezadoBody?.flag_consejos,
    formEncabezadoBody?.flag_galeria,
    formEncabezadoBody?.flag_informacion,
  ]);

  useEffect(() => {
    const currentTabVisible =
      (activePreviewTab === "consejos" && sectionsVisibility.consejos) ||
      (activePreviewTab === "galeria" && sectionsVisibility.galeria) ||
      (activePreviewTab === "informacion" && sectionsVisibility.informacion);

    if (!currentTabVisible) {
      if (sectionsVisibility.informacion) {
        setActivePreviewTab("informacion");
      } else if (sectionsVisibility.consejos) {
        setActivePreviewTab("consejos");
      } else if (sectionsVisibility.galeria) {
        setActivePreviewTab("galeria");
      }
    }
  }, [sectionsVisibility, activePreviewTab]);

  // Auto-guardado periódico
  useEffect(() => {
    if (!autoSave || !isDirty || !isFormValid) return;

    const timer = setTimeout(async () => {
      try {
        await saveBlog();
      } catch (err) {}
    }, autoSaveInterval);

    setAutoSaveTimer(timer);
    return () => timer && clearTimeout(timer);
  }, [autoSave, isDirty, isFormValid, autoSaveInterval, saveBlog]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [autoSaveTimer]);

  useEffect(() => {
    footerDataRef.current = formEncabezadoFooter;
  }, [formEncabezadoFooter]);

  // Scroll
  useEffect(() => {
    const handleNavClick = (event) => {
      const target = event.target.closest("[data-scroll-to]");
      if (!target) return;

      const section = target.getAttribute("data-scroll-to");
      event.preventDefault();

      const sectionRef =
        section === "header"
          ? headerRef
          : section === "body"
            ? bodyRef
            : section === "footer"
              ? footerRef
              : null;

      if (sectionRef?.current) {
        sectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    document.addEventListener("click", handleNavClick);
    return () => document.removeEventListener("click", handleNavClick);
  }, []);

  // Header handlers
  const handleHeaderChange = useCallback(
    ({ name, value }) => {
      if (["public_image", "url_image", "alt", "title"].includes(name)) {
        setFormImagenHeader((prev) => ({ ...prev, [name]: value }));
      } else {
        setFormEncabezadoHeader((prev) => ({ ...prev, [name]: value }));
      }
    },
    [setFormEncabezadoHeader, setFormImagenHeader],
  );

  const handleHeaderImageChange = useCallback(
    async (imageData) => {
      try {
        setLoading(true);

        setFormImagenHeader((prev) => ({
          ...prev,
          public_image: imageData.tempUrl,
          alt: imageData.alt || "",
          title: imageData.title || "",
        }));

        setFileHeader(imageData.file);
      } catch (err) {
        setError("Error al procesar imagen del header");
      } finally {
        setLoading(false);
      }
    },
    [setFormImagenHeader, setFileHeader, setLoading, setError],
  );

  const handleHeaderImageDelete = useCallback(async () => {
    try {
      setFormImagenHeader((prev) => ({
        ...prev,
        public_image: "/blog/fondo_blog_extend.png",
        alt: "",
        title: "",
      }));

      setFileHeader(null);
    } catch (err) {
      setError("Error al limpiar imagen del header");
    }
  }, [setFormImagenHeader, setFileHeader, setError]);

  const handleFooterChange = useCallback(
    ({ name, value }) => {
      if (["public_image1", "public_image2", "public_image3"].includes(name)) {
        setFormImagenFooter((prev) => ({ ...prev, [name]: value }));
      } else {
        setFormEncabezadoFooter((prev) => ({ ...prev, [name]: value }));
      }
    },
    [setFormEncabezadoFooter, setFormImagenFooter],
  );

  // NOTA: handleFooterImagesChange y handleFooterImageDelete fueron eliminados
  // Las imágenes del footer ahora se manejan a través del flujo principal de saveBlog
  // que usa el orchestrator para coordinar todas las subidas de imágenes
  // Handler para controlar flags de visibilidad de secciones
  const handleSectionToggle = useCallback(
    (section, enabled) => {
      const flagName = `flag_${section}`;

      setSectionsVisibility((prev) => ({
        ...prev,
        [section]: enabled,
      }));

      setFormEncabezadoBody?.((prev) => ({
        ...prev,
        [flagName]: enabled,
      }));

      if (!enabled) {
        switch (section) {
          case "consejos":
            setFormCommendBody?.((prev) => ({
              id: prev?.id,
              titulo: "",
              texto1: "",
              texto2: "",
              texto3: "",
              texto4: "",
              texto5: "",
            }));
            break;
          case "galeria":
            setFormGaleryBody?.({
              public_image2: "",
              public_image3: "",
              alt_image2: "",
              alt_image3: "",
              title_image2: "",
              title_image3: "",
            });
            break;
          case "informacion":
            setFormInfoBody?.((prev) =>
              prev.map((tarjeta) => ({
                id: tarjeta?.id,
                titulo: "",
                descripcion: "",
                keyword: "",
                link: "",
              })),
            );
            break;
        }
      }
    },
    [
      setFormEncabezadoBody,
      setFormCommendBody,
      setFormGaleryBody,
      setFormInfoBody,
    ],
  );
  const handleFooterValidation = useCallback(
    (isValid) => {
      setValidacionFooter(isValid);
    },
    [setValidacionFooter],
  );

  const saveBlogRef = useRef(saveBlog);
  const onSuccessRef = useRef(onSuccess);
  const setErrorRef = useRef(setError);
  const clearErrorRef = useRef(clearError);

  useEffect(() => {
    saveBlogRef.current = saveBlog;
    onSuccessRef.current = onSuccess;
    setErrorRef.current = setError;
    clearErrorRef.current = clearError;
  }, [saveBlog, onSuccess, setError, clearError]);

  // handleSave estable - solo depende de isFormValid e isPublicado
  const handleSave = useCallback(async () => {
    if (!isFormValid) {
      setErrorRef.current("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      setIsSaving(true);
      clearErrorRef.current();

      const result = await saveBlogRef.current({
        ...footerDataRef.current,
        estado_publicacion: isPublicado ? 1 : 0,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      onSuccessRef.current?.(result);
    } catch (err) {
      setErrorRef.current("No se pudo guardar el blog. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  }, [isFormValid, isPublicado]);

  useEffect(() => {
    registerActions({
      onSave: handleSave,
      disabled: loading || isSaving || !isFormValid, //  Misma regla en tiempo real que el botón inferior
      loading: isSaving,
      label: isCreateMode ? "Crear Blog" : "Actualizar Blog",
    });

    return () => {
      registerActions({
        onSave: null,
        disabled: true,
        loading: false,
        label: "",
      });
    };
  }, [
    registerActions,
    handleSave,
    isCreateMode,
    loading,
    isSaving,
    isFormValid, // Se ejecutará en tiempo real cada vez que cambie la validez
  ]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirm = window.confirm(
        "¿Estás seguro? Los cambios no guardados se perderán.",
      );
      if (!confirm) return;
    }
    resetForm();
    onCancel?.();
  }, [isDirty, resetForm, onCancel]);

  const handlePreview = useCallback(() => {
    setViewMode((prev) => (prev === "preview" ? "edit" : "preview"));
  }, []);

  const handlePlantillaChange = useCallback(
    (newPlantillaId) => {
      if (newPlantillaId !== selectedPlantilla) {
        setSelectedPlantilla(newPlantillaId);
        if (isCreateMode && onPlantillaChange) {
          onPlantillaChange(newPlantillaId);
        }
      }
      setShowTemplateSelector(false);
      setViewMode("edit");
    },
    [selectedPlantilla, isCreateMode, onPlantillaChange],
  );

  const handleShowTemplateSelector = useCallback(() => {
    setShowTemplateSelector(true);
    setViewMode("template-select");
  }, []);

  const handleCancelTemplateSelection = useCallback(() => {
    setShowTemplateSelector(false);
    setViewMode("edit");
  }, []);

  // Componente de Control de Secciones del Blog
  const renderSectionControls = () => (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 border border-purple-500/30 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Título */}
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">
            Control de Secciones del Blog
          </h3>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4 md:gap-6">
          {/* Toggle Consejos */}
          {mergedSectionsConfig.consejos?.enabled && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <MessageSquareQuote className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Consejos
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={sectionsVisibility.consejos}
                  onChange={(e) =>
                    handleSectionToggle("consejos", e.target.checked)
                  }
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    sectionsVisibility.consejos
                      ? "bg-yellow-500"
                      : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      sectionsVisibility.consejos
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </label>
          )}

          {/* Toggle Galería */}
          {mergedSectionsConfig.galeria?.enabled && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <Images className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Galería
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={sectionsVisibility.galeria}
                  onChange={(e) =>
                    handleSectionToggle("galeria", e.target.checked)
                  }
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    sectionsVisibility.galeria ? "bg-yellow-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      sectionsVisibility.galeria
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </label>
          )}

          {/* Toggle Información */}
          {mergedSectionsConfig.informacion?.enabled && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <FileText className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Información
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={sectionsVisibility.informacion}
                  onChange={(e) =>
                    handleSectionToggle("informacion", e.target.checked)
                  }
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    sectionsVisibility.informacion
                      ? "bg-yellow-500"
                      : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      sectionsVisibility.informacion
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Tooltip informativo */}
      <div className="mt-3 text-xs text-gray-400 flex items-start gap-2">
        <span>💡</span>
        <span>
          Controla qué secciones se muestran en la plantilla. Los datos se
          limpian automáticamente al deshabilitar.
        </span>
      </div>
    </div>
  );

  // Estados de carga
  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando blog...</span>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto mt-8 ${className}`}>
      {/* Panel superior */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {isCreateMode ? "Crear Nuevo Blog" : "Editar Blog"}
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Plantilla:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium whitespace-nowrap">
                {plantillaConfig.name}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Switch de Publicación */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white border rounded-xl shadow-sm">
              <span
                className={`text-sm font-medium transition-colors ${
                  isPublicado ? "text-green-600" : "text-orange-500"
                }`}
              >
                {isPublicado ? "Publicar" : "Borrador"}
              </span>

              <label className="cursor-pointer select-none">
                <div className="relative w-14 h-7">
                  {/* INPUT (el peer) */}
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isPublicado}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsPublicado(checked);
                      setFormEncabezadoFooter((prev) => ({
                        ...prev,
                        estado_publicacion: checked ? 1 : 0,
                      }));
                    }}
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-300 rounded-full shadow-inner transition-colors duration-300 peer-checked:bg-green-500"></div>
                  <div
                    className="
          absolute top-0.5 left-0.5 
          w-6 h-6 bg-white rounded-full shadow 
          transition-all duration-300 ease-out
          peer-checked:translate-x-7
        "
                  ></div>
                </div>
              </label>
            </div>
            {/* Estado de validación */}
            <div className="flex items-center space-x-2">
              {isFormValid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">
                    Formulario válido
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-orange-500">
                    Completa los campos
                  </span>
                </>
              )}
            </div>

            {isDirty && (
              <div className="flex items-center space-x-1 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4" />
                <span>Cambios sin guardar</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Blog guardado exitosamente</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row border-b border-gray-200">
          <button
            onClick={() => setViewMode("edit")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              viewMode === "edit"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>✏️ Editar Blog</span>
            </div>
          </button>

          <button
            onClick={handlePreview}
            disabled={!isFormValid}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              viewMode === "preview"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : !isFormValid
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Vista Previa</span>
            </div>
          </button>

          {isCreateMode && showTemplateSelectorProp && (
            <button
              onClick={handleShowTemplateSelector}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                viewMode === "template-select"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🎨 Cambiar Plantilla</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Contenido según el modo */}
      {viewMode === "edit" && (
        <div className="space-y-8">
          {/* 🟦 HEADER */}
          <div id="header" ref={headerRef}>
            <FormHeader
              data={{ ...formEncabezadoHeader, ...formImagenHeader }}
              mode={mode}
              onChange={handleHeaderChange}
              onImageChange={handleHeaderImageChange}
              onImageDelete={handleHeaderImageDelete}
              onValidationChange={setValidacionHeader}
              validationConfig={DEFAULT_HEADER_VALIDATION_CONFIG}
              isUploading={loading}
              showValidationMessages={true}
            />
          </div>

          <div id="body" ref={bodyRef}>
            <FormBody
              formCommendBody={formCommendBody}
              formInfoBody={formInfoBody}
              formEncabezadoBody={formEncabezadoBody}
              formGaleryBody={formGaleryBody}
              setFormCommendBody={setFormCommendBody}
              setFormInfoBody={setFormInfoBody}
              setFormEncabezadoBody={setFormEncabezadoBody}
              setFormGaleryBody={setFormGaleryBody}
              setValidacionBody={setValidacionBody}
              setFileBodyHeader={setFileBodyHeader}
              setFileBodyFile1={setFileBodyFile1}
              setFileBodyFile2={setFileBodyFile2}
              servicios={servicios}
              plantillaId={plantillaId}
              mode={mode}
              isUploading={loading}
              showValidationMessages={true}
            />
          </div>

          <div id="footer" ref={footerRef}>
            <FormFooter
              data={{ ...formEncabezadoFooter, ...formImagenFooter }}
              mode={mode}
              onChange={handleFooterChange}
              onValidationChange={handleFooterValidation}
              validationConfig={DEFAULT_FOOTER_VALIDATION_CONFIG}
              isUploading={loading}
              showValidationMessages={true}
              setFileFooterFile1={setFileFooterFile1}
              setFileFooterFile2={setFileFooterFile2}
              setFileFooterFile3={setFileFooterFile3}
            />
          </div>
        </div>
      )}
      {/* Vista Previa */}
      {viewMode === "preview" && (
        <div className="bg-gray-50 rounded-lg min-h-screen">
          <TemplateRenderer
            plantillaId={selectedPlantilla}
            blogData={getBlogDataForPreview()}
            mode="preview"
            showPlaceholders={true}
            className="shadow-lg bg-white rounded-lg"
            renderAfterHeader={renderSectionControls()}
            activeTab={activePreviewTab}
            onTabChange={setActivePreviewTab}
            sectionsVisibility={sectionsVisibility}
          />
        </div>
      )}

      {viewMode === "template-select" && isCreateMode && (
        <div className="bg-gray-50 rounded-lg p-6">
          <TemplateSelector
            currentPlantilla={selectedPlantilla}
            onTemplateSelect={handlePlantillaChange}
            onCancel={handleCancelTemplateSelection}
            showComparison={true}
            mode="selection"
          />
        </div>
      )}

      {/* PANEL FINAL DE ACCIONES */}
      <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {showCancel && (
              <button
                onClick={handleCancel}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading || isSaving}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            )}

            {showPreview && (
              <button
                onClick={handlePreview}
                className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-2 border rounded-lg transition-colors ${
                  viewMode === "preview"
                    ? "text-blue-700 border-blue-300 bg-blue-50"
                    : "text-blue-700 border-blue-300 hover:bg-blue-50"
                }`}
                disabled={loading || isSaving || !isFormValid}
              >
                <Eye className="w-4 h-4" />
                <span>
                  {viewMode === "preview" ? "Ocultar Preview" : "Vista Previa"}
                </span>
              </button>
            )}

            {isCreateMode && showTemplateSelectorProp && (
              <button
                onClick={handleShowTemplateSelector}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-2 text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                disabled={loading || isSaving}
              >
                <span>🎨</span>
                <span>Cambiar Plantilla</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-end">
            {autoSave && isDirty && (
              <span className="text-sm text-gray-500">
                Auto-guardado en {Math.round(autoSaveInterval / 1000)}s
              </span>
            )}

            {/* BOTÓN GUARDAR — REFERENCIA AÑADIDA */}
            <button
              ref={(el) => {
                saveButtonRef.current = el;
                externalSaveRef.current = el; // <<--- REFERENCIA GLOBAL
              }}
              onClick={handleSave}
              disabled={loading || isSaving || !isFormValid}
              className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-2 rounded-lg font-medium transition-all ${
                isFormValid && !loading && !isSaving
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isCreateMode ? "Crear Blog" : "Actualizar Blog"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
