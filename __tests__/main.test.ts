import * as process from 'process';
import 'dotenv/config';
import * as cp from 'child_process';
import * as path from 'path';
import { test } from '@jest/globals';
import { readFileSync } from 'fs';

const addInput = (key, value) => process.env[`INPUT_${key.replace(/ /g, '-').toUpperCase()}`] = value || ''

readFileSync(path.join(__dirname, 'code-scanning.json'), 'utf-8');
const JSON_EXAMPLE = '[{"name": "test"}, {"name": "test2"}]';

const input: any = {
  token: process.env.GITHUB_TOKEN,
  json: JSON_EXAMPLE,
  options: undefined,
  'create-artifact': true,
  'artifact-name': 'csv',
}


test('test run', () => {
  Object.entries(input).forEach(([key, value]) => addInput(key, value));
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'dist', 'index.js');
  const options: cp.ExecFileSyncOptions = {
    env: process.env,
  };
  console.log(cp.execFileSync(np, [ip], options).toString());
});