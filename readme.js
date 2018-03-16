/**
 * callbag-gun
 * -----------
 *
 * Read from and write to gun contexts using callbags.
 *
 * `yarn install callbag-gun`
 *
 * How to use:
 *
 * `readFrom(gun)`: converts values coming from a gun context to a callbag
 * Example:
 * `pipe(readFrom(gun.get('id')), forEach(value => console.log(value)));`
 *
 * `writeTo(gun)`: listens to a callbag and writes values into gun
 * Example:
 * `pipe(interval(1000), take(2), writeTo(gun.get('id')));` // 0, 1
 *
 */

const readFrom = function(gun, options = {}) {
  let isRunning = false,
    event;

  const cleanup = () => {
    if (!isRunning && event) {
      event.off();
      event = void 0;
    }
  };

  return function(start, sink) {
    if (start !== 0) return;
    isRunning = true;
    sink(0, function(t) {
      if (t === 2) {
        isRunning = false;
        cleanup();
      }
    });
    gun.on(function(data, key, context, _event) {
      event = _event;
      if (!isRunning) {
        cleanup();
      } else {
        sink(1, data);
      }
    }, options);
  };
};

const writeTo = function(gun) {
  return function(source) {
    let talkback;
    source(0, function(t, d) {
      if (t === 0) talkback = d;
      if (t === 1) gun.put(d);
      if (t === 1 || t === 0) talkback(1);
    });
  };
};

module.exports = { readFrom, writeTo };
