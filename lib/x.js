/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const Transform = require('stream').Transform;

function copy(value, key, v) {
  const c = Array.isArray(value)
    ? value.slice()
    : Object.assign({}, value);
  c[key] = v;
  return c;
}

function propertyFilter(key) {
  return (data) => data.hasOwnProperty(key)
    ? copy(data, key, '·····')
    : data;
}

function memberFilter(key, next) {
  return (data) => {
    if (data.hasOwnProperty(key)) {
      const v = data[key];
      const r = next(v);
      if (r !== v) {
        return copy(data, key, r);
      }
    }
    return data;
  };
}

function iteratingFilter() {
  return (data) => {
    if (Array.isArray(data)) {
      return data.map(() => '···');
    }
    const o = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        o[key] = '···';
      }
    }
    return o;
  };
}

function iteratingMemberFilter(next) {
  return (data) => {
    let c = null;
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const v = data[key];
        const r = next(v);
        if (r !== v) {
          if (c) {
            c[key] = r;
          } else {
            c = copy(data, key, r);
          }
        }
      }
    }
    return c || data;
  };
}

function filter(path) {
  const m = path.match(
    /^([a-zA-Z_0-9]+|\*)[.[]|^\[([0-9]+|\*)\]|^\[["']([^"']+)["']\]/
  );
  if (!m) {
    return propertyFilter(path);
  }
  const key = m[1] || m[2] || m[3];
  const remain = path
    .substring(m.index + m[0].length - 1)
    .replace(/^[.\]]+/, '');
  if (remain) {
    const next = filter(remain);
    return key === '*'
      ? iteratingMemberFilter(next)
      : memberFilter(key, next);
  }
  return key === '*'
    ? iteratingFilter()
    : propertyFilter(key);
}

function filters(args) {
  const f = Array.prototype.map.call(args, filter);
  return (entry) => {
    for (let i = 0; i < f.length; i++) {
      entry.data = f[i](entry.data);
    }
    return entry;
  };
}

function transform(fn) {
  return new Transform({
    objectMode: true,
    transform: fn
  });
}

module.exports = function x(map) {
  if (typeof map === 'object') {
    const ff = {};
    for (const key in map) {
      if (map.hasOwnProperty(key)) {
        ff[key] = filters(map[key]);
      }
    }
    return transform((entry, enc, callback) => {
      const fn = ff[entry.topic] || ff['*'];
      callback(null, fn ? fn(entry) : entry);
    });
  }

  const fn = filters(arguments);
  return transform((entry, enc, callback) => {
    callback(null, fn(entry));
  });
};
