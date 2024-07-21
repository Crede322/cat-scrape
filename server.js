const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'cat-parse-client', 'dist')));

app.get('/scrape', async (req, res) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const receivedClassName = req.query.scrapeClassName;

        await page.goto(req.query.scrapeUrl, { waitUntil: 'networkidle2' });
        await page.setViewport({ width: 1800, height: 1080 });
        
        await page.waitForSelector(`.${receivedClassName}`);
        const result = await page.evaluate((receivedClassName) => {
            const elements = document.querySelectorAll(`.${receivedClassName}`);
            const elementsData = Array.from(elements).map(element => {
                const innerTextWithClassNames = Array.from(element.childNodes).map(node => {
                    if (node.nodeType === node.TEXT_NODE) {
                        return { text: node.textContent.trim(), className: element.className };
                    } else {
                        return { text: node.innerText, className: node.className};
                    }
                })
                return innerTextWithClassNames;
            })
            return elementsData
        }, receivedClassName);

        const screenshotBuffer = await page.screenshot({ encoding: 'base64' });

        await browser.close();
        console.log("Result of scraping is", result);

        res.send(result ? { result, screenshot: screenshotBuffer } : 'Text not found');
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).send("Error scraping the website");
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'cat-parse-client', 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
