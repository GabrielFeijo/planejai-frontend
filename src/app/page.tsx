'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SquareKanban, Users, Zap, Shield } from 'lucide-react';

export default function HomePage() {
	const { isAuthenticated } = useAuthStore();
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated) {
			router.push('/dashboard');
		}
	}, [isAuthenticated, router]);

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 flex flex-col'>
			<header className='container mx-auto px-6 py-6 flex items-center justify-center'>
				<div className='flex items-center space-x-2'>
					<SquareKanban className='h-8 w-8 text-white' />
					<span className='text-2xl font-bold text-white tracking-tight'>
						PlanejAí
					</span>
				</div>
			</header>

			<main className='flex-1 flex flex-col items-center justify-center px-6 text-center'>
				<h1 className='text-5xl md:text-6xl font-extrabold text-white leading-tight max-w-3xl'>
					Organize qualquer coisa,
					<br />
					<span className='text-yellow-300'>junto com qualquer pessoa</span>
				</h1>

				<p className='mt-6 text-lg md:text-xl text-blue-100 max-w-2xl'>
					Um sistema colaborativo de gestão de tarefas que ajuda você e sua
					equipe a organizar projetos, visualizar progresso e alcançar objetivos
					mais rápido.
				</p>

				<div className='mt-8 flex flex-col sm:flex-row gap-4'>
					<Link href='/auth/register'>
						<Button
							size='lg'
							className='bg-yellow-400 text-blue-900 hover:bg-yellow-300 shadow-lg'
						>
							Começar gratuitamente
						</Button>
					</Link>
					<Link href='/auth/login'>
						<Button
							size='lg'
							variant='outline'
							className='text-blue-900 border-white hover:bg-white/10'
						>
							Fazer login
						</Button>
					</Link>
				</div>
			</main>

			<section className='container mx-auto px-6 py-20'>
				<div className='grid md:grid-cols-3 gap-8'>
					{[
						{
							icon: <Users className='h-8 w-8 text-blue-600' />,
							title: 'Colaboração em Tempo Real',
							desc: 'Trabalhe junto com sua equipe em tempo real, com mudanças instantâneas e sem fricção.',
						},
						{
							icon: <Zap className='h-8 w-8 text-blue-600' />,
							title: 'Interface Intuitiva',
							desc: 'Drag and drop simples, visual limpo e fluxo de trabalho sem complicações.',
						},
						{
							icon: <Shield className='h-8 w-8 text-blue-600' />,
							title: 'Seguro e Confiável',
							desc: 'Seus dados sempre protegidos com criptografia e boas práticas de segurança.',
						},
					].map((feature, i) => (
						<div
							key={i}
							className='bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300'
						>
							<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
								{feature.icon}
							</div>
							<h3 className='text-lg font-semibold text-gray-900'>
								{feature.title}
							</h3>
							<p className='mt-2 text-gray-600'>{feature.desc}</p>
						</div>
					))}
				</div>
			</section>

			<footer className='text-center text-blue-100 py-6 text-sm'>
				© {new Date().getFullYear()} PlanejAí — Todos os direitos reservados.
			</footer>
		</div>
	);
}
