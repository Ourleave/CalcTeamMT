export function showToast(message, duration = 2800) {
  const root = document.getElementById("toast-root");

  if (!root) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  root.append(toast);

  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";

    window.setTimeout(() => toast.remove(), 180);
  }, duration);
}


