#!/usr/bin/env node
const { execSync } = require('child_process');

try {
  execSync('npm run build', { stdio: 'inherit' });
  execSync('npm version patch', { stdio: 'inherit' });
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "chore(release): bump version"', { stdio: 'inherit' });
  execSync('git push --follow-tags', { stdio: 'inherit' });
  console.log('Release completed successfully.');
} catch (err) {
  console.error('Release script failed:', err);
  process.exit(1);
}
