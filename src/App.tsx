/* @ts-nocheck */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NewAuthProvider, useNewAuth } from '@/contexts/NewAuthContext'
import { AvatarProvider } from '@/contexts/AvatarContext'
import { UserProvider } from '@/contexts/UserContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { TabNavigationProvider } from '@/contexts/TabNavigationContext'
import { NotificationSoundProvider } from '@/contexts/NotificationSoundContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import TestEmail from '@/pages/TestEmail'

import WriterLayout from '@/components/Layout/WriterLayout'
import AdminLayout from '@/components/Layout/AdminLayout'
import ClientLayout from '@/components/Layout/ClientLayout'

import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import NewLoginForm from '@/components/Auth/NewLoginForm'
import WhatsAppButton from '@/components/WhatsAppButton'

import LandingPage from '@/pages/LandingPage'
import Unauthorized from '@/pages/Unauthorized'
import NotFound from '@/pages/NotFound'
import PendingApproval from '@/pages/PendingApproval'
import Rejected from '@/pages/Rejected'
import ManualRedator from '@/pages/ManualRedator'
import Termos from '@/pages/Termos'
import Privacidade from '@/pages/Privacidade'
import Funcionalidades from '@/pages/Funcionalidades'
import Precos from '@/pages/Precos'
import CalculadoraPreview from '@/pages/CalculadoraPreview'
import CentralAjuda from '@/pages/CentralAjuda'
import GuiaIniciante from '@/pages/GuiaIniciante'
import Seguranca from '@/pages/Seguranca'
import Status from '@/pages/Status'
import Contato from '@/pages/Contato'

/* ==== Artigos ==== */
import ComoSolicitarPrimeiraPeticao from '@/pages/artigos/ComoSolicitarPrimeiraPeticao'
import PrazoEntregaPeticoes from '@/pages/artigos/PrazoEntregaPeticoes'
import ComoUsarCalculadoraTrabalhista from '@/pages/artigos/ComoUsarCalculadoraTrabalhista'
import SistemaCorrecoesRevisoes from '@/pages/artigos/SistemaCorrecoesRevisoes'
import ComunicarComRedator from '@/pages/artigos/ComunicarComRedator'

/* ==== Client ==== */
import ClientDashboard from '@/pages/client/ClientDashboard'
import NewPetition from '@/pages/client/NewPetition'
import Plans from '@/pages/client/Plans'
import Checkout from '@/pages/client/Checkout'
import MyPetitions from '@/pages/client/MyPetitions'
import Chat from '@/pages/client/Chat'
import Settings from '@/pages/client/Settings'
import ClientNotifications from '@/pages/client/Notifications'

/* ==== Writer ==== */
import WriterDashboard from '@/pages/writer/WriterDashboard'
import AvailablePetitions from '@/pages/writer/AvailablePetitions'
import MyPetitionsWriter from '@/pages/writer/MyPetitions'
import PaymentsWriter from '@/pages/writer/Payments'
import WriterHistory from '@/pages/writer/History'
import WriterChatPage from '@/pages/writer/WriterChatPage'
import WriterSettings from '@/pages/writer/WriterSettings'
import WriterNotifications from '@/pages/writer/Notifications'
import LaborCalculator from '@/pages/calculator/LaborCalculator'
import SavedCalculations from '@/pages/calculator/SavedCalculations'

/* ==== Admin ==== */
import AdminDashboard from '@/pages/admin/AdminDashboard'
import Users from '@/pages/admin/Users'
import AdminPetitions from '@/pages/admin/AdminPetitions'
import AdminPayments from '@/pages/admin/AdminPayments'
import Reports from '@/pages/admin/Reports'
import AdminPlans from '@/pages/admin/Plans'
import AdminSettings from '@/pages/admin/AdminSettings'
import AdminNotifications from '@/pages/admin/Notifications'
import Revisoes from '@/pages/admin/Revisoes'
import ChatSuport from '@/pages/admin/ChatSuport'
import ChatReports from '@/pages/admin/ChatReports'
import WriterApproval from '@/pages/admin/WriterApproval'

/* ==== Users ==== */
import UsersPage from '@/pages/users/UsersPage'
import UserInvitePage from '@/pages/users/UserInvitePage'
import ActivityPage from '@/pages/users/ActivityPage'
import UserProfilePage from '@/pages/users/UserProfilePage'

const queryClient = new QueryClient()

