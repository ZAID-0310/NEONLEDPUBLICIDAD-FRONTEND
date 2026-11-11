"use client";

import { createContext, useContext } from "react";

const EditionActionsContext = createContext({
  actions: {
    onSave: null,
    disabled: true,
    loading: false,
    label: "",
    isDirty: false,
    formLoading: false,
    plantillaId: null,
    clearDraft: null,
  },

  registerActions: () => {},
  requestNavigation: () => {},
});

export function EditionActionsProvider({ value, children }) {
  return (
    <EditionActionsContext.Provider value={value}>
      {children}
    </EditionActionsContext.Provider>
  );
}

export function useEditionActions() {
  return useContext(EditionActionsContext);
}

export default EditionActionsContext;
