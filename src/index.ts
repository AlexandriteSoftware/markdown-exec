import { extendMarkdownItWithExec } from './exec';
import * as vscode from 'vscode';
import { globSync } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

const EXTENSION_ID = 'markdown-exec';
const EXTENSION_NAME = 'Markdown Preview Exec';

let outputChannel: vscode.OutputChannel | null = null;

let logger = {
    info: (message: string) => {
        outputChannel?.appendLine(message);
    }
};

export function activate
    (ctx: vscode.ExtensionContext)
{
    if (outputChannel !== null) {
        outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
        outputChannel.show();
    }

    logger.info(
        `The extension "${EXTENSION_NAME}" (${EXTENSION_ID}) is now active.`);
    
    ctx.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(EXTENSION_ID)
            || e.affectsConfiguration('workbench.colorTheme'))
        {
            vscode.commands.executeCommand('markdown.preview.refresh');
        }
    }));

    return {
        extendMarkdownIt(md: any) {
            extendMarkdownItWithExec(md, {
                languageIds: () => {
                    return vscode.workspace.getConfiguration(EXTENSION_ID).get<string[]>('languages', ['exec']);
                }
            });
            md.use(addConfigurationInjector);
            return md;
        }
    }
}

function addConfigurationInjector
    (md: any)
{
    logger.info(`addConfigurationInjector: invoke`);

    const render = md.renderer.render;
    md.renderer.render = function () {
        const extensionConfiguration = vscode.workspace.getConfiguration(EXTENSION_ID);

        const timeoutValue = extensionConfiguration.get('timeout') as any;
        const timeout = parseInt(timeoutValue);
        const patterns = extensionConfiguration.get('include') as any;

        logger.info(`addConfigurationInjector.renderer: timeout = ${timeout}, include = ${patterns.join(', ')}`);

        const script = includeScripts(patterns);
        const encodedScript = Buffer.from(script).toString('base64')

        // prepends the rendering output with the `span` element that contains
        // configuration data for the `exec` plugin and collected scripts

        return `<span id="${EXTENSION_ID}"
                    aria-hidden="true"
                    data-timeout="${timeout}"
                    data-script="${encodedScript}"></span>
                ${render.apply(md.renderer, arguments)}`;
    };

    return md;
}

/**
 * Read all files that match the given glob patterns, wrap them into
 * a require-like function and return the resulting script.
 * 
 * The scripts only loaded from the first workspace folder.
 */
function includeScripts
    (patterns: string[])
{
    const wsRoot = vscode.workspace.workspaceFolders?.[0];
    const rootFolder = wsRoot?.uri.fsPath ?? '.';
    const scripts = globSync(patterns, { cwd: rootFolder });

    // key points:
    //
    // - script will be executed in the interpreter, so it should be ES5
    // - `require` accepts path from the worspace root folder

    const script = `var require = function (name) {
        var path = name.replace(/\\\\/g, '/').replace(/\\.js$/, '');
        var entry = require.__scripts[path];
        if (!entry) {
            throw new Error('Cannot find module ' + path);
        }
        if (!entry.loaded) {
            entry.loaded = true;
            entry.code(entry.module = { exports: {} });
        }
        return entry.module.exports;
    };
    require.__scripts = {};`;

    return script + '\n' + scripts.map(item => {
        const itemPath = path.join(rootFolder, item);
        const content = fs.readFileSync(itemPath, 'utf8');
        const itemPathStr = item.replace(/\\/g, '/').replace(/\.js$/, '');

        return `require.__scripts[\'/${itemPathStr}\'] = {
            code : function (module) {
                var exports = module.exports;
                ${content}
            }
        };`;
    }).join('\n');
}
