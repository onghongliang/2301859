const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('UI Tests', function() {
    this.timeout(10000); // Increase timeout for Selenium tests
    
    let driver;
    
    before(async () => {
        driver = await new Builder()
            .forBrowser('chrome')
            .usingServer('http://localhost:4444/wd/hub')
            .build();
    });
    
    after(async () => {
        await driver.quit();
    });
    
    it('should load home page', async () => {
        await driver.get('http://localhost:3000/');
        const title = await driver.getTitle();
        expect(title).to.include('Search Form');
    });
    
    it('should detect XSS attempt', async () => {
        await driver.get('http://localhost:3000/');
        await driver.findElement(By.id('searchTerm')).sendKeys('<script>alert(1)</script>');
        await driver.findElement(By.css('button[type="submit"]')).click();
        
        // Verify we're still on home page (redirected back)
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.equal('http://localhost:3000/');
    });
    
    it('should accept safe search term', async () => {
        await driver.get('http://localhost:3000/');
        await driver.findElement(By.id('searchTerm')).sendKeys('safe search');
        await driver.findElement(By.css('button[type="submit"]')).click();
        
        // Verify we're on results page
        await driver.wait(until.elementLocated(By.css('p')), 5000);
        const resultText = await driver.findElement(By.css('p')).getText();
        expect(resultText).to.include('safe search');
    });
});