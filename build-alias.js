import { execSync } from 'child_process';

const projects = [
    'src/mcf/main',
    'src/mcf/preload',
    'src/mcf/renderer',
    'src/mcf/mocks',
    'src/test-app/main',
    'src/test-app/preload',
    'src/test-app/renderer'
];

for (const project of projects) {
    console.log(`Running tsc-alias for ${project}...`);
    execSync(`tsc-alias -p ${project}/tsconfig.json  --verbose`, { stdio: 'inherit' });
}