const DATABASE_NAME = "neonled-blog-editor";
const DATABASE_VERSION = 1;
const STORE_NAME = "drafts";

function openDraftDatabase() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(
      new Error("El navegador no permite almacenamiento local de borradores.")
    );
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("No se pudo abrir el almacenamiento local."));
    request.onblocked = () =>
      reject(new Error("El almacenamiento local de borradores está bloqueado."));
  });
}

async function runDraftTransaction(mode, operation) {
  const database = await openDraftDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = operation(transaction.objectStore(STORE_NAME));
      let result;

      request.onsuccess = () => {
        result = request.result;
      };
      request.onerror = () =>
        reject(request.error || new Error("No se pudo acceder al borrador."));
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () =>
        reject(transaction.error || new Error("No se pudo guardar el borrador."));
      transaction.onabort = () =>
        reject(transaction.error || new Error("Se canceló el guardado del borrador."));
    });
  } finally {
    database.close();
  }
}

export function readBlogDraft(key) {
  return runDraftTransaction("readonly", (store) => store.get(key));
}

export function writeBlogDraft(draft) {
  return runDraftTransaction("readwrite", (store) => store.put(draft));
}

export function deleteBlogDraft(key) {
  return runDraftTransaction("readwrite", (store) => store.delete(key));
}
