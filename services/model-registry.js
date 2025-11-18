'use strict';
const fs = require('fs');
const path = require('path');

let cache = null;

function load() {
  if (cache) return cache;
  const p = path.resolve(__dirname, '..', 'config', 'model-registry.json');
  const raw = fs.readFileSync(p, 'utf-8');
  cache = JSON.parse(raw);
  return cache;
}

function list() {
  const reg = load();
  return Object.entries(reg.models).map(([key, v]) => ({
    key,
    displayName: v.displayName,
    provider: v.provider,
    apiModel: v.apiModel,
    capabilities: v.capabilities || []
  }));
}

function getDefaultForRole(roleId) {
  const reg = load();
  return reg.defaults?.[roleId] || null;
}

module.exports = { load, list, getDefaultForRole };


