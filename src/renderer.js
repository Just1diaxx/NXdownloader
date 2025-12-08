const { ipcRenderer } = require("electron");
const HostsLoader = require("./structures/HostsLoader.js");
const hostsLoader = new HostsLoader();
let currentTaskId = 0;

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
    hostSelect.innerHTML = "";
    hostsLoader.hosts.forEach((host) => {
        const option = document.createElement("option");
        option.value = host.name;
        option.textContent = host.name;
        hostSelect.appendChild(option);
    });

    const resultsContainer = document.getElementById("results");

    form.addEventListener("submit", async (e) => {
        currentTaskId++;
        const taskId = currentTaskId;
        e.preventDefault();
        resultsContainer.innerHTML = `<p>Searching on ${hostSelect.value}...</p>`;
        const host = hostsLoader.hosts.get(hostSelect.value);

        const query = input.value.trim();
        if (!query) return;

        try {
            const results = await host.searchGame(query);
            if (taskId !== currentTaskId) return;
            if (!results.length) {
                resultsContainer.innerHTML = "<p>No results.</p>";
                return;
            }

            resultsContainer.innerHTML = "";

            results.slice(0, 8).forEach((game) => {
                const taskId = currentTaskId;
                const card = document.createElement("div");
                card.className = "game-card";

                const img = document.createElement("img");
                img.src = game.img || "";
                img.alt = game.title;

                const title = document.createElement("p");
                title.textContent = game.title;

                card.appendChild(img);
                card.appendChild(title);
                if (taskId !== currentTaskId) return;
                resultsContainer.appendChild(card);

                card.addEventListener("click", async () => {
                    currentTaskId++;
                    const taskId = currentTaskId;
                    resultsContainer.innerHTML = "";

                    const headerWrapper = document.createElement("div");
                    headerWrapper.style.textAlign = "center";
                    headerWrapper.style.marginBottom = "40px";

                    const topTitle = document.createElement("h2");
                    topTitle.textContent = game.title;

                    const topImg = document.createElement("img");
                    topImg.src = game.img;
                    topImg.style.width = "250px";
                    topImg.style.borderRadius = "10px";
                    topImg.style.marginTop = "10px";

                    headerWrapper.appendChild(topTitle);
                    headerWrapper.appendChild(topImg);
                    resultsContainer.appendChild(headerWrapper);

                    const blocks = await host.getDownloadBlocks(game.link);
                    if (taskId !== currentTaskId) return;

                    if (!Object.keys(blocks).length) {
                        resultsContainer.innerHTML = "<p>No download links found.</p>";
                        return;
                    }

                    const blocksWrapper = document.createElement("div");
                    blocksWrapper.style.display = "grid";
                    blocksWrapper.style.gridTemplateColumns = "repeat(auto-fit, minmax(420px, 1fr))";
                    blocksWrapper.style.gap = "40px";
                    resultsContainer.appendChild(blocksWrapper);

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

                            const copyBtn = document.createElement("span");
                            copyBtn.className = "host-badge";
                            copyBtn.textContent = "📋";
                            copyBtn.style.cursor = "pointer";

                            copyBtn.addEventListener("click", () => {
                                navigator.clipboard.writeText(l.link);
                                copyBtn.textContent = "✅";
                                setTimeout(() => (copyBtn.textContent = "📋"), 600);
                            });

                            item.appendChild(link);
                            item.appendChild(copyBtn);
                            item.appendChild(badge);

                            blockDiv.appendChild(item);
                        });
                        if (taskId !== currentTaskId) return;
                        blocksWrapper.appendChild(blockDiv);
                    }
                });
            });
        } catch (err) {
            console.error(err);
            resultsContainer.innerHTML = "<p>Error occurred while searching.</p>";
        }
    });
});
