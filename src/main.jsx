import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import SignupClient from './pages/SignupClient.jsx';
import SignupProfessional from './pages/SignupProfessional.jsx';
import Verify from './pages/Verify.jsx';
import ClientDashboard from './components/ClientDashboard.jsx'; 
import ProfDashboard from './components/ProfDashboard.jsx'; 
import AdminLogin from './pages/AdminLogin.jsx';   // ✅ added
import AdminDashboard from './components/AdminDashboard.jsx'; // ✅ added
import './global.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup-client" element={<SignupClient />} />
        <Route path="/signup-professional" element={<SignupProfessional />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/professional-dashboard" element={<ProfDashboard />} />

        {/* ✅ Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
