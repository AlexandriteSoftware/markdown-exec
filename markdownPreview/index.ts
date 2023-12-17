import { renderMermaidBlocksInElement as renderExecBlocksInElement } from './mermaid';

function init() {
    const configSpan = document.getElementById('markdown-exex');
    const darkModeTheme = configSpan?.dataset.darkModeTheme;
    const lightModeTheme = configSpan?.dataset.lightModeTheme;

    const config = {
        startOnLoad: false,
        theme: document.body.classList.contains('vscode-dark') || document.body.classList.contains('vscode-high-contrast')
            ? darkModeTheme ?? 'dark'
            : lightModeTheme ?? 'default'
    };

    renderExecBlocksInElement(document.body, (container, content) => {
        container.innerHTML = content;
    });
}


window.addEventListener('vscode.markdown.updateContent', init);

init();