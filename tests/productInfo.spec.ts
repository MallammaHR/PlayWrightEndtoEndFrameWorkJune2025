//import { test, expect } from '@playwright/test';
import { test, expect } from '../fixtures/basefixture';
//import { LoginPage } from '../pages/LoginPage';
//import { HomePage } from '../pages/HomePage';
import { ResultsPage } from '../pages/ResultsPage';
import { ProductInfoPage } from '../pages/ProductInfoPage';


//tagging : npx playwright test tests/ProductInfo.spec.ts --grep '@sanity'

const search = [
    {searchkey: 'macbook', productname: 'MacBook Pro', imagecount: 4,brand:'Apple', productcode:'Product 18',rewardpoints:'800',availability:'Out Of Stock',price:'$2,000.00',extaxprice:'$2,000.00'},
    {searchkey: 'macbook', productname: 'MacBook Air', imagecount: 4,brand:'Apple', productcode:'Product 17',rewardpoints:'700',availability:'Out Of Stock',price:'$1,202.00',extaxprice:'$1,000.00'},
    {searchkey: 'samsung', productname: 'Samsung Galaxy Tab 10.1', imagecount: 7,productcode:'SAM1',rewardpoints:'1000',availability:'Pre-Order',price:'$241.99',extaxprice:'$199.99'},
];

for (const product of search) {

    test(`verify product Header ${product.productname}`,{tag:['@product','@sanity','@regression']}, async ({ homePage }) => {

        // let loginPage = new LoginPage(page);
        // await loginPage.goToLoginPage();
        // let homePage: HomePage = await loginPage.doLogin('pwtest@nal.com', 'test123');

        const resultsPage: ResultsPage = await homePage.doSearch(product.searchkey); 
        const productInfoPage: ProductInfoPage = await resultsPage.selectProduct(product.productname);    
        expect(await productInfoPage.getProductHeader()).toBe(product.productname);

    });

    test(`verify product Images ${product.productname} : ${product.imagecount}`,{tag:['@product','@sanity']}, async ({ homePage }) => {

        // let loginPage = new LoginPage(page);
        
        // await loginPage.goToLoginPage();
        // let homePage: HomePage = await loginPage.doLogin('pwtest@nal.com', 'test123');

        const resultsPage: ResultsPage = await homePage.doSearch(product.searchkey);
        const productInfoPage: ProductInfoPage = await resultsPage.selectProduct(product.productname);
        expect(await productInfoPage.getProductImagesCount()).toBe(product.imagecount);

    });

    test(`verify product MetaData : ${product.productname}  `, async ({ homePage }) => {

        // let loginPage = new LoginPage(page); 
        // await loginPage.goToLoginPage();
        // let homePage: HomePage = await loginPage.doLogin('pwtest@nal.com', 'test123');
        const resultsPage: ResultsPage = await homePage.doSearch(product.searchkey);  
        const productInfoPage: ProductInfoPage = await resultsPage.selectProduct(product.productname);  
        const actualProductFullDetails = await productInfoPage.getProductDetails();     
        expect.soft(actualProductFullDetails.get('header')).toBe(product.productname);
        expect.soft(actualProductFullDetails.get('Brand')).toBe(product.brand);
        expect.soft(actualProductFullDetails.get('Product Code')).toBe(product.productcode);
        expect.soft(actualProductFullDetails.get('Reward Points')).toBe(product.rewardpoints);
        expect.soft(actualProductFullDetails.get('Availability')).toBe(product.availability);
    });


    test(`verify product Pricing: ${product.productname} and ${product.brand}`, async ({ homePage }) => {
        // let loginPage = new LoginPage(page);
        // await loginPage.goToLoginPage();
        // let homePage: HomePage = await loginPage.doLogin('pwtest@nal.com', 'test123');
        const resultsPage: ResultsPage = await homePage.doSearch(product.searchkey);
        const productInfoPage: ProductInfoPage = await resultsPage.selectProduct(product.productname); 
        const actualProductFullDetails = await productInfoPage.getProductDetails();
        expect.soft(actualProductFullDetails.get('header')).toBe(product.productname);
        expect.soft(actualProductFullDetails.get('price')).toBe(product.price);
        expect.soft(actualProductFullDetails.get('extaxprice')).toBe(product.extaxprice);

    });

}