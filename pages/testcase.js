/**
 * TestcasePage - Page Object for test-cases, brands and cart flows on automationexercise.com
 *
 * Responsibilities:
 * - Locate and print the 26 test-case headings on the Test Cases page
 * - Read brand names from the Products page sidebar
 * - Verify adding products to the cart (simple flow used by tests)
 * - Subscribe using footer email input and capture transient success message
 *
 * Notes:
 * - All methods expect a Playwright Page instance passed into the constructor.
 * - Selectors use CSS or XPath where appropriate; adjust if the application markup changes.
 */
class TestcasePage {
  constructor(page){
    this.page = page;
    this.defaultSelector = '.panel-group .panel-title a';
    this.brandsnames=page.locator('.brands-name');
  }

  async printHeadings(selector = this.defaultSelector, filterPrefix = 'Test Case') {
    const loc = this.page.locator(selector);
    const texts = await loc.allTextContents(); // gets raw texts for all matching anchors
    const cleaned = texts.map(t => t.replace(/\s+/g, ' ').trim());
    const filtered = cleaned.filter(t => t.startsWith(filterPrefix));
    console.log(`Found ${filtered.length} headings (filtered by "${filterPrefix}"):`);
    filtered.forEach((t, i) => console.log(`${i + 1}: ${t}`));
    return filtered;
  }

  /**
   * Navigate to products page and return brand names (without counts).
   *
   * Behavior:
   * - goes to /products page
   * - waits for the brands container to exist
   * - scrolls brands container into view (useful if sidebar loads lazily)
   * - collects anchor text values, strips "(N)" counts and returns cleaned names
   *
   * @returns {Promise<string[]>} brand names array (e.g. ["Polo", "H&M", ...])
   */

    // ...existing code...
  async getBrandNames() {
    const url = 'https://automationexercise.com/products';
    await this.page.goto(url, { waitUntil: 'load' });
    // wait for the brands container to exist
    await this.page.waitForSelector('//div[@class="brands_products"]', { timeout: 10000 });
    const container = this.page.locator('.brands-name');
    await container.scrollIntoViewIfNeeded();
    const links = container.locator('a');
    const count = await links.count();
    console.log('brand anchor count =', count);
    if (count === 0) return [];
    const texts = await links.allTextContents(); // raw texts like "(6)Polo"
    const names = texts
      .map(t => t.replace(/\(\s*\d+\s*\)/g, '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    return names;
  }

  async printBrandNames() {
    const names = await this.getBrandNames();
    console.log(`Found ${names.length} brand(s):`);
    names.forEach((n, i) => console.log(`${i + 1}: ${n}`));
    return names;
  }
  
  /**
   * Minimal product page verification & add-to-cart flow used in tests.
   *
   * Steps (high level):
   * - navigate to /products
   * - open product details for product ids 1,2,3 and add each to cart
   * - continue shopping after each add
   * - finally click Cart to land on cart page
   *
   */
  async verifyproductpage(){
    await this.page.goto("https://automationexercise.com/products");
    await this.page.waitForLoadState('networkidle');
      // Product 1 -> add to cart -> continue
    await this.page.locator("a[href='/product_details/1']").click();
    await this.page.waitForLoadState('networkidle');
    await this.page.locator("//button[normalize-space()='Add to cart']").click();
    await this.page.waitForLoadState('networkidle');
    await this.page.locator("//button[normalize-space()='Continue Shopping']").click();
    await this.page.waitForLoadState('networkidle');
    // navigate back to products and repeat for product 2
    await this.page.goto("https://automationexercise.com/products");
    await this.page.waitForLoadState('networkidle');
    await this.page.locator("a[href='/product_details/2']").click();
    await this.page.locator("//button[normalize-space()='Add to cart']").click();
    await this.page.locator("//button[normalize-space()='Continue Shopping']").click();
    await this.page.waitForLoadState('networkidle');
    // product 3
    await this.page.goto("https://automationexercise.com/products");
    await this.page.waitForLoadState('networkidle');
    await this.page.locator("a[href='/product_details/3']").click();
    await this.page.locator("//button[normalize-space()='Add to cart']").click();
    await this.page.locator("//button[normalize-space()='Continue Shopping']").click();
    await this.page.waitForLoadState('networkidle');
       // finally open Cart page to assert items present (tests can add assertions)
    await this.page.locator("//a[normalize-space()='Cart']").click();
    await this.page.waitForLoadState('networkidle');
  }
  // async subscription({
  //   email = `user${Date.now()}@example.com` // default to a unique email if none provided
  // } = {}) {
  //   const footer = this.page.locator('#footer');
  //   await footer.scrollIntoViewIfNeeded();
  //   const emailInput = footer.locator('#susbscribe_email');
  //   // const submitBtn = footer.locator('#subscribe');
  //   await emailInput.fill(email);
  //   await this.page.locator("//button[@id='subscribe']").click();

      async subscription({
    email = `user${Date.now()}@example.com` // default to a unique email if none provided
  } = {}) {
    const timeout = Number(process.env.TIMEOUT) || 5000;
     // Bring footer into view to ensure input & button are interactable
    const footer = this.page.locator('#footer');
    await footer.scrollIntoViewIfNeeded();

    const emailInput = footer.locator('#susbscribe_email');
    const submitBtn = footer.locator('#subscribe');
    // fill the email and click subscribe; wait concurrently for the transient alert
    await emailInput.fill(email);

    // click and concurrently wait for the transient success alert to appear
    await Promise.all([
      this.page.waitForSelector('#success-subscribe .alert-success', { state: 'visible', timeout }).catch(() => null),
      submitBtn.click()
    ]);

    const success = this.page.locator('#success-subscribe .alert-success');
    if (await success.isVisible().catch(() => false)) {
       // read message immediately while visible
      const msg = (await success.innerText()).trim();
      console.log('Subscription result:', msg);
      // wait for it to disappear (message is shown for ~3s)
      await success.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => null);
    } else {
       // helpful warning for debugging if message never appeared
      console.warn('Subscription success message did not appear');
    }
  }
    
  // }
}

module.exports = TestcasePage;