import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import UserPanelPage from './pages/UserPanelPage';
import SignDocumentPage from './pages/SignDocumentPage';
import UploadDocumentPage from './pages/UploadDocumentPage';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/panel" element={<UserPanelPage />} />
        <Route path="/panel/sign/:docCode" element={<SignDocumentPage />} />
        <Route path="/panel/upload/:docCode" element={<UploadDocumentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
