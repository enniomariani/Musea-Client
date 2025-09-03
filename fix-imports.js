import { promises as fs } from 'fs';
import path from 'path';

const directoryPath = path.join(process.cwd(), 'build');

async function addJsExtension(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const fixedContent = content.replace(/(from\s+['"])([^'"]+)(['"])/g, (match, p1, p2, p3) => {
        if (p2.startsWith('.') && !p2.endsWith('.js')) {
            return `${p1}${p2}.js${p3}`;
        }
        return match;
    });
    console.log("MATCH ADD JS-EXTENSION: ", filePath)
    await fs.writeFile(filePath, fixedContent, 'utf8');
}

async function traverseDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await traverseDir(fullPath);
        } else if (entry.isFile() && fullPath.endsWith('.js')) {
            await addJsExtension(fullPath);
        }
    }
}

traverseDir(directoryPath).catch(err => {
    console.error('Error processing files:', err);
    process.exit(1);
});
