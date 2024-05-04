class MarkdownParser {
    #htmlToMarkdownMap = {
        'H1': '# ?\n\n',
        'H2': '## ?\n\n',
        'H3': '### ?\n\n',
        'H4': '#### ?\n\n',
        'H5': '##### ?\n\n',
        'H6': '###### ?\n\n',
        'B': '**?**',
        'STRONG': '**?**',
        'I': '*?*',
        'EM': '*?*',
        'U': '<u>?</u>',
        'S': '~~?~~',
        'DEL': '~~?~~',
        'CODE': '`?`',
        'PRE': '```\n?\n```',
        'BLOCKQUOTE': '> ?\n\n',
        'P': '<p>\n?\n</p>\n\n',
        'UL': '<ul>\n?\n</ul>\n\n',
        'OL': '<ol>\n?\n</ol>\n\n',
        'LI': '- ?\n',
        'A': '[?](?)',
    }

    /**
     * Get text content from the give Node list
     *
     * @param element {ChildNode}
     * @returns {string|string}
     */
    extractTextContent(element) {
        let content = ''

        for (const child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
                content += this.getMarkdownContentFromElement(child.parentElement.nodeName, child.textContent)
            }
            if (child.hasChildNodes()) {
                content += this.extractTextContent(child)
            }
        }

        return content
    }


    /**
     * Get Markdown Equivalent text from text and node name
     *
     * @param element {string} "Name of the element"
     * @param text {string} "Text content of the element"
     * @return {string}
     */
    getMarkdownContentFromElement(element, text) {
        if (this.#htmlToMarkdownMap.hasOwnProperty(element)) {
            return this.#htmlToMarkdownMap[element].replace('?', text.trim())
        }

        return text + '\n\n'
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clip-button')

    button.addEventListener('click', function() {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            async function(tabs) {
                const tab = tabs?.[0]

                if (!tab) {
                    console.log('No tab found')
                    return
                }

                const response = await fetch(tab.url)
                if (!response.ok) {
                    // TODO: Show Error message in the popup
                    alert('Response is not OK')
                    return
                }
                const htmlContent = await response.text()

                const document = new DOMParser().parseFromString(
                    htmlContent,
                    'text/html',
                )

                const pageTitle = document.title ?? ''
                console.log('Page Title:', pageTitle)

                const article = document.querySelector('article')
                if (!article) {
                    alert('Nothing to capture')
                    return
                }

                const parser = new MarkdownParser()
                const content = parser.extractTextContent(article)
                console.log(content)
            },
        )
    })
})
