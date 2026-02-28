import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../../api/user.api";
import DEFAULT_AVATAR from "../../../assets/images/avatar.jpg";

const roleMap = {
  1: "ADMIN",
  2: "USER",
};

const UserManagement = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  // ================= Fetch Users =================
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userApi.getUserAll();
      const data = res?.data?.data || res?.data || [];
      setUsers(data);
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ================= Format Date =================
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  // ================= Filter Users =================
  const filteredUsers = useMemo(() => {
    if (!keyword) return users;

    return users.filter((user) =>
      Object.keys(user)
        .filter((key) => key !== "avatar") // loại avatar
        .some((key) =>
          String(user[key] || "")
            .toLowerCase()
            .includes(keyword.toLowerCase())
        )
    );
  }, [users, keyword]);

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>

      {/* ================= Action Bar ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/users/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Tạo user
          </button>

          <button
            onClick={fetchUsers}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Refresh
          </button>
        </div>

        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-64"
        />
      </div>

      {loading && (
        <div className="text-center py-6 text-gray-500">
          Đang tải dữ liệu...
        </div>
      )}

      {/* ================= Desktop ================= */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Avatar</th>
              <th className="px-4 py-3 text-left">Họ tên</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Giới tính</th>
              <th className="px-4 py-3 text-left">Ngày sinh</th>
              <th className="px-4 py-3 text-left">Quyền</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.user_id}
                onClick={() => navigate(`/admin/users/${user.user_id}`)}
                className="border-t hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <img
                    src={user.avatar || DEFAULT_AVATAR}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                </td>

                <td className="px-4 py-3 font-medium">
                  {user.full_name || "N/A"}
                </td>

                <td className="px-4 py-3">{user.email || "N/A"}</td>

                <td className="px-4 py-3">{user.phone || "N/A"}</td>

                <td className="px-4 py-3">
                  {user.gender === "male"
                    ? "Nam"
                    : user.gender === "female"
                    ? "Nữ"
                    : "Khác"}
                </td>

                <td className="px-4 py-3">
                  {formatDate(user.date_of_birth)}
                </td>

                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">
                    {roleMap[user.role_id] || "USER"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      user.status === 1
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.status === 1
                      ? "Kích hoạt"
                      : "Ngưng hoạt động"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= Mobile ================= */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user.user_id}
            onClick={() => navigate(`/admin/users/${user.user_id}`)}
            className="bg-white p-4 rounded-xl shadow cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || DEFAULT_AVATAR}
                alt="avatar"
                className="w-14 h-14 rounded-full object-cover border"
              />
              <div>
                <div className="font-semibold">
                  {user.full_name || "N/A"}
                </div>
                <div className="text-sm text-gray-500">
                  {user.email || "N/A"}
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm space-y-1">
              <div><i className="fas fa-phone"></i> {user.phone || "N/A"}</div>
              <div>
                <i className="fas fa-user-tie"></i>{" "}
                {user.gender === "male"
                  ? "Nam"
                  : user.gender === "female"
                  ? "Nữ"
                  : "Khác"}
              </div>
              <div><i className="fas fa-user-clock"></i> {formatDate(user.date_of_birth)}</div>
            </div>

            <div className="flex gap-2 mt-3">
              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">
                {roleMap[user.role_id] || "USER"}
              </span>

              <span
                className={`px-2 py-1 text-xs rounded ${
                  user.status === 1
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {user.status === 1
                  ? "Kích hoạt"
                  : "Ngưng hoạt động"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;