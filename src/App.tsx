/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { NotificationsModal } from './components/NotificationsModal.js';
import { AuthModal } from './components/AuthModal.js';

import { HomeView } from './views/HomeView.js';
import { ProvidersListingView } from './views/ProvidersListingView.js';
import { ProviderProfileView } from './views/ProviderProfileView.js';
import { CustomerDashboardView } from './views/CustomerDashboardView.js';
import { ProviderDashboardView } from './views/ProviderDashboardView.js';
import { AdminDashboardView } from './views/AdminDashboardView.js';

function MainApp() {
  const { user } = useAuth();

  // Navigation State
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleNavigate = (view: string, params?: any) => {
    setActiveView(view);
    if (params) {
      if (params.providerId) setSelectedProviderId(params.providerId);
      if (params.categoryId) setSelectedCategoryId(params.categoryId);
      if (params.areaId) setSelectedAreaId(params.areaId);
      if (params.q) setSearchTerm(params.q);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedAreaId('');
    setSearchTerm('');
    setActiveView('providers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProvider = (providerId: string) => {
    setSelectedProviderId(providerId);
    setActiveView('provider-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (term: string, areaId: string) => {
    setSearchTerm(term);
    setSelectedAreaId(areaId);
    setSelectedCategoryId('');
    setActiveView('providers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSuccess = (newBooking: any) => {
    setSuccessBanner(`تم إرسال طلب الحجز بنجاح برقم (${newBooking.bookingNumber}) وسيصلك إشعار فور مراجعة الفني.`);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 8000);
    setActiveView('customer-dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950" dir="rtl">
      {/* Header */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Success Banner Alert */}
      {successBanner && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm font-bold py-2.5 px-4 text-center sticky top-28 z-30 shadow-md flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>✅</span>
          <span>{successBanner}</span>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="mr-3 text-white/80 hover:text-white underline text-xs"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'home' && (
          <HomeView
            onSelectCategory={handleSelectCategory}
            onSelectProvider={handleSelectProvider}
            onSearch={handleSearch}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'providers' && (
          <ProvidersListingView
            initialCategoryId={selectedCategoryId}
            initialAreaId={selectedAreaId}
            initialSearchTerm={searchTerm}
            onSelectProvider={handleSelectProvider}
          />
        )}

        {activeView === 'provider-profile' && selectedProviderId && (
          <ProviderProfileView
            providerId={selectedProviderId}
            onBack={() => setActiveView('providers')}
            onBookingSuccess={handleBookingSuccess}
          />
        )}

        {activeView === 'customer-dashboard' && (
          <CustomerDashboardView
            onNavigateToProvider={handleSelectProvider}
          />
        )}

        {activeView === 'provider-dashboard' && (
          <ProviderDashboardView />
        )}

        {activeView === 'admin-dashboard' && (
          <AdminDashboardView />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={handleNavigate}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
