const axios = require("axios");
const cheerio = require("cheerio");
const BaseHost = require("../structures/BaseHost");

class Romsim extends BaseHost {
    constructor() {
        super();
        this.name = "Romsim";
        this.baseUrl = "https://romsim.com";
    }

    async searchGame(query) {
        const url = `${this.baseUrl}/?s=${encodeURIComponent(query)}`;
        const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });

        const $ = cheerio.load(res.data);

        const results = [];

        $("#masonry-grid .container-wrapper").each((i, el) => {
            const container = $(el);

            const title = container.find(".thumb-title a").text().trim();

            const link = container.find(".all-over-thumb-link").attr("href");

            const img = container.find(".slide").attr("data-back");

            if (!title || !link) return;

            results.push({
                title,
                link: this.baseUrl + "/" + link.replace(/^\//, ""),
                img
            });
        });

        return results;
    }


    async getDownloadBlocks(url) {
        const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(res.data);

        const blocks = {};

        $('p[style*="text-align: center"]').each((_, p) => {
            if ($(p).find('strong').length === 0) return;
            if ($(p).find('a[href]').length === 0) return;

            const title = $(p).find('strong').first().text().trim();

            blocks[title] = [];

            $(p).find('a[href]').each((_, a) => {
                let href = $(a).attr('href');
                if (href.startsWith('//')) href = 'https:' + href;

                blocks[title].push({
                    host: $(a).text().trim(),
                    link: href
                });
            });
        });

        return blocks;
    }
}

module.exports = Romsim;