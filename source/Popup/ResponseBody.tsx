import CopyToClipboard from 'react-copy-to-clipboard';
import type {JSX} from 'react';
import {useEffect, useRef, useState} from 'react';
import {QRCodeCanvas} from 'qrcode.react';
import clsx from 'clsx';

import {
  RequestStatusActionTypes,
  useRequestStatus,
} from '../contexts/request-status-context';
import {removeProtocol} from '../util/link';
import Icon from '../components/Icon';

import {getQrDownloadFilename, getQrCanvasStyle} from './qr';
import styles from './ResponseBody.module.scss';

const QR_EXPORT_SIZE = 512;

function ResponseBody(): JSX.Element {
  const [{error, message, actionStatus}, requestStatusDispatch] =
    useRequestStatus();
  const [copied, setCopied] = useState<boolean>(false);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 1300);
    return (): void => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!actionStatus) return;

    const timer = setTimeout(() => {
      requestStatusDispatch({
        type: RequestStatusActionTypes.SET_ACTION_STATUS,
        payload: null,
      });
    }, 2500);

    return (): void => clearTimeout(timer);
  }, [actionStatus, requestStatusDispatch]);

  function setActionStatus(actionError: boolean, actionMessage: string): void {
    requestStatusDispatch({
      type: RequestStatusActionTypes.SET_ACTION_STATUS,
      payload: {error: actionError, message: actionMessage},
    });
  }

  function getQrBlob(): Promise<Blob> {
    const canvas = qrCodeRef.current;

    if (!canvas) return Promise.reject(new Error('QR code is unavailable'));

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('QR image generation failed'));
      }, 'image/png');
    });
  }

  async function handleQrCopy(): Promise<void> {
    try {
      const blob = await getQrBlob();
      await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
      setActionStatus(false, 'QR copied');
    } catch {
      setActionStatus(true, 'QR copy failed. Download the image instead.');
    }
  }

  async function handleQrDownload(): Promise<void> {
    try {
      const blob = await getQrBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = getQrDownloadFilename(message);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setActionStatus(false, 'QR download started');
    } catch {
      setActionStatus(true, 'QR download failed.');
    }
  }

  if (error) {
    return (
      <div className={styles.popupBody}>
        <p className={styles.errorMessage}>{message}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.popupBody}>
        {!copied ? (
          <CopyToClipboard
            text={message}
            onCopy={(_text, result): void => {
              setCopied(result);
              setActionStatus(
                !result,
                result ? 'Link copied' : 'Link copy failed.'
              );
            }}
          >
            <Icon className={clsx(styles.icon, styles.copyIcon)} name="copy" />
          </CopyToClipboard>
        ) : (
          <Icon className={clsx(styles.icon, styles.copyIcon)} name="tick" />
        )}

        <CopyToClipboard
          text={message}
          onCopy={(_text, result): void => {
            setCopied(result);
            setActionStatus(
              !result,
              result ? 'Link copied' : 'Link copy failed.'
            );
          }}
        >
          <h1 className={styles.link}>{removeProtocol(message)}</h1>
        </CopyToClipboard>
      </div>

      <div className={styles.qrCodeContainer}>
        <QRCodeCanvas
          ref={qrCodeRef}
          value={message}
          size={QR_EXPORT_SIZE}
          bgColor="#ffffff"
          className={styles.qrCode}
          style={getQrCanvasStyle()}
          role="img"
          aria-label="QR code for the shortened link"
        />
        <div className={styles.qrActions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={(): void => void handleQrCopy()}
          >
            Copy QR
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={(): void => void handleQrDownload()}
          >
            Download QR
          </button>
        </div>
      </div>

      {actionStatus && (
        <p
          className={clsx(
            styles.actionStatus,
            actionStatus.error && styles.actionStatusError
          )}
          role="status"
          aria-live="polite"
        >
          {actionStatus.message}
        </p>
      )}
    </>
  );
}

export default ResponseBody;
