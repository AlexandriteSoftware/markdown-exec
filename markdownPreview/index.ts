import { renderExecBlocksInElement } from './exec';

function init() {
    const config = {
        timeout : 3,
        script : '',
        error : ''
    };

    try {
        const configSpan = document.getElementById('markdown-exec');
        const timeout = parseInt(configSpan?.dataset.timeout ?? '3');
        const encodedScript = configSpan?.dataset.script ?? '';
        const script = atob(encodedScript);

        config.timeout = timeout;
        config.script = script;
    } catch (error) {
        config.error = '' + error;
    }

    renderExecBlocksInElement(
        config,
        document.body,
        (container, content) => {
            container.innerHTML = content;
        });
}

window.addEventListener('vscode.markdown.updateContent', init);

init();
