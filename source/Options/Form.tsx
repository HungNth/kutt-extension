import {isNull, isUndefined} from '@abhijithvijayan/ts-utils';
import type {JSX} from 'react';
import {useState, useEffect, useRef, ChangeEvent} from 'react';
import clsx from 'clsx';

import {useExtensionSettings} from '../contexts/extension-settings-context';
import {
  updateExtensionSettings,
  clearExtensionSettings,
  getExtensionSettings,
} from '../util/settings';
import {CHECK_API_KEY} from '../Background/constants';
import messageUtil from '../util/messageUtil';
import {
  normalizeKuttInstanceUrl,
  isValidKuttInstanceUrl,
  applyConnectionVerification,
} from '../util/connection';
import {
  SuccessfulApiKeyCheckProperties,
  AuthRequestBodyProperties,
  ApiErroredProperties,
  ErrorStateProperties,
} from '../Background';

import Icon from '../components/Icon';

import styles from './Form.module.scss';

type FormErrors = {
  apikey?: string;
  host?: string;
};

type FormValidity = {
  apikey?: boolean;
  host?: boolean;
};

function Form(): JSX.Element {
  const extensionSettingsState = useExtensionSettings()[0];
  const hostInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [errored, setErrored] = useState<ErrorStateProperties>({
    error: null,
    message: '',
  });

  // Staged connection fields (NOT auto-saved)
  const [stagedHost, setStagedHost] = useState<string>(
    extensionSettingsState.host.hostUrl || ''
  );
  const [stagedApiKey, setStagedApiKey] = useState<string>(
    extensionSettingsState.apikey || ''
  );

  // Sync staged state when external hydrated settings change
  useEffect(() => {
    if (extensionSettingsState.host.hostUrl) {
      setStagedHost(extensionSettingsState.host.hostUrl);
    }
    if (extensionSettingsState.apikey) {
      setStagedApiKey(extensionSettingsState.apikey);
    }
  }, [extensionSettingsState.host.hostUrl, extensionSettingsState.apikey]);

  // Preferences (auto-saved independently)
  const [historyPref, setHistoryPref] = useState<boolean>(
    extensionSettingsState.history
  );
  const [reusePref, setReusePref] = useState<boolean>(
    extensionSettingsState.reuse
  );

  useEffect(() => {
    setHistoryPref(extensionSettingsState.history);
  }, [extensionSettingsState.history]);

  useEffect(() => {
    setReusePref(extensionSettingsState.reuse);
  }, [extensionSettingsState.reuse]);

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formValidity, setFormValidity] = useState<FormValidity>({});

  const validStagedHost = isValidKuttInstanceUrl(stagedHost);
  const normalizedStagedHost = normalizeKuttInstanceUrl(stagedHost);

  const isFormValid: boolean =
    validStagedHost &&
    stagedApiKey.trim().length > 0 &&
    isUndefined(formErrors.host) &&
    isUndefined(formErrors.apikey);

  function handleHostUrlInputChange(val: string): void {
    setStagedHost(val);

    if (val.trim().length === 0) {
      setFormErrors((prev) => {
        return {...prev, host: 'Kutt Instance URL is required'};
      });
      setFormValidity((prev) => {
        return {...prev, host: false};
      });
      return;
    }

    if (!isValidKuttInstanceUrl(val.trim())) {
      setFormErrors((prev) => {
        return {
          ...prev,
          host: 'Please enter a valid HTTPS URL (e.g., https://kutt.example.com)',
        };
      });
      setFormValidity((prev) => {
        return {...prev, host: false};
      });
    } else {
      setFormErrors((prev) => {
        const {host: _, ...rest} = prev;
        return rest;
      });
      setFormValidity((prev) => {
        return {...prev, host: true};
      });
    }
  }

  function handleApiKeyInputChange(apikey: string): void {
    setStagedApiKey(apikey);

    if (apikey.trim().length === 0) {
      setFormErrors((prev) => {
        return {...prev, apikey: 'API key is required'};
      });
      setFormValidity((prev) => {
        return {...prev, apikey: false};
      });
    } else {
      setFormErrors((prev) => {
        const {apikey: _, ...rest} = prev;
        return rest;
      });
      setFormValidity((prev) => {
        return {...prev, apikey: true};
      });
    }
  }

  async function handleConnect(): Promise<void> {
    if (!normalizedStagedHost || stagedApiKey.trim().length === 0) {
      return;
    }

    setSubmitting(true);

    const apiKeyValidationBody: AuthRequestBodyProperties = {
      apikey: stagedApiKey.trim(),
      hostUrl: normalizedStagedHost,
    };

    const response: SuccessfulApiKeyCheckProperties | ApiErroredProperties =
      await messageUtil.send(CHECK_API_KEY, apiKeyValidationBody);

    if (!response.error) {
      setErrored({error: false, message: 'Connected successfully'});

      // Atomically commit verified credentials and account data to storage
      const {settings = {}} = await getExtensionSettings();
      const updated = applyConnectionVerification({
        currentSettings: settings,
        verifiedHostUrl: normalizedStagedHost,
        verifiedApiKey: stagedApiKey.trim(),
        verifiedUser: {
          email: response.data.email,
          domains: response.data.domains,
        },
      });

      await updateExtensionSettings(updated);
    } else {
      setErrored({error: true, message: response.message});
    }

    setSubmitting(false);

    setTimeout(() => {
      setErrored({error: null, message: ''});
    }, 4000);
  }

  async function handleResetSettings(): Promise<void> {
    await clearExtensionSettings();
    setShowResetConfirm(false);
    window.location.reload();
  }

  return (
    <>
      <div className={styles.formSection}>
        {/* Kutt Instance URL Input */}
        <div className={styles.inputGroup}>
          <label htmlFor="host" className={styles.label}>
            <span className={styles.labelWithInfo}>
              Kutt Instance URL
              <span className={styles.infoIcon}>
                <Icon name="info" />
                <span className={styles.tooltip}>
                  HTTPS URL of your self-hosted Kutt instance (e.g.,
                  https://kutt.example.com)
                </span>
              </span>
            </span>
          </label>

          <div className={styles.inputWrapper}>
            <input
              ref={hostInputRef}
              id="host"
              name="host"
              type="text"
              value={stagedHost}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                handleHostUrlInputChange(e.target.value);
              }}
              placeholder="https://kutt.example.com"
              spellCheck="false"
              className={clsx(
                styles.input,
                !isUndefined(formValidity.host) &&
                  !formValidity.host &&
                  styles.inputError
              )}
            />
          </div>

          <span className={styles.errorText}>{formErrors.host}</span>
        </div>

        {/* API Key Input */}
        <div className={styles.inputGroup}>
          <label htmlFor="apikey" className={styles.label}>
            API Key
            {normalizedStagedHost && (
              <span className={styles.labelLinkWrapper}>
                <a
                  href={normalizedStagedHost}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className={styles.labelLink}
                >
                  Open Instance
                </a>
                <span className={styles.tooltip}>
                  Open your Kutt instance to generate an API key in settings
                </span>
              </span>
            )}
          </label>

          <div className={styles.inputWrapper}>
            <div className={styles.inputIconWrapper}>
              <Icon
                className={styles.inputIcon}
                onClick={(): void => setShowApiKey(!showApiKey)}
                name={!showApiKey ? 'eye-closed' : 'eye'}
              />
            </div>

            <input
              id="apikey"
              name="apikey"
              type={!showApiKey ? 'password' : 'text'}
              value={stagedApiKey}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                handleApiKeyInputChange(e.target.value);
              }}
              placeholder="Paste your API key"
              spellCheck="false"
              className={clsx(
                styles.input,
                !isUndefined(formValidity.apikey) &&
                  !formValidity.apikey &&
                  styles.inputError
              )}
            />
          </div>

          <span className={styles.errorText}>{formErrors.apikey}</span>
        </div>
      </div>

      {/* Connect Action Button */}
      <div className={styles.validateSection}>
        <button
          type="button"
          disabled={submitting || !isFormValid}
          onClick={handleConnect}
          className={styles.validateButton}
        >
          <span className={styles.validateText}>Connect</span>

          <Icon
            name={
              submitting
                ? 'spinner'
                : (!isNull(errored.error) &&
                    ((!errored.error && 'tick') || 'cross')) ||
                  'zap'
            }
            className={styles.validateIcon}
          />
        </button>

        {!isNull(errored.error) && (
          <div
            className={clsx(
              styles.validationFeedback,
              errored.error ? styles.error : styles.success
            )}
          >
            <Icon
              className={styles.feedbackIcon}
              name={errored.error ? 'cross' : 'tick'}
            />
            <span className={styles.feedbackMessage}>{errored.message}</span>
          </div>
        )}
      </div>

      {/* Preferences Section */}
      <div className={styles.toggleSection}>
        <label htmlFor="history" className={styles.toggleLabel}>
          <span className={styles.toggleTextWithInfo}>
            <span className={styles.toggleText}>Show Recent Links</span>
            <span className={styles.infoIcon}>
              <Icon name="info" />
              <span className={styles.tooltip}>
                Enables the History page to view your recent shortened links
              </span>
            </span>
          </span>

          <span className={styles.toggleWrapper}>
            <span className={styles.toggleTrack} />
            <span
              className={clsx(styles.toggleKnob, historyPref && styles.active)}
            >
              <input
                id="history"
                name="history"
                type="checkbox"
                checked={historyPref}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                  const val = e.target.checked;
                  setHistoryPref(val);
                  updateExtensionSettings({history: val});
                }}
                className={styles.toggleInput}
              />
            </span>
          </span>
        </label>

        <label htmlFor="reuse" className={styles.toggleLabel}>
          <span className={styles.toggleTextWithInfo}>
            <span className={styles.toggleText}>Reuse Existing URLs</span>
            <span className={styles.infoIcon}>
              <Icon name="info" />
              <span className={styles.tooltip}>
                Returns the existing short link if the same URL was shortened
                before
              </span>
            </span>
          </span>

          <span className={styles.toggleWrapper}>
            <span className={styles.toggleTrack} />
            <span
              className={clsx(styles.toggleKnob, reusePref && styles.active)}
            >
              <input
                id="reuse"
                name="reuse"
                type="checkbox"
                checked={reusePref}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                  const val = e.target.checked;
                  setReusePref(val);
                  updateExtensionSettings({reuse: val});
                }}
                className={styles.toggleInput}
              />
            </span>
          </span>
        </label>
      </div>

      <div className={styles.resetSection}>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className={styles.resetButton}
        >
          Reset All Settings
        </button>
        <span className={styles.resetHint}>
          This will clear all your settings and reload the extension
        </span>
      </div>

      {showResetConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowResetConfirm(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowResetConfirm(false);
          }}
          role="button"
          tabIndex={0}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            <div className={styles.modalHeader}>
              <Icon name="info" className={styles.modalIcon} />
              <span className={styles.modalTitle}>Reset Settings?</span>
            </div>
            <p className={styles.modalText}>
              This will permanently delete your API key, instance connection,
              and all preferences. You will need to reconfigure the extension.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className={styles.modalCancelButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetSettings}
                className={styles.modalConfirmButton}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Form;
