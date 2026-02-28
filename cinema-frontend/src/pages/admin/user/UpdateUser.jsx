import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userApi } from "../../../api/user.api";
import DEFAULT_AVATAR from "../../../assets/images/avatar.jpg";

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await userApi.getUserById(id);
      setForm(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      await userApi.updateUser(id, form);
      alert("Cập nhật thành công!");
    } catch {
      alert("Cập nhật thất bại!");
    }
  };

  const handleResetPassword = async () => {
    try {
      await userApi.resetPassword(id);
      alert("Đã reset mật khẩu!");
    } catch {
      alert("Reset thất bại!");
    }
  };
  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      {/* Header Buttons */}
      <div className="flex justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Quay lại
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
          >
            Cập nhật
          </button>

          <button
            onClick={handleResetPassword}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Reset mật khẩu
          </button>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <img
          src={form.avatar || DEFAULT_AVATAR}
          alt="avatar"
          className="w-32 h-32 rounded-full object-cover border"
        />
      </div>

      {/* Form */}
      <div className="grid md:grid-cols-2 gap-6">
        <Input
          label="Họ tên"
          name="full_name"
          value={form.full_name || ""}
          onChange={handleChange}
        />
        <Input
          label="Email"
          name="email"
          value={form.email || ""}
          onChange={handleChange}
        />
        <Input
          label="Số điện thoại"
          name="phone"
          value={form.phone || ""}
          onChange={handleChange}
        />

        <Select
          label="Giới tính"
          name="gender"
          value={form.gender ?? ""}
          onChange={handleChange}
          options={[
            { value: "male", label: "Nam" },
            { value: "female", label: "Nữ" },
            { value: "other", label: "Khác" },
          ]}
        />

        <Input
          label="Ngày sinh"
          name="date_of_birth"
          type="date"
          value={form.date_of_birth || ""}
          onChange={handleChange}
        />

        <Select
          label="Quyền"
          name="role_id"
          value={form.role_id || ""}
          onChange={handleChange}
          options={[
            { value: 1, label: "ADMIN" },
            { value: 2, label: "USER" },
          ]}
        />

        <Select
          label="Trạng thái"
          name="status"
          value={form.status || ""}
          onChange={handleChange}
          options={[
            { value: 1, label: "Kích hoạt" },
            { value: 0, label: "Vô hiệu" },
          ]}
        />
      </div>
    </div>
  );
};

export default UpdateUser;

/* ================= Reusable Components ================= */

const Input = ({ label, ...props }) => (
  <div>
    <label className="block mb-1 text-sm font-medium">{label}</label>
    <input
      {...props}
      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block mb-1 text-sm font-medium">{label}</label>
    <select
      {...props}
      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
