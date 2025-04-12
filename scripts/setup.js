#!/usr/bin/env node

/**
 * This script helps with setting up the environment for development or production.
 * It creates necessary configuration files and validates environment variables.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

async function main() {
  console.log(`${colors.bright}${colors.blue}=====================================${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}  AI Learning Platform Setup Script  ${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}=====================================${colors.reset}\n`);

  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(envExamplePath)) {
    console.error(`${colors.red}Error: .env.example file not found. Make sure you're running this script from the project root.${colors.reset}`);
    process.exit(1);
  }

  if (fs.existsSync(envPath)) {
    const overwrite = await question(`${colors.yellow}A .env.local file already exists. Do you want to overwrite it? (y/N): ${colors.reset}`);
    if (overwrite.toLowerCase() !== 'y') {
      console.log(`${colors.green}Keeping existing .env.local file.${colors.reset}`);
    } else {
      createEnvFile(envPath, envExamplePath);
    }
  } else {
    createEnvFile(envPath, envExamplePath);
  }

  // Check dependencies
  console.log(`\n${colors.blue}Checking dependencies...${colors.reset}`);
  try {
    execSync('npm --version', { stdio: 'ignore' });
    console.log(`${colors.green}✓ npm is installed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ npm is not installed. Please install Node.js and npm.${colors.reset}`);
  }

  // Offer to install dependencies
  const installDeps = await question(`\nDo you want to install project dependencies? (Y/n): `);
  if (installDeps.toLowerCase() !== 'n') {
    console.log(`${colors.blue}Installing dependencies...${colors.reset}`);
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log(`${colors.green}✓ Dependencies installed successfully${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}✗ Error installing dependencies: ${error.message}${colors.reset}`);
    }
  }

  // Setup complete
  console.log(`\n${colors.green}${colors.bright}Setup complete!${colors.reset}`);
  console.log(`${colors.blue}You can now run the development server with: npm run dev${colors.reset}`);
  console.log(`${colors.yellow}Make sure to fill in the values in your .env.local file before starting.${colors.reset}`);

  rl.close();
}

function createEnvFile(envPath, envExamplePath) {
  try {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log(`${colors.green}Created .env.local file from template.${colors.reset}`);
    console.log(`${colors.yellow}Please edit the .env.local file and fill in your actual API keys and configuration.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error creating .env.local file: ${error.message}${colors.reset}`);
  }
}

main().catch(error => {
  console.error(`${colors.red}An error occurred: ${error.message}${colors.reset}`);
  process.exit(1);
});