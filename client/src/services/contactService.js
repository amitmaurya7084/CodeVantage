import api from "./api";

export async function sendContactMessage(payload) {
  const { data } = await api.post("/contact", payload);
  return data;
}
