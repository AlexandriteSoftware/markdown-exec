import * as mdItContainer from 'markdown-it-container';

const pluginKeyword = 'exec';
const tokenTypeInline = 'inline';
const ttContainerOpen = 'container_exec_open';
const ttContainerClose = 'container_exec_close';

export function extendMarkdownItWithExec(
    md: any,
    config: { languageIds(): readonly string[] })
{
    md.use(
        mdItContainer,
        pluginKeyword,
        {
            anyClass: true,
            validate: (info: string) => info.trim() === pluginKeyword,
            render: (tokens: any[], idx: number) => {
                const token = tokens[idx];

                let src = '';
                if (token.type === ttContainerOpen) {
                    for (let i = idx + 1; i < tokens.length; i++) {
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

                        // Code can be triggered multiple times, even if tokens are
                        // not updated (eg. on editor losing and regaining focus).
                        // Content must be preserved, so src can be realculated
                        // in such instances.
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

    md.options.highlight = (code: string, lang: string) => {
        const reg = new RegExp('\\b(' + config.languageIds().map(escapeRegExp).join('|') + ')\\b', 'i');
        if (lang && reg.test(lang)) {
            return `<pre style="all:unset;"><div class="${pluginKeyword}">${preProcess(code)}</div></pre>`;
        }
        return highlight(code, lang);
    };

    return md;
}

function preProcess(source: string): string {
    return source
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\n+$/,'')
        .trimStart();
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}