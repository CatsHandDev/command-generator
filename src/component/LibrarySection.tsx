import { useState } from 'react';
import styles from '../commandGenerator.module.scss'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

type sectionType = {
  title: string,
  command: { name: string; cmd: string }[],
  copyToClipboard: (command: string) => void,
  copiedIcon: { [key: string]: boolean },
  lib: string,
};

export const LibrarySection = (
  { title, command, copyToClipboard, copiedIcon, lib }: sectionType
) => {
  const [selectedLib, setSelectedLib] = useState<{ name: string; cmd: string } | null>(null);

  const handleLibSelect = (lib: { name: string; cmd: string }) => {
    setSelectedLib(lib);
  };

  return (
    <section>
      <h2 className={styles.h2}>{title}</h2>
      <div>
        {command.map((lib, index) => (
          <button
            key={`${lib.name}-${index}`}
            onClick={() => handleLibSelect(lib)}
            className={
              selectedLib?.name === lib.name
                ? `${styles.libraryButton} ${styles.active}`
                : styles.libraryButton
            }
          >
            {lib.name}
          </button>
        ))}
      </div>
      {(selectedLib || command.length > 0) && (
        <div className={styles.commandBox}>
          <p className={styles.commandInput}>
            {selectedLib ? selectedLib.cmd : command[0].cmd}
          </p>
          <button onClick={() => copyToClipboard(selectedLib ? selectedLib.cmd : command[0].cmd)}>
            {copiedIcon[lib] ? <ThumbUpIcon /> : <ContentCopyIcon />}
          </button>
        </div>
      )}
    </section>
  )
}