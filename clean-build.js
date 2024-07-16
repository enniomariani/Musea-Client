import fs from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from "url";

const filename = fileURLToPath(import.meta.url);
const __dirname = dirname(filename);

function deleteDTSFiles(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            const filePath = join(directory, file);

            fs.stat(filePath, (err, stats) => {
                if (err) throw err;

                if (stats.isDirectory()) {
                    deleteDTSFiles(filePath);
                } else if (filePath.endsWith('.d.ts')) {
                    fs.unlink(filePath, err => {
                        if (err) throw err;
                        console.log(`Deleted: ${filePath}`);
                    });
                }
            });
        }
    });
}

deleteDTSFiles(join(__dirname, 'build'));