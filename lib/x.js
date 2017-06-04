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
    return (object) => object.hasOwnProperty(path);
  }
  const next = accessor(path.substring(p + 1));
  const key = path.substring(0, p);
  return (object) => object.hasOwnProperty(key) && next(object[key]);
}

function replacer(path) {
  // eslint-disable-next-line no-new-func
  return Function('entry', `entry.${path} = '·····'`);
}

module.exports = function () {
  const accessors = Array.prototype.map.call(arguments, accessor);
  const replacers = Array.prototype.map.call(arguments, replacer);

  return new Transform({
    objectMode: true,

    transform(entry, enc, callback) {
      let copy = null;
      for (let i = 0; i < accessors.length; i++) {
        if (accessors[i](entry)) {
          if (!copy) {
            copy = JSON.parse(JSON.stringify(entry));
          }
          replacers[i](copy);
        }
      }
      callback(null, copy || entry);
    }
  });
};
