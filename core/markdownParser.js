import { getUrl } from '../utils/index.js'

export class MarkdownParser {
    #htmlToMarkdownMap = {
        'H1': '\n# ?\n\n',
        'H2': '\n## ?\n\n',
        'H3': '\n### ?\n\n',
        'H4': '\n#### ?\n\n',
        'H5': '\n##### ?\n\n',
        'H6': '\n###### ?\n\n',
        'B': '**?**',
        'STRONG': '**?**',
        'I': '*?*',
        'EM': '*?*',
        'U': '<u>?</u>',
        'S': '~~?~~',
        'DEL': '~~?~~',
        'CODE': '`?`',
        'PRE': '\n```\n?\n```\n',
        'BLOCKQUOTE': '> ?\n\n',
        'P': '\n?\n',
        'SPAN': '?',
        'UL': '<ul>\n?\n</ul>\n\n',
        'OL': '<ol>\n?\n</ol>\n\n',
        'LI': '\n- ?',
    }

    #inlineTags = ['a', 'abbr', 'acronym', 'b', 'cite', 'code', 'em', 'i', 'kbd', 'mark', 'q', 's', 'del', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'var', 'li', 'p']

    #headings = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    ]

    /**
     * Get text content from the give Node list
     *
     * @param element {HTMLElement|ChildNode}
     * @param tab {chrome.tabs.Tab}
     * @returns {string|string}
     */
    extractTextContent(element, tab) {
        let content = ''

        for (const child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
                content += this.getMarkdownContentFromElement(child.parentElement.nodeName, child.textContent)
            } else if (child.nodeName.toLowerCase() === 'table') {
                content += this.getMarkdownTableContent(child)
            } else if (child.nodeName.toLowerCase() === 'pre') {
                content += this.getMarkdownContentFromElement(child.nodeName, child.textContent)
            } else if (child.nodeName.toLowerCase() === 'a') {
                content += this.getMarkdownContentForLink(child, tab)
            } else if (child.nodeName.toLowerCase() === 'img') {
                content += this.getMarkdownForImage(child, tab)
            } else if (child.hasChildNodes()) {
                content += this.extractTextContent(child, tab)
            }
        }

        return content
    }


    /**
     * Get Markdown Equivalent text from text and node name
     *
     * @param nodeName {string} "Node to be converted into markdown"
     * @param text {string}
     * @return {string}
     */
    getMarkdownContentFromElement(nodeName, text) {
        if (this.#htmlToMarkdownMap.hasOwnProperty(nodeName)) {
            return this.#htmlToMarkdownMap[nodeName].replace('?', text.trim())
        }

        return '\n'
    }


    /**
     *
     * @param table {HTMLElement|ChildNode}
     * @returns string
     */
    getMarkdownTableContent(table) {
        const markdownTable = []
        const rows = table.querySelectorAll('tr')

        // TODO: Add support for markdown inside the table
        rows.forEach(row => {
            const rowData = []
            const cells = row.childNodes

            cells.forEach(cell => {
                // Replace newline characters with spaces
                const cellContent = cell.textContent.trim()
                rowData.push(cellContent)
            })

            const rowValue = rowData.filter(row => row.length > 0).join(' | ')

            const markdownRow = `| ${rowValue} |`
            markdownTable.push(markdownRow)
        })

        const headerRow = markdownTable.shift()
        let separatorRow = ''
        headerRow.split(' ').join('').split('').forEach((row, index) => {
            if (row === '|') {
                if (index === 0) separatorRow += '| '
                else if (index === headerRow.length - 1) separatorRow += ' |'
                else separatorRow += ' | '
            } else separatorRow += '-'
        })

        return ['', headerRow, separatorRow, ...markdownTable, ''].join('\n')
    }

    /**
     *
     * @param child {ChildNode|HTMLAnchorElement}
     * @param tab {chrome.tabs.Tab}
     * @returns {string}
     */
    getMarkdownContentForLink(child, tab) {
        const href = getUrl(tab.url, child.getAttribute('href'))
        let markdown = `[${child.textContent.trim()}](${href})`

        const parentTag = child.parentNode.nodeName.toLowerCase()

        const isHeadingLink = this.#headings.includes(parentTag)
        if (isHeadingLink) {
            const headingMarkdown = '#'.repeat(parseInt(parentTag.charAt(1))) + ' '
            markdown = headingMarkdown + markdown
        }

        const isInlineLink = this.#inlineTags.includes(parentTag)

        return isInlineLink ? ` ${markdown} ` : `\n\n${markdown}\n\n`
    }


    /**
     *
     * @param child {ChildNode|HTMLImageElement}
     * @param tab {chrome.tabs.Tab}
     * @returns {string}
     */
    getMarkdownForImage(child, tab) {
        const url = getUrl(tab.url, child.getAttribute('src'))
        const alt = child.getAttribute('alt') ?? child.getAttribute('title') ?? 'Image'

        return '\n' + `![${alt}](${url})` + '\n'
    }
}