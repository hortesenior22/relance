import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import StudentProfile from './pages/StudentProfile'
import CompanyProfile from './pages/profiles/CompanyProfile'
import CenterProfile from './pages/profiles/CenterProfile'
import TutorProfile from './pages/profiles/TutorProfile'
import RegisterPage from './pages/register/RegisterPage'
import TutorRegisterPage from './pages/register/TutorRegisterPage'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/registro-tutor" element={<TutorRegisterPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Perfiles por rol */}
          <Route path="/perfil" element={<StudentProfile />} />
          <Route path="/perfil/empresa" element={<CompanyProfile />} />
          <Route path="/perfil/centro" element={<CenterProfile />} />
          <Route path="/perfil/tutor" element={<TutorProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
