import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to run a command and pipe its output
function runCommand(command, args, name) {
  const process = spawn(command, args, {
    stdio: 'inherit',
    shell: true
  });

  process.on('error', (error) => {
    console.error(`Error starting ${name}:`, error);
  });

  return process;
}

// Start backend server
console.log('Starting backend server...');
const backend = runCommand('node', ['server.js'], 'Backend');

// Start frontend server
console.log('Starting frontend server...');
const frontend = runCommand('npm', ['run', 'dev'], 'Frontend');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit();
}); 