import * as process from 'process';
import 'dotenv/config';
import * as cp from 'child_process';
import * as path from 'path';
import { test } from '@jest/globals';
// import { readFileSync } from 'fs';

// const JSON_EXAMPLE = readFileSync(path.join(__dirname, 'code-scanning.json'), 'utf-8');

const addInput = (key, value) => process.env[`INPUT_${key.replace(/ /g, '-').toUpperCase()}`] = value || ''
const input: any = {
  json: '[{"name":{"first":"austen","last":"stone"},"age":25,"occupation":"developer"},{"name":{"first":"john","last":"smith"},"age":50,"occupation":"boss"}]',
  options: undefined,
  'create-artifact': true,
  'artifact-name': 'test',
  'github-token': process.env.GITHUB_TOKEN
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
