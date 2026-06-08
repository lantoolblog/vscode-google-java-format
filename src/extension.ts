import * as vscode from "vscode";
import { execFileSync } from "child_process";
import { accessSync, constants, existsSync, statSync } from "fs";
import * as path from "path";

const CONFIG_SECTION = "gjfe";
const isKoreanLocale = vscode.env.language.toLowerCase().startsWith("ko");

const messages = {
  openSettingsLabel: {
    en: "Open Settings",
    ko: "설정 열기",
  },
  jarPathEmpty: {
    en: "gjfe.jarPath is empty. Set a google-java-format JAR file path.",
    ko: "gjfe.jarPath 설정이 비어 있습니다. google-java-format JAR 파일 경로를 설정하세요.",
  },
  jarPathNotFile: {
    en: "gjfe.jarPath is not an existing file. Check the google-java-format JAR file path.",
    ko: "gjfe.jarPath가 존재하는 파일이 아닙니다. google-java-format JAR 파일 경로를 확인하세요.",
  },
  jarPathNotJar: {
    en: "gjfe.jarPath is not a JAR file. Set a .jar file path.",
    ko: "gjfe.jarPath가 JAR 파일이 아닙니다. .jar 파일 경로를 설정하세요.",
  },
  javaHomeEmpty: {
    en: "gjfe.javaHome is empty. Set the JAVA_HOME path.",
    ko: "gjfe.javaHome 설정이 비어 있습니다. JAVA_HOME 경로를 설정하세요.",
  },
  javaHomeNotDirectory: {
    en: "gjfe.javaHome is not an existing directory. Check the JAVA_HOME path.",
    ko: "gjfe.javaHome이 존재하는 디렉터리가 아닙니다. JAVA_HOME 경로를 확인하세요.",
  },
  javaHomeNoExecutable: {
    en: "No executable java was found under gjfe.javaHome. Check the JAVA_HOME path.",
    ko: "gjfe.javaHome 아래에서 실행 가능한 java를 찾을 수 없습니다. JAVA_HOME 경로를 확인하세요.",
  },
  nativeImagePathEmpty: {
    en: "gjfe.nativeImagePath is empty. Set a native executable file path.",
    ko: "gjfe.nativeImagePath 설정이 비어 있습니다. 네이티브 실행 파일 경로를 설정하세요.",
  },
  nativeImagePathNotExecutable: {
    en: "gjfe.nativeImagePath is not an existing executable file. Check the native executable path.",
    ko: "gjfe.nativeImagePath가 존재하는 실행 파일이 아닙니다. 네이티브 실행 파일 경로를 확인하세요.",
  },
} as const;

type MessageKey = keyof typeof messages;

function t(key: MessageKey): string {
  return isKoreanLocale ? messages[key].ko : messages[key].en;
}

function showConfigurationError(message: string, settingName?: string): never {
  const openSettingsLabel = t("openSettingsLabel");

  void vscode.window
    .showErrorMessage(
      `Google Java Format: ${message}`,
      ...(settingName ? [openSettingsLabel] : []),
    )
    .then((selectedAction) => {
      if (selectedAction === openSettingsLabel && settingName) {
        return vscode.commands.executeCommand(
          "workbench.action.openSettings",
          `${CONFIG_SECTION}.${settingName}`,
        );
      }

      return undefined;
    });

  throw new Error(message);
}

function getTrimmedSettingOrThrow(
  config: vscode.WorkspaceConfiguration,
  settingName: string,
  emptyMessage: string,
): string {
  const value = (config.get<string>(settingName) ?? "").trim();

  if (!value) {
    showConfigurationError(emptyMessage, settingName);
  }

  return value;
}

