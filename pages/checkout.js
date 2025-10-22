const fs = require('fs');
const path = require('path');

/**
 * checkoutPage - Page Object for checkout/payment/invoice flows
 *
 * Responsibilities:
 * - Interact with checkout-related UI (Proceed To Checkout, Place Order)
 * - Fill payment details and confirm order
 * - Download generated invoice and save it to disk
 *
 * Notes:
 * - The class expects a Playwright Page instance passed to the constructor.
 * - downloadInvoice saves files into ./outputfolder by default (can be overridden with OUTPUT_DIR env var).
 */
class checkoutPage { 
    constructor(page) {
        this.page = page;
        this.proceedToCheckoutBtn = page.locator("//a[normalize-space()='Proceed To Checkout']");
        this.placeorderBtn = page.locator("//a[normalize-space()='Place Order']");
    }
    /**
     * Click the "Proceed To Checkout" button and return the delivery address text.
     *
     * - waits for navigation/network to settle after the click
     * - reads the delivery address block and returns its inner text for assertions/logging
     *
     * @returns {Promise<string>} delivery address text
     */

    async proceedToCheckout() {
        await this.proceedToCheckoutBtn.click();
        await this.page.waitForLoadState('networkidle');
        const address = await this.page.locator("//ul[@id='address_delivery']").innerText();
        console.log(address);
        return address;
    }
     /**
     * Click the "Place Order" button to move to the payment step.
     *
     * - waits for networkidle after the click so tests can continue reliably
     */

    async placeOrder() {
        await this.placeorderBtn.click();
        await this.page.waitForLoadState('networkidle');
    }
     /**
     * Fill payment details on the payment page and submit.
     *
     * - Navigates to the payment URL (if needed) and fills dummy card details.
     * - Clicks the submit button and waits for the network to settle.
     *
     * NOTE: In real tests use valid test card data from your payment provider sandbox.
     */
    async verifyCheckoutPage() {
        await this.page.goto("https://automationexercise.com/payment");
        await this.page.waitForLoadState('networkidle');
        await this.page.fill("input[name='name_on_card']", "test user");
        await this.page.fill("input[name='card_number']", "1234567890123456");
        await this.page.fill("//input[@placeholder='ex. 311']", "123");
        await this.page.fill("//input[@name='expiry_month']", "12");
        await this.page.fill("//input[@placeholder='YYYY']", "2025");
        await this.page.locator("//button[@id='submit']").click();
        await this.page.waitForLoadState('networkidle');
    }
      /**
     * Get the order confirmation locator for use in assertions.
     *
     * - Returns a locator pointing to the "Order Placed!" element so tests can assert visibility or text.
     *
     * @returns {import('@playwright/test').Locator} locator for the order confirmation element
     */
    async confirmOrder() {
        // await expect(this.page).toHaveURL("https://automationexercise.com/payment_done/900");
        // await this.page.waitForLoadState('networkidle');
        const orderConfirmation = this.page.locator("//b[normalize-space()='Order Placed!']");
        return orderConfirmation;
    }
    
    /**
     * Download the invoice file by clicking "Download Invoice" and save it to disk.
     *
     * Behavior:
     * - Waits for the Download Invoice link to be visible.
     * - Ensures the destination folder exists (default: ./outputfolder in project root).
     * - Clicks the link and waits for the Playwright 'download' event.
     * - Uses the browser-suggested filename unless a fileName override is provided.
     * - Saves the download to disk and returns the full saved path.
     *
     * @param {string} [saveDir=path.resolve(process.env.OUTPUT_DIR || process.cwd(), 'outputfolder')] - destination folder for the invoice
     * @param {string} [fileName] - optional final filename (if omitted, the download's suggested filename is used)
     * @returns {Promise<string>} absolute path to the saved invoice file
     */
    async downloadInvoice(saveDir = path.resolve(process.env.OUTPUT_DIR || process.cwd(), 'outputfolder'), fileName) {
    const downloadBtn = this.page.locator("//a[normalize-space()='Download Invoice']");
    await downloadBtn.waitFor({ state: 'visible', timeout: 10000 });

    // ensure folder exists
    await fs.promises.mkdir(saveDir, { recursive: true });

    // click and wait for download event
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      downloadBtn.click()
    ]);

    // get suggested name or fallback
    const suggested = (download.suggestedFilename && await download.suggestedFilename()) || 'invoice';
    const finalName = fileName || suggested;
    const savePath = path.join(saveDir, finalName);

    await download.saveAs(savePath);
      // Log the saved location for test-artifact traceability
    console.log('Invoice saved to:', savePath);
    return savePath;
  }
}

module.exports = checkoutPage;