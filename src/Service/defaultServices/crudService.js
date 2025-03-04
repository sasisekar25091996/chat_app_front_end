import HTTPClient from "./http";

export default class CrudService extends HTTPClient {
  url = "";

  getAll(filter = {}) {
    return this.get(this.url, { params: filter });
  }

  getSingleItem(id) {
    return this.get(`${this.url}/${id}`);
  }

  updateItem(id, data) {
    return this.put(`${this.url}/${id}`, data);
  }

  updateFile(id, formData) {
    return this.put(`${this.url}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Ensure the content type is set to multipart/form-data
      },
    });
  }

  create(data) {
    return this.post(this.url, data);
  }

  createFile(formData) {
    return this.post(`${this.url}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Ensure the content type is set to multipart/form-data
      },
    });
  }

  deleteItem(id) {
    return this.delete(`${this.url}/${id}`);
  }
}
