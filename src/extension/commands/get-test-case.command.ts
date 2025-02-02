import type { ExtensionContext, Uri } from "vscode";
import { window } from "vscode";
import { TestRailService } from "../services";
import {
  getEditorLine,
  createWebviewPanel,
  getSettings,
  createSettingsError,
  getDescriptions,
  showCommandError,
} from "../utils";

const command = "get-test-case";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callback = (context: ExtensionContext): any => {
  console.log(command);

  return (uri: Uri): void => {
    const editor = window.activeTextEditor;
    if (!editor) throw new Error("VS Code editor not found");

    const line = getEditorLine(editor);
    const panel = createWebviewPanel(context, command, "Get test case");

    const handleReceiveMessage = async (message: Message) => {
      try {
        const settings = getSettings(uri.fsPath);
        if (!settings) throw createSettingsError();

        const description = getDescriptions(line).pop();
        if (!description || !description.title || !description.id) throw new Error("Test case description not found");

        const testCase = await TestRailService.getTestCase(settings, description.id);
        panel.webview.postMessage({ ...message, data: [testCase] });
      } catch (error) {
        showCommandError(error);
      }
    };

    panel.webview.onDidReceiveMessage(handleReceiveMessage);
  };
};

const GetTestCase = { command, callback };

export default GetTestCase;
