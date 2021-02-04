import { analyzeFile, ScannedLine } from './lib/analyze-file';
import util from 'util';
import fs from 'fs';

const fsOpen = util.promisify(fs.open);
const fsClose = util.promisify(fs.close);
const fsRead = util.promisify(fs.read);
export interface FileContentsReaderOptions {
    skipLastLine?: boolean;
    encoding?: BufferEncoding
}
/**
 * Class for reading a file back and forth between lines.
 * Supports text files.
 * 
 * Tested with utf-8 text files. Untested with other encodings.
 */
export class FileContentsReader {
    private lines: ScannedLine[] = [];
    private rowBuffer = Buffer.alloc(0xFFFFFF);
    private encoding: BufferEncoding;
    constructor(private filePath: string, private options?: FileContentsReaderOptions) {
        this.encoding = options?.encoding ?? 'utf8';
    }
    /**
     * Gets the number of scanned lines.
     */
    get lineCount() {
        return this.lines.length;
    }
    /**
     * Calling this will scan the file again.
     * 
     * This is useful if the file has changed after the scan.
     */
    async refreshLines() {
        this.lines = await new Promise<ScannedLine[]>((resolve, reject) => {
            const analyzeStream = analyzeFile(this.filePath, this.encoding);
            const lines: ScannedLine[] = [];
            analyzeStream.on('data', line => lines.push(line));
            analyzeStream.on('end', () => resolve(lines));
            analyzeStream.on('error', (err) => reject(err));
        });
    }
    /**
     * Starts the reader. This must be called before you can call other methods in this class.
     * 
     * Opens a file descriptor to the file.
     */
    async start() {
        await this.refreshLines();
    }
    /**
     * Reads lines including from and excluding to
     * @param from from what line to start with
     * @param to to what line will the reading end to defaults to last line
     * 
     * @rejects Throws error if start() has not been called yet.
     */
    async getLines(from: number, to: number = this.lineCount) {
        const fd = await fsOpen(this.filePath, 'r');
        const _to = Math.min(this.lines.length - (this.options?.skipLastLine ? 1 : 0), Math.max(to, 0));
        let dataStr = '';
        for (let i = from; i < _to; i++) {
            const line = this.lines[i];
            await fsRead(fd, this.rowBuffer, 0, line.end - line.start, line.start);
            dataStr += this.rowBuffer.slice(0, line.end - line.start).toString(this.encoding);
        }
        await fsClose(fd);
        return dataStr;
    }
}

export default FileContentsReader;