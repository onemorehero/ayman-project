/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { NotificationsModal } from './components/NotificationsModal.js';
import { AuthModal } from './components/AuthModal.js';
import { OnboardingTour } from './components/OnboardingTour.js';
import { PushNotificationPrompt } from './components/PushNotificationPrompt.js';

import { HomeView } from './views/HomeView.js';
import { ProvidersListingView } from './views/ProvidersListingView.js';
import { ProviderProfileView } from './views/ProviderProfileView.js';
import { CustomerDashboardView } from './views/CustomerDashboardView.js';
import { ProviderDashboardView } from './views/ProviderDashboardView.js';
import { AdminDashboardView } from './views/AdminDashboardView.js';
import { TermsView } from './views/TermsView.js';

function ProviderProfileRouteWrapper({ onBookingSuccess }: { onBookingSuccess: (booking: any) => void }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return <Navigate to="/providers" replace />;
  }

  return (
    <ProviderProfileView
      providerId={id}
      onBack={() => navigate('/providers')}
      onBookingSuccess={onBookingSuccess}
    />
  );
}

function ProvidersListingRouteWrapper({ onSelectProvider }: { onSelectProvider: (id: string) => void }) {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || '';
  const initialArea = searchParams.get('area') || '';
  const initialQ = searchParams.get('q') || '';

  return (
    <ProvidersListingView
      initialCategoryId={initialCat}
      initialAreaId={initialArea}
      initialSearchTerm={initialQ}
      onSelectProvider={onSelectProvider}
    />
  );
}

function MainApp() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Compute activeView from current pathname
  const getActiveView = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/provider/')) return 'provider-profile';
    if (path === '/providers') return 'providers';
    if (path === '/customer') return 'customer-dashboard';
    if (path === '/provider-dashboard') return 'provider-dashboard';
    if (path === '/admin') return 'admin-dashboard';
    if (path === '/terms') return 'terms';
    return 'home';
  };

  const activeView = getActiveView();

  const handleNavigate = (view: string, params?: any) => {
    if (params?.providerId) {
      navigate(`/provider/${encodeURIComponent(params.providerId)}`);
    } else if (params?.categoryId || params?.areaId || params?.q) {
      const query = new URLSearchParams();
      if (params.categoryId) query.set('cat', params.categoryId);
      if (params.areaId) query.set('area', params.areaId);
      if (params.q) query.set('q', params.q);
      navigate(`/providers?${query.toString()}`);
    } else {
      switch (view) {
        case 'home':
          navigate('/');
          break;
        case 'providers':
          navigate('/providers');
          break;
        case 'customer-dashboard':
          navigate('/customer');
          break;
        case 'provider-dashboard':
          navigate('/provider-dashboard');
          break;
        case 'admin-dashboard':
          navigate('/admin');
          break;
        case 'terms':
          navigate('/terms');
          break;
        default:
          navigate('/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryId: string) => {
    navigate(`/providers?cat=${encodeURIComponent(categoryId)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProvider = (providerIdOrSlug: string) => {
    navigate(`/provider/${encodeURIComponent(providerIdOrSlug)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (term: string, areaId: string) => {
    const query = new URLSearchParams();
    if (term) query.set('q', term);
    if (areaId) query.set('area', areaId);
    navigate(`/providers?${query.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSuccess = (newBooking: any) => {
    setSuccessBanner(`تم إرسال طلب الخدمة رقم #${newBooking.bookingNumber} بنجاح. سيقوم الفني بمراجعته والتواصل معك.`);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 8000);
    navigate('/customer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white" dir="rtl">
      {/* Header */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenOnboarding={() => {
          // Handled via Context triggerTour
        }}
      />

      {/* Success Banner Alert */}
      {successBanner && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm font-bold py-3 px-4 text-center sticky top-16 sm:top-18 z-30 shadow-md flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>✨</span>
          <span>{successBanner}</span>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="mr-3 text-emerald-100 hover:text-white underline text-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Content with React Router Routes */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomeView
                onSelectCategory={handleSelectCategory}
                onSelectProvider={handleSelectProvider}
                onSearch={handleSearch}
                onNavigate={handleNavigate}
              />
            }
          />

          <Route
            path="/providers"
            element={
              <ProvidersListingRouteWrapper
                onSelectProvider={handleSelectProvider}
              />
            }
          />

          <Route
            path="/provider/:id"
            element={
              <ProviderProfileRouteWrapper
                onBookingSuccess={handleBookingSuccess}
              />
            }
          />

          <Route
            path="/customer"
            element={
              <CustomerDashboardView
                onNavigateToProvider={handleSelectProvider}
              />
            }
          />

          <Route
            path="/provider-dashboard"
            element={<ProviderDashboardView />}
          />

          <Route
            path="/admin"
            element={<AdminDashboardView />}
          />

          <Route
            path="/terms"
            element={<TermsView />}
          />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals & Tours */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={handleNavigate}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Role-based Onboarding Tour: Shows ONLY after first signup / registration */}
      <OnboardingTour />

      {/* Native Web Push Notification Graceful Prompt */}
      <PushNotificationPrompt />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
