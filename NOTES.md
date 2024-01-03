# NOTES

## eval

eval is not allowed in the markdown preview in Strict mode.

Even when with a lesser security policy, the preview script cannot access node's APIs such as require, fs, vm, etc.

Also right now there is no way to pass data from the preview script to the extension with JS even with relaxed security policy. The only known way is to use IP transport (HTTP or WebSocket).

This is discussed here: <https://github.com/microsoft/vscode-discussions/discussions/981>.

See also:

- <https://github.com/microsoft/vscode/issues/174080>

This extension can expose HTTP or HTTPS endpoint, and the preview script can send requests to it in order to execute the code.

The Live Preview extension can be used as an example:

- <https://github.com/microsoft/vscode-livepreview>

## Extension

The structure of this extension follows <https://github.com/mjbvz/vscode-markdown-mermaid>.

The notebook support is removed, because the notebook supports code blocks naturally.
