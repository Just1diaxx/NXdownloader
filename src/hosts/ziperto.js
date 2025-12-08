const axios = require("axios");
const cheerio = require("cheerio");
const BaseHost = require("../structures/BaseHost");

class Ziperto extends BaseHost {
    constructor() {
        super();
        this.name = "Ziperto";
        this.baseUrl = "https://ziperto.com";
    }

    async searchGame(query) {
        const url = `${this.baseUrl}/?s=${encodeURIComponent(query)}`;

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

    async getDownloadBlocks(url) {
        const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(res.data);

        const blocks = {};

        $("strong").each((i, strong) => {
            const raw = $(strong).text().trim();

            const isValid =
                /(download|links|update)/i.test(raw) &&
                !/(required|firmware|title id|publisher|developer)/i.test(raw);

            if (!isValid) return;

            let el = $(strong);
            let foundLinksBlock = null;

            while (el.length && !foundLinksBlock) {
                el = el.next();

                if (!el.length) break;

                const links = el.find("a[href]").filter((_, a) => {
                    const href = $(a).attr("href");
                    return href.includes("ouo.io") || href.includes("shortnest.com");
                });

                if (links.length > 0) {
                    foundLinksBlock = el;
                }
            }

            if (!foundLinksBlock) return;

            const links = [];

            foundLinksBlock.find("a[href]").each((_, a) => {
                const href = $(a).attr("href");
                if (!href.includes("ouo.io") && !href.includes("shortnest.com")) return;

                links.push({
                    host: $(a).text().trim(),
                    link: href
                });
            });

            if (links.length) {
                blocks[raw] = links;
            }
        });

        return blocks;
    }
}

module.exports = Ziperto;