const axios = require("axios");
const puppeteer = require('puppeteer');
const cheerio = require("cheerio");

const BASE_URL = "https://nswpedia.com";

async function searchGame(query) {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
    const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(res.data);

    const results = [];
    $(".soft-item").slice(0, 8).each((i, item) => {
        const container = $(item);

        const title = container.find(".soft-item-title").text().trim();

        const link = container.find("a.link-title").attr("href");

        const img =
            container.find("picture img").attr("src") ||
            container.find("picture source").attr("srcset") ||
            "";

        results.push({
            title,
            link,
            img
        });
    });
    return results;
}

async function getDownloadBlocks(gameUrl) {
    const res = await axios.get(gameUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(res.data);

    const href = $(".btn-block a").first().attr("href");
    const blocks = await getRealBlocks(href);

    return blocks;
}

async function getRealBlocks(url) {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const blocks = {};

    const rows = $(".table-download tbody tr").toArray();

    for (const row of rows) {
        const cols = $(row).find("td");
        const a = $(cols[0]).find("a");

        const name = a.text().trim();
        const downloadPageUrl = new URL(a.attr("href"), BASE_URL).href;

        const realUrl = await getRealUrl(downloadPageUrl, page);
        const host = getDomainName(realUrl);

        blocks[name] = [{
            link: realUrl,
            host
        }];
    }

    await browser.close();
    return blocks;
}


async function getRealUrl(url, page) {
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('#download-link', { timeout: 60000 });

    return await page.$eval('#download-link', el => el.href);
}


function getDomainName(url) {
    if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
    }
    const hostname = new URL(url).hostname;
    const cleanHost = hostname.replace(/^(.*\.)?([^\.]+)\.[^.]+$/, "$2");

    const parts = cleanHost.split(".");
    return parts[0].split('')[0].toUpperCase() + parts[0].split('').slice(1).join('');
}

module.exports = { searchGame, getDownloadBlocks };
