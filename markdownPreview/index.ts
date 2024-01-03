import { renderExecBlocksInElement } from './exec';

function init() {
    const configSpan = document.getElementById('markdown-exec');
    const timeout = parseInt(configSpan?.dataset.timeout ?? '3');

    const config = {
        timeout
    };

    renderExecBlocksInElement(
        config,
        document.body,
        (container, content) => {
            container.innerHTML = content;
        });
}

window.addEventListener('vscode.markdown.updateContent', init);

init();
