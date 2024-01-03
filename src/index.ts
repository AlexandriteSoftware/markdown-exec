import { extendMarkdownItWithExec } from './exec';
import * as vscode from 'vscode';

const configSection = 'markdown-exec';

export function activate(ctx: vscode.ExtensionContext) {
    ctx.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(configSection)
            || e.affectsConfiguration('workbench.colorTheme'))
        {
            vscode.commands.executeCommand('markdown.preview.refresh');
        }
    }));

    return {
        extendMarkdownIt(md: any) {
            extendMarkdownItWithExec(md, {
                languageIds: () => {
                    return vscode.workspace.getConfiguration(configSection).get<string[]>('languages', ['exec']);
                }
            });
            md.use(injectConfiguration);
            return md;
        }
    }
}

function injectConfiguration(md: any) {
    const render = md.renderer.render;
    md.renderer.render = function () {
        const timeoutValue = vscode.workspace.getConfiguration(configSection).get('timeout') as any;
        const timeout = parseInt(timeoutValue);
        return `<span id="${configSection}"
                    aria-hidden="true"
                    data-timeout="${timeout}"></span>
                ${render.apply(md.renderer, arguments)}`;
    };
    return md;
}
