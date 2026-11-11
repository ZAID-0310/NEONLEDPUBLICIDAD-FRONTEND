import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getCookie } from "cookies-next";
import Api from "../services/api";
import blogImageService from "../services/blogImageService";
import blogOrchestrator from "../orchestrators/blogOrchestrator";
import {
  deleteBlogDraft,
  readBlogDraft,
  writeBlogDraft,
} from "../services/blogDraftStorage";
import {
  mapServerToForm,
  mapFormToServer,
  mapCard,
  mapConsejos,
  mapTarjetas,
} from "../mappers/blogMappers";
import {
  getPlantillaConfig,
  PLANTILLA_IDS,
  DEFAULT_SERVICIOS,
} from "../config/index";
import {
  normalizeImageField,
  ensureRelativePath,
  cleanupBlobUrls as cleanupBlobUrlsUtil,
  getDefaultImage,
  isValidImageUrl,
} from "../utils/imageUtils";
import {
  HEADER_DEFAULTS,
  BODY_DEFAULTS,
  FOOTER_DEFAULTS,
  CONSEJOS_DEFAULTS,
  TARJETA_INFO_DEFAULT,
  TARJETAS_INFO_DEFAULTS,
  BODY_FLAGS_DEFAULTS,
  DEFAULT_IMAGES,
  MAX_INFO_TARJETAS,
} from "../constants/defaults";
import useFormState from "./useFormState";
import { safeJsonParse } from "@/lib/safe-json";

/**
 * Hook principal para manejar el estado del blog
 * Soporta tanto creación como edición de blogs
 *
 * @param {number} plantillaId - ID de la plantilla (1, 2, 3)
 * @param {string|null} blogId - ID del blog para edición (null para creación)
 * @param {string} mode - Modo: 'create' | 'edit'
 */