// Componente interno que usa o contexto
function AppRoutesContent() {
  const { user, loading } = useNewAuth()

  // Mostrar loading apenas se ainda estiver carregando
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Wrapper com todos os providers que dependem do NewAuthContext
  const AppWithProviders = () => (
    <AvatarProvider>
      <UserProvider>
        <NotificationSoundProvider>
          <ChatProvider>
            <NotificationProvider>
              <TabNavigationProvider>
                <RoutesContent />
              </TabNavigationProvider>
            </NotificationProvider>
          </ChatProvider>
        </NotificationSoundProvider>
      </UserProvider>
    </AvatarProvider>
  )

  // Conteúdo das rotas
  function RoutesContent() {
    // Se usuário está logado, redirecionar para dashboard
    if (user) {
      // Para redatores, não redirecionar automaticamente - deixar o ProtectedRoute decidir
      const redirectPath = user.role === 'client' ? '/client' : 
                          user.role === 'admin' ? '/admin' : '/writer'
      
      return (
        <Routes>
          <Route path="/" element={<Navigate to={redirectPath} replace />} />
          <Route path="/auth/login" element={<Navigate to={redirectPath} replace />} />
          <Route path="/auth/register" element={<Navigate to={redirectPath} replace />} />
          <Route path="/auth/forgot-password" element={<Navigate to={redirectPath} replace />} />
          <Route path="/auth/reset-password" element={<Navigate to={redirectPath} replace />} />
          
          {/* Rotas privadas */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientLayout>
                  <Outlet />
                </ClientLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="petitions/new" element={<NewPetition />} />
            <Route path="plans" element={<Plans />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="petitions" element={<MyPetitions />} />
            <Route path="chat" element={<Chat />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<ClientNotifications />} />
          </Route>

          <Route
            path="/writer"
            element={
              <ProtectedRoute allowedRoles={['writer']}>
                <WriterLayout>
                  <Outlet />
                </WriterLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<WriterDashboard />} />
            <Route path="available" element={<AvailablePetitions />} />
            <Route path="my-petitions" element={<MyPetitionsWriter />} />
            <Route path="payments" element={<PaymentsWriter />} />
            <Route path="history" element={<WriterHistory />} />
            <Route path="chat" element={<WriterChatPage />} />
            <Route path="settings" element={<WriterSettings />} />
            <Route path="notifications" element={<WriterNotifications />} />
            <Route path="calculator" element={<LaborCalculator />} />
            <Route path="calculator/saved" element={<SavedCalculations />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <Outlet />
                </AdminLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="peticoes" element={<AdminPetitions />} />
            <Route path="pagamentos" element={<AdminPayments />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="revisoes" element={<Revisoes />} />
            <Route path="chat-suporte" element={<ChatSuport />} />
            <Route path="chat-reports" element={<ChatReports />} />
            <Route path="writer-approval" element={<WriterApproval />} />
            <Route path="user-management" element={<UsersPage />} />
            <Route path="invite-user" element={<UserInvitePage />} />
            <Route path="activity-logs" element={<ActivityPage />} />
            <Route path="user-profile/:id" element={<UserProfilePage />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/rejected" element={<Rejected />} />
          <Route path="/test-email" element={<TestEmail />} />
          {/* Páginas públicas - acessíveis mesmo logado */}
          <Route path="/manual-redator" element={<ManualRedator />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/funcionalidades" element={<Funcionalidades />} />
          <Route path="/precos" element={<Precos />} />
          <Route path="/calculadora" element={<CalculadoraPreview />} />
          <Route path="/central-ajuda" element={<CentralAjuda />} />
          <Route path="/guia-iniciante" element={<GuiaIniciante />} />
          <Route path="/seguranca" element={<Seguranca />} />
          <Route path="/status" element={<Status />} />
          <Route path="/contato" element={<Contato />} />
          {/* Artigos */}
          <Route path="/artigos/como-solicitar-primeira-peticao" element={<ComoSolicitarPrimeiraPeticao />} />
          <Route path="/artigos/prazo-entrega-peticoes" element={<PrazoEntregaPeticoes />} />
          <Route path="/artigos/como-usar-calculadora-trabalhista" element={<ComoUsarCalculadoraTrabalhista />} />
          <Route path="/artigos/sistema-correcoes-revisoes" element={<SistemaCorrecoesRevisoes />} />
          <Route path="/artigos/comunicar-com-redator" element={<ComunicarComRedator />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )
    }

    // Usuário não logado - mostrar rotas públicas
    return (
      <>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<NewLoginForm />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/test-email" element={<TestEmail />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/rejected" element={<Rejected />} />
          {/* Páginas públicas - acessíveis sem login */}
          <Route path="/manual-redator" element={<ManualRedator />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/funcionalidades" element={<Funcionalidades />} />
          <Route path="/precos" element={<Precos />} />
          <Route path="/calculadora" element={<CalculadoraPreview />} />
          <Route path="/central-ajuda" element={<CentralAjuda />} />
          <Route path="/guia-iniciante" element={<GuiaIniciante />} />
          <Route path="/seguranca" element={<Seguranca />} />
          <Route path="/status" element={<Status />} />
          <Route path="/contato" element={<Contato />} />
          {/* Artigos */}
          <Route path="/artigos/como-solicitar-primeira-peticao" element={<ComoSolicitarPrimeiraPeticao />} />
          <Route path="/artigos/prazo-entrega-peticoes" element={<PrazoEntregaPeticoes />} />
          <Route path="/artigos/como-usar-calculadora-trabalhista" element={<ComoUsarCalculadoraTrabalhista />} />
          <Route path="/artigos/sistema-correcoes-revisoes" element={<SistemaCorrecoesRevisoes />} />
          <Route path="/artigos/comunicar-com-redator" element={<ComunicarComRedator />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
        <WhatsAppButton />
      </>
    )
  }

  // Retornar o wrapper com providers
  return <AppWithProviders />
}

// Componente que fornece o contexto
function AppRoutes() {
  return (
    <NewAuthProvider>
      <AppRoutesContent />
    </NewAuthProvider>
  )
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            <Router>
              <AppRoutes />
            </Router>
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App