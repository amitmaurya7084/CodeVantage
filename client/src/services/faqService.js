import api from "./api";

export async function fetchFaqs() {
  const { data } = await api.get("/faqs");
  return data.faqs;
}
