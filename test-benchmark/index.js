/* eslint-disable prefer-const */
/* eslint-disable unused-imports/no-unused-vars-ts */
const fs = require('fs');
const readline = require('readline');
const runProfiling = require('./runProfiling');
const { augmentativeForEachAsync } = require('../lib/augmentative-async-iterable');


function getAsyncIterable(rl) {
  return {
    [Symbol.asyncIterator]() {
      let onError;
      let onClose;
      let onLine;
      let queue = {};
      let error;
      onError = (value) => {
        rl.off('close', onClose);
        rl.off('line', onLine);
        error = value;
      };
      onClose = () => {
        rl.off('error', onError);
        rl.off('line', onLine);
        queue = undefined;
      };
      onLine = (value) => {
        if (queue) {
          const node = { value };
          if (queue.last) {
            queue.last = queue.last.next = node;
          } else {
            queue.last = queue.next = node;
          }
        }
      };
      rl.on('line', onLine);
      rl.once('error', onError);
      rl.once('close', onClose);
      function next() {
        if (!queue) {
          return { done: true };
        }
        if (error) {
          throw error;
        }
        if (queue.next) {
          const { value } = queue.next;
          queue.next = queue.next.next;
          if (!queue.next) {
            queue.last = undefined;
          }
          return {
            value,
          };
        } else {
          rl.off('line', onLine);
          return new Promise((resolve, reject) => {
            let onErrorOnce;
            let onCloseOnce;
            let onLineOnce;
            onErrorOnce = (value) => {
              rl.off('close', onCloseOnce);
              rl.off('line', onLineOnce);
              reject(value);
            };
            onCloseOnce = () => {
              rl.off('error', onErrorOnce);
              rl.off('line', onLineOnce);
              resolve({ done: true });
            };
            onLineOnce = (value) => {
              rl.off('close', onCloseOnce);
              rl.off('error', onErrorOnce);
              rl.on('line', onLine);
              resolve({ value });
            };
            rl.once('line', onLineOnce);
            rl.once('error', onErrorOnce);
            rl.once('close', onCloseOnce);
          });
        }
      }
      return {
        next,
      };
    },
  };
}

(async () => {
  await runProfiling('readline stream interface', () => new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream('./test-benchmark/big.txt'),
    });

    let i = 0;
    rl.on('line', (line) => {
      i += 1;
    });

    rl.on('error', reject);

    rl.on('close', () => {
      console.log(`Read ${i} lines`);
      resolve();
    });
  }));

  await runProfiling('readline async iteration', async () => {
    const rl = readline.createInterface({
        input: fs.createReadStream('./test-benchmark/big.txt'),
      });

      let i = 0;
      for await (const line of rl) {
        i += 1;
      }
      console.log(`Read ${i} lines`);
  });

  await runProfiling('readline manual readline async iterable', async () => {
    const rl = readline.createInterface({
        input: fs.createReadStream('./test-benchmark/big.txt'),
      });
      const iterable = getAsyncIterable(rl);

      let i = 0;
      for await (const line of iterable) {
        i += 1;
      }

      console.log(`Read ${i} lines`);
  });

  await runProfiling('readline augmentative-iterable', async () => {
    const rl = readline.createInterface({
        input: fs.createReadStream('./test-benchmark/big.txt'),
      });
      const iterable = getAsyncIterable(rl);

      let i = 0;
      await augmentativeForEachAsync.call(iterable, () => i += 1);

      console.log(`Read ${i} lines`);
   });

  // await runProfiling('readline async iteration with iteration map', async () => {
  //   async function *map(iterable) {
  //     for await (const item of iterable) {
  //       yield 1;
  //     }
  //   }

  //   const rl = readline.createInterface({
  //       input: fs.createReadStream('./test-benchmark/big.txt'),
  //     });

  //     let i = 0;
  //     for await (const line of map(rl)) {
  //       i += 1;
  //     }

  //     console.log(`Read ${i} lines`);
  // });

  // await runProfiling('readline fluent-iterable with map', async () => {
  //   const rl = readline.createInterface({
  //       input: fs.createReadStream('./test-benchmark/big.txt'),
  //     });

  //     const i = await fluentAsync(rl).map(constant(1)).sum();

  //     console.log(`Read ${i} lines`);
  // });

  // // Modify readline to return an array of lines
  // // Copied from https://github.com/nodejs/node/blob/efec6811b667b6cf362d648bc599b667eebffce0/lib/readline.js
  // const lineEnding = /\r?\n|\r(?!\n)/;
  // readline.Interface.prototype._normalWrite = function(b) {
  //   if (b === undefined) {
  //     return;
  //   }
  //   let string = this._decoder.write(b);
  //   if (this._sawReturnAt &&
  //       DateNow() - this._sawReturnAt <= this.crlfDelay) {
  //     string = string.replace(/^\n/, '');
  //     this._sawReturnAt = 0;
  //   }

  //   // Run test() on the new string chunk, not on the entire line buffer.
  //   const newPartContainsEnding = lineEnding.test(string);

  //   if (this._line_buffer) {
  //     string = this._line_buffer + string;
  //     this._line_buffer = null;
  //   }
  //   if (newPartContainsEnding) {
  //     this._sawReturnAt = string.endsWith('\r') ? DateNow() : 0;

  //     // Got one or more newlines; process into "line" events
  //     const lines = string.split(lineEnding);
  //     // Either '' or (conceivably) the unfinished portion of the next line
  //     string = lines.pop();
  //     this._line_buffer = string;
  //     this._onLine(lines); // <- changed from `for of` to `this._onLine(lines)`
  //   } else if (string) {
  //     // No newlines this time, save what we have for next time
  //     this._line_buffer = string;
  //   }
  // };

  // readline.Interface.prototype._line = function() {
  //   const line = this._addHistory();
  //   this.clearLine();
  //   this._onLine([line]); // <- changed from `line` to `[line]`
  // };

  // await runProfiling('readline async iteration via array of lines', async () => {
  //   const rl = readline.createInterface({
  //       input: fs.createReadStream('./test-benchmark/big.txt'),
  //     });

  //     let i = 0;
  //     for await (const lines of rl) {
  //       for (const line of lines) {
  //         i += 1;
  //       }
  //     }
  //     console.log(`Read ${i} lines`);
  // });
})();

