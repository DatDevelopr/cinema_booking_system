import { Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "../layout/UserLayout";
import AdminLayout from "../layout/AdminLayout";
import ProtectedAdmin from "./ProtectedAdmin";

import HomePage from "../pages/client/home/HomePage";
import MoviePage from "../pages/client/movie/MoviePage";
import ShowtimePage from "../pages/client/showtimes/ShowtimePage";
import AuthPage from "../pages/client/auth/AuthPage";

import Dashboard from "../pages/admin/dashboard/Dashboard";
import ProfilePage from "../pages/client/profile/ProfilePage";
import TicketPage from "../pages/client/profile/TicketPage";
import HistoryPage from "../pages/client/profile/HistoryPage";
import ForgotPassword from "../pages/client/auth/ForgotPassword";
import ResetPassword from "../pages/client/auth/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import Overview from "../pages/admin/Overview";
import UserManagement from "../pages/admin/user/UserManagement";
import CreateUser from "../pages/admin/user/CreateUser";
import UpdateUser from "../pages/admin/user/UpdateUser";
import GenreManagement from "../pages/admin/categories/GenreManagement";

const AppRoutes = () => {
  return (
    <Routes>
      {/* USER SITE */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviePage />} />
        <Route path="/showtimes" element={<ShowtimePage />} />
        <Route
          path="/auth"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />
        <Route
          path="/account/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account/tickets" element={<TicketPage />} />
        <Route path="/account/transactions" element={<HistoryPage />} />
      </Route>

      {/* ADMIN SITE */}
      <Route
        path="/admin"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard/*" element={<Dashboard />}>
          <Route index element={<Overview />} />
        </Route>
        <Route path="users">
          <Route index element={<UserManagement />} />
          <Route path="create" element={<CreateUser />} />
          <Route path=":id" element={<UpdateUser />} />
        </Route>
        <Route path="genres" element={<GenreManagement />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
