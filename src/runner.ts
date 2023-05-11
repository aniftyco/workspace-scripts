import concurrently, { ConcurrentlyOptions } from 'concurrently';
import * as dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { join } from 'path';

import type { PackageJson } from 'type-fest';

export class Runner {
  private _pkg: PackageJson | null = null;
  private env: dotenv.DotenvParseOutput | undefined = undefined;

  constructor(
    private readonly cwd: string = process.cwd(),
    private readonly options: Partial<ConcurrentlyOptions> = {}
  ) {
    const { parsed } = dotenv.config({ path: join(this.cwd, '.env') });

    this.env = parsed;
  }

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
      env: this.env,
    }));

    if (commands.length === 0) {
      throw new Error('No workspaces found in package.json');
    }

    concurrently(commands, {
      prefixColors: ['cyan', 'magenta', 'green', 'yellow', 'red'],
      ...this.options,
      outputStream: process.stdout,
    });
  }
}
