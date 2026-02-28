import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Search, X, ArrowUpDown } from "lucide-react";
import { genreApi } from "../../../api/genre.api";

const GenreManagement = () => {
  /* ================= STATE ================= */
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortOrder, setSortOrder] = useState(null); // null | asc | desc

  const [isOpen, setIsOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [formName, setFormName] = useState("");

  /* ================= DEBOUNCE SEARCH ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= FETCH DATA ================= */
  const fetchGenres = async () => {
    try {
      setLoading(true);

      const res = await genreApi.getGenreAll({
        page,
        limit: 10,
        search: debouncedSearch,
        sortField: sortOrder ? "genre_name" : undefined,
        sortOrder: sortOrder || undefined,
      });

      const { data, pagination } = res.data;

      setGenres(data);
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.total);
    } catch (error) {
      console.error("Fetch lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, [page, debouncedSearch, sortOrder]);

  /* ================= SORT ================= */
  const handleSort = () => {
    setPage(1);

    if (!sortOrder) setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder(null);
  };

  /* ================= MODAL ================= */
  const openCreateModal = () => {
    setEditingGenre(null);
    setFormName("");
    setIsOpen(true);
  };

  const openEditModal = (genre) => {
    setEditingGenre(genre);
    setFormName(genre.genre_name);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingGenre(null);
    setFormName("");
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formName.trim()) {
      alert("Tên thể loại không được để trống");
      return;
    }

    try {
      setLoading(true);

      if (editingGenre) {
        await genreApi.updateGenre(editingGenre.genre_id, {
          genre_name: formName.trim(),
        });
        alert("Cập nhật thành công");
      } else {
        await genreApi.createGenre({
          genre_name: formName.trim(),
        });
        alert("Thêm thành công");
      }

      closeModal();
      fetchGenres();
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 409) {
          alert(message || "Tên thể loại đã tồn tại");
        } else if (status === 400) {
          alert(message || "Dữ liệu không hợp lệ");
        } else {
          alert("Có lỗi xảy ra");
        }
      } else {
        alert("Không kết nối được server");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá?")) return;

    try {
      await genreApi.deleteGenre(id);

      if (genres.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchGenres();
      }
    } catch (error) {
      console.error("Xoá lỗi:", error);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý thể loại</h1>
          <p className="text-sm text-gray-500">Tổng: {totalItems} thể loại</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition shadow"
        >
          <Plus size={18} />
          Thêm thể loại
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm thể loại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
        />
        <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-lg rounded-2xl overflow-x-auto">
        <table className="w-full text-left min-w-[500px]">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-4">ID</th>

              <th
                onClick={handleSort}
                className="px-6 py-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  Tên thể loại
                  <ArrowUpDown
                    size={16}
                    className={`transition ${
                      sortOrder === "asc"
                        ? "rotate-180 text-blue-600"
                        : sortOrder === "desc"
                          ? "text-blue-600"
                          : "text-gray-400"
                    }`}
                  />
                </div>
              </th>

              <th className="px-6 py-4 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-8">
                  Đang tải...
                </td>
              </tr>
            ) : genres.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              genres.map((genre) => (
                <tr key={genre.genre_id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{genre.genre_id}</td>
                  <td className="px-6 py-4 font-medium">{genre.genre_name}</td>
                  <td className="px-6 py-4 flex justify-center gap-4">
                    <button
                      onClick={() => openEditModal(genre)}
                      className="text-yellow-500 hover:scale-110 transition"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(genre.genre_id)}
                      className="text-red-500 hover:scale-110 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            <i class="fas fa-chevron-left"></i><i class="fas fa-chevron-left"></i>
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setPage(index + 1)}
              className={`px-4 py-2 rounded-lg border ${
                page === index + 1
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            <i class="fas fa-chevron-right"></i><i class="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingGenre ? "Sửa thể loại" : "Thêm thể loại"}
              </h2>
              <button onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nhập tên thể loại..."
                className="w-full border rounded-lg px-4 py-2 mb-4"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                >
                  {editingGenre ? "Cập nhật" : "Thêm"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border py-2 rounded-lg"
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreManagement;
