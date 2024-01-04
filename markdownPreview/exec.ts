var JSI = require('./lib/interpreter');

async function renderExecElement(
    config : { timeout: number, script: string, error: string },
    container: HTMLElement,
    writeOut: (container: HTMLElement, content: string) => void)
{
    const containerId = `exec-container-${crypto.randomUUID()}`;
    container.id = containerId;

    const source = config.script + ';\n' + (container.textContent ?? '');
    container.innerHTML = '';

    if (config.error != '')
        writeOut(container, config.error);

    try {
        await evaluate(source, config.timeout, value => writeOut(container, value));
        //result.bindFunctions?.(container);
    } catch (error) {
        const errorMessageNode = document.createElement('pre');
        errorMessageNode.className = 'exec-error';
        errorMessageNode.innerText = '' + error;
        writeOut(container, errorMessageNode.outerHTML);
    }
}

function evaluate(
        source : string,
        timeout : number,
        write: (content: string) => void)
    : Promise<any>
{
    // trim trailing newline (semicolon insertion makes last line an empty statement)
    const code = source.trimEnd();

    const interpreter = new JSI.Interpreter(code);

    // use native support for regular expressions
    interpreter.REGEXP_MODE = 1;

    // if no timeout, just run the interpreter to completion
    // and return the result
    if (timeout === 0 || typeof timeout === 'undefined') {
        interpreter.run();
        write(interpreter.value);
        return Promise.resolve(null);
    }

    // otherwise, run the interpreter in steps until it completes
    // but no longer than the timeout

    const startTime = (Date.now() / 1000) | 0;
    let currentTime = (startTime / 1000) | 0;

    while (true) {
        const now = (Date.now() / 1000) | 0;

        if (currentTime != now) {
            currentTime = now;
            // next second tick
            // write('working...');
        }

        if (currentTime - startTime > timeout) {
            return Promise.reject(new Error(`Timeout after ${timeout}s`));
        }

        try {
            const result = interpreter.step();
            if (!result) {
                write(interpreter.value);
                return Promise.resolve(null);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export async function renderExecBlocksInElement(
        config : { timeout: number, script: string, error: string },
        root: HTMLElement,
        writeOut: (container: HTMLElement, content: string) => void)
    : Promise<void>
{
    // Delete existing outputs
    for (const element of document.querySelectorAll('.exec > *'))
        element.remove();

    for (const element of root.getElementsByClassName('exec'))
        await renderExecElement(config, element as HTMLElement, writeOut);
}
