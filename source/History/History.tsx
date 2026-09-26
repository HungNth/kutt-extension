import type {JSX} from 'react';
import {useEffect, useState} from 'react';

import {
  useShortenedLinks,
  ShortenedLinksActionTypes,
} from '../contexts/shortened-links-context';
import {useExtensionSettings} from '../contexts/extension-settings-context';
import {
  useRequestStatus,
  RequestStatusActionTypes,
} from '../contexts/request-status-context';
import messageUtil from '../util/messageUtil';
import {FETCH_URLS_HISTORY} from '../Background/constants';
import {getExtensionSettings} from '../util/settings';
import {
  SuccessfulUrlsHistoryFetchProperties,
  AuthRequestBodyProperties,
  ApiErroredProperties,
  ErrorStateProperties,
} from '../Background';
import {getConnectionConfig} from '../util/connection';

import BodyWrapper from '../components/BodyWrapper';
import Loader from '../components/Loader';
import Header from '../Options/Header';
import Table from './Table';

import styles from './History.module.scss';

function History(): JSX.Element {
  const [, shortenedLinksDispatch] = useShortenedLinks();
  const [, extensionSettingsDispatch] = useExtensionSettings();
  const [requestStatusState, requestStatusDispatch] = useRequestStatus();
  const [errored, setErrored] = useState<ErrorStateProperties>({
    error: null,
    message: '',
  });
  const [hostUrl, setHostUrl] = useState<string>('');

  useEffect(() => {
    async function getUrlsHistoryStats(): Promise<void> {
      // ********************************* //
      // **** GET EXTENSIONS SETTINGS **** //
      // ********************************* //
      const {settings = {}} = await getExtensionSettings();
      const connection = getConnectionConfig(settings);

      if (!connection) {
        setErrored({
          error: true,
          message:
            'Error: Extension is not configured. Please set your Kutt Instance URL and API Key in Options.',
        });
        requestStatusDispatch({
          type: RequestStatusActionTypes.SET_LOADING,
          payload: false,
        });
        return;
      }

      const historyEnabled = Object.prototype.hasOwnProperty.call(
        settings,
        'history'
      )
        ? (settings.history as boolean)
        : true;

      const defaultExtensionConfig = {
        apikey: connection.apikey,
        history: historyEnabled,
        host: {
          hostDomain: connection.hostDomain,
          hostUrl: connection.hostUrl,
        },
      };

      setHostUrl(connection.hostUrl);

      if (defaultExtensionConfig.history) {
        // ****************************************************** //
        // **************** FETCH URLS HISTORY ****************** //
        // ****************************************************** //
        const urlsHistoryFetchRequetBody: AuthRequestBodyProperties = {
          apikey: defaultExtensionConfig.apikey,
          hostUrl: defaultExtensionConfig.host.hostUrl,
        };

        // call api
        const response:
          SuccessfulUrlsHistoryFetchProperties | ApiErroredProperties =
          await messageUtil.send(
            FETCH_URLS_HISTORY,
            urlsHistoryFetchRequetBody
          );

        if (!response.error) {
          setErrored({error: false, message: 'Fetch successful'});

          shortenedLinksDispatch({
            type: ShortenedLinksActionTypes.HYDRATE_SHORTENED_LINKS,
            payload: {
              items: response.data.data,
              total: response.data.total,
            },
          });
        } else {
          setErrored({error: true, message: response.message});
        }
      } else {
        setErrored({
          error: true,
          message: 'History page disabled. Please enable it from settings.',
        });
      }

      requestStatusDispatch({
        type: RequestStatusActionTypes.SET_LOADING,
        payload: false,
      });
    }

    getUrlsHistoryStats();
  }, [
    extensionSettingsDispatch,
    requestStatusDispatch,
    shortenedLinksDispatch,
  ]);

  return (
    <BodyWrapper>
      <div id="history" className={styles.historyPage}>
        <div className={styles.historyContent}>
          <Header subtitle="Recent Links" hostUrl={hostUrl} />

          {}
          {!requestStatusState.loading ? (
            !errored.error ? (
              <Table />
            ) : (
              <h2 className={styles.errorMessage}>{errored.message}</h2>
            )
          ) : (
            <div className={styles.loaderContainer}>
              <Loader />
            </div>
          )}
        </div>
      </div>
    </BodyWrapper>
  );
}

export default History;
