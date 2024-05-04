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

                const url = tab.url

                const response = await fetch(url)
                if (!response.ok) {
                    alert('Response is not OK')
                    return
                }
                const htmlContent = await response.text()

                const parser = new DOMParser()
                const document = parser.parseFromString(
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

                const content = extractTextContent(article)
                console.log(content)
            },
        )
    })
})


/**
 *
 * @param element {ChildNode}
 * @returns {string|string}
 */
function extractTextContent(element) {
    let content = ''

    for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
            // console.log(child.parentElement.nodeName, child.textContent)
            // content += child.textContent + '\n\n'
            content += getMarkdownContentFromElement(child.parentElement.nodeName, child.textContent)
        }
        if (child.hasChildNodes()) {
            content += extractTextContent(child)
        }
    }

    return content
}

const htmlToMarkdownMap = {
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
 *
 * @param element
 * @param text
 * @return {*|string}
 */
function getMarkdownContentFromElement(element, text) {
    if (htmlToMarkdownMap.hasOwnProperty(element)) {
        return htmlToMarkdownMap[element].replace('?', text.trim())
    }

    return text + '\n\n'
}