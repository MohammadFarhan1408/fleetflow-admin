import { useEffect } from "react";

/** Asks the browser to confirm a reload or tab close while a form has unsaved changes. In-app Cancel uses its own dialog. */
export const useUnsavedChangesWarning = (dirty: boolean) => {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
};
