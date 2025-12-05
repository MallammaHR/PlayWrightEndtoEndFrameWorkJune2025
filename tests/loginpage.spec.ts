import { LoginPage } from '../pages/LoginPage';
import { test, expect } from '../fixtures/basefixture'


test('verify valid login @login',
    {
        annotation: [
            { type: 'epic', description: 'EPIC 100 - Design login page for Open Cart App' },
            { type: 'feature', description: 'Login Page Feature' },
            { type: 'story', description: 'US 50 - user can login to app' },
            { type: 'severity', description: 'Blocker' },
            { type: 'owner', description: 'Naveen Khunteta'}
        ]
    }
    , async ({ homePage }) => {
        await expect(homePage.page).toHaveTitle('My Account');
        
});


test.skip('verify Invalid login @wip', async ({ page, baseURL }) => {
    //AAA
    let loginPage = new LoginPage(page);
    await loginPage.goToLoginPage(baseURL);
    await loginPage.doLogin('abcxyzzz@nal.com', 'test123456');
    const errorMesg = await loginPage.getInvalidMessage();
    expect(errorMesg).toContain('Warning: No match for E-Mail Address and/or Password.')

});