import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../../api/user.api";

const CreateUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role_id: 2,
    gender: "male",
    date_of_birth: "",
    status: 1,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async () => {
    try {
      await userApi.createUser(form);
      alert("Tạo user thành công!");
      navigate("/admin/users");
    } catch (error) {
      console.error(error);
      alert("Tạo user thất bại!");
    }
  };

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

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
        >
          + Tạo user
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Input label="Họ tên" name="full_name" value={form.full_name} onChange={handleChange} />
        <Input label="Email" name="email" value={form.email} onChange={handleChange} />
        <Input label="Mật khẩu" name="password" type="password" value={form.password} onChange={handleChange} />
        <Input label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} />

        <Select
          label="Giới tính"
          name="gender"
          value={form.gender}
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
          value={form.date_of_birth}
          onChange={handleChange}
        />

        <Select
          label="Quyền"
          name="role_id"
          value={form.role_id}
          onChange={handleChange}
          options={[
            { value: 1, label: "ADMIN" },
            { value: 2, label: "USER" },
          ]}
        />

        <Select
          label="Trạng thái"
          name="status"
          value={form.status}
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

export default CreateUser;

/* ================= Components ================= */

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