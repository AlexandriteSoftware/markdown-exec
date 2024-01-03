import { extendMarkdownItWithExec } from './exec';
import * as vscode from 'vscode';
import { globSync } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

const configSection = 'markdown-exec';
let outputChannel: vscode.OutputChannel | null = null;

export function activate(ctx: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Markdown Preview Exec');

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
        const patterns = vscode.workspace.getConfiguration(configSection).get('include') as any;
        const script = includeScripts(patterns);
        const encodedScript = Buffer.from(script).toString('base64')
        log(`injectConfiguration: encodedScript = ${encodedScript}`);
        return `<span id="${configSection}"
                    aria-hidden="true"
                    data-timeout="${timeout}"
                    data-script="${encodedScript}"></span>
                ${render.apply(md.renderer, arguments)}`;
    };
    return md;
}

function includeScripts(patterns: string[]) {
    log(`includeScripts: patterns = ${patterns.join(', ')}`);
    const wsRoot = vscode.workspace.workspaceFolders?.[0];
    const rootFolder = wsRoot?.uri.fsPath ?? '.';
    const scripts = globSync(patterns, { cwd: rootFolder });
    return scripts.map(item => {
        const itemPath = path.join(rootFolder, item);
        return fs.readFileSync(itemPath, 'utf8');
    }).join('\n');
}

function log(message: string) {
    outputChannel?.appendLine(message);
}