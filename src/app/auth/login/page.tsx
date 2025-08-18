'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2, SquareKanban } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/services/auth.service';

const loginSchema = z.object({
	email: z.string().email('Email inválido'),
	password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const login = useAuthStore((state) => state.login);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginForm) => {
		try {
			setLoading(true);
			const response = await authApi.login(data);

			login(response.data.access_token, response.data.user);
			toast.success('Login realizado com sucesso!');
			router.push('/dashboard');
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Erro ao fazer login');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='text-center'>
					<SquareKanban className='h-8 w-8 text-blue-600 mx-auto' />
					<CardTitle className='text-2xl font-bold'>PlanejAí</CardTitle>
					<CardDescription>
						Faça login para acessar seus quadros
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className='space-y-4'
					>
						<div>
							<Input
								type='email'
								placeholder='Email'
								{...register('email')}
								className={errors.email ? 'border-red-500' : ''}
							/>
							{errors.email && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<Input
								type='password'
								placeholder='Senha'
								{...register('password')}
								className={errors.password ? 'border-red-500' : ''}
							/>
							{errors.password && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.password.message}
								</p>
							)}
						</div>

						<Button
							type='submit'
							className='w-full'
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Entrando...
								</>
							) : (
								'Entrar'
							)}
						</Button>
					</form>

					<div className='mt-6 text-center'>
						<p className='text-sm text-muted-foreground'>
							Não tem uma conta?{' '}
							<Link
								href='/auth/register'
								className='text-primary hover:underline'
							>
								Cadastre-se
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
