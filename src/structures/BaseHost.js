class Host {
    constructor() {
        this.name = "";
        this.baseUrl = "";
    }

    /**
     * 
     * @param {string} gameName The game name to search for
     * @returns {Promise<Array>} An array of game objects, each containing the following properties:
     * - name: The game name
     * - url: The game URL
     * - img: The game image URL
     * 
     * @example
     * [
     *  {
     *     name: "Game Name",
     *     url: "https://gameurl.com",
     *     img: "https://gameimg.com"
     *  },
     *  {
     *     name: "Game Name 2",
     *     url: "https://gameurl2.com",
     *     img: "https://gameimg2.com"
     *  }
     * ]
     */
    async searchGame(gameName) {}

    /**
     * 
     * @param {string} gameUrl The game URL taken by the searchGame() function
     * @returns {Promise<Object>} An object of download blocks, each containing an array:
     * "blockName" = [{
     *     link: "https://sigmaurl.com",
     *     host: "sigmaURLs"
     * }]
     * 
     * @example 
     * blocks = {
     *     "Direct Download": [{
     *         link: "https://coolurl.com",
     *         host: "coolURLs"
     *     }],
     *     "Mirror Download": [{
     *         link: "https://bruhurl.com",
     *         host: "bruhURLs"
     *     }]
     * }
     */
    async getDownloadBlocks(gameUrl) {}
}

module.exports = Host;