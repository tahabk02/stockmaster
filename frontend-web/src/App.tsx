import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 1. Layouts
import { DashboardLayout } from "./components/layout/DashboardLayout";

// 2. Pages Public
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";

// 3. Pages Privées
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Sales } from "./pages/Sales";
import { Purchases } from "./pages/Purchases";
import { Suppliers } from "./pages/Suppliers";
import { Clients } from "./pages/Clients";
import { SubscriptionPlans } from "./pages/SubscriptionPlans";
import { MySubscriptions } from "./pages/MySubscriptions";
import { SupplierDetail } from "./pages/SupplierDetail";
import { Reports } from "./pages/Reports";
import { AuditLogs } from "./pages/AuditLogs";
import { Jobs } from "./pages/Jobs";
import { AIIntelligence } from "./pages/AIIntelligence";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Team } from "./pages/Team";
import { StockLedger } from "./pages/StockLedger";
import { Community } from "./pages/Community";
import { StoreProfile } from "./pages/StoreProfile";
import { Messages } from "./pages/Messages";
import { Invoices } from "./pages/Invoices";
import { Reels } from "./pages/Reels";
import { WarehouseMap } from "./pages/WarehouseMap";
import LegalConsultant from "./pages/LegalConsultant";
import { ContractHub } from "./pages/ContractHub";
import { QualityZenith } from "./pages/QualityZenith";
import { FleetLogistics } from "./pages/FleetLogistics";
import { OperationalFlow } from "./pages/OperationalFlow";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { ProductionHub } from "./pages/ProductionHub";
import { HRPulse } from "./pages/HRPulse";
import { MarketingHub } from "./pages/MarketingHub";
import { ReturnsCenter } from "./pages/ReturnsCenter";
import { ExpenseLedger } from "./pages/ExpenseLedger";
import { Integrations } from "./pages/Integrations";
import { OpticalScanner } from "./pages/OpticalScanner";
import { NeuralRestock } from "./pages/NeuralRestock";
import { FinancialIntelligence } from "./pages/FinancialIntelligence";
import { SystemStatus } from "./pages/SystemStatus";

// 4. Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminTenants from "./pages/AdminTenants";

import { Guard } from "./permissions/Guard";
import { PERMISSIONS } from "./permissions/can";
import { CallOverlay } from "./components/layout/CallOverlay";
import { socketService } from "./services/socket.service";
import { useAuth } from "./store/auth.slice";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const RootRedirect = () => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/home" replace />;
};

function App() {
  const { user, token } = useAuth();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (token && user) {
      const userId = (user.id || user._id)?.toString();
      if (userId) socketService.connect(token, userId);
    }
    return () => { if (!localStorage.getItem("token")) socketService.clear(); };
  }, [token, user]);

  // --- GLOBAL LANGUAGE SYNCHRONIZATION EFFECT ---
  useEffect(() => {
    const lng = i18n.language || "en";
    const dir = lng === "ar" ? "rtl" : "ltr";
    
    // 1. Update DOM attributes
    document.documentElement.dir = dir;
    document.documentElement.lang = lng;
    
    // 2. Update Document Title
    document.title = `${t("common:system_name", "StockMaster Pro")} | ${t("nav:dashboard")}`;

    // 3. Persist to LocalStorage
    localStorage.setItem("i18nextLng", lng);
  }, [i18n.language, t]);

  return (
    <>
      <CallOverlay />
      <Suspense fallback={<div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617]"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div><p className="text-indigo-600 font-black text-xs uppercase tracking-widest mt-4 animate-pulse">Initializing Lattice...</p></div>}>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<RootRedirect />} />

          {/* 🔒 PROTECTED CORE */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/stock-ledger" element={<ProtectedRoute><StockLedger /></ProtectedRoute>} />
          <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
          <Route path="/suppliers/:id" element={<ProtectedRoute><SupplierDetail /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/marketing" element={<ProtectedRoute><MarketingHub /></ProtectedRoute>} />
          <Route path="/hr/pulse" element={<ProtectedRoute><HRPulse /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/ai-intelligence" element={<ProtectedRoute><AIIntelligence /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/subscriptions/plans" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />
          <Route path="/my-subscriptions" element={<ProtectedRoute><MySubscriptions /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Guard permission={PERMISSIONS.TEAM_VIEW} showError><Team /></Guard></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/community/store/:tenantId" element={<ProtectedRoute><StoreProfile /></ProtectedRoute>} />
          <Route path="/reels" element={<ProtectedRoute><Reels /></ProtectedRoute>} />
          <Route path="/logistics/fleet" element={<ProtectedRoute><FleetLogistics /></ProtectedRoute>} />
          <Route path="/ops/flow" element={<ProtectedRoute><OperationalFlow /></ProtectedRoute>} />
          <Route path="/docs/archives" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
          <Route path="/production/hub" element={<ProtectedRoute><ProductionHub /></ProtectedRoute>} />
          <Route path="/logistics/returns" element={<ProtectedRoute><ReturnsCenter /></ProtectedRoute>} />
          <Route path="/finance/expenses" element={<ProtectedRoute><ExpenseLedger /></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
          <Route path="/warehouse-map" element={<ProtectedRoute><WarehouseMap /></ProtectedRoute>} />
          <Route path="/legal/contracts" element={<ProtectedRoute><ContractHub /></ProtectedRoute>} />
          <Route path="/legal/consultant" element={<ProtectedRoute><LegalConsultant /></ProtectedRoute>} />
          <Route path="/ops/quality" element={<ProtectedRoute><QualityZenith /></ProtectedRoute>} />
          <Route path="/optical-scanner" element={<ProtectedRoute><OpticalScanner /></ProtectedRoute>} />
          <Route path="/neural-restock" element={<ProtectedRoute><NeuralRestock /></ProtectedRoute>} />
          <Route path="/financial-intelligence" element={<ProtectedRoute><FinancialIntelligence /></ProtectedRoute>} />
          <Route path="/system-status" element={<ProtectedRoute><SystemStatus /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><Guard permission={PERMISSIONS.INVOICES_VIEW} showError><Invoices /></Guard></ProtectedRoute>} />

          {/* 🛡️ ADMIN OVERLORD */}
          <Route path="/admin/console" element={<ProtectedRoute><Guard permission={PERMISSIONS.ADMIN_ACCESS} showError><AdminDashboard /></Guard></ProtectedRoute>} />
          <Route path="/admin/tenants" element={<ProtectedRoute><Guard permission={PERMISSIONS.ADMIN_ACCESS} showError><AdminTenants /></Guard></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
