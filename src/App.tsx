import { useState } from 'react';
import styles from './commandGenerator.module.scss';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { LibrarySection } from './component/LibrarySection';
import data from './data/data.json'

const platforms = ['Windows'];

type Lib = {
  name: string;
  cmd: string;
};

type Libs = {
  ui: Lib[];
  state: Lib[];
  routing: Lib[];
  form: Lib[];
  fetch: Lib[];
};

export default function CommandGenerator() {
  const [platform, setPlatform] = useState('Windows');
  const [packageManager, setPackageManager] = useState('');
  const [framework, setFramework] = useState('');
  const [commandFramework, setCommandFramework] = useState<string>('');
  const [commandUi, setCommandUi] = useState<{ name: string; cmd: string }[]>([]);
  const [commandState, setCommandState] = useState<{ name: string; cmd: string }[]>([]);
  const [commandRouting, setCommandRouting] = useState<{ name: string; cmd: string }[]>([]);
  const [commandForm, setCommandForm] = useState<{ name: string; cmd: string }[]>([]);
  const [commandFetch, setCommandFetch] = useState<{ name: string; cmd: string }[]>([]);
  const [copiedIcon, setCopiedIcon] = useState<{ [key: string]: boolean }>({
    framework: false,
    ui: false,
    state: false,
    routing: false,
    form: false,
    fetch: false
  });

  const handlePlatformSelect = (pf: string) => {
    setPlatform(pf);
  };

  const handlePackageManagerSelect = (pm: string) => {
    setPackageManager(pm);
    setFramework('');
    updateFrameWork(pm, '', {
      ui: [],
      state: [],
      routing: [],
      form: [],
      fetch: [],
    });
  };

  const handleFrameworkSelect = (fw: string) => {
    setFramework(fw);
    const selectedFramework = data
      .find((d) => d.pm === 'npm') // npm または pip を選択
      ?.framework.find((f) => f.name === fw);

    if (selectedFramework) {
      updateFrameWork(packageManager, fw, selectedFramework.libs);
    };
  };

  const updateFrameWork = (
    pm: string,
    fw: string,
    libs: Partial<Libs> = {}
  ) => {
    let cmd = "";

    if (fw) {
      const fwData = data.find((f) => f.pm === pm)?.framework.find((framework) => framework.name === fw);
      const fwCmd = fwData?.cmd || "";
      cmd = pm === "sudo" ? `sudo ${fwCmd}` : fwCmd;
    }

    // `libs` のプロパティが `undefined` にならないようにデフォルト値を適用し、
    // `cmd` と `name` のペアとしてオブジェクト配列に変換
    setCommandFramework(cmd);
    setCommandUi(libs.ui?.map(lib => ({ name: lib.name, cmd: lib.cmd })) ?? []);
    setCommandState(libs.state?.map(lib => ({ name: lib.name, cmd: lib.cmd })) ?? []);
    setCommandRouting(libs.routing?.map(lib => ({ name: lib.name, cmd: lib.cmd })) ?? []);
    setCommandForm(libs.form?.map(lib => ({ name: lib.name, cmd: lib.cmd })) ?? []);
    setCommandFetch(libs.fetch?.map(lib => ({ name: lib.name, cmd: lib.cmd })) ?? []);
  };

const copyToClipboard = (command: string, section: keyof typeof copiedIcon) => {
    // クリップボードにテキストをコピー
    navigator.clipboard.writeText(command).then(() => {

      // 該当セクションのアイコンを一時的に変更
      setCopiedIcon(prev => ({
        ...prev,
        [section]: true
      }));

      // 3秒後に元のアイコンに戻す
      setTimeout(() => {
        setCopiedIcon(prev => ({
          ...prev,
          [section]: false
        }));
      }, 3000);
    }).catch(err => {
      console.error('クリップボードへのコピーに失敗:', err);
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Command Generator</h1>
      </div>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <h2>PlatForm</h2>
          {platforms.map((pf) => (
            <button
              key={pf}
              onClick={() => handlePlatformSelect(pf)}
              className={platform === pf ? styles.active : ''}
            >
              {pf}
            </button>
          ))}
        </aside>

        <main className={styles.main}>
          <section>
            <h2 className={styles.h2}>Package manager</h2>
            <div>
              {data.map((pm, index) => (
                <button
                  key={index}
                  onClick={() => handlePackageManagerSelect(pm.pm)}
                  className={packageManager === pm.pm ? styles.active : ''}
                >
                  {pm.pm}
                </button>
              ))}
            </div>
          </section>

          {packageManager && (
            <section>
              <h2 className={styles.h2}>フレームワーク</h2>

              {data
                .filter((fw) => fw.pm === packageManager) // 選択された packageManager のみを表示
                .map((fw) => (
                  <div key={fw.pm}>
                    <div>
                      {fw.framework.map((frameworkItem, frameworkIndex) => (
                        <button
                          key={`${fw.pm}-${frameworkIndex}`}
                          onClick={() => handleFrameworkSelect(frameworkItem.name)}
                          className={framework === frameworkItem.name ? styles.active : ''}
                        >
                          {frameworkItem.name}
                        </button>
                      ))}
                    </div>
                  </div>
              ))}

              <div className={styles.commandBox}>
                <p className={styles.commandInput}>{commandFramework}</p>
                <button onClick={() => copyToClipboard(commandFramework, 'framework')}>
                  {copiedIcon.framework ? <ThumbUpIcon /> : <ContentCopyIcon />}
                </button>
              </div>
            </section>
          )}

          {framework && (
            <LibrarySection
              title={"UIデザイン"}
              command={commandUi}
              copyToClipboard={(command) => copyToClipboard(command, 'ui')}
              copiedIcon={copiedIcon}
              lib={('ui')}
            />
          )}

          {framework && (
            <LibrarySection
              title={'状態管理ライブラリ'}
              command={commandState}
              copyToClipboard={(command) => copyToClipboard(command, 'state')}
              copiedIcon={copiedIcon}
              lib={('state')}
            />
          )}

          {framework && (
            <LibrarySection
              title={'ルーティングライブラリ'}
              command={commandRouting}
              copyToClipboard={(command) => copyToClipboard(command, 'routing')}
              copiedIcon={copiedIcon}
              lib={('routing')}
            />
          )}

          {framework && (
            <LibrarySection
              title={'フォーム処理ライブラリ'}
              command={commandForm}
              copyToClipboard={(command) => copyToClipboard(command, 'form')}
              copiedIcon={copiedIcon}
              lib={('form')}
            />
          )}

          {framework && (
            <LibrarySection
              title={'データフェッチングライブラリ'}
              command={commandFetch}
              copyToClipboard={(command) => copyToClipboard(command, 'fetch')}
              copiedIcon={copiedIcon}
              lib={('fetch')}
            />
          )}

        </main>
      </div>
    </div>
  );
}