export default function useBlogData(
  plantillaId = PLANTILLA_IDS.CLASICA,
  blogId = null,
  mode = "create",
  templateOverride = false
) {
  // ========== ESTADOS BASE ==========
  const [loading, setLoading] = useState(mode === "edit" && Boolean(blogId));
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false); // Indica si hay cambios sin guardar
  const [hydrating, setHydrating] = useState(false); // Flag para evitar marcar isDirty durante carga inicial
  const [resolvedPlantillaId, setResolvedPlantillaId] = useState(plantillaId);
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const plantillaConfig = getPlantillaConfig(
    isEditMode ? resolvedPlantillaId : plantillaId
  );

  const [blogRelations, setBlogRelations] = useState({
    id_blog_head: null,
    id_blog_body: null,
    id_blog_footer: null,
  });

  // ========== ESTADOS DE FORMULARIOS (CONSOLIDADOS) ==========
  const {
    // Estados Header
    formEncabezadoHeader,
    setFormEncabezadoHeader,
    formImagenHeader,
    setFormImagenHeader,
    // Estados Body
    formEncabezadoBody,
    setFormEncabezadoBody,
    formCommendBody,
    setFormCommendBody,
    formGaleryBody,
    setFormGaleryBody,
    formInfoBody,
    setFormInfoBody,
    // Estados Footer
    formEncabezadoFooter,
    setFormEncabezadoFooter,
    formImagenFooter,
    setFormImagenFooter,
    // Utilidades
    resetAllForms,
  } = useFormState();

  // ========== ESTADOS DE ARCHIVOS ==========
  const [fileHeader, setFileHeader] = useState(null);
  const [fileBodyHeader, setFileBodyHeader] = useState(null);
  const [fileBodyFile1, setFileBodyFile1] = useState(null);
  const [fileBodyFile2, setFileBodyFile2] = useState(null);
  const [fileFooterFile1, setFileFooterFile1] = useState(null);
  const [fileFooterFile2, setFileFooterFile2] = useState(null);
  const [fileFooterFile3, setFileFooterFile3] = useState(null);

  const [draftStatus, setDraftStatus] = useState("checking");
  const [draftError, setDraftError] = useState("");
  const [availableDraft, setAvailableDraft] = useState(null);
  const cleanFormSnapshotRef = useRef(null);
  const hydrationInProgressRef = useRef(false);
  const resetSnapshotWhenStableRef = useRef(false);
  const draftCheckedRef = useRef(false);
  const latestDraftSnapshotRef = useRef(null);
  const currentDraftData = useMemo(
    () => ({
      resolvedPlantillaId,
      formEncabezadoHeader,
      formImagenHeader,
      formEncabezadoBody,
      formCommendBody,
      formGaleryBody,
      formInfoBody,
      formEncabezadoFooter,
      formImagenFooter,
      files: {
        fileHeader,
        fileBodyHeader,
        fileBodyFile1,
        fileBodyFile2,
        fileFooterFile1,
        fileFooterFile2,
        fileFooterFile3,
      },
    }),
    [
      resolvedPlantillaId,
      formEncabezadoHeader,
      formImagenHeader,
      formEncabezadoBody,
      formCommendBody,
      formGaleryBody,
      formInfoBody,
      formEncabezadoFooter,
      formImagenFooter,
      fileHeader,
      fileBodyHeader,
      fileBodyFile1,
      fileBodyFile2,
      fileFooterFile1,
      fileFooterFile2,
      fileFooterFile3,
    ],
  );
  const currentFormSnapshot = JSON.stringify({
    ...currentDraftData,
    files: Object.values(currentDraftData.files).map((file) =>
      file
        ? {
            name: file.name,
            size: file.size,
            lastModified: file.lastModified,
            type: file.type,
          }
        : null
    ),
  });

  useEffect(() => {
    if (isCreateMode || templateOverride) {
      setResolvedPlantillaId(plantillaId);
    }
  }, [isCreateMode, plantillaId, templateOverride]);

  // ========== ESTADOS DE VALIDACIÓN ==========
  const [validacionHeader, setValidacionHeader] = useState(false);
  const [validacionBody, setValidacionBody] = useState(false);
  const [validacionFooter, setValidacionFooter] = useState(false);

  // ========== ESTADO PARA CARDID (REQUERIDO PARA SUBIR IMÁGENES) ==========
  const [cardId, setCardId] = useState(null);

  // ========== FUNCIÓN HELPER PARA LIMPIAR BLOB URLS ==========
  const cleanupBlobUrls = useCallback(() => {
    // Usar utilidad centralizada para limpiar URLs blob temporales
    cleanupBlobUrlsUtil([
      formImagenHeader.public_image,
      formEncabezadoBody.public_image1,
      formGaleryBody.public_image2,
      formGaleryBody.public_image3,
      formImagenFooter.public_image1,
      formImagenFooter.public_image2,
      formImagenFooter.public_image3,
    ]);
  }, [
    formImagenHeader.public_image,
    formEncabezadoBody.public_image1,
    formGaleryBody.public_image2,
    formGaleryBody.public_image3,
    formImagenFooter.public_image1,
    formImagenFooter.public_image2,
    formImagenFooter.public_image3,
  ]);

  // ========== COMPUTED VALUES ==========
  const isFormValid = validacionHeader && validacionBody && validacionFooter;

  // ========== FUNCIÓN HELPER PARA OBTENER ID_EMPLEADO ==========
  const getEmpleadoId = useCallback(() => {
    try {
      const empleadoCookie = getCookie("empleado");
      if (empleadoCookie) {
        const empleadoData = safeJsonParse(empleadoCookie, null);
        if (!empleadoData) return 1;
        return empleadoData.id_empleado || 1;
      }
      return 1; // Fallback por defecto
    } catch (error) {
      return 1; // Fallback por defecto
    }
  }, []);

  const draftOwnerId = useMemo(() => {
    try {
      const employee = safeJsonParse(getCookie("empleado"), null);
      return employee?.id_empleado ? String(employee.id_empleado) : null;
    } catch {
      return null;
    }
  }, []);
  const draftKey = draftOwnerId
    ? `${draftOwnerId}:${isEditMode ? `blog:${blogId}` : "create"}`
    : null;

  const clearDraft = useCallback(async () => {
    if (!draftKey) {
      latestDraftSnapshotRef.current = null;
      setAvailableDraft(null);
      return true;
    }

    setDraftStatus("deleting");
    try {
      await deleteBlogDraft(draftKey);
      latestDraftSnapshotRef.current = null;
      setAvailableDraft(null);
      setDraftError("");
      setDraftStatus("ready");
      return true;
    } catch (draftStorageError) {
      setDraftError(
        `No se pudo eliminar el borrador local: ${draftStorageError.message}`,
      );
      setDraftStatus("error");
      return false;
    }
  }, [draftKey]);

  const restoreDraft = useCallback(() => {
    if (!availableDraft?.data) return false;

    const {
      resolvedPlantillaId: draftPlantillaId,
      formEncabezadoHeader: draftHeader,
      formImagenHeader: draftHeaderImage,
      formEncabezadoBody: draftBody,
      formCommendBody: draftAdvice,
      formGaleryBody: draftGallery,
      formInfoBody: draftInfo,
      formEncabezadoFooter: draftFooter,
      formImagenFooter: draftFooterImages,
      files = {},
    } = availableDraft.data;

    cleanupBlobUrls();
    if (draftPlantillaId) setResolvedPlantillaId(draftPlantillaId);

    const headerImageUrl = files.fileHeader
      ? URL.createObjectURL(files.fileHeader)
      : null;
    const bodyHeaderImageUrl = files.fileBodyHeader
      ? URL.createObjectURL(files.fileBodyHeader)
      : null;
    const galleryImage2Url = files.fileBodyFile1
      ? URL.createObjectURL(files.fileBodyFile1)
      : null;
    const galleryImage3Url = files.fileBodyFile2
      ? URL.createObjectURL(files.fileBodyFile2)
      : null;
    const footerImage1Url = files.fileFooterFile1
      ? URL.createObjectURL(files.fileFooterFile1)
      : null;
    const footerImage2Url = files.fileFooterFile2
      ? URL.createObjectURL(files.fileFooterFile2)
      : null;
    const footerImage3Url = files.fileFooterFile3
      ? URL.createObjectURL(files.fileFooterFile3)
      : null;

    setFormEncabezadoHeader(draftHeader);
    setFormImagenHeader(
      headerImageUrl
        ? { ...draftHeaderImage, public_image: headerImageUrl }
        : draftHeaderImage,
    );
    setFormEncabezadoBody(
      bodyHeaderImageUrl
        ? { ...draftBody, public_image1: bodyHeaderImageUrl }
        : draftBody,
    );
    setFormCommendBody(draftAdvice);
    setFormGaleryBody({
      ...draftGallery,
      ...(galleryImage2Url && { public_image2: galleryImage2Url }),
      ...(galleryImage3Url && { public_image3: galleryImage3Url }),
    });
    setFormInfoBody(draftInfo);
    setFormEncabezadoFooter(draftFooter);
    setFormImagenFooter({
      ...draftFooterImages,
      ...(footerImage1Url && { public_image1: footerImage1Url }),
      ...(footerImage2Url && { public_image2: footerImage2Url }),
      ...(footerImage3Url && { public_image3: footerImage3Url }),
    });
    setFileHeader(files.fileHeader || null);
    setFileBodyHeader(files.fileBodyHeader || null);
    setFileBodyFile1(files.fileBodyFile1 || null);
    setFileBodyFile2(files.fileBodyFile2 || null);
    setFileFooterFile1(files.fileFooterFile1 || null);
    setFileFooterFile2(files.fileFooterFile2 || null);
    setFileFooterFile3(files.fileFooterFile3 || null);
    latestDraftSnapshotRef.current = availableDraft.snapshot;
    setAvailableDraft(null);
    setDraftError("");
    setDraftStatus("ready");
    return true;
  }, [
    availableDraft,
    cleanupBlobUrls,
    setFormCommendBody,
    setFormEncabezadoBody,
    setFormEncabezadoFooter,
    setFormEncabezadoHeader,
    setFormGaleryBody,
    setFormImagenFooter,
    setFormImagenHeader,
    setFormInfoBody,
  ]);

  useEffect(() => {
    if (draftCheckedRef.current || loading || hydrating) return undefined;
    draftCheckedRef.current = true;
    if (!draftKey) {
      setDraftError(
        "No se pudo identificar tu sesión; el borrador local no estará disponible.",
      );
      setDraftStatus("error");
      return undefined;
    }

    let active = true;

    readBlogDraft(draftKey)
      .then(async (draft) => {
        if (!active) return;
        if (!draft || draft.version !== 1 || !draft.data) {
          setDraftStatus("ready");
          return;
        }

        if (draft.snapshot === cleanFormSnapshotRef.current) {
          await deleteBlogDraft(draftKey);
          if (active) setDraftStatus("ready");
          return;
        }

        latestDraftSnapshotRef.current = draft.snapshot;
        setAvailableDraft(draft);
        setDraftStatus("available");
      })
      .catch((draftStorageError) => {
        if (!active) return;
        setDraftError(
          `No se pudo revisar el borrador local: ${draftStorageError.message}`,
        );
        setDraftStatus("error");
      });

    return () => {
      active = false;
    };
  }, [draftKey, hydrating, loading]);

  useEffect(() => {
    if (
      !isDirty ||
      loading ||
      hydrating ||
      !draftKey ||
      availableDraft ||
      (draftStatus !== "ready" && draftStatus !== "saved") ||
      latestDraftSnapshotRef.current === currentFormSnapshot
    ) {
      return undefined;
    }

    const draft = {
      key: draftKey,
      version: 1,
      snapshot: currentFormSnapshot,
      updatedAt: Date.now(),
      data: currentDraftData,
    };
    const timer = setTimeout(async () => {
      setDraftStatus("saving");
      setDraftError("");

      try {
        await writeBlogDraft(draft);
        latestDraftSnapshotRef.current = draft.snapshot;
        setDraftStatus("saved");
      } catch (draftStorageError) {
        setDraftError(
          `No se pudo guardar el borrador local: ${draftStorageError.message}`,
        );
        setDraftStatus("error");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    availableDraft,
    currentDraftData,
    currentFormSnapshot,
    draftKey,
    draftStatus,
    hydrating,
    isDirty,
    loading,
  ]);

  useEffect(() => {
    const flushDraft = () => {
      if (
        !isDirty ||
        loading ||
        hydrating ||
        !draftKey ||
        availableDraft ||
        latestDraftSnapshotRef.current === currentFormSnapshot
      ) {
        return;
      }

      void writeBlogDraft({
        key: draftKey,
        version: 1,
        snapshot: currentFormSnapshot,
        updatedAt: Date.now(),
        data: currentDraftData,
      }).catch((draftStorageError) => {
        console.error(
          "No se pudo completar el guardado del borrador al salir:",
          draftStorageError,
        );
      });
    };

    window.addEventListener("pagehide", flushDraft);
    return () => window.removeEventListener("pagehide", flushDraft);
  }, [
    availableDraft,
    currentDraftData,
    currentFormSnapshot,
    draftKey,
    hydrating,
    isDirty,
    loading,
  ]);

  // ========== FUNCIONES DE CARGA (MODO EDICIÓN) ==========
  const fetchBlogData = useCallback(async () => {
    if (!blogId || isCreateMode) return;

    try {
      setLoading(true);
      setError(null);
      setHydrating(true);

      const blogResponse = await Api.getBlogById(blogId);

      if (!blogResponse) {
        throw new Error("No se pudo cargar el blog");
      }

      const relations = {
        id_blog_head: blogResponse.id_blog_head,
        id_blog_body: blogResponse.id_blog_body,
        id_blog_footer: blogResponse.id_blog_footer,
      };

      setBlogRelations(relations);

      setFormEncabezadoHeader((prev) => ({
        ...prev,
        ...blogResponse,
        titulo_enlace: blogResponse.link || "",
      }));

      const [headerResponse, bodyResponse, footerResponse, cardsResponse] =
        await Promise.all([
          relations.id_blog_head
            ? Api.getHeader(relations.id_blog_head).catch((err) => {
              console.warn("⚠️ Error cargando header:", err);
              return null;
            })
            : null,
          relations.id_blog_body
            ? Api.getBody(relations.id_blog_body).catch((err) => {
              console.warn("⚠️ Error cargando body:", err);
              return null;
            })
            : null,
          relations.id_blog_footer
            ? Api.getFooter(relations.id_blog_footer).catch((err) => {
              console.warn("⚠️ Error cargando footer:", err);
              return null;
            })
            : null,
          Api.getCards().catch(() => []),
        ]);

      // Buscar y establecer cardId para poder subir imágenes en modo edición
      let associatedCard = null;
      if (cardsResponse && Array.isArray(cardsResponse)) {
        associatedCard = cardsResponse.find(
          (card) => String(card.id_blog) === String(blogId)
        );
        if (associatedCard) {
          setCardId(associatedCard.id_card);
          if (!templateOverride && associatedCard.id_plantilla) {
            setResolvedPlantillaId(Number(associatedCard.id_plantilla));
          }
        }
      }

      // Mapear header usando mapper centralizado
      if (headerResponse) {
        const mappedHeader = mapServerToForm("header", headerResponse);
        if (mappedHeader) {
          setFormEncabezadoHeader((prev) => ({
            ...prev,
            titulo: mappedHeader.titulo,
            texto_frase: mappedHeader.texto_frase,
            texto_descripcion: mappedHeader.texto_descripcion,
            meta_title: mappedHeader.meta_title,
            meta_descripcion: mappedHeader.meta_descripcion,
          }));
          setFormImagenHeader({
            public_image: mappedHeader.public_image,
            url_image: mappedHeader.url_image,
            alt: mappedHeader.alt,
            title: mappedHeader.title,
          });
        }
      }

      // Mapear body usando mapper centralizado
      if (bodyResponse) {
        const bodyPlantillaId = templateOverride
          ? plantillaId
          : Number(
              bodyResponse.plantilla_id ||
                associatedCard?.id_plantilla ||
                plantillaId
            );
        if (!templateOverride && bodyPlantillaId) {
          setResolvedPlantillaId(bodyPlantillaId);
        }
        const mappedBody = mapServerToForm(
          "body",
          bodyResponse,
          bodyPlantillaId
        );
        if (mappedBody) {
          setFormEncabezadoBody((prev) => ({
            ...prev,
            ...mappedBody.main,
          }));
          setFormGaleryBody({
            public_image2: mappedBody.main.public_image2,
            public_image3: mappedBody.main.public_image3,
            url_image2: mappedBody.main.url_image2,
            url_image3: mappedBody.main.url_image3,
            alt_image2: mappedBody.main.alt_image2,
            alt_image3: mappedBody.main.alt_image3,
            title_image2: mappedBody.main.title_image2,
            title_image3: mappedBody.main.title_image3,
          });

          // ✅ CARGAR COMMEND_TARJETA DESDE LA RELACIÓN EN BODY
          // El backend ya incluye commend_tarjeta en bodyResponse (usando ->with('commend_tarjeta'))
          if (bodyResponse.commend_tarjeta) {
            setFormCommendBody({
              id:
                bodyResponse.commend_tarjeta.id ||
                bodyResponse.commend_tarjeta.id_commend_tarjeta, // ✅ GUARDAR ID
              titulo: bodyResponse.commend_tarjeta.titulo || "",
              texto1: bodyResponse.commend_tarjeta.texto1 || "",
              texto2: bodyResponse.commend_tarjeta.texto2 || "",
              texto3: bodyResponse.commend_tarjeta.texto3 || "",
              texto4: bodyResponse.commend_tarjeta.texto4 || "",
              texto5: bodyResponse.commend_tarjeta.texto5 || "",
            });
          } else {
            // Si no hay commend_tarjeta, usar valores por defecto
            setFormCommendBody(mappedBody.consejos);
          }

          // ✅ CARGAR TARJETAS DE INFORMACIÓN
          // Intentar cargar desde la relación primero, si no existe, cargar explícitamente
          if (bodyResponse.tarjetas && Array.isArray(bodyResponse.tarjetas)) {
            const tarjetasMapped = bodyResponse.tarjetas.map((tarjeta) => ({
              id: tarjeta.id || tarjeta.id_tarjeta, // ✅ GUARDAR ID ORIGINAL
              titulo: tarjeta.titulo || "",
              descripcion: tarjeta.descripcion || "",
              keyword: tarjeta.keyword || tarjeta.palabra || "",
              link: tarjeta.link || tarjeta.enlace || "",
            }));
            setFormInfoBody(tarjetasMapped);
          } else {
            try {
              const allTarjetas = await Api.getTarjetas();
              // Filtrar tarjetas que pertenecen a este body
              const bodyTarjetas = allTarjetas.filter(
                (tarjeta) => tarjeta.id_blog_body === relations.id_blog_body
              );

              if (bodyTarjetas && bodyTarjetas.length > 0) {
                const tarjetasMapped = bodyTarjetas.map((tarjeta) => ({
                  id: tarjeta.id || tarjeta.id_tarjeta, // ✅ GUARDAR ID ORIGINAL
                  titulo: tarjeta.titulo || "",
                  descripcion: tarjeta.descripcion || "",
                  keyword: tarjeta.keyword || tarjeta.palabra || "",
                  link: tarjeta.link || tarjeta.enlace || "",
                }));
                setFormInfoBody(tarjetasMapped);
              } else {
                setFormInfoBody(mappedBody.informacion);
              }
            } catch (err) {
              console.warn("⚠️ Error cargando tarjetas:", err);
              setFormInfoBody(mappedBody.informacion);
            }
          }
        }
      }

      // Mapear footer usando mapper centralizado
      if (footerResponse) {
        const mappedFooter = mapServerToForm("footer", footerResponse);
        if (mappedFooter) {
          setFormEncabezadoFooter({
            titulo: mappedFooter.titulo,
            descripcion: mappedFooter.descripcion,
            estado: mappedFooter.estado,
            alt_image1: mappedFooter.alt_image1,
            title_image1: mappedFooter.title_image1,
            alt_image2: mappedFooter.alt_image2,
            title_image2: mappedFooter.title_image2,
            alt_image3: mappedFooter.alt_image3,
            title_image3: mappedFooter.title_image3,
            keyword: mappedFooter.keyword,
            link: mappedFooter.link,
          });
          setFormImagenFooter({
            public_image1: mappedFooter.public_image1,
            public_image2: mappedFooter.public_image2,
            public_image3: mappedFooter.public_image3,
          });
        }
      }
      // ========== Cargar estado_publicacion desde CARD ==========
      if (blogResponse?.card?.estado_publicacion !== undefined) {
        setFormEncabezadoFooter(prev => ({
          ...prev,
          estado_publicacion: blogResponse.card.estado_publicacion
        }));
      }

      setIsDirty(false);
    } catch (err) {
      setError("No se pudo cargar el blog");
    } finally {
      setLoading(false);
      // ✅ Usar setTimeout para desactivar hydrating DESPUÉS de que React procese los cambios de estado
      setTimeout(() => setHydrating(false), 0);
    }
  }, [blogId, isCreateMode, plantillaId, templateOverride]);

  // Cargar datos al montar o cambiar blogId
  useEffect(() => {
    fetchBlogData();
  }, [fetchBlogData]);

  // Función para crear Card (separada para mayor control)
  const saveCard = useCallback(
    async (blogId) => {
      try {
        const empleadoId = getEmpleadoId();

        // Usar mapper para preparar datos de la card
        const cardData = mapCard(
          formEncabezadoHeader,
          formEncabezadoBody,
          formImagenHeader,
          plantillaId,
          empleadoId,
          blogId
        );

        const result = await Api.createCard(cardData);
        const cardId = result?.id || result?.data?.id;

        if (cardId) {
          setCardId(cardId); // Establecer cardId para uso posterior
          return { id: cardId, ...result };
        } else {
          throw new Error("No se pudo obtener el ID de la card creada");
        }
      } catch (err) {
        throw new Error(`Error al crear card: ${err.message}`);
      }
    },
    [
      formEncabezadoHeader,
      formEncabezadoBody,
      formImagenHeader,
      plantillaId,
      getEmpleadoId,
    ]
  );

  // ========== FUNCIONES DE GUARDADO ==========
  const saveHeader = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headerPayload = {
        ...formEncabezadoHeader,
        public_image: formImagenHeader.public_image?.startsWith("blob:")
          ? DEFAULT_IMAGES.header.image1
          : formImagenHeader.public_image || DEFAULT_IMAGES.header.image1,
        url_image: formImagenHeader.url_image || "",
        alt: formImagenHeader.alt || HEADER_DEFAULTS.alt,
        title: formImagenHeader.title || HEADER_DEFAULTS.title,
      };

      if (isCreateMode) {
        const result = await Api.createHeader(headerPayload);
        return result;
      } else {
        // ✅ Usar id_blog_head en vez de blogId
        const headerId = blogRelations.id_blog_head;
        if (!headerId) {
          throw new Error("No se encontró el ID del header");
        }
        const result = await Api.updateHeader(headerId, headerPayload);
        return result;
      }
    } catch (err) {
      setError("No se pudo guardar el header");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    formEncabezadoHeader,
    formImagenHeader,
    isCreateMode,
    blogRelations.id_blog_head,
  ]);

  const saveBody = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isCreateMode) {
        // MODO CREACIÓN: Mantener lógica existente
        let commendTarjetaId = null;
        const hasConsejos =
          formCommendBody?.texto1 ||
          formCommendBody?.texto2 ||
          formCommendBody?.texto3 ||
          formCommendBody?.texto4 ||
          formCommendBody?.texto5;

        if (hasConsejos) {
          const consejosPayload = mapConsejos(formCommendBody, plantillaId);
          const commendResult = await Api.createCommendTarjeta(consejosPayload);
          commendTarjetaId = commendResult?.id || commendResult?.data?.id;
        }

        const galleryFiles = [
          { file: fileBodyHeader, route: "upload_body", key: "public_image1" },
          {
            file: fileBodyFile1,
            route: "upload_gallery",
            key: "public_image2",
          },
          {
            file: fileBodyFile2,
            route: "upload_gallery",
            key: "public_image3",
          },
        ];

        const uploadedGalleryImages =
          await blogImageService.uploadGalleryImages(galleryFiles, {
            public_image1:
              formEncabezadoBody.public_image1 ||
              getDefaultImage("body", "image1"),
            public_image2:
              formGaleryBody.public_image2 || getDefaultImage("body", "image2"),
            public_image3:
              formGaleryBody.public_image3 || getDefaultImage("body", "image3"),
            url_image1: formEncabezadoBody.url_image1 || "",
            url_image2: formGaleryBody.url_image2 || "",
            url_image3: formGaleryBody.url_image3 || "",
          });

        const bodyData = {
          ...formEncabezadoBody,
          ...formGaleryBody,
          ...uploadedGalleryImages,
          plantilla_id: plantillaId,
          ...(commendTarjetaId && { id_commend_tarjeta: commendTarjetaId }),
        };

        const bodyResult = await Api.createBody(bodyData);
        const bodyId = bodyResult?.id || bodyResult?.data?.id;

        if (bodyId && formInfoBody && formInfoBody.length > 0) {
          const tarjetasPayload = mapTarjetas(formInfoBody);

          for (const [index, tarjeta] of tarjetasPayload.entries()) {
            try {
              const tarjetaData = {
                ...tarjeta,
                id_blog_body: bodyId,
              };
              await Api.createTarjeta(tarjetaData);
            } catch (err) {
              console.warn(`⚠️ Error creando tarjeta ${index + 1}:`, err);
            }
          }
        }

        return bodyResult;
      } else {
        // ✅ MODO EDICIÓN: Usar id_blog_body
        const bodyId = blogRelations.id_blog_body;
        if (!bodyId) {
          throw new Error("No se encontró el ID del body");
        }

        // ========== PASO 1: Actualizar/crear CommendTarjeta (consejos) ==========
        let commendTarjetaId = null;
        const hasConsejos =
          formCommendBody?.texto1 ||
          formCommendBody?.texto2 ||
          formCommendBody?.texto3 ||
          formCommendBody?.texto4 ||
          formCommendBody?.texto5;

        if (hasConsejos) {
          const consejosPayload = mapConsejos(
            formCommendBody,
            resolvedPlantillaId
          );

          // Garantizar que tenga título
          if (!consejosPayload.titulo || consejosPayload.titulo.trim() === "") {
            consejosPayload.titulo = "Consejos Importantes";
          }

          try {
            // ✅ Si formCommendBody tiene ID, actualizar; si no, crear nuevo
            if (formCommendBody.id) {
              // Actualizar commend_tarjeta existente usando el ID guardado
              await Api.updateCommendTarjeta(
                formCommendBody.id,
                consejosPayload
              );
              commendTarjetaId = formCommendBody.id;
            } else {
              // Crear nuevo commend_tarjeta
              const consejosResult = await Api.createCommendTarjeta(
                consejosPayload
              );
              commendTarjetaId = consejosResult?.id || consejosResult?.data?.id;
            }
          } catch (err) {
            throw new Error(
              `No se pudieron guardar los consejos: ${
                err?.response?.data?.message || err.message
              }`
            );
          }
        }

        // ========== PASO 2: Actualizar Body principal ==========
        const bodyData = {
          ...formEncabezadoBody,
          ...formGaleryBody,
          public_image1: formEncabezadoBody.public_image1?.startsWith("blob:")
            ? DEFAULT_IMAGES.body.image1
            : formEncabezadoBody.public_image1,
          public_image2: formGaleryBody.public_image2?.startsWith("blob:")
            ? DEFAULT_IMAGES.body.image2
            : formGaleryBody.public_image2,
          public_image3: formGaleryBody.public_image3?.startsWith("blob:")
            ? DEFAULT_IMAGES.body.image3
            : formGaleryBody.public_image3,
          plantilla_id: resolvedPlantillaId,
          ...(commendTarjetaId && { id_commend_tarjeta: commendTarjetaId }),
        };

        const result = await Api.updateBody(bodyId, bodyData);

        // ========== PASO 3: Actualizar Tarjetas de información ==========
        if (formInfoBody && Array.isArray(formInfoBody)) {
          try {
            // Filtrar tarjetas válidas (que tengan al menos un campo con contenido)
            const validTarjetas = formInfoBody.filter(
              (t) =>
                t.titulo ||
                t.descripcion ||
                t.keyword ||
                t.link ||
                t.palabra ||
                t.enlace
            );

            const tarjetaErrors = [];
            for (const [index, tarjeta] of validTarjetas.entries()) {
              const tarjetaData = {
                titulo: tarjeta.titulo || "",
                descripcion: tarjeta.descripcion || "",
                keyword: tarjeta.keyword || tarjeta.palabra || "",
                link: tarjeta.link || tarjeta.enlace || "",
                id_blog_body: bodyId,
              };

              try {
                // ✅ Si la tarjeta tiene ID, es una actualización
                if (tarjeta.id) {
                  await Api.updateTarjeta(tarjeta.id, tarjetaData);
                } else {
                  // ❌ Si no tiene ID, es una creación nueva
                  await Api.createTarjeta(tarjetaData);
                }
              } catch (err) {
                tarjetaErrors.push(
                  `Tarjeta ${index + 1}: ${
                    err?.response?.data?.message || err.message
                  }`
                );
              }
            }

            if (tarjetaErrors.length > 0) {
              throw new Error(tarjetaErrors.join(" | "));
            }

            // ========== ELIMINAR TARJETAS QUE YA NO EXISTEN ==========
            // Obtener IDs de tarjetas actuales (las que tienen ID)
            const currentTarjetaIds = validTarjetas
              .filter((t) => t.id)
              .map((t) => t.id);
            // Obtener todas las tarjetas del body desde la DB
            const allTarjetas = await Api.getTarjetas();
            const existingTarjetas = allTarjetas.filter(
              (tarjeta) => tarjeta.id_blog_body === bodyId
            );

            // Eliminar tarjetas que ya no están en el formulario
            for (const dbTarjeta of existingTarjetas) {
              const tarjetaId = dbTarjeta.id || dbTarjeta.id_tarjeta;
              if (!currentTarjetaIds.includes(tarjetaId)) {
                try {
                  await Api.deleteTarjeta(tarjetaId);
                } catch (err) {
                  throw new Error(
                    `No se pudo eliminar la tarjeta ${tarjetaId}: ${
                      err?.response?.data?.message || err.message
                    }`
                  );
                }
              }
            }
          } catch (err) {
            throw new Error(
              `No se pudieron guardar las tarjetas de informacion: ${err.message}`
            );
          }
        }

        return result;
      }
    } catch (err) {
      setError("No se pudo guardar el body");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    formEncabezadoBody,
    formGaleryBody,
    formCommendBody,
    formInfoBody,
    fileBodyHeader,
    fileBodyFile1,
    fileBodyFile2,
    plantillaId,
    resolvedPlantillaId,
    isCreateMode,
    blogRelations.id_blog_body,
  ]);

  const saveFooter = useCallback(async (estado_publicacion) => {
    try {
      setLoading(true);
      setError(null);

      //Enviar correctamente el estado_publicacion al backend
      const footerEnabled =
        estado_publicacion !== undefined
          ? estado_publicacion
          : formEncabezadoFooter?.estado_publicacion ?? false;


      const footerPayload = {
        ...formEncabezadoFooter,
        estado: footerEnabled,
        public_image1: formImagenFooter.public_image1?.startsWith("blob:")
          ? DEFAULT_IMAGES.footer.image1
          : formImagenFooter.public_image1 || DEFAULT_IMAGES.footer.image1,
        public_image2: formImagenFooter.public_image2?.startsWith("blob:")
          ? DEFAULT_IMAGES.footer.image2
          : formImagenFooter.public_image2 || DEFAULT_IMAGES.footer.image2,
        public_image3: formImagenFooter.public_image3?.startsWith("blob:")
          ? DEFAULT_IMAGES.footer.image3
          : formImagenFooter.public_image3 || DEFAULT_IMAGES.footer.image3,
        titulo: footerEnabled
          ? formEncabezadoFooter.titulo || FOOTER_DEFAULTS.titulo
          : FOOTER_DEFAULTS.titulo,
        descripcion: footerEnabled
          ? formEncabezadoFooter.descripcion || FOOTER_DEFAULTS.descripcion
          : FOOTER_DEFAULTS.descripcion,
        keyword: footerEnabled
          ? formEncabezadoFooter.keyword || FOOTER_DEFAULTS.keyword
          : FOOTER_DEFAULTS.keyword,
        link: footerEnabled
          ? formEncabezadoFooter.link || FOOTER_DEFAULTS.link
          : FOOTER_DEFAULTS.link,
      };

      if (isCreateMode) {
        const result = await Api.createFooter(footerPayload);
        return result;
      } else {
        const footerId = blogRelations.id_blog_footer;
        if (!footerId) {
          throw new Error("No se encontró el ID del footer");
        }
        const result = await Api.updateFooter(footerId, footerPayload);
        return result;
      }
    } catch (err) {
      console.error("❌ Error al guardar footer:", err);
      setError("No se pudo guardar el footer");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    formEncabezadoFooter,
    formImagenFooter,
    isCreateMode,
    blogRelations.id_blog_footer,
  ]);


  // Guardar blog completo - USANDO ORCHESTRATOR
  const saveBlog = useCallback(async ({ estado_publicacion }) => {
    try {
      setLoading(true);
      setError(null);

      if (isCreateMode) {
        // ========== MODO CREACIÓN: Usar orchestrator ==========
        const result = await blogOrchestrator.createBlog({
          headerData: {
            formEncabezadoHeader,
            id_blog_head: blogRelations.id_blog_head,
            formImagenHeader,
          },
          bodyData: {
            formEncabezadoBody,
            formGaleryBody,
            formCommendBody,
            id_blog_body: blogRelations.id_blog_body,
            formInfoBody,
          },
          footerData: {
            formEncabezadoFooter,
            id_blog_footer: blogRelations.id_blog_footer,
            formImagenFooter,
          },
          files: {
            fileHeader,
            fileBodyHeader,
            fileBodyFile1,
            fileBodyFile2,
            fileFooterFile1,
            fileFooterFile2,
            fileFooterFile3,
          },
          plantillaId,
          empleadoId: getEmpleadoId(),
          isPublicado: estado_publicacion
        });

        // Actualizar cardId en el hook
        if (result.cardId) {
          setCardId(result.cardId);
        }

        setBlogRelations({
          id_blog_head: result.headerId,
          id_blog_body: result.bodyId,
          id_blog_footer: result.footerId,
        });

        // Limpiar archivos después de éxito
        setFileHeader(null);
        setFileBodyHeader(null);
        setFileBodyFile1(null);
        setFileBodyFile2(null);
        setFileFooterFile1(null);
        setFileFooterFile2(null);
        setFileFooterFile3(null);
        await clearDraft();
        resetSnapshotWhenStableRef.current = true;
        setIsDirty(false);

        return result;
      } else {
        // ========== MODO EDICIÓN: Usar orchestrator ==========

        // Primero actualizar Header, Body, Footer por separado (mantener compatibilidad)
        await Promise.all([saveHeader(), saveBody(), saveFooter(estado_publicacion)]);

        const result = await blogOrchestrator.updateBlog({
          blogId,
          headerData: {
            formEncabezadoHeader,
            formImagenHeader,
          },
          bodyData: {
            formEncabezadoBody,
            formGaleryBody,
            formCommendBody,
            formInfoBody,
          },
          footerData: {
            formEncabezadoFooter,
            formImagenFooter,
          },
          files: {
            fileHeader,
            fileBodyHeader,
            fileBodyFile1,
            fileBodyFile2,
            fileFooterFile1,
            fileFooterFile2,
            fileFooterFile3,
          },
          plantillaId: resolvedPlantillaId,
          empleadoId: getEmpleadoId(),
          cardId,
          blogRelations,
          isPublicado: estado_publicacion
        });

        setFileHeader(null);
        setFileBodyHeader(null);
        setFileBodyFile1(null);
        setFileBodyFile2(null);
        setFileFooterFile1(null);
        setFileFooterFile2(null);
        setFileFooterFile3(null);
        await clearDraft();
        resetSnapshotWhenStableRef.current = true;
        setIsDirty(false);

        return result;
      }
    } catch (err) {
      console.error("❌ Error al guardar blog completo:", err);
      setError(`No se pudo guardar el blog: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    formEncabezadoHeader,
    formImagenHeader,
    formEncabezadoBody,
    formGaleryBody,
    formCommendBody,
    formInfoBody,
    formEncabezadoFooter,
    formImagenFooter,
    fileHeader,
    fileBodyHeader,
    fileBodyFile1,
    fileBodyFile2,
    fileFooterFile1,
    fileFooterFile2,
    fileFooterFile3,
    plantillaId,
    resolvedPlantillaId,
    isCreateMode,
    blogId,
    saveHeader,
    saveBody,
    saveFooter,
    saveCard,
    getEmpleadoId,
    clearDraft,
    blogRelations,
    cardId,
  ]);

  // ========== FUNCIONES DE UTILIDAD ==========
  const resetForm = useCallback(() => {
    cleanupBlobUrls();
    resetAllForms();
    void clearDraft();

    setFileHeader(null);
    setFileBodyHeader(null);
    setFileBodyFile1(null);
    setFileBodyFile2(null);
    setFileFooterFile1(null);
    setFileFooterFile2(null);
    setFileFooterFile3(null);
    resetSnapshotWhenStableRef.current = true;

    setValidacionHeader(false);
    setValidacionBody(false);
    setValidacionFooter(false);

    setIsDirty(false);
    setError(null);

    // Resetear relaciones
    setBlogRelations({
      id_blog_head: null,
      id_blog_body: null,
      id_blog_footer: null,
    });
  }, [clearDraft, cleanupBlobUrls, resetAllForms]);

  // Compare changes against the last loaded or saved form state.
  useEffect(() => {
    if (hydrating) {
      hydrationInProgressRef.current = true;
      return;
    }

    if (loading) return;

    if (
      cleanFormSnapshotRef.current === null ||
      hydrationInProgressRef.current ||
      resetSnapshotWhenStableRef.current
    ) {
      cleanFormSnapshotRef.current = currentFormSnapshot;
      hydrationInProgressRef.current = false;
      resetSnapshotWhenStableRef.current = false;
      setIsDirty(false);
      return;
    }

    if (draftStatus === "checking" || draftStatus === "available") return;

    setIsDirty(currentFormSnapshot !== cleanFormSnapshotRef.current);
  }, [currentFormSnapshot, draftStatus, loading, hydrating]);

  // ========== LIMPIEZA DE MEMORY LEAKS ==========
  // Limpiar URLs blob al desmontar para evitar memory leaks
  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, [cleanupBlobUrls]);

  // ========== RETURN DEL HOOK ==========
  return {
    // ===== CONFIGURACIÓN =====
    plantillaConfig,
    plantillaId,
    resolvedPlantillaId,
    mode,
    isCreateMode,
    isEditMode,

    // ===== ESTADOS PRINCIPALES =====
    loading,
    error,
    isDirty,
    isFormValid,
    draftStatus,
    draftError,
    availableDraft,

    // ===== IDs DE RELACIONES =====
    blogRelations,

    // ===== ESTADOS DE FORMULARIOS (COMPATIBILIDAD TOTAL) =====
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

    // ===== ESTADOS DE ARCHIVOS =====
    fileHeader,
    setFileHeader,
    fileBodyHeader,
    setFileBodyHeader,
    fileBodyFile1,
    setFileBodyFile1,
    fileBodyFile2,
    setFileBodyFile2,
    fileFooterFile1,
    setFileFooterFile1,
    fileFooterFile2,
    setFileFooterFile2,
    fileFooterFile3,
    setFileFooterFile3,

    // ===== ESTADOS DE VALIDACIÓN =====
    validacionHeader,
    setValidacionHeader,
    validacionBody,
    setValidacionBody,
    validacionFooter,
    setValidacionFooter,

    // ===== SERVICIOS (SOLO PARA ENLACES EN TARJETAS) =====
    servicios: DEFAULT_SERVICIOS,

    // ===== ACCIONES =====
    fetchBlogData,
    saveHeader,
    saveBody,
    saveFooter,
    saveCard,
    saveBlog,
    resetForm,
    restoreDraft,
    discardDraft: clearDraft,

    // ===== FUNCIONES HELPER =====
    getEmpleadoId,

    // ===== UTILIDADES =====
    setError: (error) => setError(error),
    clearError: () => setError(null),
    setLoading: (loading) => setLoading(loading),
    cleanupBlobUrls,
  };
}