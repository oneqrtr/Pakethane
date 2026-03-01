import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import KuryeOlPage from './pages/KuryeOlPage';
import KuryeHizmetiAlPage from './pages/KuryeHizmetiAlPage';
import AdminPage from './pages/AdminPage';
import UserPanelPage from './pages/UserPanelPage';
import SignDocumentPage from './pages/SignDocumentPage';
import UploadDocumentPage from './pages/UploadDocumentPage';
import { Toaster } from '@/components/ui/sonner';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { CookieConsent } from '@/components/CookieConsent';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/basvuru/kurye-ol" element={<KuryeOlPage />} />
        <Route path="/basvuru/kurye-hizmeti-al" element={<KuryeHizmetiAlPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/panel" element={<UserPanelPage />} />
        <Route path="/panel/sign/:docCode" element={<SignDocumentPage />} />
        <Route path="/panel/upload/:docCode" element={<UploadDocumentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
      <WhatsAppButton />
      <CookieConsent />
    </HashRouter>
  );
}

export default App;
