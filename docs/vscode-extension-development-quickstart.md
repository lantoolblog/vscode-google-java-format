# VS Code Extension Development Quickstart

VS Code 확장 개발 프로젝트를 새로 만들고, 기본 `Hello World` 확장을 실행하는 최소 절차입니다.

## 1. 준비물

- VS Code
- Node.js LTS
- npm
- Git

설치 확인:

```powershell
node --version
npm --version
git --version
code --version
```

## Tip. 개발용 VS Code 프로필 분리

VS Code 프로필 분리는 필수는 아닙니다. 기존 JavaScript/TypeScript 개발 프로필을 사용해도 `Hello World` 확장을 실행하는 데 문제는 없습니다.

다만 확장 개발을 계속할 예정이라면 `VS Code Extension Dev` 같은 별도 프로필을 만들어두면 좋습니다. 확장, 설정, 단축키, UI 상태를 일반 개발 환경과 분리할 수 있어 테스트 중인 확장이나 포맷터 설정이 기존 작업 환경에 영향을 주는 일을 줄일 수 있습니다.

이미 JavaScript 개발용 프로필이 있다면 처음에는 그대로 사용해도 충분합니다. 이후 확장 개발용 설정이 늘어나거나 테스트 환경을 더 깨끗하게 유지하고 싶을 때 별도 프로필로 분리합니다.

## 2. 확장 프로젝트 생성

작업할 상위 디렉토리에서 VS Code 확장 생성기를 실행합니다.

```powershell
npx --package yo --package generator-code -- yo code
```

이미 만든 빈 폴더를 현재 프로젝트 폴더로 사용하려면 해당 폴더로 이동한 뒤 현재 폴더(`.`)를 지정해서 생성합니다.

```powershell
mkdir hello-extension
cd hello-extension
npx --package yo --package generator-code -- yo code .
```

프롬프트가 나오면 아래처럼 선택합니다.

```text
? What type of extension do you want to create? New Extension (TypeScript)
? What's the name of your extension? hello-extension
? What's the identifier of your extension? hello-extension
? What's the description of your extension? Hello VS Code extension quickstart
? Initialize a git repository? Yes
? Which bundler to use? unbundled
? Which package manager to use? npm
```

상위 디렉토리에서 생성했다면 생성이 끝난 뒤 프로젝트 디렉토리로 이동합니다. 현재 폴더(`.`) 기준으로 생성했다면 이미 프로젝트 디렉토리 안에 있으므로 `code .`만 실행하면 됩니다.

```powershell
cd hello-extension
code .
```

## 3. 기본 파일 확인

생성된 프로젝트에서 우선 아래 파일을 확인합니다.

```text
hello-extension/
|- package.json
|- src/
|  `- extension.ts
|- .vscode/
|  |- launch.json
|  `- tasks.json
`- tsconfig.json
```

핵심 파일은 두 개입니다.

- `package.json`: 확장 메타데이터, 명령, 활성화 조건을 정의합니다.
- `src/extension.ts`: 확장이 활성화될 때 실행되는 코드를 작성합니다.

기본 템플릿에는 `hello-extension.helloWorld` 명령이 이미 등록되어 있습니다.

## 4. 의존성 설치

생성기가 설치를 완료하지 않았거나 의존성을 다시 맞춰야 하면 아래 명령을 실행합니다.

```powershell
npm install
```

TypeScript 컴파일 확인:

```powershell
npm run compile
```

## 5. Hello Extension 실행

VS Code에서 프로젝트를 연 상태로 `F5`를 누릅니다.

그러면 새 VS Code 창이 열립니다. 이 창은 `Extension Development Host`이며, 방금 만든 확장이 로드된 테스트용 VS Code입니다.

새 창에서 명령 팔레트를 엽니다.

```text
Ctrl+Shift+P
```

아래 명령을 검색해서 실행합니다.

```text
Hello World
```

화면 오른쪽 아래에 아래와 비슷한 알림이 나오면 성공입니다.

```text
Hello World from hello-extension!
```

## 6. 메시지 바꿔보기

`src/extension.ts`에서 `showInformationMessage` 호출부를 찾습니다.

```ts
vscode.window.showInformationMessage('Hello World from hello-extension!');
```

원하는 메시지로 바꿉니다.

```ts
vscode.window.showInformationMessage('Hello Extension is running!');
```

`Extension Development Host` 창을 다시 실행하거나, 디버그 툴바에서 재시작한 뒤 `Hello World` 명령을 다시 실행합니다.

## 7. 자주 막히는 지점

### `Hello World` 명령이 보이지 않는 경우

`package.json`의 `engines.vscode` 값이 현재 설치된 VS Code 버전과 호환되는지 확인합니다.

```json
{
  "engines": {
    "vscode": "^1.100.0"
  }
}
```

현재 VS Code 버전 확인:

```powershell
code --version
```

### `F5`를 눌러도 실행되지 않는 경우

아래 파일이 있는지 확인합니다.

```text
.vscode/launch.json
.vscode/tasks.json
```

없다면 생성기가 정상 완료되지 않았을 가능성이 큽니다. 프로젝트를 다시 생성하거나 VS Code의 `Run and Debug` 패널에서 launch 구성을 다시 만듭니다.

### TypeScript 컴파일 에러가 나는 경우

의존성을 다시 설치하고 컴파일합니다.

```powershell
npm install
npm run compile
```

### `console`, `suite`, `test` 등에 빨간 밑줄이 생기는 경우

의존성은 설치돼 있어도, 편집기의 TypeScript 서버가 전역 타입을 즉시 인식하지 못할 때 생깁니다.  
`tsconfig.json`에 `types`를 명시하면 안정적으로 해결됩니다.

```json
{
  "compilerOptions": {
    "types": ["node", "vscode", "mocha"]
  }
}
```

- `node`: `console`, `process`, `Buffer` 등 Node.js 전역 타입
- `vscode`: VS Code API 타입 (`@types/vscode`에서 제공)
- `mocha`: `suite`, `test` 등 테스트 전역 타입

추가 후 VS Code 명령 팔레트에서 `TypeScript: Restart TS Server`를 실행하면 바로 반영됩니다.

## 8. 다음 단계

Hello extension 실행까지 확인했다면 다음 항목을 이어서 보면 됩니다.

- `package.json`의 `contributes.commands`로 명령 이름 바꾸기
- `src/extension.ts`에서 VS Code API 호출 추가하기
- `activationEvents`로 확장 활성화 시점 조정하기
- `vsce`로 확장 패키징하기

## 참고

- VS Code Extension API: https://code.visualstudio.com/api
- Your First Extension: https://code.visualstudio.com/api/get-started/your-first-extension
- Extension Anatomy: https://code.visualstudio.com/api/get-started/extension-anatomy
