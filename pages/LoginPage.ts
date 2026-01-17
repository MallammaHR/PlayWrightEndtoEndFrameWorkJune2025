import { Locator, Page } from '@playwright/test';
import { ElementUtil } from '../utils/ElementUtil';
import { HomePage } from './HomePage';
import { RegisterPage } from './RegisterPage';


export class LoginPage{

//page locators/objects/objectRepositories

//encapsulation

    private readonly page:Page;
    private readonly eleUtil;
    private readonly emailId:Locator;
    private readonly password:Locator;
    private readonly loginBtn:string;
    private readonly warningMsg:Locator;
    private readonly registerLink:Locator;

//page class constructor
    constructor(page:Page){
        this.page=page; //current class values/proerties if you want to access then this.global=local of the constr variable
        this.eleUtil=new ElementUtil(page);
        this.emailId=page.getByRole('textbox',{name:'E-Mail Address'});
        this.password=page.getByRole('textbox',{name:'Password'});
      //  this.loginBtn=page.locator(`input[type="submit"][value="Login"]`);
        this.loginBtn='input[type="submit"][value="Login"]';
        this.warningMsg=page.locator('.alert.alert-danger.alert-dismissible');
        this.registerLink=page.getByText('Register',{exact:true});
    }

// page actions/methods

    async goToLoginPage(baseURL:string | undefined){
        await this.page.goto(baseURL+'?route=account/login');
    }

    async doLogin(email:string, password:string):Promise<HomePage>{
        await this.eleUtil.fill(this.emailId,email);
        await this.eleUtil.fill(this.password,password);
        await this.eleUtil.click(this.loginBtn,{force:true, timeout:1000);
        return new HomePage(this.page);
    }

    async getInvalidLoginMessage():Promise<string|null>{
        const errorMsge=await this.eleUtil.getText(this.warningMsg);
        console.log('Invalid Login Warning Message'+errorMsge);
        return errorMsge;
    }

    async navigateToRegisterPage():Promise<RegisterPage>{
        await this.eleUtil.click(this.registerLink,{force:true},1);
        return new RegisterPage(this.page);
    }
}