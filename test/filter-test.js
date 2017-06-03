/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const logX = require('..');

describe('filter', () => {

  it('passes unmatched object through', () => {
    const filter = logX.filter('test');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { key: 'value' };
    filter.write(original);

    assert.equal(entries.length, 1);
    assert.strictEqual(entries[0], original);
  });

  it('passes modified copy with filtered property', () => {
    const filter = logX.filter('key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { key: 'value' };
    filter.write(original);

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], { key: '·····' });
    assert.notStrictEqual(entries[0], original);
  });

  it('replaces multiple properties', () => {
    const filter = logX.filter('key1', 'key2');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { key1: 'value', key2: 'other', key3: 'plain' };
    filter.write(original);

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      key1: '·····',
      key2: '·····',
      key3: 'plain'
    });
    assert.notStrictEqual(entries[0], original);
  });

  it('replaces deeps property', () => {
    const filter = logX.filter('key.child.deep');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { key: { child: { deep: 'test' } } };
    filter.write(original);

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      key: {
        child: {
          deep: '·····'
        }
      }
    });
    assert.notStrictEqual(entries[0], original);
  });

  it('does not fail if deep property does not exist', () => {
    const filter = logX.filter('key.child.deep');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { key: 'is something else' };
    filter.write(original);

    assert.equal(entries.length, 1);
    assert.strictEqual(entries[0], original);
  });

  it('does not add property', () => {
    const filter = logX.filter('key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = {};
    filter.write(original);

    assert.equal(entries.length, 1);
    assert.strictEqual(entries[0], original);
  });

});
