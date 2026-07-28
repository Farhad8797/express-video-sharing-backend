import * as fs from "fs";
import path from "path";

export function clearTemp() {
    const folderPath = path.join(process.cwd(), "public", "temp");
    if (!fs.existsSync(folderPath)) return;

    const files = fs.readdirSync(folderPath);
    for (let file of files) {
        const filePath = path.join(folderPath, file);
        if (!fs.statSync(filePath).isFile()) return;
        fs.unlinkSync(filePath);
    }
    console.log("Temp files have been deleted");
}
