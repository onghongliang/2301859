const { Builder, By, until } = require('selenium-webdriver');

(async function testSearchForm() {
    let driver = await new Builder()
        .forBrowser('chrome')
        .usingServer('http://localhost:4444/wd/hub')
        .build();
    
    try {
        // Test normal search
        await driver.get('http://localhost:3000/');
        await driver.findElement(By.id('searchTerm')).sendKeys('safe search');
        await driver.findElement(By.css('button[type="submit"]')).click();
        
        // Verify results page
        await driver.wait(until.elementLocated(By.css('p')), 5000);
        const resultText = await driver.findElement(By.css('p')).getText();
        console.log('Normal search test passed:', resultText.includes('safe search'));
        
        // Test XSS attempt
        await driver.get('http://localhost:3000/');
        await driver.findElement(By.id('searchTerm')).sendKeys('<script>alert(1)</script>');
        await driver.findElement(By.css('button[type="submit"]')).click();
        
        // Should remain on home page
        await driver.wait(until.elementLocated(By.id('searchTerm')), 5000);
        console.log('XSS protection test passed');
        
        // Test SQL injection attempt
        await driver.findElement(By.id('searchTerm')).sendKeys("1' OR '1'='1");
        await driver.findElement(By.css('button[type="submit"]')).click();
        
        // Should remain on home page
        await driver.wait(until.elementLocated(By.id('searchTerm')), 5000);
        console.log('SQL injection protection test passed');
        
    } finally {
        await driver.quit();
    }
})();