import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Customer & Finance Manager',
  description: 'Comprehensive customer and finance management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-950 antialiased`}>
        <div className="flex h-full">
          <Sidebar />
          <div className="flex-1 flex flex-col md:ml-64">
            <Navbar />
            <main className="flex-1 overflow-auto">
              <div className="h-full w-full p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}