const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://nxbrew.net";

async function searchGame(query) {
  const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
  const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const $ = cheerio.load(res.data);

  const results = [];
  $("h2.post-title").each((i, el) => {
    const a = $(el).find("a");
    const img = $(el).closest(".post").find("img").attr("src") || "";
    results.push({ title: a.text().trim(), link: a.attr("href"), img });
  });
  return results;
}

async function getDownloadBlocks(gameUrl) {
  const res = await axios.get(gameUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
  const $ = cheerio.load(res.data);

  const blocks = {};
  $(".wp-block-columns").each((i, el) => {
    const blockTitle = $(el).find("strong").first().text().trim();
    if (!blockTitle) return;

    const links = [];
    $(el).find(".wp-block-column p").each((j, p) => {
      $(p).find("a[href]").each((k, a) => {
        const href = $(a).attr("href");
        const strongText = $(p).find("strong").first().text().trim();
        const hostName = strongText || $(a).text().trim() || "Unknown";
        links.push({ link: href, host: hostName });
      });
    });

    if (links.length) blocks[blockTitle] = links;
  });

  return blocks;
}

module.exports = { searchGame, getDownloadBlocks };
