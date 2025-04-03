// apiService.js
export function apiReq(endpoint, data, method, headers = {}) {
    return fetch(endpoint, {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data)
    });
  }
  
  export function apiPost(endpoint, data, headers = {}) {
    return apiReq(endpoint, data, 'post', headers);
  }
  