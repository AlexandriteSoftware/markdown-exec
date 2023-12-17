async function renderExecElement(mermaidContainer: HTMLElement, writeOut: (mermaidContainer: HTMLElement, content: string) => void) {
    const containerId = `mermaid-container-${crypto.randomUUID()}`;
    mermaidContainer.id = containerId;

    const id = `mermaid-${crypto.randomUUID()}`;
    const source = mermaidContainer.textContent ?? '';
    mermaidContainer.innerHTML = '';

    try {
        const renderResult = eval(source);
        writeOut(mermaidContainer, renderResult);
        renderResult.bindFunctions?.(mermaidContainer);
    } catch (error) {
        if (error instanceof Error) {
            const errorMessageNode = document.createElement('pre');
            errorMessageNode.className = 'mermaid-error';
            errorMessageNode.innerText = error.message;
            writeOut(mermaidContainer, errorMessageNode.outerHTML);
        }

        throw error;
    }
}

export async function renderExecBlocksInElement(root: HTMLElement, writeOut: (container: HTMLElement, content: string) => void): Promise<void> {
    // Delete existing mermaid outputs
    for (const el of document.querySelectorAll('.exec > svg')) {
        el.remove();
    }
    for (const svg of document.querySelectorAll('svg')) {
        if (svg.parentElement?.id.startsWith('dmermaid')) {
            svg.parentElement.remove();
        }
    }

    for (const execContainer of root.getElementsByClassName('exec')) {
        await renderExecElement(execContainer as HTMLElement, writeOut);
    }
}