import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  function toast(message, { type = "success", icon, duration = 2500, action } = {}) {
    const id = Date.now();
    const dismiss = () => setToasts(t => t.filter(x => x.id !== id));
    setToasts(t => [...t, { id, message, type, icon, action: action ? { ...action, dismiss } : null }]);
    setTimeout(dismiss, duration);
  }

  return { toasts, toast };
}
