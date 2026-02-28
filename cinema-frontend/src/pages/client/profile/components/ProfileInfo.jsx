import { useEffect, useState } from "react";
import { userApi } from "../../../../api/user.api";
import { useAuthStore } from "../../../../store/auth.store";

export default function ProfileInfo() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    gender: "male",
    date_of_birth: "",
  });

  const [loading, setLoading] = useState(false);

  /* =========================
     FORMAT DATE dd/mm/yyyy
  ========================= */
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN");
  };

  /* =========================
     LOAD USER
  ========================= */
  useEffect(() => {
    if (!user) return;

    setForm({
      full_name: user.full_name || "",
      phone: user.phone || "",
      gender: user.gender || "male",
      date_of_birth: user.date_of_birth
      ? new Date(user.date_of_birth).toISOString().split("T")[0]
      : "",
    });
  }, [user]);

  /* =========================
     HANDLE INPUT
  ========================= */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
     UPDATE PROFILE
  ========================= */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("full_name", form.full_name);
      formData.append("phone", form.phone);
      formData.append("gender", form.gender);
      formData.append("date_of_birth", form.date_of_birth);

      const res = await userApi.updateProfile(formData);

      setUser(res.data.user);

      alert("Cập nhật thành công");
    } catch (error) {
      console.error(error);
      alert("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-6">
        Thông Tin Cá Nhân
      </h2>

      <div className="grid grid-cols-2 gap-6">

        {/* HỌ TÊN */}
        <div>
          <label className="text-sm text-gray-500">
            Họ và tên
          </label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* NGÀY SINH */}
        <div>
          <label className="text-sm text-gray-500">
            Ngày sinh
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            className="input"
          />

          {/* Hiển thị dd/mm/yyyy */}
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(form.date_of_birth)}
          </p>
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-sm text-gray-500">
            Email
          </label>
          <input
            disabled
            value={user?.email || ""}
            className="input bg-gray-100"
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="text-sm text-gray-500">
            Số điện thoại
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* GENDER */}
        <div className="col-span-2 flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={form.gender === "male"}
              onChange={handleChange}
            />
            Nam
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={form.gender === "female"}
              onChange={handleChange}
            />
            Nữ
          </label>
        </div>

        {/* PASSWORD */}
        <div className="col-span-2">
          <label className="text-sm text-gray-500">
            Mật khẩu
          </label>

          <div className="relative">
            <input
              disabled
              value="********"
              className="input bg-gray-100 pr-24"
            />

            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 text-sm hover:underline"
              onClick={() => alert("Chuyển sang trang đổi mật khẩu")}
            >
              Thay đổi
            </button>
          </div>
        </div>

      </div>

      {/* BUTTON */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:opacity-90"
        >
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </div>
    </div>
  );
}
