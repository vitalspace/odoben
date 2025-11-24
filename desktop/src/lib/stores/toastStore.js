import { writable } from 'svelte/store';

const { subscribe, update } = writable([]);

function addToast(message, type = 'info', duration = 4000) {
  const id = Math.random().toString(36).substr(2, 9);
  const toast = { id, message, type, duration };

  update(toasts => [...toasts, toast]);

  // Auto remove after duration
  setTimeout(() => {
    removeToast(id);
  }, duration);

  return id;
}

function removeToast(id) {
  update(toasts => toasts.filter(t => t.id !== id));
}

export const toastStore = {
  subscribe,
  addToast,
  removeToast,
  success: (message, duration) => addToast(message, 'success', duration),
  error: (message, duration) => addToast(message, 'error', duration),
  info: (message, duration) => addToast(message, 'info', duration),
  warning: (message, duration) => addToast(message, 'warning', duration)
};