// src/lib/services/walletService.ts
import { Transaction } from '@mysten/sui/transactions';
import { getWallets } from '@mysten/wallet-standard';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { writable, get } from 'svelte/store';
import type { WalletAccount, Wallet } from '@wallet-standard/base';
import { browser } from '$app/environment';
import { apiServices } from './apiServices';

interface WalletState {
	isConnected: boolean;
	address: string;
	wallet: Wallet | null;
	account: WalletAccount | null;
	balance: string | null;
}

const client = new SuiClient({
	url: getFullnodeUrl('testnet')
});

export const walletStore = writable<WalletState>({
	isConnected: false,
	address: '',
	wallet: null,
	account: null,
	balance: null
});

class WalletService {
	private unsubscribe: (() => void) | null = null;
	private wallet: Wallet | null = null;
	private account: WalletAccount | null = null;

	constructor() {
		if (browser) {
			this.initializeWallet();
		}
	}

	private updateWalletStore(updated: Partial<WalletState>) {
		walletStore.update((state) => ({ ...state, ...updated }));
	}

	private async initializeWallet() {
		await new Promise((resolve) => setTimeout(resolve, 100));

		const wallets = getWallets();

		wallets.on('register', () => {
			// console.log('Nueva wallet registrada');
			this.checkConnection();
		});

		await this.checkConnection();
	}

	getSlushWallet = (): Wallet | null => {
		const wallets = getWallets().get();
		const slushWallet = wallets.find(
			(w) =>
				w.name === 'Slush' ||
				w.name === 'Slush — A Sui wallet' ||
				w.name.toLowerCase().includes('slush')
		);
		return slushWallet || null;
	};

	private subscribeToWalletEvents(wallet: Wallet) {
		if (this.unsubscribe) {
			this.unsubscribe();
		}

		const eventsFeature = wallet.features['standard:events'];
		if (!eventsFeature) return;

		this.unsubscribe = eventsFeature.on('change', (event) => {
			// console.log('Wallet event change:', event);

			if (event.accounts && event.accounts.length > 0) {
				this.account = event.accounts[0];
				this.updateWalletStore({
					isConnected: true,
					address: this.account.address,
					account: this.account
				});
			} else {
				this.clearWalletState();
			}
		});
	}

	private clearWalletState() {
		this.wallet = null;
		this.account = null;
		this.updateWalletStore({
			isConnected: false,
			address: '',
			wallet: null,
			account: null,
			balance: null
		});
	}

	async connectWallet() {
		try {
			const wallet = this.getSlushWallet();

			if (!wallet) {
				console.error('Slush wallet no encontrada');
				return false;
			}

			const connectFeature = wallet.features['standard:connect'] as {
				connect: (options?: {
					silent?: boolean;
				}) => Promise<{ accounts: readonly WalletAccount[] }>;
			};

			if (!connectFeature) {
				console.error('Connect feature no disponible');
				return false;
			}

			const result = await connectFeature.connect();

			// console.log('Connection result:', result);

			if (result && result.accounts && result.accounts.length > 0) {
				this.wallet = wallet;
				this.account = result.accounts[0];

				this.subscribeToWalletEvents(wallet);

				this.updateWalletStore({
					isConnected: true,
					address: this.account.address,
					wallet: wallet,
					account: this.account
				});

				if (browser) {
					localStorage.setItem('slush_wallet_connected', 'true');
				}

				// Ensure user exists in DB
				try {
					console.log('🔑 Calling loginWithWallet on connect...');
					const loginResult = await apiServices.loginWithWallet(this.account.address);
					console.log('✅ Login successful, token should be stored');
					console.log(
						'📦 Token in localStorage:',
						localStorage.getItem('auth_token') ? 'YES' : 'NO'
					);
				} catch (e) {
					console.error('❌ Failed to create/login user on connect:', e);
				}

				return true;
			}

			return false;
		} catch (error) {
			console.error('Error connecting wallet:', error);
			return false;
		}
	}

