const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'cat-parse-client', 'dist')));

app.get('/scrape', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({  // запуск браузера
            headless: false,
            args: ['--start-maximized']
        });
        
        // класснеймы с карточкой товара, поисковой строки и запросом
        const receivedClassname = req.query.scrapeClassname;
        const receivedInputClassname = req.query.inputClassname;
        const scrapeQuery = req.query.scrapeQuery;
        const paginationNumber = req.query.paginationNumber;
        const classButtonNext = req.query.classButtonNext;

        // класснеймы с именем, ценой и id
        const props = req.query.props;
        const productName = props[0]
        const productCost = props[1]
        const productId = props[2]
        
        // ниже имитация действий в браузере
        const page = await browser.newPage();

        await page.goto(req.query.scrapeUrl, { waitUntil: 'load' });
        
        await page.setViewport({ width: 1800, height: 1080 });
        
        await page.waitForSelector(`.${receivedInputClassname}`);

        await page.click(`.${receivedInputClassname}`);
        await page.type(`.${receivedInputClassname}`, scrapeQuery);
        await page.keyboard.press('Enter');

        await page.waitForSelector(`.${receivedClassname}`);

        let togglePaginationAttempt = 0
        while (togglePaginationAttempt < paginationNumber) {
            togglePaginationAttempt += 1;
            console.log(`результаты ${togglePaginationAttempt} страницы :`);
            const result = await page.evaluate((receivedClassname, productName, productCost, productId) => {
                const foundElements = document.querySelectorAll(`.${receivedClassname}`);
                const separatedElements = Array.from(foundElements).map(element => {
                    const product = []
                    const elementName = element.querySelector(`.${productName}`)
                    const elementCost = element.querySelector(`.${productCost}`)
                    const elementId = element.querySelector(`.${productId}`)
                    if (elementName) {
                        product.push(elementName.innerText.trim())
                    }
                    if (elementCost) {
                        product.push(elementCost.innerText.trim())
                    }
                    if (elementId) {
                        product.push(elementId.innerText.trim())
                    }

                    return product.length > 0 ? product : null;
                }).filter(product => product !== null);
                return separatedElements
            }, receivedClassname, productName, productCost, productId);
            console.log(result, togglePaginationAttempt, ` страница прочитана, найдено товаров : ${result.length}`);
            await page.waitForSelector(`.${classButtonNext}`);
            await page.click(`.${classButtonNext}`);
            await page.waitForSelector(`.${receivedClassname}`);
        }
    }

    catch (error) {
        console.error("Ошибка со стороны бэкенда: ", error);
        res.status(500).send("Error scraping the website");
    }

    finally {
        browser.close();
    }

});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'cat-parse-client', 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
