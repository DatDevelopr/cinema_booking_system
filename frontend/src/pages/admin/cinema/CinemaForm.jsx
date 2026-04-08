import { useState, useEffect } from "react";
import { Building2, MapPin, Globe, Save, X } from "lucide-react";

const CinemaForm = ({ regions, initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    cinema_name: "",
    address: "",
    region_id: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        cinema_name: initialData.cinema_name || "",
        address: initialData.address || "",
        region_id: initialData.region_id || "",
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "cinema_name":
        if (!value.trim()) error = "Tên rạp không được để trống";
        else if (value.length < 2) error = "Tên rạp phải có ít nhất 2 ký tự";
        break;
      case "region_id":
        if (!value) error = "Vui lòng chọn khu vực";
        break;
      case "address":
        if (!value.trim()) error = "Địa chỉ không được để trống";
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, form[name]) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fields = ["cinema_name", "region_id", "address"];
    const newTouched = {};
    let isValid = true;
    
    fields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, form[field]);
      if (error) isValid = false;
      setErrors(prev => ({ ...prev, [field]: error }));
    });
    setTouched(newTouched);
    
    if (isValid) onSubmit(form);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Thông tin rạp</h2>
        <p className="text-sm text-gray-500">Nhập thông tin cơ bản của rạp</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" />
            Tên rạp <span className="text-red-500">*</span>
          </label>
          <input
            name="cinema_name"
            value={form.cinema_name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="VD: CGV Vincom Center"
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.cinema_name && touched.cinema_name
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-blue-400"
            }`}
          />
          {errors.cinema_name && touched.cinema_name && (
            <p className="text-red-500 text-xs">{errors.cinema_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" />
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Số nhà, đường, phường/xã..."
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.address && touched.address
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-blue-400"
            }`}
          />
          {errors.address && touched.address && (
            <p className="text-red-500 text-xs">{errors.address}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Globe size={16} className="text-blue-600" />
            Khu vực <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              name="region_id"
              value={form.region_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer ${
                errors.region_id && touched.region_id
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-blue-400"
              }`}
            >
              <option value="">Chọn khu vực</option>
              {regions.map((r) => (
                <option key={r.region_id} value={r.region_id}>
                  {r.region_name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.region_id && touched.region_id && (
            <p className="text-red-500 text-xs">{errors.region_id}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-medium transition-all"
          >
            <Save size={16} />
            Lưu
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium transition-all"
            >
              <X size={16} />
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CinemaForm;