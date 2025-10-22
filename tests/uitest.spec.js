const {test,expect}=require('@playwright/test');
const  Signinpage  = require('../pages/login');
const Contactpage = require('../pages/contact');
const TestcasePage = require('../pages/testcase');
const Checkoutpage = require('../pages/checkout');
const fs = require('fs');
const path = require('path');


/**
 * Utility: clearOutputFolder
 * - Removes all files under the project's ./outputfolder directory.
 * - Called before the test run to ensure artifacts (invoices/screenshots) are fresh.
 * - Uses fs.rmSync with recursive & force to support files and nested folders.
 */
function clearOutputFolder(dir = path.resolve(process.cwd(), 'outputfolder')) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    try { fs.rmSync(filePath, { recursive: true, force: true }); } catch (e) { /* ignore */ }
  }
  console.log('Cleared output folder:', dir);
}
/**
 * Run one-time cleanup before all tests in this file.
 * - test.beforeAll runs once per worker for this test file.
 */

test.beforeAll(async () => {
  clearOutputFolder();
});

/**
 * Increase default timeout for long UI flows (navigation, downloads).
 * - Adjust if your environment is slower.
 */
test.setTimeout(120000); 


let parse;
try { ({ parse } = require('csv-parse/sync')); } catch (e) { parse = null; }

/**
 * Test: Login Application - Authentication & login flows
 *
 * High level:
 * 1. Open base URL (from env)
 * 2. Click Signup / Login and perform sign-in using page object
 * 3. Navigate to Test Cases page and exercise TestcasePage flows:
 *    - print headings
 *    - read / print brand names
 *    - verify a simple add-to-cart flow
 *    - subscribe via footer and capture transient message
 * 4. Proceed to checkout, place order, verify confirmation and download invoice
 *
 * Notes:
 * - Page objects (Signinpage, TestcasePage, Checkoutpage) encapsulate selectors/actions.
 * - Assertions check visible elements and that invoice file exists on disk.
 */


test('Login Application - Authentication & login flows',async ({page})=>{
         // Navigate to configured base URL (set BASE_URL in .env or environment)
        await page.goto(process.env.BASE_URL);
         // Click "Signup / Login" link in the header and wait for navigation to settle
        await page.locator("//a[normalize-space()='Signup / Login']").click();
        await page.waitForLoadState('networkidle');
        // await page.locator("//a[normalize-space()='Signup / Login']").click();
         // Use page-object to perform login (credentials read inside the page-object)
        const signin=new Signinpage(page);
        await signin.logintoapplication();
        // Verify home page loaded by checking the website logo image is visible
        await expect(page.locator("//img[@alt='Website for automation practice']")).toBeVisible({ timeout: 5000 });
    //     await page.locator("//a[normalize-space()='Contact us']").click();
    //     const contact = new Contactpage(page);
    //     const csvPath = path.resolve(process.cwd(), 'datadriventest', 'testdata.csv');
    // const records = (fs.existsSync(csvPath) && parse)
    //   ? parse(fs.readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true, trim: true })
    //   : [];

    // for (const rec of records) {
    //     // ensure form visible (page may have redirected after previous submission)
    //     await page.locator("input[placeholder='Name']").waitFor({ state: 'visible', timeout: 5000 });

    //     await contact.fillForm({
    //         name: rec.name,
    //         email: rec.email,
    //         subject: rec.subject,
    //         message: rec.message//section[@id='form']//div[@class='container']
    //     });

    //     await contact.uploadFile(rec.file);
    //     await contact.submitAndVerify(rec);
        // Navigate directly to Test Cases page and wait for content to load
        await page.goto('https://automationexercise.com/test_cases');
        await page.waitForLoadState('networkidle');
        // Instantiate the TestcasePage page-object and run helper flows
        const tc = new TestcasePage(page);
        // Print the 26 test-case headings to the console (useful for debugging)
        await tc.printHeadings('.panel-group .panel-title a');
        // Read brand names from Products sidebar and print them
        // getBrandNames navigates to /products internally
        await tc.getBrandNames();
        await tc.printBrandNames();
          // Minimal product verification + add-to-cart flow (clicks several products and adds to cart)
        await tc.verifyproductpage();
         // Footer subscription: fills email and captures transient success message
        await tc.subscription();
        // Checkout flow: proceed, place order, fill payment and verify confirmation
        const checkout = new Checkoutpage(page);
        await checkout.proceedToCheckout();
        await checkout.placeOrder();
        await checkout.verifyCheckoutPage();
        // Confirm order placed UI is visible
        const orderConfirmation = await checkout.confirmOrder();
        await expect(orderConfirmation).toBeVisible({ timeout: 5000 });
        // Download invoice and assert the file is saved into ./outputfolder
        const invoicePath = await checkout.downloadInvoice();
        expect(fs.existsSync(invoicePath)).toBeTruthy();


    });
