"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

// Componentes
import TemplateSelector from "./components/preview/TemplateSelector";
import FormMain from "./components/forms/FormMain";
import TemplateRenderer from "./components/preview/TemplateRenderer";

// Configuración
import { PLANTILLA_IDS, getPlantillaConfig } from "./config/index";

/**
 * EditionContent - Componente que maneja la lógica con useSearchParams
 */
function EditionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramTemplate = searchParams.get("template");
  
  // Estados principales
  const [currentView, setCurrentView] = useState("loading"); // 'loading' | 'template-select' | 'form' | 'error'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de configuración
  const [mode, setMode] = useState("create");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [blogId, setBlogId] = useState(null);

  // Leer query params al montar componente
  useEffect(() => {
    const paramMode = searchParams.get("mode") || "create";
    const paramId = searchParams.get("id") || searchParams.get("id_blog");
    const paramView = searchParams.get("view");

    setMode(paramMode);

    if (paramMode === "edit") {
      // Modo edición: requiere ID del blog
      if (!paramId) {
        setError("No se especificó el ID del blog para editar");
        setCurrentView("error");
        setLoading(false);
        return;
      }
      
      setBlogId(paramId);
      if (
        paramTemplate &&
        Object.values(PLANTILLA_IDS).includes(Number(paramTemplate))
      ) {
        setSelectedTemplate(Number(paramTemplate));
      } else {
        setSelectedTemplate(null);
      }
      setCurrentView(paramView === "templates" ? "template-select" : "form");
      setLoading(false);
      
    } else {
      // Modo creación
      if (paramTemplate) {
        // Validar que la plantilla existe
        const templateId = parseInt(paramTemplate);
        const config = getPlantillaConfig(templateId);
        
        if (config && Object.values(PLANTILLA_IDS).includes(templateId)) {
          setSelectedTemplate(templateId);
          setCurrentView("form");
        } else {
          setError(`Plantilla ${templateId} no válida`);
          setCurrentView("error");
        }
      } else {
        setSelectedTemplate(null);
        // Sin plantilla especificada, mostrar selector
        setCurrentView("template-select");
      }
      
      setLoading(false);
    }
  }, [searchParams]);

  // Handler para selección de plantilla
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setCurrentView("form");
    
    // Actualizar URL para reflejar selección
    const newUrl = new URL(window.location);
    newUrl.searchParams.set("template", templateId);
    newUrl.searchParams.delete("view");
    router.replace(newUrl.pathname + newUrl.search, { scroll: false });
  };

  // Handler para cancelar selección de plantilla
  const handleTemplateCancel = () => {
    if (mode === "edit" && blogId) {
      const selectedTemplateParam = paramTemplate
        ? `&template=${encodeURIComponent(paramTemplate)}`
        : "";
      router.replace(
        `/edition?mode=edit&id=${encodeURIComponent(blogId)}${selectedTemplateParam}`,
      );
      return;
    }

    router.push("/dashboard/blogs");
  };

  // Handler para éxito en guardado
  const handleFormSuccess = (result) => {
    router.push("/dashboard/blogs");
  };

  // Handler para cancelar formulario
  const handleFormCancel = () => {
    router.push("/dashboard/blogs");
  };

  // Handler para cambio de plantilla durante creación
  const handlePlantillaChange = (newTemplateId) => {
    setSelectedTemplate(newTemplateId);
    
    // Actualizar URL
    const newUrl = new URL(window.location);
    newUrl.searchParams.set("template", newTemplateId);
    router.replace(newUrl.pathname + newUrl.search, { scroll: false });
  };

  // Renderizado condicional basado en estado
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Cargando editor de blogs...</p>
        </div>
      </div>
    );
  }

  if (currentView === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error en el Editor
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard/blogs")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Volver a Blogs
          </button>
        </div>
      </div>
    );
  }

  if (currentView === "template-select") {
    return (
      <TemplateSelector
        onTemplateSelect={handleTemplateSelect}
        onCancel={handleTemplateCancel}
        defaultTemplate={selectedTemplate || PLANTILLA_IDS.CLASICA}
        showCancel={true}
      />
    );
  }

  if (currentView === "form") {
    return (
      <div className="min-h-screen bg-gray-50">
        <FormMain
          key={`${mode}:${blogId ?? "new"}`}
          plantillaId={selectedTemplate || PLANTILLA_IDS.CLASICA}
          blogId={blogId}
          mode={mode}
          templateOverride={Boolean(paramTemplate)}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          onPlantillaChange={mode === "create" ? handlePlantillaChange : undefined}
          showPreview={true}
          showCancel={true}
          showTemplateSelector={mode === "create"}
        />
      </div>
    );
  }

  // Fallback por seguridad
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Estado del editor no reconocido</p>
        <button
          onClick={() => router.push("/dashboard/blogs")}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Volver a Blogs
        </button>
      </div>
    </div>
  );
}

/**
 * Page - Entry point principal para la ruta /edition
 * 
 * Maneja tanto la creación como edición de blogs basado en query params:
 * - mode: 'create' | 'edit' (default: 'create')
 * - template: id de plantilla (solo para creación)  
 * - id o id_blog: id del blog (solo para edición)
 */
export default function Page() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Cargando editor de blogs...</p>
          </div>
        </div>
      }
    >
      <EditionContent />
    </Suspense>
  );
}