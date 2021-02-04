import path from 'path';
import FileContentsReader from '../../src/';
import fs from 'fs';
import os from 'os';
import chai from 'chai';

const testFilePath = path.join(__dirname, 'testfile.txt');
const largeTestFilePath = path.join(__dirname, 'large-file.txt');

const testData = ['ads', 'my-test', 'line-3', 'asd'].join(os.EOL);

const testData2 = ['rerad', 'asdsad', 'rewrer', 'asdasddsa', 'asdasddsa', 'asdartetre'].join(os.EOL);

describe('acceptance', () => {
    describe('file-contents-reader', () => {
        beforeEach(() => {
            fs.writeFileSync(testFilePath, testData);
        });
        afterEach(() => {
            fs.unlinkSync(testFilePath);
        });
        it('Scans file. File changes. Scans the file again.', async () => {
            const reader = new FileContentsReader(testFilePath);
            await reader.start();

            let lines = await reader.getLines(1, 2);
            chai.expect(lines).to.be.eq('my-test\r\n');
            fs.writeFileSync(testFilePath, testData2);
            await reader.refreshLines();
            lines = await reader.getLines(1,2);
            chai.expect(lines).to.be.eq('asdsad\r\n');
        });
        it('Scans file and prints time taken', async () => {
            const reader = new FileContentsReader(largeTestFilePath);
            await reader.start();

            console.time('Scan file');
            await reader.refreshLines();
            console.timeEnd('Scan file');
        });
    })
})