/**
 * This script is executed in the context of the Markdown Preview.
 * It does not have access to the VS Code API.
 */

import { renderExecBlocksInElement } from './exec';

let loggerContainer : HTMLDivElement | null = null;
const logger = { info : (message : string) => {} };
logger.info = (message : string) => {
    loggerContainer?.appendChild(document.createElement('pre'))
        .appendChild(document.createTextNode(message));
};

function init() {
    if (loggerContainer === null) {
        loggerContainer = document.createElement('div');
        loggerContainer.id = 'markdown-exec-logger';
        document.body.insertBefore(loggerContainer, document.body.firstChild);
    }

    loggerContainer.innerHTML = '';

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
            const fragment = container.appendChild(document.createElement('div'));
            fragment.innerHTML = content;
        });
}

window.addEventListener('vscode.markdown.updateContent', init);

init();
