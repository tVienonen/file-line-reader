# File Line Scanner

Utility class for analyzing a file and counting lines in it. After analyzing you can read lines from the line with simple from -> to syntax.

Tested with UTF-8 text files. Other files behaviour is unknown.
## Usage

```typescript
import FileLineScanner from 'file-line-scanner';

const examplePath = '/var/logs/log.txt';


async main() {
    const scanner = new FileLineScanner(examplePath);
    // Scanner needs to be started before lines can be fetched.
    await scanner.start();
    // File has been analyzed
    // Line count
    console.log(scanner.lineCount);
    // Lines start from 0
    // Get lines from 1 to 100 (excludes the 101st line, you will end up with lines from 1 - 100);
    console.log(await scanner.getLines(0, 100));
}
```

## Options

```typescript
// Pass options to the FileLineScanner constructor's last argument
new FileLineScanner(path, opts: {
    encoding?: string; // BufferEnconding same encodings as supported by Buffer
    skipLastLine?: boolean; // If true last line of the file will be skipped when reading lines
})
```