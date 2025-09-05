const { spawn } = require('child_process');

const MAX_OLD_SPACE = process.env.REACT_MAX_OLD_SPACE || '256'; // MB

const args = [
  `--max-old-space-size=${MAX_OLD_SPACE}`,
  require.resolve('react-scripts/bin/react-scripts.js'),
  'start',
];

const child = spawn('node', args, {
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: undefined } // ensure we don’t double‑set the flag
});

child.on('close', (code) => {
  process.exit(code);
});