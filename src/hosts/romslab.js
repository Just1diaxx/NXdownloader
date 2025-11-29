const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://romslab.com";

async function searchGame(query) {
  const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
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


async function getDownloadBlocks(url) {
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
    const text = $(el).text().trim();

    if (!href) return;
    if (text.toLowerCase().includes("discord")) return;

    links.push({ link: href, host: text });
    blocks[text] = links;
  });

  return blocks;
}



module.exports = { searchGame, getDownloadBlocks };
