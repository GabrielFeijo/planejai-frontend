import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'PlanejAí - Gestão de Tarefas Colaborativo',
	description: 'Sistema de gestão de tarefas colaborativo',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='pt-BR'>
			<body className={inter.className}>
				<Providers>
					{children}
					<Toaster
						richColors
						position='bottom-right'
					/>
				</Providers>
			</body>
		</html>
	);
}
