const fs = require('fs');

class HostsLoader {
    constructor() {
        this.hosts = new Map();
        this.init()
    }

    load(hostName) {
        const host = require(`${process.cwd()}/src/hosts/${hostName}`);
        const instance = new host();
        this.hosts.set(host.name, instance);
    }

    isLoaded(hostName) {
        return !!this.hosts.has(hostName);
    }

    init() {
        const routes = fs.readdirSync(process.cwd() + "/src/hosts").filter(file => file.endsWith(".js"));
        routes.forEach(file => {
            if (!this.isLoaded(file.split(".")[0])) {
                this.load(file)
            }
        }
        );
    }
}

module.exports = HostsLoader;