import { NavLink } from "react-router-dom";

const tabs = [
  { name: "Thông Tin Cá Nhân", path: "/account/profile" },
  { name: "Vé Xem Phim", path: "/account/tickets" },
  { name: "Lịch Sử Giao Dịch", path: "/account/transactions" },
];

export default function ProfileTabs() {
  return (
    <div className="bg-white rounded-xl shadow px-6">

      <ul className="flex gap-8 border-b">

        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `py-4 font-medium transition ${
                isActive
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-orange-500"
              }`
            }
          >
            {tab.name}
          </NavLink>
        ))}

      </ul>

    </div>
  );
}