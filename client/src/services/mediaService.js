import api from "./api";

export async function uploadMedia(file, altText = "") {
  const formData = new FormData();
  formData.append("file", file);
  if (altText) formData.append("altText", altText);

  const { data } = await api.post("/admin/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchMedia(params) {
  const { data } = await api.get("/admin/media", { params });
  return data;
}

export async function updateMediaAltText(id, altText) {
  const { data } = await api.patch(`/admin/media/${id}`, { altText });
  return data;
}

export async function deleteMedia(id) {
  const { data } = await api.delete(`/admin/media/${id}`);
  return data;
}
