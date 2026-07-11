import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SNCFT — Suivi des Horaires',
  description: 'Application de suivi des horaires ferroviaires SNCFT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto p-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
