document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('clip-button')

    button.addEventListener('click', function () {
        console.log('Clip button click')

        chrome.tabs.query(
            { active: true, currentWindow: true },
            async function (tabs) {
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
                    'text/html'
                )

                const article = document.querySelector('article')
                if (!article) {
                    alert('Nothing to capture')
                    return
                }
                console.log(article)

                let content = ''
                for (const childNode of article.childNodes) {
                    console.log(childNode.nodeName, childNode.nodeValue)
                }
            }
        )
    })
})
