import { NavLink } from "react-router-dom";

const tabs = [
  { name: "Lịch Sử Giao Dịch", path: "/account/transactions" },
  { name: "Thông Tin Cá Nhân", path: "/account/profile" },
  { name: "Vé Xem Phim", path: "/account/tickets" },
];

export default function ProfileTabs() {
  return (
    <div className="bg-white rounded-xl shadow px-6">
      <ul className="flex gap-8 border-b">

        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.path}
            end
            className={({ isActive }) =>
              `py-4 cursor-pointer transition ${
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                  : "text-gray-500 hover:text-black"
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
