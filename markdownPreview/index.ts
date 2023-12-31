import { renderExecBlocksInElement } from './exec';

function init() {
    console.log('init');
    renderExecBlocksInElement(document.body, (container, content) => {
        container.innerHTML = content;
    });
}

window.addEventListener('vscode.markdown.updateContent', init);

init();
