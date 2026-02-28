import { useAuthStore } from "../../../../store/auth.store";
import avatarDefault from "../../../../assets/images/avatar.jpg";

export default function ProfileSidebar() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="w-[280px] bg-white rounded-xl shadow p-5">

      {/* Avatar */}
      <div className="flex flex-col items-center text-center">

        <div className="relative">
          <img
            src={user.avatar || avatarDefault}
            className="w-24 h-24 rounded-full object-cover"
          />

          <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow hover:bg-gray-100">
            📷
          </button>
        </div>

        <h3 className="mt-3 font-semibold text-lg">
          {user.full_name}
        </h3>

        <p className="text-sm text-gray-500">
          🎁 0 Stars
        </p>
      </div>

      {/* Spending */}
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">
            Tổng chi tiêu 2026
          </span>

          <span className="text-orange-500 font-semibold">
            0 đ
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={4000000}
          value={0}
          readOnly
          className="w-full accent-orange-500"
        />

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0 đ</span>
          <span>2.000.000 đ</span>
          <span>4.000.000 đ</span>
        </div>
      </div>

    </div>
  );
}
