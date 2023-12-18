const vscode = require('vscode');
const mdItContainer = require('markdown-it-container');

const configSection = 'markdown-exec';

function activate(ctx) {
    ctx.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(configSection) || e.affectsConfiguration('workbench.colorTheme')) {
            vscode.commands.executeCommand('markdown.preview.refresh');
        }
    }));

    ctx.subscriptions.push(vscode.window.tabGroups.onDidChangeTabs(e => {
        var changed = e.changed[0];
        if (changed) {
            console.log(changed.label);
            console.log(changed.input);
        }
    }));

    return {
        extendMarkdownIt(md) {
            extendMarkdownItWithExec(md, {
                languageIds: () => {
                    return vscode.workspace.getConfiguration(configSection).get('languages', ['exec']);
                }
            });
            return md;
        }
    }
}

module.exports.activate = activate;

const pluginKeyword = 'exec';
const tokenTypeInline = 'inline';
const ttContainerOpen = 'container_' + pluginKeyword + '_open';
const ttContainerClose = 'container_' + pluginKeyword + '_close';

function extendMarkdownItWithExec(md, config) {
    md.use(mdItContainer, pluginKeyword, {
        anyClass: true,
        validate: (info) => {
            return info.trim() === pluginKeyword;
        },

        render: (tokens, idx) => {
            const token = tokens[idx];

            var src = '';
            if (token.type === ttContainerOpen) {
                for (var i = idx + 1; i < tokens.length; i++) {
                    const value = tokens[i]
                    if (value === undefined || value.type === ttContainerClose) {
                        break;
                    }
                    src += value.content;
                    if (value.block && value.nesting <= 0) {
                        src += '\n';
                    }
                    // Clear these out so markdown-it doesn't try to render them
                    value.tag = '';
                    value.type = tokenTypeInline;
                    // Code can be triggered multiple times, even if tokens are not updated (eg. on editor losing and regaining focus). Content must be preserved, so src can be realculated in such instances.
                    //value.content = ''; 
                    value.children = [];
                }
            }

            if (token.nesting === 1) {
                return `<div class="${pluginKeyword}">${preProcess(src)}`;
            } else {
                return '</div>';
            }
        }
    });

    const highlight = md.options.highlight;
    md.options.highlight = (code, lang) => {
        const reg = new RegExp('\\b(' + config.languageIds().map(escapeRegExp).join('|') + ')\\b', 'i');
        if (lang && reg.test(lang)) {
            return `<pre style="all:unset;"><div class="${pluginKeyword}">${preProcess(code)}</div></pre>`;
        }
        return highlight(code, lang);
    };
    return md;
}

function preProcess(source) {
    return source
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\n+$/,'')
        .trimStart();
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}