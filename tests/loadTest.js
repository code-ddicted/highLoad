const axios = require('axios');

const URL = 'http://localhost:3000/users/1/balance'; // Adjust as necessary

// Function to send request
const sendRequest = async () => {
  try {
    const response = await axios.put(URL, { amount: -4 });
    return { status: 'success', data: response.data };
  } catch (error) {
    return { status: 'error', data: error.response ? error.response.data : 'Network error' };
  }
};

const runLoadTest = async () => {
  // Generate 10,000 requests
  const requests = Array.from({ length: 10000 }, () => sendRequest());

  // Send requests concurrently
  const results = await Promise.all(requests);

  // Analyze results
  const successResponses = results.filter(result => result.status === 'success');
  const errorResponses = results.filter(result => result.status === 'error' && result.data.error === 'Not enough funds in the balance');
const otherErrors = results.filter(result => result.status === 'error' && result.data.error !== 'Not enough funds in the balance');

  console.log(`Total Requests: ${results.length}`);
  console.log(`Successful Requests: ${successResponses.length}`);
  console.log(`Balance cannot go negative: ${errorResponses.length}`);
  console.log(`others: ${otherErrors.length}`);
  
  // Log the first few errors to diagnose issues
  if (otherErrors.length > 0) {
    console.log('Sample Other Errors:', otherErrors.slice(0, 5));
    console.log(results[0].data.error)
  }
};

runLoadTest();
