import { Outlet } from "react-router-dom";
import ProfileTabs from "../components/ProfileTabs";

export default function ProfileLayout() {
  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4">

        <ProfileTabs />

        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <Outlet />
        </div>

      </div>
    </div>
  );
}