'use client';

import ProtectedRoute from '../components/ProtectedRoute';
import KoiPortfolio from '../components/KoiPortfolio';

export default function KoiPage() {
  return (
    <ProtectedRoute>
      <KoiPortfolio />
    </ProtectedRoute>
  );
}
// ```

// **The issue:** You had duplicate providers causing context conflicts. Now the flow is clean:
// ```
// Layout → Providers (SessionProvider + ThemeProvider + DiscordProvider) → Everything else