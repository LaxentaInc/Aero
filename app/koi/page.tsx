'use client';

import { SessionProvider } from 'next-auth/react';
import ProtectedRoute from '../components/ProtectedRoute';
import KoiPortfolio from '../components/KoiPortfolio';

export default function KoiPage() {
  return (
    <SessionProvider>
      <ProtectedRoute>
        <KoiPortfolio />
      </ProtectedRoute>
    </SessionProvider>
  );
}