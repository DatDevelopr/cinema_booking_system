import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useAuthStore } from "../../../../store/auth.store";
import { userApi } from "../../../../api/user.api";
import UploadApi from "../../../../api/upload.api";
import avatarDefault from "../../../../assets/images/avatar.jpg";

export default function ProfileInfo() {
  const { user, setUser } = useAuthStore();

  const fileRef = useRef(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    gender: "male",
    date_of_birth: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =========================
        LOAD USER
  ========================= */

  useEffect(() => {
    if (!user) return;

    setForm({
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      gender: user.gender ?? "male",
      date_of_birth: user.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split("T")[0]
        : "",
    });

    setAvatarPreview(user.avatar || avatarDefault);
  }, [user]);

  /* =========================
        HANDLE INPUT
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
        UPLOAD AVATAR
  ========================= */

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setAvatarPreview(URL.createObjectURL(file));

      const uploadRes = await UploadApi.uploadFile(file);

      const avatarUrl = uploadRes.url;

      const res = await userApi.updateAvatar({
        avatar: avatarUrl,
      });
      alert("Cập nhật avatar thành công");

      setUser(res.data.user); 
    } catch (err) {
      console.error(err);
      alert("Upload avatar thất bại");
    }
  };

  /* =========================
        UPDATE PROFILE
  ========================= */

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await userApi.updateProfile(form);

      setUser(res.data.user); 

      alert("Cập nhật thành công");
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl p-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b">
          {/* AVATAR */}
          <div className="relative">
            <img
              src={avatarPreview || avatarDefault}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border"
            />

            <input
              type="file"
              ref={fileRef}
              className="hidden"
              onChange={handleAvatarChange}
            />

            <button
              onClick={() => fileRef.current.click()}
              className="
              absolute bottom-0 right-0
              bg-white border
              p-2 rounded-full
              shadow hover:bg-orange-50
            "
            >
              <Camera size={16} className="text-orange-500" />
            </button>
          </div>

          {/* USER INFO */}
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold">{user.full_name}</h2>

            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div>
            <label className="text-sm text-gray-500">Họ và tên</label>

            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Ngày sinh</label>

            <input
              type="date"
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Số điện thoại</label>

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Giới tính</label>

            <div className="flex gap-6 mt-2">
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
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
            bg-orange-500
            text-white
            px-6 py-2
            rounded-lg
            hover:bg-orange-600
            transition
          "
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
}
