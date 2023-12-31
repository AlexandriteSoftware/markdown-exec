import Interpreter from 'js-interpreter';

async function renderExecElement(
    container: HTMLElement,
    writeOut: (container: HTMLElement, content: string) => void)
{
    const containerId = `exec-container-${crypto.randomUUID()}`;
    container.id = containerId;

    const source = container.textContent ?? '';
    container.innerHTML = '';

    let renderResult : string[] = [ ];

    try {
        const interpreter = new Interpreter(source.trim());
        interpreter.run();
        const result = interpreter.value;
        writeOut(container, result);
        result.bindFunctions?.(container);
    } catch (error) {
        if (error instanceof Error) {
            const errorMessageNode = document.createElement('pre');
            errorMessageNode.className = 'exec-error';
            errorMessageNode.innerText = error.message;
            renderResult.push(errorMessageNode.outerHTML);
            writeOut(container, renderResult.join('\n'));
        }

        throw error;
    }
}

export async function renderExecBlocksInElement(
        root: HTMLElement,
        writeOut: (container: HTMLElement, content: string) => void)
    : Promise<void>
{
    // Delete existing outputs
    for (const el of document.querySelectorAll('.exec > *')) {
        el.remove();
    }

    for (const container of root.getElementsByClassName('exec')) {
        await renderExecElement(container as HTMLElement, writeOut);
    }
}

function inspectObject(out : string[], value : any) {
    out.push(`inspectObject(${typeof value})`);
    try {
        switch (typeof value) {
            case 'function':
                out.push(value.toString());
                break;
            case 'object':
                for (const key in value) {
                    out.push(`${key}: ...`);
                }
                break;
            default:
                out.push(value);
                break;
        }
    }
    catch (error) {
        out.push('' + error);
    }
}

function evalObject(out : string[], expr : string) {
    out.push(`evalObject(${expr})`);
    try {
        const parts = expr.split(':');
        const imported = require(parts[0]);
        const value = imported[parts[1]];
        inspectObject(out, value);
    }
    catch (error) {
        out.push('' + error);
    }
}