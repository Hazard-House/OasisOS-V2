import { spawn } from 'node:child_process';
import path from 'node:path';
import { previewAllowedHosts } from './allowed-hosts.mjs';

const port = String(process.env.PORT || 5173);
const host = '0.0.0.0';
const allowedHosts = previewAllowedHosts();
const viteBin = path.resolve('node_modules/vite/bin/vite.js');

const child = spawn(process.execPath, [viteBin, 'preview', '--host', host, '--port', port, '--strictPort'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS: allowedHosts.join(','),
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
