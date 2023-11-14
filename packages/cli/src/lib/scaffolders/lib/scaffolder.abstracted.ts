import type { Project } from '../../project';
import type { TemplateCompiler, SavedFile } from '../../template.compiler';


export abstract class AbstractedScaffolder {

  constructor(
    protected readonly project: Project,
    protected readonly compiler: TemplateCompiler
  ) {
  }


  public abstract scaffold(): Promise<SavedFile[]>;

}
