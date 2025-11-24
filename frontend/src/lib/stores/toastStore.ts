import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function addToast(message: string, type: ToastType = 'info', duration = 4000) {
		const id = Math.random().toString(36).substr(2, 9);
		const toast: Toast = { id, message, type, duration };

		update(toasts => [...toasts, toast]);

		// Auto remove after duration
		setTimeout(() => {
			removeToast(id);
		}, duration);

		return id;
	}

	function removeToast(id: string) {
		update(toasts => toasts.filter(t => t.id !== id));
	}

	function success(message: string, duration?: number) {
		return addToast(message, 'success', duration);
	}

	function error(message: string, duration?: number) {
		return addToast(message, 'error', duration);
	}

	function info(message: string, duration?: number) {
		return addToast(message, 'info', duration);
	}

	function warning(message: string, duration?: number) {
		return addToast(message, 'warning', duration);
	}

	return {
		subscribe,
		add: addToast,
		remove: removeToast,
		success,
		error,
		info,
		warning
	};
}

export const toastStore = createToastStore();