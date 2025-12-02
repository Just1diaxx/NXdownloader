const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://ziperto.com";

async function searchGame(query) {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;

    const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(res.data);

    const results = [];

    $(".post-list article").each((i, article) => {
        const container = $(article);

        const title = container.find(".post-title a").text().trim();

        const link = container.find(".post-title a").attr("href");

        const img =
            container.find(".post-thumbnail img").attr("src") ||
            container.find(".post-thumbnail img").attr("data-src") ||
            "";

        if (!title.toLowerCase().includes("switch")) return;

        results.push({
            title,
            link,
            img
        });
    });

    return results;
}

async function getDownloadBlocks(url) {
    const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(res.data);

    const blocks = {};

    $("p strong").each((i, strong) => {
        const title = $(strong).text().trim();

        if (!/download|update|dlc/i.test(title)) return;

        const nextP = $(strong).closest("p").nextAll("p").first();

        const links = [];

        nextP.find("a[href], a[href]").each((_, a) => {
            const link = $(a).attr("href").trim();
            if (!/shortnest\.com/.test(link) && !link.includes("ouo.io")) return;

            links.push({
                host: $(a).text().trim(),
                link
            });
        });

        if (links.length) {
            blocks[title] = links;
        }
    });

    return blocks;
}

module.exports = { searchGame, getDownloadBlocks };