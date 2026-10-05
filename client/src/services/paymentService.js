import api from "./api";

/** Submits UPI payment proof: a screenshot file plus an optional UTR/transaction ref. */
export async function submitUpiPayment(file, utrNumber = "") {
  const formData = new FormData();
  formData.append("screenshot", file);
  if (utrNumber) formData.append("utrNumber", utrNumber);

  const { data } = await api.post("/payments/upi/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchMyPayments() {
  const { data } = await api.get("/payments/my");
  return data;
}
