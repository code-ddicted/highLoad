const axios = require('axios');

const URL = 'http://localhost:3000/users/1/balance'; // Adjust as necessary

// Function to send request
const sendRequest = async () => {
  try {
    const response = await axios.put(URL, { amount: -2 });
    return { status: 'success', data: response.data };
  } catch (error) {
    return { status: 'error', data: error.response ? error.response.data : 'Network error' };
  }
};

const runLoadTest = async () => {
  // Generate 100 requests (adjust as necessary)
  const requests = Array.from({ length: 100 }, () => sendRequest());

  // Send requests concurrently
  const results = await Promise.all(requests);

  // Analyze results
  const successResponses = results.filter(result => result.status === 'success' && result.data.message === 'Balance updated successfully');
  const errorResponses = results.filter(result => result.status === 'error' && result.data.error === 'Balance cannot go negative');
  const otherErrors = results.filter(result => result.status === 'error' && !result.data.error.includes('Balance cannot go negative'));

  // Log counts
  console.log(`Total Requests: ${results.length}`);
  console.log(`Successful Requests: ${successResponses.length}`);
  console.log(`Balance cannot go negative: ${errorResponses.length}`);
  console.log(`Other Errors: ${otherErrors.length}`);

  // Log the first few errors to diagnose issues
  if (otherErrors.length > 0) {
    console.log('Sample Other Errors:', otherErrors.slice(0, 5).map(err => err.data.error));
  }
};

runLoadTest();
