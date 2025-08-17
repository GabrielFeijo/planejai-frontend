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

const registerSchema = z
	.object({
		name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
		username: z
			.string()
			.min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
		email: z.string().email('Email inválido'),
		password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
		confirmPassword: z
			.string()
			.min(6, 'Confirmação de senha deve ter pelo menos 6 caracteres'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Senhas não coincidem',
		path: ['confirmPassword'],
	});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const login = useAuthStore((state) => state.login);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterForm>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterForm) => {
		try {
			setLoading(true);
			const { confirmPassword, ...registerData } = data;
			const response = await authApi.register(registerData);

			login(response.data.access_token, response.data.user);
			toast.success('Conta criada com sucesso!');
			router.push('/dashboard');
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Erro ao criar conta');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='text-center'>
					<SquareKanban className='h-8 w-8 text-blue-600 mx-auto' />
					<CardTitle className='text-2xl font-bold'>Criar Conta</CardTitle>
					<CardDescription>
						Cadastre-se para começar a usar o PlanejAí
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className='space-y-4'
					>
						<div>
							<Input
								type='text'
								placeholder='Nome completo'
								{...register('name')}
								className={errors.name ? 'border-red-500' : ''}
							/>
							{errors.name && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.name.message}
								</p>
							)}
						</div>

						<div>
							<Input
								type='text'
								placeholder='Nome de usuário'
								{...register('username')}
								className={errors.username ? 'border-red-500' : ''}
							/>
							{errors.username && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.username.message}
								</p>
							)}
						</div>

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

						<div>
							<Input
								type='password'
								placeholder='Confirmar senha'
								{...register('confirmPassword')}
								className={errors.confirmPassword ? 'border-red-500' : ''}
							/>
							{errors.confirmPassword && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.confirmPassword.message}
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
									Criando conta...
								</>
							) : (
								'Criar conta'
							)}
						</Button>
					</form>

					<div className='mt-6 text-center'>
						<p className='text-sm text-muted-foreground'>
							Já tem uma conta?{' '}
							<Link
								href='/auth/login'
								className='text-primary hover:underline'
							>
								Faça login
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
