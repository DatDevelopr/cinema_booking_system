import ProfileSidebar from "./ProfileSidebar";
import ProfileTabs from "./ProfileTabs";

export default function ProfileLayout({ children }) {
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Tabs */}
        <ProfileTabs />

        {/* Content */}
        <div className="flex gap-6 mt-4">

          {/* Sidebar */}
          <ProfileSidebar />

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-xl shadow p-6">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
