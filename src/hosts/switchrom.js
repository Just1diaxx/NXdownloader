const axios = require("axios");
const cheerio = require("cheerio");
const BaseHost = require("../structures/BaseHost");

class SwitchROM extends BaseHost {
    constructor() {
        super();
        this.name = "SwitchROM";
        this.baseUrl = "https://switchrom.net";
    }

    async searchGame(query) {
        const url = `${this.baseUrl}/?s=${encodeURIComponent(query)}`;
        const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(res.data);

        const results = [];

        $(".gb-query-loop-item").each((i, item) => {
            const container = $(item);

            const title = container.find("h2 a").text().trim();

            const link = container.find("h2 a").attr("href");

            const img =
                container.find("img").attr("src") ||
                container.find("img").attr("data-src") ||
                "";

            if (!title || !link) return;

            results.push({
                title,
                link,
                img
            });
        });

        return results;
    }

    async getDownloadBlocks(gameUrl) {
        const res = await axios.get(gameUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(res.data);

        const blocks = {};

        $("p.has-text-align-center strong").each((_, el) => {
            const titleText = $(el).text().trim();
            if (!titleText) return;

            let next = $(el).parent().next();

            while (next.length && !next.find("a[href]").length) {
                next = next.next();
            }

            if (!next.length) return;

            const links = [];

            next.find("a[href]").each((_, link) => {
                const href = $(link).attr("href");
                if (!href) return;

                const realUrl = this.cleanGoogleRedirect(href);

                links.push({
                    host: this.getDomainName(realUrl),
                    link: realUrl
                });
            });

            if (links.length > 0) {
                blocks[titleText] = links;
            }
        });

        return blocks;
    }
    cleanGoogleRedirect(url) {
        try {
            const parsed = new URL(url);
            if (parsed.hostname.includes("google.com") && parsed.searchParams.get("q")) {
                return parsed.searchParams.get("q");
            }
            return url;
        } catch {
            return url;
        }
    }

    getDomainName(url) {
        try {
            const hostname = new URL(url).hostname;
            return hostname.replace(/^www\./, "").split(".")[0];
        } catch {
            return "Unknown";
        }
    }
}

module.exports = SwitchROM;