	async disconnectWallet() {
		try {
			const wallet = this.getSlushWallet();

			if (!wallet) {
				this.clearWalletState();
				return;
			}

			const disconnectFeature = wallet.features['standard:disconnect'] as {
				disconnect: () => Promise<void>;
			};

			if (disconnectFeature) {
				await disconnectFeature.disconnect();
			}

			if (this.unsubscribe) {
				this.unsubscribe();
				this.unsubscribe = null;
			}

			this.clearWalletState();

			if (browser) {
				localStorage.removeItem('slush_wallet_connected');
			}

			console.log('Wallet desconectada');
		} catch (error) {
			console.error('Error disconnecting wallet:', error);
		}
	}

	async checkConnection() {
		if (!browser) return;

		try {
			const wallet = this.getSlushWallet();

			if (!wallet) {
				// console.log('Slush wallet no encontrada');
				return;
			}

			// console.log('Checking wallet:', wallet.name);
			// console.log('Wallet accounts:', wallet.accounts);

			if (wallet.accounts && wallet.accounts.length > 0) {
				this.wallet = wallet;
				this.account = wallet.accounts[0];

				this.subscribeToWalletEvents(wallet);

				this.updateWalletStore({
					isConnected: true,
					address: this.account.address,
					wallet: wallet,
					account: this.account
				});

				// console.log('Conexión restaurada:', this.account.address);

				// Ensure user exists in DB (Silent check)
				apiServices
					.loginWithWallet(this.account.address)
					.catch((e) => console.error('Silent login failed:', e));

				return;
			}

			let wasConnected = false;
			if (browser && typeof window !== 'undefined') {
				wasConnected = localStorage.getItem('slush_wallet_connected') === 'true';
			}

			if (wasConnected) {
				// console.log('Intentando reconexión silenciosa...');

				const connectFeature = wallet.features['standard:connect'] as {
					connect: (options?: {
						silent?: boolean;
					}) => Promise<{ accounts: readonly WalletAccount[] }>;
				};

				if (connectFeature) {
					try {
						const result = await connectFeature.connect({ silent: true });

						if (result && result.accounts && result.accounts.length > 0) {
							this.wallet = wallet;
							this.account = result.accounts[0];

							this.subscribeToWalletEvents(wallet);

							this.updateWalletStore({
								isConnected: true,
								address: this.account.address,
								wallet: wallet,
								account: this.account
							});

							// console.log('Reconexión exitosa:', this.account.address);

							// Ensure user exists in DB (Silent check)
							apiServices
								.loginWithWallet(this.account.address)
								.catch((e) => console.error('Silent login failed:', e));
						}
					} catch (error) {
						// console.log('Reconexión silenciosa falló');
						if (browser) {
							localStorage.removeItem('slush_wallet_connected');
						}
					}
				}
			}
		} catch (error) {
			console.error('Error checking connection:', error);
		}
	}

	async getBalance(): Promise<string | null> {
		if (!this.account) return null;

		try {
			const balance = await client.getBalance({
				owner: this.account.address
			});

			const suiBalance = (Number(balance.totalBalance) / 1_000_000_000).toFixed(4);

			this.updateWalletStore({ balance: suiBalance });

			return suiBalance;
		} catch (error) {
			console.error('Error obteniendo balance:', error);
			return null;
		}
	}

	async signAndExecuteTransaction(
		transaction: Transaction,
		options?: {
			showEffects?: boolean;
			showObjectChanges?: boolean;
			showEvents?: boolean;
		}
	) {
		if (!this.wallet || !this.account) {
			console.error('No hay wallet conectada');
			return null;
		}

		try {
			const feature = this.wallet.features['sui:signAndExecuteTransaction'];

			if (!feature) {
				console.error('signAndExecuteTransaction no soportado');
				return null;
			}

			const result = await feature.signAndExecuteTransaction({
				transaction,
				account: this.account,
				chain: 'sui:testnet',
				options: {
					showEffects: options?.showEffects ?? true,
					showObjectChanges: options?.showObjectChanges ?? true,
					showEvents: options?.showEvents ?? true
				}
			});

			// console.log('Transacción ejecutada:', result);

			await this.getBalance();

			return result;
		} catch (error) {
			console.error('Error ejecutando transacción:', error);
			return null;
		}
	}

	getState(): WalletState {
		return get(walletStore);
	}
}

export const walletService = new WalletService();
export default walletService;
