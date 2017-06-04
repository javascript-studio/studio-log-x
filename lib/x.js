/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const Transform = require('stream').Transform;

function accessor(path) {
  const p = path.indexOf('.');
  if (p === -1) {
    return (data) => data.hasOwnProperty(path);
  }
  const next = accessor(path.substring(p + 1));
  const key = path.substring(0, p);
  return (data) => data.hasOwnProperty(key) && next(data[key]);
}

function replacer(path) {
  // eslint-disable-next-line no-new-func
  return Function('data', `data.${path} = '·····'`);
}

function filter(args) {
  const accessors = Array.prototype.map.call(args, accessor);
  const replacers = Array.prototype.map.call(args, replacer);

  return (entry) => {
    let copy = false;
    for (let i = 0; i < accessors.length; i++) {
      if (accessors[i](entry.data)) {
        if (!copy) {
          copy = true;
          entry.data = JSON.parse(JSON.stringify(entry.data));
        }
        replacers[i](entry.data);
      }
    }
    return entry;
  };
}

module.exports = function x(map) {
  if (typeof map === 'object') {
    const filters = {};
    for (const key in map) {
      if (map.hasOwnProperty(key)) {
        filters[key] = filter(map[key]);
      }
    }
    return new Transform({
      objectMode: true,

      transform(entry, enc, callback) {
        const f = filters[entry.topic] || filters['*'];
        callback(null, f ? f(entry) : entry);
      }
    });
  }

  const f = filter(arguments);
  return new Transform({
    objectMode: true,

    transform(entry, enc, callback) {
      callback(null, f(entry));
    }
  });
};
