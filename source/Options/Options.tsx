import type {JSX} from 'react';
import {useEffect, useState} from 'react';

import {getExtensionSettings} from '../util/settings';
import {
  HostProperties,
  useExtensionSettings,
  ExtensionSettingsActionTypes,
} from '../contexts/extension-settings-context';
import {
  useRequestStatus,
  RequestStatusActionTypes,
} from '../contexts/request-status-context';
import {normalizeKuttInstanceUrl} from '../util/connection';

import BodyWrapper from '../components/BodyWrapper';
import Loader from '../components/Loader';
import Header from './Header';
import Footer from './Footer';
import Form from './Form';

import styles from './Options.module.scss';

function Options(): JSX.Element {
  const [, extensionSettingsDispatch] = useExtensionSettings();
  const [requestStatusState, requestStatusDispatch] = useRequestStatus();
  const [hostUrl, setHostUrl] = useState<string>('');

  useEffect(() => {
    async function getSavedSettings(): Promise<void> {
      const {settings = {}} = await getExtensionSettings();
      const normalizedHost = normalizeKuttInstanceUrl(settings?.host);

      const defaultHost: HostProperties = {
        hostDomain: normalizedHost ? new URL(normalizedHost).host : '',
        hostUrl: normalizedHost || '',
      };

      const historyEnabled = Object.prototype.hasOwnProperty.call(
        settings,
        'history'
      )
        ? (settings.history as boolean)
        : true;

      const defaultExtensionConfig = {
        apikey: (settings?.apikey as string)?.trim() || '',
        history: historyEnabled,
        host: defaultHost,
        reuse: (settings?.reuse as boolean) || false,
      };
      setHostUrl(defaultHost.hostUrl);

      extensionSettingsDispatch({
        type: ExtensionSettingsActionTypes.HYDRATE_EXTENSION_SETTINGS,
        payload: defaultExtensionConfig,
      });
      requestStatusDispatch({
        type: RequestStatusActionTypes.SET_LOADING,
        payload: false,
      });
    }

    getSavedSettings();
  }, [extensionSettingsDispatch, requestStatusDispatch]);

  return (
    <>
      <BodyWrapper>
        <div id="options" className={styles.optionsPage}>
          <div className={styles.optionsContainer}>
            <Header hostUrl={hostUrl} />

            {!requestStatusState.loading ? (
              <Form />
            ) : (
              <div className={styles.loaderContainer}>
                <Loader />
              </div>
            )}

            <Footer />
          </div>
        </div>
      </BodyWrapper>
    </>
  );
}

export default Options;
