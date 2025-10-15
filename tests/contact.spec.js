// const { test } = require('@playwright/test');
// const ContactPage = require('../pages/contact');
// const fs = require('fs');
// const path = require('path');
// const { parse } = require('csv-parse/sync'); // npm.cmd install csv-parse --save-dev

// const csvPath = path.resolve(__dirname, '../datadriventest/testdata.csv');
// const records = fs.existsSync(csvPath)
//   ? parse(fs.readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true, trim: true })
//   : [];

// for (const record of records) {
//   test(`Contact Form - ${record.name || record.email}`, async ({ page }) => {
//     const contact = new ContactPage(page);
//     await contact.goto();
//     await contact.fillForm(record);
//     await contact.uploadFile(record.file);
//     await contact.submitAndVerify();
//   });
// }