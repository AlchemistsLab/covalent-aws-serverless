import axios from 'axios';

export const client = axios.create({ baseURL: process.env.REACT_APP_COVALENT_API_AWS_URL });

export const request = async (path, params) => {
  let response = null;

  try {
    const res = await client.get('', { params: { path, ...(params || {}) } })
      .catch(error => { return { data: null, error: true, error_message: error.message, error_code: error.code }; });

    if (res && res.data) {
      response = res.data;
    }
  } catch (error) {
    response = { data: null, error: true, error_message: error.message, error_code: error.code };
  }

  return response;
};
