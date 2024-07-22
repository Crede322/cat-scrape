const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'cat-parse-client', 'dist')));

app.get('/scrape', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        const receivedClassname = req.query.scrapeClassname;
        const receivedInputClassname = req.query.inputClassname;
        const scrapeQuery = req.query.scrapeQuery;

        await page.goto(req.query.scrapeUrl, { waitUntil: 'networkidle2' });

        await page.setViewport({ width: 1800, height: 1080 });

        await page.waitForSelector(`.${receivedInputClassname}`);
        await page.type(`.${receivedInputClassname}`, scrapeQuery);
        await page.keyboard.press('Enter');
        await page.waitForSelector(`.${receivedClassname}`);

        const result = await page.evaluate((receivedClassname) => {
            const elements = document.querySelectorAll(`.${receivedClassname}`);
            const elementsData = Array.from(elements).map(element => {
                const innerTextWithClassnames = Array.from(element.childNodes).map(node => {
                    if (node.nodeType === node.TEXT_NODE) {
                        return { text: node.textContent.trim(), classname: element.className };
                    } else {
                        return { text: node.innerText, classname: node.className};
                    }
                })
                return innerTextWithClassnames;
            })
            return elementsData
        }, receivedClassname);

        const screenshotBuffer = await page.screenshot({ encoding: 'base64' });
        await page.screenshot({ path: 'screenshot.png' });
        console.log("Result of scraping is", result);
        
        res.send(result ? { result, screenshot: screenshotBuffer } : {screenshot: screenshotBuffer});
        await browser.close();
    }
    catch (error) {
        console.error("Ошибка со стороны бэкенда: ", error);
        res.status(500).send("Error scraping the website");
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'cat-parse-client', 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
