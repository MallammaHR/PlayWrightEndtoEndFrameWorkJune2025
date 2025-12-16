import { Locator, Page } from '@playwright/test';
import { ElementUtil } from '../utils/ElementUtil';
import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';


export class LoginPage{
//1.page locator//object/ObjectRepository
private readonly page:Page;
private readonly eleUtil ;
private readonly emailId:Locator;
private readonly password:Locator;
private readonly loginBtn:Locator;
private readonly warningMsg : Locator;
private readonly registerLink: Locator;
    static goToLoginPage: any;

//2.page class constructor
constructor(page:Page){

    this.page = page;
    this.eleUtil =new ElementUtil(page);
    this.emailId = page.getByRole('textbox', { name: 'E-Mail Address' });
    this.password = page.getByRole('textbox', { name: 'Password' });
    this.loginBtn = page.getByRole('button', { name: 'Login' });
    this.warningMsg = page.locator('.alert.alert-danger.alert-dismissible');
    this.registerLink = page.getByRole('link', { name: 'Register' });
    
}
//3.page actions/methods

async goToLoginPage(baseURL :  string | undefined){
    await this.page.goto(baseURL+'?route=account/login');
}

async doLogin(email :string,password :string):Promise<HomePage>
{
    await this.eleUtil.fill(this.emailId,email);
    await  this.eleUtil.fill(this.password,password);
    await this.eleUtil.click(this.loginBtn,{force :true,timeout : 5000});
   

    return new HomePage(this.page);
    // let pageTitle = await this.page.title();
    // console.log('Home Page Title is :  ${pageTitle}');
    // return await this.page.title()
}

async getInvalidMessage():Promise<string | null>{
    let errorMessage = await this.eleUtil.getText(this.warningMsg);
    console.log('invalid login warning message :' +errorMessage);
    return errorMessage;
}

async navigateToRegisterPage() : Promise<RegisterPage>{
    // await this.eleUtil.click(this.registerLink , {force :true, timeout :5000}, 3);
     await this.eleUtil.click(this.registerLink, { force: true, timeout: 5000 }, 0);

     return new RegisterPage(this.page);
 }

}
