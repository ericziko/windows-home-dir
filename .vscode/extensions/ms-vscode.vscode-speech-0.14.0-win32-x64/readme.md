# Speech extension for Visual Studio Code

<p align="center">
    <img src="https://github.com/microsoft/vscode/assets/900690/38106cff-2a99-4715-934c-cb1711bbf72c" alt="Logo">
</p>

The Speech extension for Visual Studio Code adds speech-to-text and text-to-speech capabilities to Visual Studio Code. No internet connection is required, the voice audio data is processed locally on your computer.

For example, you can use this extension anywhere VS Code offers chat capabilities such as with [GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat): 

![Speech to text in Visual Studio Code Chat](https://github.com/microsoft/vscode/assets/900690/63279c01-3941-46c5-bf51-284fbc31fbfe)

You can also use this extension to dictate directly into the text editor:

![Editor dictation in Visual Studio Code](https://github.com/microsoft/vscode/assets/900690/4d60fb0e-2ad9-4aca-901e-638110d61c3a)

Chat responses can be read out aloud if you prefer to listen:

![Text to speech in Visual Studio Code Chat](https://github.com/microsoft/vscode/assets/900690/5ae2878a-9e74-4a68-907d-9791026fd235)


## Getting Started

If you want to use this extension in AI powered Chat in VS Code, please install the [GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) extension and sign in. You will see a microphone icon in all chat interfaces that GitHub Copilot Chat extension provides:

![Chat with Microphone Icoin](https://github.com/microsoft/vscode/assets/900690/fd5bc07f-ba57-4e3e-b294-074428f33d8b)

If you want to use this extension to dicate directly into the editor, no further setup is required!

## Keybindings and Walky-Talky Mode

The easiest way to get going with voice in chat is to use the keybinding `Ctrl+I` (`Cmd+I` on macOS). If you press and hold the keys, voice transcription starts immediately and submits when you release. Otherwise, when a chat input field is focused, pressing this key will start the voice session until it gets submitted.

For the editor dictation mode, use the keybinding `Ctrl+Alt+V` (`Cmd+Alt+V` on macOS).

You can easily configure your own keybinding to your liking via the Keybinding Shortcuts Editor:

```json
{
    "key": "ctrl+u",
    "command": "workbench.action.chat.startVoiceChat",
    "when": "!voiceChatInProgress"
},
{
    "key": "ctrl+u",
    "command": "workbench.action.chat.stopListeningAndSubmit",
    "when": "voiceChatInProgress"
},
{
    "key": "ctrl+d",
    "command": "workbench.action.editorDictation.start",
    "when": "!editorDictation.inProgress"
},
{
    "key": "ctrl+d",
    "command": "workbench.action.editorDictation.stop",
    "when": "editorDictation.inProgress"
}
```

## Settings

You can find all settings that are voice related by opening the Settings Editor and searching for `voice`:

![Voice Settings](https://github.com/microsoft/vscode/assets/900690/8fc60a66-4818-42f5-8376-31b1310ace86)

If you want chat responses to be automatically read out aloud when you used voice as input, make sure to enable `accessibility.voice.autoSynthesize`.

## Troubleshooting

On certain platforms, it maybe necessary to grant VS Code the permissions to use the microphone. For example, on macOS the "Privacy & Security" settings page has an entry for "Microphone". Make sure that Visual Studio Code is enabled:

![Screenshot 2024-02-23 at 08 46 15](https://github.com/microsoft/vscode/assets/900690/8bce6a0b-b234-40e8-8195-2461f809c030)

## Supported Platforms

This extension is compatible with Windows, Linux, and macOS:
- Windows x64 / ARM
- macOS x64 / ARM

### Linux 

This extension only supports the following distributions on the x86 (Debian/Ubuntu), x64, ARM32 (Debian/Ubuntu), and ARM64 (Debian/Ubuntu) architectures:

  - Ubuntu 20.04/22.04/24.04
  - Debian 11/12
  - Red Hat Enterprise Linux (RHEL) 8
  - CentOS 8

The extension depends on the shared library for ALSA applications (`libasound`).

For more information, please refer to [this documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/quickstarts/setup-platform?tabs=linux%2Cubuntu%2Cdotnetcli%2Cdotnet%2Cjre%2Cmaven%2Cnodejs%2Cmac%2Cpypi&pivots=programming-language-cpp) of the Azure Speech SDK this extension is built with.

## Supported Languages

The VS Code Speech extension supports 26 languages in total. You can configure the setting `accessibility.voice.speechLanguage` to the desired language for speech recognition and synthesis. This may require additional extensions to be installed for the language support.

## Issues

This extension is still in development, so please refer to our [issue tracker for known issues](https://github.com/Microsoft/vscode/issues), and please contribute with additional information if you encounter an issue yourself.

## Building

| Build   | Status                                                                                                                                                                                                                                               |
|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Stable  | [![Build Status](https://dev.azure.com/monacotools/Monaco/_apis/build/status%2FExtensions%2Fms-vscode%2Fvscode-speech?repoName=microsoft%2Fvscode-speech&branchName=release%2F0.8.0)](https://dev.azure.com/monacotools/Monaco/_build/latest?definitionId=536&repoName=microsoft%2Fvscode-speech&branchName=release%2F0.8.0) |
| Nightly | [![Build Status](https://dev.azure.com/monacotools/Monaco/_apis/build/status%2FExtensions%2Fms-vscode%2Fvscode-speech%20(pre-release)?repoName=microsoft%2Fvscode-speech&branchName=main)](https://dev.azure.com/monacotools/Monaco/_build/latest?definitionId=535&repoName=microsoft%2Fvscode-speech&branchName=main) |
