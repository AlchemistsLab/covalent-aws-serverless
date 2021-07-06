import axios from 'axios';

// initial requester object
export const requester = axios.create({ baseURL: process.env.REACT_APP_COVALENT_API_AWS_URL });

// function to request data from your API on AWS by passing 2 arguments (path, params)
export const request = async (path, params) => {
  // response data variable
  let response = null;

  try {
    // send request to your API
    const res = await requester.get('', { params: { path, ...(params || {}) } })
      // set response data from error handled by exception
      .catch(error => { return { data: { data: null, error: true, error_message: error.message, error_code: error.code } }; });

    // set response data
    if (res && res.data) {
      response = res.data;
    }
  } catch (error) {
    // set response data from error handled by exception
    response = { data: null, error: true, error_message: error.message, error_code: error.code };
  }

  // return response data
  return response;
};
