# Google Java Format for VSCode

VSCode용 Google Java Format 확장

## Features

VSCode에서 Google Java Format 포멧터를 사용할 수 있게 해줍니다.

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.



## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

* VSCode 1.12.3 버전 이상



## Extension Settings

### 실행 타입 선택 옵션

* `gjfe.executionType`: 네이티브(Native) 또는 Jar 실행 방식을 선택합니다.

  > Google Java Format 1.20.0 버전부터 Native 방식을 지원합니다.
  >
  > Jar 방식보다 속도가 빨라서 가능한 native 방식을 추천합니다.

  * 선택 가능한 옵션
    * `native`: 실행 파일 실행방식
    * `jar`: jar파일 실행 방식


### Native 실행 방식

* `gjfe.nativeImagePath`: 네이티브 실행 파일 전체 경로

### Jar 실행 방식

* `gjfe.jarPath`: Jar 파일 전체 경로

* `gjfe.javaHome`: Jar 파일을 실행하기 위한 JAVA_HOME 경로

* `gjfe.jvmOptions`: Jar 파일을 실행할 때 추가해줄 JVM 옵션

  Java 17 이상에서 발생하는 리플렉션 차단? 문제 해결을 위해 다음 옵션이 기본값으로 추가되어있습니다.

  💡`--add-exports` 이후에 등호를 쓰지 않아도 정상실행 되도록 대응이 되어있지만, =를 쓰는 것을 권장합니다.
  
  ```
  --add-exports=jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED
  --add-exports=jdk.compiler/com.sun.tools.javac.code=ALL-UNNAMED
  --add-exports=jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED
  --add-exports=jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED
  --add-exports=jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED
  --add-exports=jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED
  ```

## Known Issues

* ...

## Release Notes

### 0.0.1

* 최초 버전
* Native, Jar 실행 방식 지원

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
