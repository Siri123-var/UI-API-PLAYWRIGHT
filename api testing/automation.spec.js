import { test, expect } from '@playwright/test';
 
/**
 * GET /api/productsList
 * - Verify endpoint responds with 200 and returns a products array.
 */
test('API testing GET method', async ({ request }) => {
  const response = await request.get('https://automationexercise.com/api/productsList');
  expect(response.status()).toBe(200);
  const data = await response.json();
  console.log(data);
 
  // Optional but recommended checks
  expect(data).toHaveProperty('products');
  expect(data.products.length).toBeGreaterThan(0);
});
 /**
 * POST to /api/productsList with wrong method
 * - Some APIs respond with 200 and an error message instead of 405.
 * - This test calls POST to observe the returned behavior.
 */
 test("API testing - wrong method for productsList", async ({ request }) => {
  const response = await request.post("https://automationexercise.com/api/productsList");
  expect(response.status()).toBe(200);
  const body = await response.json();
  console.log(body);
});
/**
 * GET /api/brandsList
 * - Verify endpoint responds with 200 and returns a brands array.
 */
 
  test('API testing GET method - brands list', async ({ request }) => {
  const response = await request.get('https://automationexercise.com/api/brandsList');
  expect(response.status()).toBe(200);
  const data = await response.json();
  console.log(data);
  expect(data).toHaveProperty('brands');
  expect(Array.isArray(data.brands)).toBeTruthy();
  expect(data.brands.length).toBeGreaterThan(0);
});

/**
 * PUT /api/brandsList
 * - Verify that an unsupported method returns the expected message.
 * - Note: API returns 200 with a message string rather than 405 in this system.
 */
 
test('PUT to /brandsList should return 405', async ({ request }) => {
  const response = await request.put('https://automationexercise.com/api/brandsList');
  expect(response.status()).toBe(200);
 
  const body = await response.text();
  expect(body).toContain('This request method is not supported');
});
 
/**
 * POST /api/searchProduct
 * - Send a form post with search_product and expect matching products in JSON.
 */ 

test('POST to /searchProduct should return matching products', async ({ request }) => {
  const response = await request.post('https://automationexercise.com/api/searchProduct', {
    form: {
      search_product: 'tshirt'
    }
  });
 
  expect(response.status()).toBe(200);
 
  const body = await response.json();
  expect(body).toHaveProperty('products');
  expect(Array.isArray(body.products)).toBe(true);
  expect(body.products.length).toBeGreaterThan(0);
 
});
/**
 * POST /api/searchProduct (alternative using data field)
 * - Demonstrates another way to send request body with Playwright request fixture.
 */
 
test('Search product API', async ({ request }) => {
  const response = await request.post('https://automationexercise.com/api/searchProduct', {
    data: {
      search_product: 'Laptop' // required parameter
    }
  });
 
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
});
 /**
 * POST /api/verifyLogin - valid credentials
 * - Verify API indicates user exists for valid credentials.
 * - Replace test credentials with appropriate test accounts in real runs.
 */
 
 
test('Verify login API with valid details', async ({ request }) => {
  const response = await request.post('https://automationexercise.com/api/verifyLogin', {
    form: {
      email: 'varshu@gmail.com',
      password: 'varshu@123',
    }
  });
 
  expect(response.status()).toBe(200);
 
  const responseBody = await response.json();
  console.log(responseBody);
 
  expect(responseBody.message).toBe('User exists!');
});
 /**
 * POST /api/verifyLogin - missing email parameter
 * - Ensure API returns a descriptive error message when required params are missing.
 */
test('Verify login API without email parameter', async ({ request }) => {
  const response = await request.post('https://automationexercise.com/api/verifyLogin', {
    form: {
     
      password: 'varshu@123',
    }
  });
 
  expect(response.status()).toBe(200);
 
  const responseBody = await response.json();
  console.log(responseBody);
 
  // Validate the error message
  expect(responseBody.message).toBe(
    'Bad request, email or password parameter is missing in POST request.'
  );
});
 /**
 * DELETE /api/verifyLogin - method not allowed
 * - Many endpoints respond with a JSON message for unsupported methods.
 */
 
 
test('Verify DELETE method is not allowed on login API', async ({ request }) => {
  const response = await request.delete('https://automationexercise.com/api/verifyLogin');
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  expect(responseBody.message).toBe('This request method is not supported.');
});
/**
 * POST /api/verifyLogin - invalid credentials
 * - Verify API returns 'User not found!' for wrong credentials.
 */
 
test('Verify login API with invalid details', async ({ request }) => {
  const response = await request.post('https://automationexercise.com/api/verifyLogin', {
    form: {
      email: 'invaliduser@example.com', // invalid email
      password: 'WrongPass123'          // invalid password
    }
  });
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  expect(responseBody.message).toBe('User not found!');
});
 
/**
 * POST /api/createAccount - create/register user
 * - Attempt to create a user; the test expects 'Email already exists!' for this example email.
 * - In CI, use unique emails (or mock) to test account creation successfully.
 */
test('Create/Register User Account', async ({ request }) => {
  const response = await request.post('https://automationexercise.com/api/createAccount', {
    form: {
      title: 'Miss',
      name: 'sirivarshini',
      email: 'vammoooo@gmail.com',
      password: 'siri@123',
      birth_date: '02',
      birth_month: 'June',
      birth_year: '2002',
      firstname: 'siri',
      lastname: 'varsh',
      company: 'sails',
      address1: 'Vizag',
      address2: 'Gurudwara',
      country: 'India',
      zipcode: '530013',
      state: 'Andhra',
      city: 'Vizag',
      mobile_number: '9999999999'
    }
  });
 
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  expect(responseBody.message).toBe('Email already exists!');
});
 /**
 * DELETE /api/deleteAccount - delete user account
 * - Attempt to delete the sample account and assert the expected API response.
 * - Be cautious: running against a real backend may remove data. Prefer test doubles in CI.
 */
 
 
test('Delete User Account', async ({ request }) => {
  const response = await request.delete('https://automationexercise.com/api/deleteAccount', {
    form: {
      email: 'vammoooo@gmail.com',
      password: 'siri@123'    
    }
  });
 
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  expect(responseBody.message).toBe('Account not found');
});
 
 
 
 
 
 
 
 