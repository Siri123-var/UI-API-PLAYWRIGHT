const { expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

class ContactPage {
  constructor(page) {
    this.page = page;
    this.name = page.locator("input[placeholder='Name']");
    this.email = page.locator("input[placeholder='Email']");
    this.subject = page.locator("input[placeholder='Subject']");
    this.message = page.locator("textarea#message");
    this.uploadInput = page.locator("input[name='upload_file']");
    this.submitBtn = page.locator("input[name='submit']");
    this.successMsg = page.locator("//div[@class='status alert alert-success']");
    this.okBtn = page.locator("//span[normalize-space()='Home']");
  }

  async goto() {
    const base = process.env.BASE_URL || 'https://automationexercise.com';
    await this.page.goto(`${base}/contact_us`);
    await this.page.waitForLoadState('networkidle');
  }

  async fillForm({ name, email, subject, message }) {
    await this.name.fill(name);
    await this.email.fill(email);
    await this.subject.fill(subject);
    await this.message.fill(message);
  }

  async uploadFile(fileName) {
    if (!fileName) return;
    const filePath = path.resolve('uploads', fileName);
    if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
    await this.uploadInput.setInputFiles(filePath);
  }
  async submitAndVerify(rec = {}) {
    const timeout = Number(process.env.TIMEOUT) || 15000;

    // click and accept dialog reliably
    const [dialog] = await Promise.all([
      this.page.waitForEvent('dialog').catch(() => null),
      this.submitBtn.click()
    ]);
    if (dialog) await dialog.accept().catch(() => {});

    // only assert when record expects success
    if (rec.expectedResult && String(rec.expectedResult).toLowerCase() === 'success') {
      await this.successMsg.waitFor({ state: 'visible', timeout });
      await expect(this.successMsg).toContainText('Success! Your details have been submitted successfully.', { timeout });

      if (await this.okBtn.count() > 0) {
        await Promise.all([
          this.page.waitForNavigation({ timeout, waitUntil: 'load' }).catch(() => null),
          this.okBtn.first().click()
        ]);
      }
    }
  }
  //  async submitAndVerify() {
  //   await this.page.click("input[name='submit']");
  //   // await this.page.waitforTimeout(5000);
  //   if(rec.expectedResult && rec.expectedResult.toLowerCase() === 'success'){
  //     this.page.once('dialog', dialog => dialog.accept());
  //     await expect(this.successMsg).toBeVisible({ timeout: 10000 });
  //     await expect(this.successMsg).toContainText('Success! Your details have been submitted successfully.', { timeout: 10000 });}
  //   }

  //   const timeout = Number(process.env.TIMEOUT) || 15000;
  //   const [dialog] = await Promise.all([
  //     this.page.waitForEvent('dialog').catch(() => null),
  //     this.submitBtn.click()
  //   ]);
  //   if (dialog) await dialog.accept().catch(() => {});
  //   await this.successMsg.waitFor({ state: 'visible', timeout });
  //   await expect(this.successMsg).toContainText('Success! Your details have been submitted successfully.', { timeout });
  //   if (await this.okBtn.count() > 0) {
  //     await Promise.all([
  //       this.page.waitForNavigation({ timeout, waitUntil: 'load' }).catch(() => null),
  //       this.okBtn.click()
  //     ]);
  //   }
  //   await this.page.waitForLoadState('networkidle').catch(() => {});
  // }
}

module.exports = ContactPage;