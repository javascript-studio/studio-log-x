/*eslint-env mocha*/
'use strict';

const { assert, refute } = require('@sinonjs/referee');
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

    assert.equals(entries.length, 1);
    assert.same(entries[0], original);
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], { topic: 'ok', data: { key: '·····' } });
    assert.same(entries[0], original_entry);
    refute.same(entries[0].data, original_data);
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
      topic: 'ok',
      data: {
        key1: '·····',
        key2: '·····',
        key3: 'plain'
      }
    });
    refute.same(entries[0].data, original);
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
      topic: 'ok',
      data: {
        key: {
          child: {
            deep: '·····'
          }
        }
      }
    });
    refute.same(entries[0].data, original.data);
  });

  it('does not fail if deep property does not exist', () => {
    const filter = logX('key.child.deep');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { topic: 'ok', data: { key: 'is something else' } };
    filter.write(original);

    assert.equals(entries.length, 1);
    assert.same(entries[0], original);
  });

  it('does not add property', () => {
    const filter = logX('key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original = { topic: 'ok', data: {} };
    filter.write(original);

    assert.equals(entries.length, 1);
    assert.same(entries[0], original);
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
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

    assert.equals(entries.length, 1);
    assert.same(entries[0], original);
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], { topic: 'output', data: { key: '·····' } });
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
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

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
      topic: 'output',
      data: { a: '···', b: '···', c: '···' }
    });
  });

  it('applies filter for specified namespace', () => {
    const filter = logX.ns('Test', 'key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original_data = { key: 'value' };
    const original_entry = { ns: 'Test', topic: 'disk', data: original_data };
    filter.write(original_entry);

    assert.equals(entries.length, 1);
    assert.equals(entries[0], {
      ns: 'Test',
      topic: 'disk',
      data: { key: '·····' }
    });
    assert.same(entries[0], original_entry);
    refute.same(entries[0].data, original_data);
  });

  it('does not apply filter for different namespace', () => {
    const filter = logX.ns('Test', 'key');
    const entries = [];
    filter.on('data', (entry) => {
      entries.push(entry);
    });

    const original_data = { key: 'value' };
    const original_entry = { ns: 'Foo', topic: 'disk', data: original_data };
    filter.write(original_entry);

    assert.equals(entries.length, 1);
    assert.same(entries[0], original_entry);
    assert.same(entries[0].data, original_data);
  });

  it('combines multiple streams', () => {
    const all = logX.all(
      logX('a'),
      logX('b'),
      logX('c')
    );
    const entries = [];
    all.on('data', (entry) => {
      entries.push(entry);
    });

    all.write({ topic: 'disk', data: { a: 'A' } });
    all.write({ topic: 'disk', data: { b: 'B' } });
    all.write({ topic: 'disk', data: { c: 'C' } });
    all.write({ topic: 'disk', data: { a: 'A', b: 'B' } });
    all.write({ topic: 'disk', data: { b: 'B', c: 'C' } });
    all.write({ topic: 'disk', data: { a: 'A', c: 'C' } });

    assert.equals(entries.length, 6);
    assert.match(entries[0], { data: { a: '·····' } });
    assert.match(entries[1], { data: { b: '·····' } });
    assert.match(entries[2], { data: { c: '·····' } });
    assert.match(entries[3], { data: { a: '·····', b: '·····' } });
    assert.match(entries[4], { data: { b: '·····', c: '·····' } });
    assert.match(entries[5], { data: { a: '·····', c: '·····' } });
  });

  it('combines deep filters', () => {
    const all = logX.all(
      logX('a.x'),
      logX('b')
    );
    const entries = [];
    all.on('data', (entry) => {
      entries.push(entry);
    });

    all.write({ topic: 'disk', data: { a: { x: 'A' } } });
    all.write({ topic: 'disk', data: { b: 'B' } });
    all.write({ topic: 'disk', data: { a: { x: 'A' }, b: 'B' } });

    assert.equals(entries.length, 3);
    assert.match(entries[0], { data: { a: { x: '·····' } } });
    assert.match(entries[1], { data: { b: '·····' } });
    assert.match(entries[2], { data: { a: { x: '·····' }, b: '·····' } });
  });

  describe('with null property', () => {

    it('does not fail if property is null', () => {
      const filter = logX('key.child');

      refute.exception(() => {
        filter.write({ topic: 'ok', data: { key: null } });
      });
    });

    it('does not fail if deep property is null', () => {
      const filter = logX('key.child.deep');

      refute.exception(() => {
        filter.write({ topic: 'ok', data: { key: null } });
      });
    });

  });

  describe('with prototype-less object', () => {

    it('does not fail on prototype-less object', () => {
      const filter = logX('key');

      refute.exception(() => {
        filter.write({ topic: 'ok', data: Object.create(null) });
      });
    });

    it('does not fail on prototype-less object (key.child)', () => {
      const filter = logX('key.child');

      refute.exception(() => {
        filter.write({ topic: 'ok', data: Object.create(null) });
      });
    });

    it('does not fail on prototype-less object ([*])', () => {
      const filter = logX('[*]');
      const data = Object.create(null);
      data.key = 1;

      refute.exception(() => {
        filter.write({ topic: 'ok', data });
      });
    });

    it('does not fail on prototype-less object (*.key)', () => {
      const filter = logX('*.key');
      const data = Object.create(null);
      data.key = 1;

      refute.exception(() => {
        filter.write({ topic: 'ok', data });
      });
    });

  });

});
