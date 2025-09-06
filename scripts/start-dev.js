const { exec } = require('child_process');
const chalk = require('chalk');

// Check if port 3000 is available
const checkPort = (port, callback) => {
  const platform = process.platform;
  const command = platform === 'win32' 
    ? `netstat -ano | findstr :${port}`
    : `lsof -i :${port}`;
  
  exec(command, (error, stdout) => {
    callback(!stdout);
  });
};

// Start development servers
const startDev = () => {
  console.log(chalk.cyan('\n🚀 Starting SagradaGo development environment...\n'));
  
  // Check port 3000
  checkPort(3000, (isAvailable) => {
    if (!isAvailable) {
      console.log(chalk.yellow('⚠️  Port 3000 is in use. Using port 3001 instead.\n'));
      process.env.PORT = 3001;
    }
    
    // Start both servers
    const devProcess = exec('npm run dev');
    
    devProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    devProcess.stderr.on('data', (data) => {
      process.stderr.write(chalk.red(data));
    });
    
    devProcess.on('close', (code) => {
      console.log(chalk.red(`\nDevelopment server exited with code ${code}`));
    });
  });
};

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n❌ Critical error:'), error.message);
  process.exit(1);
});

startDev();