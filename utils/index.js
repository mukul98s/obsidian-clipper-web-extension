/**
 *
 * @param sourceUrl {string}
 * @param href {string}
 * @returns {string}
 */
export function getUrl(sourceUrl, href) {
    const url = new URL(sourceUrl)
    href = url.protocol + '//' + url.hostname + href
    return href
}