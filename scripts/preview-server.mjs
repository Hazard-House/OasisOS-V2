import { spawn } from 'node:child_process';
import path from 'node:path';

const port = String(process.env.PORT || 5173);
const host = '0.0.0.0';
const viteBin = path.resolve('node_modules/vite/bin/vite.js');

const child = spawn(process.execPath, [viteBin, 'preview', '--host', host, '--port', port, '--strictPort'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
