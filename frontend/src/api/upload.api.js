import axiosClient from "./axiosClient";

const UploadApi = {
  // upload file
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axiosClient.post("/upload", formData);
    return res.data;
  },
};

export default UploadApi;