function isExecutableFile(filePath: string): boolean {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return false;
  }

  if (process.platform === "win32") {
    return [".exe", ".cmd", ".bat", ".com"].includes(
      path.extname(filePath).toLowerCase(),
    );
  }

  try {
    accessSync(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function getJarPathOrThrow(config: vscode.WorkspaceConfiguration): string {
  const jarPath = getTrimmedSettingOrThrow(
    config,
    "jarPath",
    t("jarPathEmpty"),
  );

  if (!existsSync(jarPath) || !statSync(jarPath).isFile()) {
    showConfigurationError(t("jarPathNotFile"), "jarPath");
  }

  if (path.extname(jarPath).toLowerCase() !== ".jar") {
    showConfigurationError(t("jarPathNotJar"), "jarPath");
  }

  return jarPath;
}

function getJavaCommandOrThrow(config: vscode.WorkspaceConfiguration): string {
  const javaHome = getTrimmedSettingOrThrow(
    config,
    "javaHome",
    t("javaHomeEmpty"),
  );

  if (!existsSync(javaHome) || !statSync(javaHome).isDirectory()) {
    showConfigurationError(t("javaHomeNotDirectory"), "javaHome");
  }

  const javaExecutable = path.join(
    javaHome,
    "bin",
    process.platform === "win32" ? "java.exe" : "java",
  );

  if (!isExecutableFile(javaExecutable)) {
    showConfigurationError(t("javaHomeNoExecutable"), "javaHome");
  }

  return javaExecutable;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.languages.registerDocumentRangeFormattingEditProvider(
    { scheme: "file", language: "java" },
    {
      provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        range: vscode.Range,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken,
      ): Promise<vscode.TextEdit[]> {
        if (range.isEmpty) {
          return Promise.resolve([]);
        }

        return runFormatter(document.getText(range)).then(
          (stdout) => {
            return Promise.resolve([vscode.TextEdit.replace(range, stdout)]);
          },
          (reason) => {
            return Promise.reject(reason);
          },
        );
      },
    },
  );

  context.subscriptions.push(disposable);
}

function getNativeImagePathOrThrow(
  config: vscode.WorkspaceConfiguration,
): string {
  const nativeImagePath = getTrimmedSettingOrThrow(
    config,
    "nativeImagePath",
    t("nativeImagePathEmpty"),
  );

  if (!isExecutableFile(nativeImagePath)) {
    showConfigurationError(
      t("nativeImagePathNotExecutable"),
      "nativeImagePath",
    );
  }

  return nativeImagePath;
}

function normalizeJvmOptions(rawOptions: string[]): string[] {
  const normalizedOptions: string[] = [];

  for (const rawOption of rawOptions) {
    const option = rawOption.trim();

    if (!option) {
      continue;
    }

    const splitOptionMatch = option.match(
      /^(--add-exports|--add-opens|--add-reads|--patch-module)\s+(.+)$/,
    );

    if (splitOptionMatch) {
      normalizedOptions.push(splitOptionMatch[1], splitOptionMatch[2].trim());
      continue;
    }

    normalizedOptions.push(option);
  }

  return normalizedOptions;
}

function getFormatterCommand(config: vscode.WorkspaceConfiguration): {
  command: string;
  args: string[];
} {
  const executionType = `${config.get("executionType")}`;

  if (executionType === "jar") {
    const jarPath = getJarPathOrThrow(config);
    const javaCommand = getJavaCommandOrThrow(config);
    const jvmOptions = normalizeJvmOptions(
      config.get<string[]>("jvmOptions") ?? [],
    );

    return {
      command: javaCommand,
      args: [...jvmOptions, "-jar", jarPath, "-"],
    };
  }

  return {
    command: getNativeImagePathOrThrow(config),
    args: ["-"],
  };
}

function runFormatter(textRange: string): Promise<string> {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
  const { command, args } = getFormatterCommand(config);

  return new Promise((resolve, reject) => {
    try {
      let stdout: string = execFileSync(command, args, {
        encoding: "utf8",
        input: textRange,
        windowsHide: true,
      });
      resolve(stdout);
    } catch (e) {
      reject(e);
    }
  });
}

export function deactivate() {}
