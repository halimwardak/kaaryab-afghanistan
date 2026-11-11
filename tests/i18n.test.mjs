import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { createLanguageInstance } from '../lib/i18n.js';

function NavigationLabel() {
  const { t } = useTranslation();
  return React.createElement('button', { 'aria-label': t('Open navigation') }, t('Home'));
}
const render = instance => renderToString(React.createElement(I18nextProvider, {i18n:instance}, React.createElement(NavigationLabel)));

test('initial server and client instances synchronously produce identical attributes and text', () => {
  const server = createLanguageInstance();
  const client = createLanguageInstance();
  assert.equal(server.isInitialized,true);
  assert.equal(client.isInitialized,true);
  assert.equal(render(server),render(client));
  assert.match(render(client), /aria-label="Open navigation"/);
});

test('a previous language selection cannot leak into a new hydration tree', async () => {
  const previous = createLanguageInstance();
  const server = createLanguageInstance();
  for (const language of ['fa-AF','ps-AF']) {
    await previous.changeLanguage(language);
    assert.notEqual(render(previous),render(server));
    const freshClient = createLanguageInstance();
    assert.equal(freshClient.language,'en');
    assert.equal(render(freshClient),render(server));
  }
});
