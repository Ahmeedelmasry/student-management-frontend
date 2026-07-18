import httpClient from "@/../HTTPClient"

const apiUrl = import.meta.env.VITE_API_URL

class ApiClient {
  constructor(resource) {
    this.resource = resource
  }

  get url() {
    return `${apiUrl}${this.resource}`
  }

  list(params) {
    return httpClient.get(this.url, {
      params: {
        ...params,
      },
    })
  }

  show(id) {
    return httpClient.get(`${this.url}/${id}`)
  }

  create(data) {
    return httpClient.post(`${this.url}`, data)
  }

  update(data, id) {
    return httpClient.put(`${this.url}/${id}`, data)
  }

  sort(id, order_type) {
    return httpClient.post(`${this.url}/reorder/${id}/${order_type == 'up' ? 1 : -1}`)
  }

  delete(id) {
    return httpClient.delete(`${this.url}/${id}`)
  }
}

export default ApiClient
