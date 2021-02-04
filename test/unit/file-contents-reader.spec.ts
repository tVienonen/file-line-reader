import path from 'path';
import { FileContentsReader } from '../../src';
import chai from 'chai';

const testFilePath = path.join(__dirname, 'testfile.txt');


describe('file-contents-reader', () => {
    it('reads 1 line', async () => {
        const reader = new FileContentsReader(testFilePath);
        await reader.start();
        const lines = await reader.getLines(0, 1);
        chai.expect(lines).to.be.eq('asdfghj\r\n');
    });
    it('reads 0 lines', async () => {
        const reader = new FileContentsReader(testFilePath);
        await reader.start();
        const lines = await reader.getLines(0, 0);
        chai.expect(lines).to.be.eq('');
    });
    it('reads 2 lines from between', async () => {
        const reader = new FileContentsReader(testFilePath);
        await reader.start();
        const lines = await reader.getLines(1, 3);
        chai.expect(lines).to.be.eq('asdfghje\r\nasdfghjrc\r\n');
    });
    it('reads 3 lines skipping the first line', async () => {
        const reader = new FileContentsReader(testFilePath);
        await reader.start();
        const lines = await reader.getLines(1, 4);
        chai.expect(lines).to.be.eq('asdfghje\r\nasdfghjrc\r\ndaswesc');
    });
    it('reads all lines', async () => {
        const reader = new FileContentsReader(testFilePath);
        await reader.start();
        const lines = await reader.getLines(0);
        chai.expect(lines).to.be.eq('asdfghj\r\nasdfghje\r\nasdfghjrc\r\ndaswesc');
    });
    it('reads all lines then reads one line', async () => {
        const reader = new FileContentsReader(testFilePath);
        await reader.start();
        let lines = await reader.getLines(0);
        chai.expect(lines).to.be.eq('asdfghj\r\nasdfghje\r\nasdfghjrc\r\ndaswesc');
        lines = await reader.getLines(0, 1);
        chai.expect(lines).to.be.eq('asdfghj\r\n');
    });
    it('reads all lines with skip last line option enabled', async () => {
        const reader = new FileContentsReader(testFilePath, { skipLastLine: true });
        await reader.start();
        let lines = await reader.getLines(0);
        chai.expect(lines).to.be.eq('asdfghj\r\nasdfghje\r\nasdfghjrc\r\n');
    });
});