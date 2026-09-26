import type {JSX} from 'react';
import {memo} from 'react';
import clsx from 'clsx';

import styles from './Footer.module.scss';

function Footer(): JSX.Element {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.linksSection}>
          <a
            href="https://github.com/thedevs-network/kutt"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className={clsx(styles.linkItem, styles.narrow)}
          >
            Kutt Project
          </a>
          <span className={styles.linkDivider} />
          <a
            href="https://github.com/HungNth/kutt-extension/issues"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className={clsx(styles.linkItem, styles.wide)}
          >
            Report an issue
          </a>
          <span className={styles.linkDivider} />
          <a
            href="https://github.com/HungNth/kutt-extension"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className={clsx(styles.linkItem, styles.narrow)}
          >
            GitHub
          </a>
        </div>
      </footer>
    </>
  );
}

export default memo(Footer);
