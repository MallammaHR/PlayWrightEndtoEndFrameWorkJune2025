//import{test,expect} from '@playwright/test';
//import { stat } from 'fs';
import {test, expect} from '../fixtures/basefixture';
import { LoginPage } from '../pages/LoginPage';
//import { HomePage } from '../pages/HomePage';

//npm install --save-dev allure-playwright allure-commandline ---for allure installtion 
//npx allure generate allure-results --clean -o allure-report ---Generate report, clean results folder and copy report in allure-report
//npx allure open allure-report -----to open the allure report
//npm i -D playwright-html-reporter -----to open playwright html report

//tagging --after v1.32 they added this tagging, npx playwright test --grep '@login'
//tagging - exclude: --grep-invert "@sanity"

//AAA pattern
test('verify valid login @login',
    {
        annotation: [
            { type: 'epic', description: 'EPIC 100 - Design login page for Open Cart App' },
            { type: 'feature', description: 'Login Page Feature' },
            { type: 'story', description: 'US 50 - user can login to app' },
            { type: 'severity', description: 'Blocker' },
            { type: 'owner', description: 'MallammaHR'}
        ]
    }
    , async ({ homePage }) => {
        await expect(homePage.page).toHaveTitle('Account Login');
        
});

test.skip('verify Invalid login @wip', async ({ page, baseURL }) => {
    //AAA
    const loginPage = new LoginPage(page);
    await loginPage.goToLoginPage(baseURL);
    await loginPage.doLogin('abcxyzzz123@nal.com', 'test123456');
    const errorMesg = await loginPage.getInvalidLoginMessage();
    expect(errorMesg).toContain('Warning: No match for E-Mail Address and/or Password.');

});

//Common tags paatern
/**
 * @smoke :Quick sanity test
 * @regression :Full regression suite
 * @critical :Business-critical tests
 * @slow :Long-running tests
 * @flaky :Known unstable tests
 * @api :API tests
 * @ui : UI tests
 * @auth :Authentication tests
 * @p0 , @p1 ://Priority levels 
 * 
 * 
 * Run tests with specific tag : npx playwright test --grep @smoke
 * Run tests with multiple tag (OR): npx playwright test --grep @smoke | @critical
 * Run tests with all tag (AND): npx playwright test --grep "(?=.*@smoke)(?=.*@critical)"
 * Exclude specific tags: npx playwright test --grep-invert @slow
 * Combine include & exclude: npx playwright test --grep @smoke --grep-invert @flaky
 * Advance Filtering, tags smoke or critical: npx playwright test --grep "@smoke|@critical"
 * Test tags with smoke and not a slow: npx playwright test --grep @smoke --grep-invert @slow
 * Test with multiple tags: npx playwright test --grep "(?=.*smoke)(?=.*api)"
 * 
 * package.json
 * json{
 *  "scripts":{
 *      "test:smoke": "playwright test --grep @smoke",
 *      "test:regression": "playwright test --grep @regression",
 *      "test:critical": "playwright test --grep @critical",
 *      "test:no-flaky": "playwright test --grep-invert @flaky",
 * 
 *  }
 * }
 * 
 */
