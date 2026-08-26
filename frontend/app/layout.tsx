import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClipScout — Conversational Video RAG',
  description: 'Multimodal Video Intelligence. Semantic chunking, AI conversation, and grounded video moment search.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased min-h-screen selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
