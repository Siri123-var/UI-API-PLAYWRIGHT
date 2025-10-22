/**
 * Signinpage - Page Object for the login / signin page
 *
 * Notes:
 * - This class encapsulates locators and actions related to logging into the app.
 * - Call logintoapplication() to perform a login using environment credentials.
 */
class Signinpage{
    constructor(page){
        this.page=page;
          // Locator for email / username input (data-qa attribute used on page)
        this.username="//input[@data-qa='login-email']";
        // Locator for password input (uses placeholder attribute)
        this.password="//input[@placeholder='Password']";
        // Locator for the Login button (text normalized to be robust to whitespace)
        this.loginbtn="//button[normalize-space()='Login']";
    }
    async logintoapplication(){
         // Prefer admin credentials, then test user; fall back to empty string
        const user = process.env.ADMIN_USER || process.env.TEST_USER || '';
        const pass = process.env.ADMIN_PASSWORD || process.env.TEST_PASSWORD || '';
        // Fill email/username
        await this.page.fill(this.username, user);
        // Fill password
        await this.page.fill(this.password, pass);
        // Click the login button to submit the form
        await this.page.click(this.loginbtn)
        // await this.page.pause();
    }
}

module.exports=Signinpage;