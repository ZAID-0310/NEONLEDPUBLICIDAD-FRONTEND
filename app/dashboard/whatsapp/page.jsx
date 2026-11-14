'use client';
import RouteGuard from "@/app/dashboard/components/RouteGuard";
import { getCookie } from 'cookies-next';
import { useMemo, useState, useEffect } from 'react';
import { TabButton, Card, CardTitle } from './components/TabButton';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, whatsappApi } from '@/api/fetchApiWhatsApp';
import { useWhatsAppSocket } from '@/api/socket';
import { QrDisplay } from './components/QrDisplay';
import { TestSendTab } from './components/TestSendTab';
import { PlantillasTab } from './components/PlantillasTab';
import { CampaignProgressMonitor } from './components/CampaignProgressMonitor';
import { CampaignQueuePanel } from './components/CampaignQueuePanel';
import { PopupsTab } from './components/PopupsTab'; // ← AGREGAR

import Swal from 'sweetalert2';
import servicesList from './data/servicesList';

export default function WhatsAppPage() {
  const [tab, setTab] = useState('conexion');
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasActiveCampaigns, setHasActiveCampaigns] = useState(false);
  const { isLoading: isAuthLoading } = useAuth();

  // Token cliente (para socket)
  const [clientToken, setClientToken] = useState(null);

  const services = useMemo(() => servicesList, []);

  // Socket WhatsApp
  const {
    isConnected: wsConnected,
    qrData,
    loading: wsLoading,
  } = useWhatsAppSocket(clientToken);

  const connected = Boolean(wsConnected);
  const connectedNumber =
    qrData?.me?.id?.split(':')[0] || qrData?.me?.id?.split('@')[0];

  const statusText = isConnected
    ? `Conectado: ${connectedNumber || 'WhatsApp'}`
    : 'WhatsApp Desconectado';

  const statusHint = isConnected
    ? `Tu cuenta (${connectedNumber}) está vinculada y lista para enviar mensajes.`
    : 'Vincula tu cuenta para poder enviar mensajes.';

  useEffect(() => {
    const token = getCookie('token') || localStorage.getItem('token');
    setClientToken(token);
  }, []);

  useEffect(() => {
    if (wsConnected !== undefined) setIsConnected(wsConnected);
  }, [wsConnected]);

  // 🔒 Verificar si hay campañas activas para deshabilitar botón de reinicio
  useEffect(() => {
    const checkActiveCampaigns = async () => {
      try {
        const res = await apiRequest('/api/whatsapp/campaigns?limit=10');
        const campaigns = res?.data?.data || [];

        // Considerar activa si está en_proceso o ejecutándose
        const hasActive = campaigns.some((c) => c.estado === 'en_proceso');
        setHasActiveCampaigns(hasActive);
      } catch (err) {
        console.error('Error checking active campaigns:', err);
      }
    };

    checkActiveCampaigns();
    // Verificar cada 5 segundos
    const interval = setInterval(checkActiveCampaigns, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRestartSession = async () => {
    try {
      await whatsappApi.restart();
      setIsConnected(false);
      Swal.fire('Reiniciando', 'La sesión se está reiniciando...', 'info');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo reiniciar la sesión.', 'error');
    }
  };

  // Renderizado defensivo para evitar hidratación rara
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => setIsLoaded(true), []);
  if (!isLoaded)
    return (
      <div className="p-10 text-center text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        Iniciando Dashboard...
      </div>
    );

  return (
    <RouteGuard>
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-900">
      {/* ✅ Sistema de notificaciones Toast */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg border animate-slide-in-right
              ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
              ${notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
              ${notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
              ${notification.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
            `}
          >
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/85">
        <div className="w-full px-3 sm:px-4 py-3 sm:py-4">
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Envío de Whatsapp
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Conecta tu cuenta y ejecuta pruebas reales de campaña.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 sm:px-3 py-1 text-xs sm:text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span className="truncate max-w-[200px] sm:max-w-none">{statusText}</span>
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-3 sm:mt-4">
              <div className="flex gap-2 sm:gap-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto overflow-y-hidden scrollbar-none">
                <TabButton
                  active={tab === 'conexion'}
                  onClick={() => setTab('conexion')}
                  label="Conexión"
                />
                <TabButton
                  active={tab === 'prueba'}
                  onClick={() => setTab('prueba')}
                  label="Prueba"
                />
                <TabButton
                  active={tab === 'plantillas'}
                  onClick={() => setTab('plantillas')}
                  label="Plantillas"
                />
                <TabButton
                  active={tab === 'popups'}
                  onClick={() => setTab('popups')}
                  label="Pop-Ups"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mb-12 flex-1 w-full px-2 sm:px-4 py-4 sm:py-8 overflow-y-auto min-w-0">
        <div className="mx-auto w-full max-w-7xl min-w-0">
          {isAuthLoading && (
            <div className="flex flex-col items-center justify-center p-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-azul-principal border-t-transparent" />
              <p className="mt-4 text-slate-500 dark:text-slate-400">
                Cargando sesión...
              </p>
            </div>
          )}

          {/* Monitor de Progreso de Campañas (siempre visible) */}
          {!isAuthLoading && (
            <div className="mb-6 w-full min-w-0">
              <CampaignProgressMonitor />
            </div>
          )}

          {/* Layout con sidebar para pestaña Prueba */}
          {!isAuthLoading && tab === 'prueba' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
              {/* Columna principal (2/3) */}
              <div className="min-w-0 w-full lg:col-span-2">
                <TestSendTab
                  services={services}
                  isConnected={isConnected}
                  connectedNumber={connectedNumber}
                />
              </div>

              {/* Sidebar derecha (1/3) */}
              <div className="min-w-0 w-full lg:col-span-1">
                <CampaignQueuePanel />
              </div>
            </div>
          ) : (
            <>
              {!isAuthLoading && tab === 'conexion' && (
                <section className="space-y-6">
                  <Card>
                    <CardTitle>Estado de Conexión WhatsApp</CardTitle>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800/60">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-3 w-3 rounded-full ${
                              isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {statusText}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {statusHint}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={handleRestartSession}
                            disabled={hasActiveCampaigns}
                            className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all ${
                              hasActiveCampaigns
                                ? 'bg-gray-400 cursor-not-allowed opacity-60 dark:bg-slate-700 dark:text-slate-400'
                                : 'bg-azul-principal hover:bg-azul-cobalto active:opacity-80'
                            }`}
                            title={
                              hasActiveCampaigns
                                ? 'No se puede reiniciar mientras hay campañas ejecutándose'
                                : ''
                            }
                          >
                            {hasActiveCampaigns
                              ? '🔒 Campaña en Proceso'
                              : 'Reiniciar Sesión'}
                          </button>
                          {hasActiveCampaigns && (
                            <p className="text-xs text-amber-600 dark:text-amber-500">
                              ⚠️ Espera a que termine la campaña activa
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <QrDisplay
                          qrData={qrData}
                          isConnected={isConnected}
                          loading={wsLoading}
                        />
                      </div>
                    </div>
                  </Card>
                </section>
              )}

              {!isAuthLoading && tab === 'plantillas' && <PlantillasTab />}
              {/* ← agregamos esto */}
              {!isAuthLoading && tab === 'popups' && <PopupsTab />}
            </>
          )}
        </div>
      </main>
    </div>
    </RouteGuard>
  );
}
