import { analyzeFile, Line } from '../../src/lib/analyze-file';
import path from 'path';
import fs from 'fs';
import chai from 'chai';

const testFilePath = path.join(__dirname, 'testfile.txt');

describe('analyze-file', () => {
    it('analyzes test file', (done) => {
        const fd = fs.openSync(testFilePath, 'r');
        const lines: Line[] = [];
        const stream = analyzeFile(testFilePath, 'utf8', err => done(err));
        stream.on('data', line => lines.push(line));
        stream.on('end', () => {
            chai.expect(lines.length).to.be.eq(4);
            chai.expect(lines[0].start).to.be.eq(0);
            chai.expect(lines[0].end).to.be.eq(9);
            chai.expect(lines[3].start).to.be.eq(30);
            chai.expect(lines[3].end).to.be.eq(37);
            let testStr = Buffer.from('asdfghj\r\n');
            let targetBuf = Buffer.alloc(testStr.byteLength);
            // @ts-ignore
            fs.readSync(fd, targetBuf, 0, lines[0].end - lines[0].start, lines[0].start);
            chai.expect(testStr.compare(targetBuf)).to.be.eq(0);
            testStr = Buffer.from('asdfghjrc\r\n');
            targetBuf = Buffer.alloc(testStr.byteLength);
            // @ts-ignore
            fs.readSync(fd, targetBuf, 0, lines[2].end - lines[2].start, lines[2].start);
            chai.expect(testStr.compare(targetBuf)).to.be.eq(0);
            done();
        });
    });
    it('handles missing file properly', (done) => {
        const stream = analyzeFile('phony-file-name.txt', 'utf8', err => done());
        stream.on('data', () => chai.assert.fail('Should not emit data events'));
        stream.on('error', () => chai.assert.fail('No error event expected from missing file'));
    });
});