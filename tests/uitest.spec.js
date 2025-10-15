const {test,expect}=require('@playwright/test');
const  Signinpage  = require('../pages/login');
const Contactpage = require('../pages/contact');
const TestcasePage = require('../pages/testcase');
const fs = require('fs');
const path = require('path');


test.setTimeout(120000); // 2 minutes

// npm install csv-parse --save-dev


let parse;
try { ({ parse } = require('csv-parse/sync')); } catch (e) { parse = null; }



test('Login Application - Authentication & login flows',async ({page})=>{
    
        await page.goto(process.env.BASE_URL);
        await page.locator("//a[normalize-space()='Signup / Login']").click();
        await page.waitForLoadState('networkidle');
        // await page.locator("//a[normalize-space()='Signup / Login']").click();
        const signin=new Signinpage(page);
        await signin.logintoapplication();
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

        await page.goto('https://automationexercise.com/test_cases');
        await page.waitForLoadState('networkidle');
        const tc = new TestcasePage(page);
        await tc.printHeadings('.panel-group .panel-title a');
        await tc.getBrandNames();
        await tc.printBrandNames();
        await tc.verifyproductpage();
        await tc.subscription();

    });


// Note: Adjust the timeout values and selectors as per your application's performance and structure
// Note: Adjust the timeout values and selectors as per your application's performance and structur
