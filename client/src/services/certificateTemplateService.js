import api from "./api";

export async function fetchCertificateTemplateFields() {
  const { data } = await api.get("/admin/certificate-template");
  return data.fields;
}

export async function updateCertificateTemplateField(fieldName, fieldValue) {
  const { data } = await api.put(`/admin/certificate-template/${fieldName}`, { fieldValue });
  return data.field;
}

export async function resetCertificateTemplateField(fieldName) {
  const { data } = await api.delete(`/admin/certificate-template/${fieldName}`);
  return data.field;
}

/** Returns a blob URL for the rendered preview PDF. Caller should revoke it when done. */
export async function previewCertificateTemplate(content) {
  const { data } = await api.post(
    "/admin/certificate-template/preview",
    { content },
    { responseType: "blob" }
  );
  return URL.createObjectURL(data);
}
