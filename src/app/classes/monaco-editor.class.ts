import { CodeEditor, CodeEditorChoiceEnum } from './code-editor.abstract';

let Monaco;

// https://github.com/Microsoft/vscode/blob/master/src/vs/editor/standalone/browser/standaloneCodeEditor.ts
// import { IEditorConstructionOptions } from 'vs/editor/standalone/browser/standaloneCodeEditor';

// https://github.com/Microsoft/vscode/blob/master/src/vs/editor/common/config/editorOptions.ts
// import { IEditorOptions } from 'vs/editor/common/config/editorOptions';

// https://microsoft.github.io/monaco-editor/playground.html
// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonecodeeditor.html
// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
// 'vs' (default), 'vs-dark', 'hc-black'
// scrollBeyondLastLine: false,

// const internalPropAggregation = {
//   scrollBeyondLastLine: false
// };

export class MonacoEditor extends CodeEditor {

  readonly vendor = CodeEditorChoiceEnum.MONACO;

  protected setters = {
    tabSize: (value) => {
      this.instance.getModel().updateOptions({ tabSize: value });
    },
    emmet: (enable) => {
      return false;
    },
    folding: (folding) => {
      this.instance.updateOptions({
        folding: (folding === 'always') || (folding === 'hover') || folding,
        showFoldingControls: typeof folding === 'string' ? folding : 'hover'
      });
    },
    lang: (lang: string) => {
      lang = {}[lang] || lang;
      Monaco.editor.setModelLanguage(
        this.instance.getModel(),
        lang);
    },
    wrap: (wrap: boolean) => {

    },
    editable: (editable: boolean) => {
      this.instance.updateOptions({ readOnly: !editable });
    },
    fontSize: (size: number) => {
      this.instance.updateOptions({ fontSize: size });
    },
    theme: (theme: string) => {
      switch (theme) {
        case 'dark':
          Monaco.editor.setTheme('vs-dark');
          break;
        case 'light':
        case 'default':
        default:
          Monaco.editor.setTheme('vs');
          break;
      }
    }
  };

  constructor() {
    super();
    this.require(['vs/editor/editor.main'], () => {
      Monaco = window['monaco'];
    });
  }

  protected vendorSetValue(value: string): void {
    this.instance.setValue(value);
  }

  render(elem: any, options: any): Promise<CodeEditor> {
    return this.tap(() => {
      let { rendered$ } = this;
      let editor = Monaco.editor.create(elem, {
        scrollBeyondLastLine: false,
        value: options.value || ''
      });
      if (options) {
        if (options.value) {
          delete options.value;
        }
        this.options(options);
      }
      this.instance = editor;
      rendered$.next(true);
      rendered$.complete();
      editor.getModel().onDidChangeContent((e) => {
        this.changes$.next({
          value: this.instance.getValue(),
          originalEvent: e
        });
      });
    });
  }

  resize() {
    this.ready(() => this.instance.layout());
  }

  focus() {
    this.ready(() => this.instance.focus());
  }

  format(): void {
    this.ready(() => {
      this.instance.getAction('editor.action.formatDocument').run();
    });
  }

  dispose(): void {
    this.disposeSubjects();
    if (this.instance) {
      this.instance.dispose();
    }
  }

}
