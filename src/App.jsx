import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import StudentProfile from "./pages/StudentProfile";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import LoginModal from "./components/auth/LoginModal";
import RegisterModal from "./components/auth/RegisterModal"; // 👈 AÑADIR
import ResetPasswordModal from "./pages/ResetPassword";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ResetPasswordModal />
        <LoginModal />
        {/* <RegisterModal /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
