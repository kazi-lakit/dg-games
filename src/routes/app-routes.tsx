import { Routes, Route, Navigate } from 'react-router-dom';
import { NotFoundPage, ServiceUnavailablePage } from '@/modules/error-view';
import { ProfilePage } from '@/modules/profile';
import { UsersTablePage } from '@/modules/iam';
import { MainLayout } from '@/layout/main-layout/main-layout';
import { AuthRoutes } from './auth.route';
import { Guard } from '@/state/store/auth/guard';
import { ClientMiddleware } from '@/state/client-middleware';
import { ThemeProvider } from '@/styles/theme/theme-provider';
import { SidebarProvider } from '@/components/ui-kit/sidebar';
import { Toaster } from '@/components/ui-kit/toaster';
import { useLanguageContext } from '@/i18n/language-context';
import { LoadingOverlay } from '@/components/core';

export const AppRoutes = () => {
  const { isLoading } = useLanguageContext();

  if (isLoading) {
    return <LoadingOverlay />;
  }
  return (
    <div className="min-h-screen bg-background font-sans antialiased relative">
      <ClientMiddleware>
        <ThemeProvider>
          <SidebarProvider>
            <Routes>
              {AuthRoutes}
              <Route
                element={
                  <Guard>
                    <MainLayout />
                  </Guard>
                }
              >
                <Route path="/identity-management" element={<UsersTablePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/503" element={<ServiceUnavailablePage />} />
                <Route path="/404" element={<NotFoundPage />} />
              </Route>

              <Route path="/" element={<Navigate to="/identity-management" />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </SidebarProvider>
        </ThemeProvider>
      </ClientMiddleware>
      <Toaster />
    </div>
  );
};
