import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  function toast(message, { type = "success", icon, duration = 2500 } = {}) {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type, icon }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }

  return { toasts, toast };
}
