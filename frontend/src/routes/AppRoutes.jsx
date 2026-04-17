import { Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "../layout/UserLayout";
import AdminLayout from "../layout/AdminLayout";
import ProtectedAdmin from "./ProtectedAdmin";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import ProtectedUser from "./ProtectedUser";

import HomePage from "../pages/client/home/HomePage";
import MoviePage from "../pages/client/movie/MoviePage";
import ShowtimePage from "../pages/client/showtimes/ShowtimePage";
import AuthPage from "../pages/client/auth/AuthPage";
import ProfilePage from "../pages/client/profile/pages/ProfilePage";
import TicketPage from "../pages/client/profile/pages/TicketPage";
import HistoryPage from "../pages/client/profile/pages/HistoryPage";
import ForgotPassword from "../pages/client/auth/ForgotPassword";
import ResetPassword from "../pages/client/auth/ResetPassword";
import MovieDetail from "../pages/client/home/components/MovieDetail";
import BookingPage from "../pages/client/booking/BookingPage";

import Dashboard from "../pages/admin/dashboard/Dashboard";
import Overview from "../pages/admin/Overview";
import UserManagement from "../pages/admin/user/UserManagement";
import CreateUser from "../pages/admin/user/CreateUser";
import UpdateUser from "../pages/admin/user/UpdateUser";
import GenreManagement from "../pages/admin/categories/GenreManagement";
import RegionManagement from "../pages/admin/region/RegionManagement";
import CinemaManagement from "../pages/admin/cinema/CinemaManagement";
import CreateCinema from "../pages/admin/cinema/CreateCinema";
import EditCinema from "../pages/admin/cinema/EditCinema";
import RoomManagement from "../pages/admin/room/RoomManagement";
import CreateRoom from "../pages/admin/room/CreateRoom";
import EditRoom from "../pages/admin/room/EditRoom";
import MovieManagement from "../pages/admin/movie/MovieManagement";
import CreateMovie from "../pages/admin/movie/CreateMovie";
import EditMovie from "../pages/admin/movie/EditMovie";
import ShowtimeManagement from "../pages/admin/showtime/ShowtimeManagement";
import CreateShowtime from "../pages/admin/showtime/CreateShowTimes";
import EditShowtime from "../pages/admin/showtime/EditShowtimes";
import SeatEditor from "../pages/admin/room/EditSeat";
import ServicesManagement from "../pages/admin/services/ServicesManagement";
import CreateService from "../pages/admin/services/CreateService";
import EditService from "../pages/admin/services/EditService";

const AppRoutes = () => {
  return (
    <Routes>
      {/* USER SITE */}
      <Route element={<UserLayout />}>
        <Route
          path="/"
          element={
            <ProtectedUser>
              <HomePage />
            </ProtectedUser>
          }
        />
        <Route path="/movies" element={<MoviePage />} />
        <Route path="/movies/:idSlug" element={<MovieDetail />} />
        <Route path="/showtimes" element={<ShowtimePage />} />
        <Route
          path="/booking/:showtime_id"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
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
        <Route path="regions" element={<RegionManagement />} />
        <Route path="cinemas">
          <Route index element={<CinemaManagement />} />
          <Route path="create" element={<CreateCinema />} />
          <Route path=":id/edit" element={<EditCinema />} />
        </Route>
        <Route path="rooms">
          <Route index element={<RoomManagement />} />
          <Route path="create" element={<CreateRoom />} />
          <Route path=":id/edit" element={<EditRoom />} />
          <Route path=":id/seats" element={<SeatEditor />} />
        </Route>
        <Route path="movies">
          <Route index element={<MovieManagement />} />
          <Route path="create" element={<CreateMovie />} />
          <Route path=":id/edit" element={<EditMovie />} />
        </Route>
        <Route path="showtimes">
          <Route index element={<ShowtimeManagement />} />
          <Route path="create" element={<CreateShowtime />} />
          <Route path=":id/edit" element={<EditShowtime />} />
        </Route>
        <Route path="services">
          <Route index element={<ServicesManagement />} />
          <Route path="create" element={<CreateService />} />
          <Route path=":id/edit" element={<EditService />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
