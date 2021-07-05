/************************************************
 * This code is a function for request data from Covalent API.
 * Deploy on AWS Lambda (triggered by AWS API Gateway)
 ************************************************/
exports.handler = async (event, context, callback) => {
  // import module for submitting request.
  const axios = require('axios');

  /************************************************
   * Covalent API information for requesting data
   * You can setup these environment variables below on the AWS Lambda function's configuration.
   * - API_HOST (Optional)
   * - API_KEY (You can also replace '{YOUR_API_KEY}' with your key if you are not set it on Lambda function)
   ************************************************/
  const api_host = process.env.API_HOST || 'https://api.covalenthq.com/v1/';
  const api_key = process.env.API_KEY || '{YOUR_API_KEY}';

  // response data variable
  let response = null;

  // check path parameter exist
  if (event.queryStringParameters && event.queryStringParameters.path) {
    // initial requester object
    const requester = axios.create({ baseURL: api_host });

    // normalize path parameter
    const path = `${event.queryStringParameters.path}${!event.queryStringParameters.path.endsWith('/') ? '/' : ''}`;
    // remove path parameter before setup query string parameters
    delete event.queryStringParameters.path;
    // setup query string parameters including API key
    const params = { key: api_key, ...event.queryStringParameters };

    // send request to Covalent API
    const res = await requester.get(path, { params })
      // set response data from error handled by exception
      .catch(error => { return { data: null, error: true, error_message: error.message, error_code: error.code }; });

    // set response data
    if (res && res.data) {
      response = res.data;
    }
  }
  else {
    // set response data to 'Not found'
    response = { data: null, error: true, error_message: 'Not found', error_code: 404 };
  }

  // return response data
  return response;
};