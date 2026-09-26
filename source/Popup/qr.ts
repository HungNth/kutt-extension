export function getQrDownloadFilename(shortenedLink: string): string {
  try {
    const pathname = new URL(shortenedLink).pathname;
    const code = decodeURIComponent(
      pathname.slice(pathname.lastIndexOf('/') + 1)
    )
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^[-.]+|[-.]+$/g, '');

    return code ? `kutt-qr-${code}.png` : 'kutt-qr.png';
  } catch {
    return 'kutt-qr.png';
  }
}

export const QR_PREVIEW_SIZE = 250;

export function getQrCanvasStyle(): {width: number; height: number} {
  return {
    width: QR_PREVIEW_SIZE,
    height: QR_PREVIEW_SIZE,
  };
}
