const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const repoPath = process.cwd();
const gitRemote = 'https://github.com/OnlyYatashi/yosugo.xyz-source.git';

console.log('Watching for file changes...');

let debounceTimer;

function pushChanges() {
    console.log('\n[Auto-Deploy] Changes detected, pushing to GitHub...');
    
    exec('git add -A', { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
            console.error('[Auto-Deploy] Error staging files:', error.message);
            return;
        }
        
        const date = new Date().toISOString();
        exec(`git commit -m "Site update - ${date}"`, { cwd: repoPath }, (error, stdout, stderr) => {
            if (error) {
                console.error('[Auto-Deploy] Error committing:', error.message);
                return;
            }
            
            console.log('[Auto-Deploy] Commit created');
            
            exec(`git push origin master`, { cwd: repoPath }, (error, stdout, stderr) => {
                if (error) {
                    console.error('[Auto-Deploy] Error pushing:', error.message);
                    return;
                }
                console.log('[Auto-Deploy] Successfully pushed to GitHub!\n');
            });
        });
    });
}

const publicFiles = ['index.html', 'script.js', 'style.css'];

publicFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.watch(file, (eventType, filename) => {
            if (eventType === 'change') {
                console.log(`[Watch] ${filename} changed`);
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(pushChanges, 2000);
            }
        });
    }
});

if (fs.existsSync('data')) {
    fs.watch('data', { recursive: true }, (eventType, filename) => {
        if (eventType === 'change') {
            console.log(`[Watch] data/${filename} changed`);
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(pushChanges, 2000);
        }
    });
}

process.on('SIGINT', () => {
    console.log('\nStopping file watcher...');
    process.exit();
});