import through from 'through2';
import fs from 'fs';
import os from 'os';

export interface Line {
    start: number|null;
    end: number|null;
}
export interface ScannedLine {
    start: number;
    end: number;
}

function makeLine() {
    return {
        start: null,
        end: null
    } as Line;
}

function rotateLeft(buf: Buffer) {
    if (buf.length < 2) return;
    for (let i = 0; i < buf.length; i++) {
        buf[i] = buf[i + 1];
    }
}

export function analyzeFile(path: string, encoding: BufferEncoding, cb: (err: Error) => any) {
    let readBytes = 0;
    let line = makeLine();
    const eolBuf = Buffer.from(os.EOL, encoding);
    
    return fs.createReadStream(path)
    .on('error', cb)
    .pipe(through.obj(
        function(chunk: Buffer, enc, cb) {
            let ptr = 0;
            let chars = Buffer.alloc(eolBuf.length);
            while (ptr < chunk.byteLength) {
                rotateLeft(chars);
                if (line.start === null) {
                    line.start = readBytes;
                }
                chars[Math.max(0, chars.length - 1)] = chunk.readUInt8(ptr++);
                readBytes++;
                if (chars.compare(eolBuf) === 0) {
                    line.end = readBytes;
                    this.push(line);
                    line = makeLine();
                }
            }
            cb();
        },
        function(cb) {
            if (line) {
                line.end = readBytes;
                this.push(line);
            }
            cb();
        }
    ))
}
