class Signinpage{
    constructor(page){
        this.page=page;
        this.username="//input[@data-qa='login-email']";
        this.password="//input[@placeholder='Password']";
        this.loginbtn="//button[normalize-space()='Login']";
    }
    async logintoapplication(){
        const user = process.env.ADMIN_USER || process.env.TEST_USER || '';
        const pass = process.env.ADMIN_PASSWORD || process.env.TEST_PASSWORD || '';
        // allow optional overrides if callers pass credentials
        await this.page.fill(this.username, user);
        await this.page.fill(this.password, pass);
        await this.page.click(this.loginbtn)
        // await this.page.pause();
    }
}

module.exports=Signinpage;