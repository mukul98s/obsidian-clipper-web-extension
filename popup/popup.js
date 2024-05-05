import { MarkdownParser } from '../core/markdownParser.js'

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
                const content = parser.extractTextContent(article, tab)
                console.log(content)
            },
        )
    })
})
