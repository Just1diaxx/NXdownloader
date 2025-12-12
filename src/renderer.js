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
    document.body.innerHTML = "";

    const container = document.createElement("div");
    container.className = "container";

    const header = document.createElement("div");
    header.className = "app-header";

    const brand = document.createElement("div");
    brand.className = "brand";
    const logo = document.createElement("img");
    logo.src = "logo.png";
    logo.className = "app-logo";
    const title = document.createElement("span");
    title.className = "app-title";
    title.textContent = "NX Downloader";
    brand.appendChild(logo);
    brand.appendChild(title);

    const controls = document.createElement("div");
    controls.className = "controls";
    const hostSelect = document.createElement("select");
    hostSelect.id = "host-select";
    const guideBtn = document.createElement("button");
    guideBtn.id = "guide-btn";
    guideBtn.className = "guide-btn";
    guideBtn.textContent = "How to Merge Multiple Files";
    controls.appendChild(hostSelect);
    controls.appendChild(guideBtn);

    header.appendChild(brand);
    header.appendChild(controls);

    const hero = document.createElement("div");
    hero.className = "hero";
    const form = document.createElement("form");
    form.id = "search-form";
    form.className = "search";
    const input = document.createElement("input");
    input.type = "text";
    input.id = "search-input";
    input.placeholder = "Insert a game title";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Search";
    form.appendChild(input);
    form.appendChild(submit);
    hero.appendChild(form);

    const guide = document.createElement("div");
    guide.id = "guide";
    guide.className = "guide";
    guide.innerHTML = `<div class="guide-title">Guide: How to Merge Multiple Files</div>
        <ol class="guide-list">
            <li>Download all parts from the same host</li>
            <li>Extract the files and insert them into a folder</li>
            <li>Rename them in numbers, like 00, 01, 02, 03...</li>
            <li>Download <a class="copy-link" style="color: #007bff;" href="https://github.com/dezem/SAK/releases" target="_blank">SKA tool</a></li>
            <li>Use XCI/NSP merge, in base of the version you choose</li>
            <li>Select the 00 file from the folder where you inserted the files.</li>
            <li>Click Merge</li>
            <li>The full NSP file will appear in the folder where you inserted the files!</li>
        </ol>`;

    const resultsContainer = document.createElement("div");
    resultsContainer.id = "results";

    container.appendChild(header);
    container.appendChild(hero);
    container.appendChild(guide);
    container.appendChild(resultsContainer);
    document.body.appendChild(container);
    const toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
    const notifyCopied = () => {
        toast.textContent = "Copied✅";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 1200);
    };

    hostsLoader.hosts.forEach((host) => {
        const option = document.createElement("option");
        option.value = host.name;
        option.textContent = host.name;
        hostSelect.appendChild(option);
    });

    guideBtn.addEventListener("click", (e) => {
        e.preventDefault();
        guide.classList.toggle("show");
        guide.style.display = guide.classList.contains("show") ? "block" : "none";
    });

    const skaLink = guide.querySelector("a.copy-link");
    if (skaLink) {
        skaLink.addEventListener("click", (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(skaLink.href).then(() => notifyCopied());
        });
    }

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
                                navigator.clipboard.writeText(l.link).then(() => notifyCopied());
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
