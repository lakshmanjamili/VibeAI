import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VibeAI - AI-Generated Creative Content Hub',
  description:
    'Share and discover AI-generated GIFs, videos, storybooks, and photos. Join a creative community where imagination meets AI technology.',
  keywords: 'AI, content creation, GIF, video, storybook, photo, AI art, community, creative',
  openGraph: {
    title: 'VibeAI - AI-Generated Creative Content Hub',
    description: 'Share and discover amazing AI-generated content',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/gallery"
      afterSignUpUrl="/gallery"
    >
      <html lang="en" className="dark">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}