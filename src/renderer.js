const { ipcRenderer } = require("electron");

ipcRenderer.on("update_available", () => {
    alert("New update found! Downloading now...");
});

ipcRenderer.on("update_downloaded", () => {
    if (confirm("Download completed. Restart now?")) {
        ipcRenderer.send("restart_app");
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("search-form");
    const input = document.getElementById("search-input");
    const hostSelect = document.getElementById("host-select");
    const resultsContainer = document.getElementById("results");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        resultsContainer.innerHTML = `<p>Searching on ${hostSelect.value}...</p>`;
        const { searchGame, getDownloadBlocks } = require(`./hosts/${hostSelect.value.toLowerCase()}.js`);

        const query = input.value.trim();
        if (!query) return;

        try {
            const results = await searchGame(query);
            if (!results.length) {
                resultsContainer.innerHTML = "<p>No results.</p>";
                return;
            }

            resultsContainer.innerHTML = "";

            results.slice(0, 8).forEach((game) => {
                const card = document.createElement("div");
                card.className = "game-card";

                const img = document.createElement("img");
                img.src = game.img || "";
                img.alt = game.title;

                const title = document.createElement("p");
                title.textContent = game.title;

                card.appendChild(img);
                card.appendChild(title);
                resultsContainer.appendChild(card);

                card.addEventListener("click", async () => {
                    resultsContainer.innerHTML = "<p>Getting download links...</p>";

                    const blocks = await getDownloadBlocks(game.link);

                    resultsContainer.innerHTML = "";
                    resultsContainer.style.display = "grid";
                    resultsContainer.style.gridTemplateColumns = "repeat(auto-fit, minmax(420px, 1fr))";
                    resultsContainer.style.gap = "40px";

                    for (const blockTitle in blocks) {
                        const blockDiv = document.createElement("div");
                        blockDiv.className = "block";

                        const blockTitleEl = document.createElement("div");
                        blockTitleEl.className = "block-title";
                        blockTitleEl.textContent = blockTitle;

                        blockDiv.appendChild(blockTitleEl);

                        blocks[blockTitle].forEach((l) => {
                            const item = document.createElement("div");
                            item.className = "link-item";

                            const link = document.createElement("a");
                            link.target = "_blank";
                            link.textContent = l.link;

                            const badge = document.createElement("span");
                            badge.className = "host-badge";
                            badge.textContent = l.host;

                            item.appendChild(link);

                            const copyBtn = document.createElement("span");
                            copyBtn.className = "host-badge";
                            copyBtn.textContent = "📋";
                            copyBtn.style.cursor = "pointer";

                            copyBtn.addEventListener("click", () => {
                                navigator.clipboard.writeText(l.link);
                                copyBtn.textContent = "✅";
                                setTimeout(() => (copyBtn.textContent = "📋"), 600);
                            });

                            item.appendChild(copyBtn);
                            item.appendChild(badge);

                            blockDiv.appendChild(item);
                        });

                        resultsContainer.appendChild(blockDiv);
                    }
                });
            });
        } catch (err) {
            console.error(err);
            resultsContainer.innerHTML = "<p>Error while searching, check console.</p>";
        }
    });
});
