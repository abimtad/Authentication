import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";
import SignUpPage from "./pages/SignUpPage";
import LogInPage from "./pages/LogInPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import Dashboard from "./pages/Dashboard";
import FullPageSpinner from "./components/FullPageSpinner";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/log-in" replace />;
  } else if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { checkAuth, user, isCheckingAuth } = useAuthStore();
  console.log("user:", user);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <FullPageSpinner />;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900  relative overflow-hidden">
      <FloatingShape
        size={"w-64 h-64"}
        color={"bg-green-500"}
        top={"-top-[5%]"}
        left={"left-[10%]"}
        delay={0}
      />
      <FloatingShape
        size={"w-48 h-48"}
        color={"bg-emerald-500"}
        top={"top-[70%]"}
        left={"left-[80%]"}
        delay={0}
      />
      <FloatingShape
        size={"w-64 h-64"}
        color={"bg-green-500"}
        top={"top-[40%]"}
        left={"-left-[10%]"}
        delay={0}
      />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/sign-up"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        ></Route>
        <Route
          path="/log-in"
          element={
            <RedirectAuthenticatedUser>
              <LogInPage />
            </RedirectAuthenticatedUser>
          }
        ></Route>
        <Route path="/verify-email" element={<EmailVerificationPage />}></Route>
        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
        ></Route>
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        ></Route>
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
