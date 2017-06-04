/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const logX = require('..');

describe('x', () => {

  it('passes unmatched object through', () => {
    const filter = logX('test');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { topic: 'ok', data: { key: 'value' } };
    filter.write(original);

    assert.equal(entries.length, 1);
    assert.strictEqual(entries[0], original);
  });

  it('passes modified copy with filtered property', () => {
    const filter = logX('key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original_data = { key: 'value' };
    const original_entry = { topic: 'ok', data: original_data };
    filter.write(original_entry);

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], { topic: 'ok', data: { key: '·····' } });
    assert.strictEqual(entries[0], original_entry);
    assert.notStrictEqual(entries[0].data, original_data.data);
  });

  it('replaces multiple properties', () => {
    const filter = logX('key1', 'key2');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { key1: 'value', key2: 'other', key3: 'plain' };
    filter.write({
      topic: 'ok',
      data: original
    });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'ok',
      data: {
        key1: '·····',
        key2: '·····',
        key3: 'plain'
      }
    });
    assert.notStrictEqual(entries[0].data, original);
  });

  it('replaces deep property', () => {
    const filter = logX('key.child.deep');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { key: { child: { deep: 'test' } } };
    filter.write({
      topic: 'ok',
      data: original
    });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'ok',
      data: {
        key: {
          child: {
            deep: '·····'
          }
        }
      }
    });
    assert.notStrictEqual(entries[0].data, original.data);
  });

  it('does not fail if deep property does not exist', () => {
    const filter = logX('key.child.deep');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { topic: 'ok', data: { key: 'is something else' } };
    filter.write(original);

    assert.equal(entries.length, 1);
    assert.strictEqual(entries[0], original);
  });

  it('does not add property', () => {
    const filter = logX('key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { topic: 'ok', data: {} };
    filter.write(original);

    assert.equal(entries.length, 1);
    assert.strictEqual(entries[0], original);
  });

  it('replaces properties in topic', () => {
    const filter = logX({
      wtf: ['key1', 'key2']
    });
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    filter.write({ topic: 'wtf', data: { key1: 'a', key2: 'b', key3: 'c' } });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'wtf',
      data: {
        key1: '·····',
        key2: '·····',
        key3: 'c'
      }
    });
  });

  it('does not replace property in other topic', () => {
    const filter = logX({
      wtf: ['key']
    });
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { topic: 'input', data: { key: 'value' } };
    filter.write(original);

    assert.equal(entries.length, 1);
    assert.strictEqual(entries[0], original);
  });

  it('replaces property in default', () => {
    const filter = logX({
      '*': ['key']
    });
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    filter.write({ topic: 'output', data: { key: 'value' } });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], { topic: 'output', data: { key: '·····' } });
  });

  it('replaces index in array', () => {
    const filter = logX('items[0]');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    filter.write({
      topic: 'output',
      data: { items: ['value'] }
    });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'output',
      data: { items: ['·····'] }
    });
  });

  it('replaces property in array', () => {
    const filter = logX('items[0].key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    filter.write({
      topic: 'output',
      data: { items: [{ key: 'value' }] }
    });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'output',
      data: { items: [{ key: '·····' }] }
    });
  });

  it('replaces property in reflective property name (single quote)', () => {
    const filter = logX('items[":a"].key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    filter.write({
      topic: 'output',
      data: { items: { ':a': { key: 'value' } } }
    });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'output',
      data: { items: { ':a': { key: '·····' } } }
    });
  });

  it('replaces property in reflective property name (double quote)', () => {
    const filter = logX('items[\':a\'].key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    filter.write({
      topic: 'output',
      data: { items: { ':a': { key: 'value' } } }
    });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'output',
      data: { items: { ':a': { key: '·····' } } }
    });
  });

  it('finds properties in array', () => {
    const filter = logX('items[*].key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    filter.write({
      topic: 'output',
      data: { items: [{ text: 'visible' }, { key: 'secret' }] }
    });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'output',
      data: { items: [{ text: 'visible' }, { key: '·····' }] }
    });
  });

  it('finds properties in object (dot notation)', () => {
    const filter = logX('*.key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    filter.write({
      topic: 'output',
      data: { foo: { text: 'visible', key: 'secret' }, bar: { key: 'other' } }
    });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'output',
      data: { foo: { text: 'visible', key: '·····' }, bar: { key: '·····' } }
    });
  });

  it('finds properties in object (brackets notation)', () => {
    const filter = logX('[*].key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    filter.write({
      topic: 'output',
      data: { foo: { text: 'visible', key: 'secret' }, bar: { key: 'other' } }
    });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'output',
      data: { foo: { text: 'visible', key: '·····' }, bar: { key: '·····' } }
    });
  });

  it('filters all array properties', () => {
    const filter = logX('items[*]');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    filter.write({
      topic: 'output',
      data: { items: ['one', 'two', 'three'] }
    });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'output',
      data: { items: ['···', '···', '···'] }
    });
  });

  it('finds properties in object', () => {
    const filter = logX('[*]');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    filter.write({
      topic: 'output',
      data: { a: 'one', b: 'two', c: 'three' }
    });

    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      topic: 'output',
      data: { a: '···', b: '···', c: '···' }
    });
  });

});
