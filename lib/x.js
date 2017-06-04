/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const Transform = require('stream').Transform;

function propertyAccessor(key) {
  return (data) => data.hasOwnProperty(key);
}

function memberAccessor(key, next) {
  return (data) => data.hasOwnProperty(key) && next(data[key]);
}

function accessor(path) {
  const m = path.match(
    /^([a-zA-Z_0-9]+)[\.\[]|^\[([0-9]+)\]|^\[["']([^"']+)["']\]/
  );
  if (m) {
    if (m[2]) {
      return propertyAccessor(m[2]);
    }
    const remain = path.substring(m.index + m[0].length - 1)
      .replace(/^[\.\]]+/, '');
    const next = accessor(remain);
    const key = m[1] || m[3];
    return memberAccessor(key, next);
  }
  return propertyAccessor(path);
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
