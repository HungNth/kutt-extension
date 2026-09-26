import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getQrDownloadFilename,
  getQrCanvasStyle,
  QR_PREVIEW_SIZE,
} from '../source/Popup/qr.ts';

test('getQrDownloadFilename derives a safe name from the Shortened Link code', () => {
  assert.equal(
    getQrDownloadFilename('https://links.example/abc-123'),
    'kutt-qr-abc-123.png'
  );
  assert.equal(
    getQrDownloadFilename('https://links.example/a%20b%3Fc'),
    'kutt-qr-a-b-c.png'
  );
});

test('getQrDownloadFilename falls back when no usable Shortened Link code exists', () => {
  assert.equal(getQrDownloadFilename('https://links.example/'), 'kutt-qr.png');
  assert.equal(getQrDownloadFilename('not a URL'), 'kutt-qr.png');
});

test('getQrCanvasStyle returns explicit 250px dimensions to override QRCodeCanvas inline defaults', () => {
  const style = getQrCanvasStyle();
  assert.equal(style.width, QR_PREVIEW_SIZE);
  assert.equal(style.height, QR_PREVIEW_SIZE);
  assert.equal(style.width, 250);
  assert.equal(style.height, 250);
});
