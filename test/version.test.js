'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { nextVersion, isValidVersion } = require('../src/shared/version');

test('zählt die letzte Stelle hoch', () => {
  assert.equal(nextVersion('0.0.1'), '0.0.2');
  assert.equal(nextVersion('1.2.3'), '1.2.4');
});

test('nach 0.0.9 kommt 0.1.0', () => {
  assert.equal(nextVersion('0.0.9'), '0.1.0');
});

test('nach 0.9.9 kommt 1.0.0', () => {
  assert.equal(nextVersion('0.9.9'), '1.0.0');
});

test('die erste Stelle darf über 9 wachsen', () => {
  assert.equal(nextVersion('9.9.9'), '10.0.0');
});

test('lehnt Versionen außerhalb des Schemas ab', () => {
  assert.equal(isValidVersion('0.0.10'), false);
  assert.equal(isValidVersion('1.0'), false);
  assert.equal(isValidVersion('abc'), false);
  assert.throws(() => nextVersion('0.10.0'));
});
