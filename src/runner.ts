import { concurrently, ConcurrentlyOptions } from 'concurrently';
import { readFileSync } from 'node:fs';
import { join } from 'path';

import type { PackageJson } from 'type-fest';

export class Runner {
  private _pkg: PackageJson | null = null;

  constructor(
    private readonly cwd: string = process.cwd(),
    private readonly options: Partial<ConcurrentlyOptions> = {
      prefixColors: ['cyan', 'magenta', 'green', 'yellow', 'red'],
    }
  ) {}

  get pkg(): PackageJson {
    if (this._pkg !== null) {
      return this._pkg;
    }

    const path = join(this.cwd, 'package.json');
    const pkg = readFileSync(path, 'utf8');

    this._pkg = JSON.parse(pkg);

    return this._pkg as PackageJson;
  }

  async start([command]: string[]) {
    const commands = ((this.pkg.workspaces || []) as string[]).map((workspace) => ({
      command: `npm run ${command} -w ${workspace} --if-present`,
      name: workspace,
    }));

    if (commands.length === 0) {
      throw new Error('No workspaces found in package.json');
    }

    return concurrently(commands, this.options);
  }
}
