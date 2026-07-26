import ImageKit from "@imagekit/nodejs";
import * as fs from "fs";
import { apiError } from "./apiError.js";

const client = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY // This is the default and can be omitted
});

export async function uploadFile(filepath: string, fileName: string) {
    if (!filepath) return null;
    try {
        const response = await client.files.upload({
            file: fs.createReadStream(filepath),
            fileName: fileName
        });
        console.log("File uploaded successfully at", response.url);
        return response;
    } catch (err: any) {
        console.log("Error uploading file: ", err?.message || err);
        return apiError(500, `Error uploading file: ${err?.message || err}`);
    } finally {
        fs.unlink(filepath, (err) => {
            if (err) console.log(`Error deleting file: ${err.message}`);
            else {
                console.log("path/file.txt was deleted");
            }
        });
    }
}
