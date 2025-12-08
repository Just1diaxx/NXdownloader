const axios = require("axios");
const cheerio = require("cheerio");
const BaseHost = require("../structures/BaseHost");

class Romslab extends BaseHost {
  constructor() {
    super();
    this.name = "Romslab";
    this.baseUrl = "https://romslab.com";
  }

  async searchGame(query) {
    const url = `${this.baseUrl}/?s=${encodeURIComponent(query)}`;
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
    });

    const $ = cheerio.load(res.data);
    const results = [];

    $("li.post-item").slice(0, 8).each((i, el) => {
      const titleEl = $(el).find("a.post-title");
      const link = titleEl.attr("href");
      const title = titleEl.text().trim();

      const imgEl = $(el).find("a.thumb-image img");
      const img =
        imgEl.attr("data-src") ||
        imgEl.attr("data-lazy-src") ||
        imgEl.attr("data-original") ||
        imgEl.attr("src") ||
        "";

      results.push({ title, link, img });
    });

    return results;
  }


  async getDownloadBlocks(url) {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html",
      },
    });

    const $ = cheerio.load(res.data);

    const blocks = {};
    $(".btns a").each((i, el) => {
      const links = [];
      const href = $(el).attr("href");
      let text = $(el).text().trim();

      if (!href) return;
      if (text.toLowerCase().includes("discord")) return;
      if (text.toLowerCase() === 'download here') text = 'Base Game';

      links.push({ link: href, host: this.getDomainName(href) });
      blocks[text] = links;
    });

    return blocks;
  }

  getDomainName(url) {
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    const hostname = new URL(url).hostname;
    const cleanHost = hostname.replace(/^(.*\.)?([^\.]+)\.[^.]+$/, "$2");

    const parts = cleanHost.split(".");
    return parts[0].split('')[0].toUpperCase() + parts[0].split('').slice(1).join('');
  }
}

module.exports = Romslab;