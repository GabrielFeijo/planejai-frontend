import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { AuthUser } from '@/types';
import { authApi } from '@/services/auth.service';

interface AuthState {
	user: AuthUser | null;
	token: string | null;
	isAuthenticated: boolean;
	login: (token: string, user: AuthUser) => void;
	logout: () => void;
	updateUser: (user: Partial<AuthUser>) => void;
	checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			token: null,
			get isAuthenticated() {
				const cookieToken = Cookies.get('auth-token');
				return !!cookieToken;
			},

			login: (token, user) => {
				try {
					Cookies.set('auth-token', token, {
						expires: 7,
						sameSite: 'lax',
						secure: process.env.NODE_ENV === 'production',
						httpOnly: false,
					});
					set({
						token,
						user,
						isAuthenticated: true,
					});
				} catch (error) {
					set({
						isAuthenticated: false,
					});
				}
			},

			logout: () => {
				try {
					Cookies.remove('auth-token');
					set({
						token: null,
						user: null,
						isAuthenticated: false,
					});
				} catch (error) {
					console.error('Erro ao fazer logout:', error);
				}
			},

			updateUser: (userData) => {
				const { user } = get();
				if (user) {
					set({ user: { ...user, ...userData } });
				}
			},

			checkAuth: async () => {
				const cookieToken = Cookies.get('auth-token');

				try {
					if (cookieToken) {
						const response = await authApi.me();
						const user = response.data;

						set({
							token: cookieToken,
							user,
							isAuthenticated: true,
						});
					}
				} catch (error) {
					Cookies.remove('auth-token');
					set({
						token: null,
						user: null,
						isAuthenticated: false,
					});
				}
			},
		}),
		{
			name: 'auth-storage',
			partialize: (state) => ({
				user: state.user,
				token: state.token,
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.checkAuth();
				}
			},
		}
	)
);
