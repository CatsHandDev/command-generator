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

export default function CommandGenerator() {
  const [platform, setPlatform] = useState('Windows');
  const [packageManager, setPackageManager] = useState('');
  const [framework, setFramework] = useState('');
  const [commandFramework, setCommandFramework] = useState<string>('');
  const [, setCommandUi] = useState<{ name: string; cmd: string }[]>([]);
  const [, setCommandState] = useState<{ name: string; cmd: string }[]>([]);
  const [, setCommandRouting] = useState<{ name: string; cmd: string }[]>([]);
  const [, setCommandForm] = useState<{ name: string; cmd: string }[]>([]);
  const [, setCommandFetch] = useState<{ name: string; cmd: string }[]>([]);
  const [copiedIcon, setCopiedIcon] = useState<{ [key: string]: boolean }>({
    framework: false,
    ui: false,
    state: false,
    routing: false,
    form: false,
    fetch: false,
    date: false,
    processing: false,
    request: false,
  });
  const [selectedLibSections, setSelectedLibSections] = useState<{
    title: string;
    lib: { name: string; cmd: string }[];
    id: string
  }[]>([]);

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
      .find((d) => d.pm === packageManager)
      ?.framework.find((f) => f.name === fw);

    if (selectedFramework) {
      // フレームワークごとにlibsの構造が異なるため、適切に処理
      const libs = selectedFramework.libs;

      // libsが配列かオブジェクトかを判定
      const libSections = Array.isArray(libs)
        ? libs
        : Object.entries(libs).map(([id, libraryList]) => ({
            id,
            lib: libraryList as { name: string; cmd: string }[],
            title: id === 'ui' ? 'UIデザイン' :
                   id === 'state' ? '状態管理' :
                   id === 'routing' ? 'ルーティング' :
                   id === 'form' ? 'フォーム' :
                   id === 'fetch' ? 'データフェッチ' :
                   id
          }));

      // 状態を更新
      setSelectedLibSections(libSections as {
        title: string;
        lib: { name: string; cmd: string }[];
        id: string
      }[]);

      updateFrameWork(packageManager, fw, libs);
    }
  };

  const updateFrameWork = (
    pm: string,
    fw: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    libs: any = {}
  ) => {
    let cmd = "";

    if (fw) {
      const fwData = data.find((f) => f.pm === pm)?.framework.find((framework) => framework.name === fw);
      const fwCmd = fwData?.cmd || "";
      cmd = pm === "sudo" ? `sudo ${fwCmd}` : fwCmd;
    }

    // 各セクションのライブラリコマンドを適切に設定
    setCommandFramework(cmd);
    setCommandUi(libs.ui?.map ? libs.ui.map((lib: Lib) => ({ name: lib.name, cmd: lib.cmd })) : []);
    setCommandState(libs.state?.map ? libs.state.map((lib: Lib) => ({ name: lib.name, cmd: lib.cmd })) : []);
    setCommandRouting(libs.routing?.map ? libs.routing.map((lib: Lib) => ({ name: lib.name, cmd: lib.cmd })) : []);
    setCommandForm(libs.form?.map ? libs.form.map((lib: Lib) => ({ name: lib.name, cmd: lib.cmd })) : []);
    setCommandFetch(libs.fetch?.map ? libs.fetch.map((lib: Lib) => ({ name: lib.name, cmd: lib.cmd })) : []);
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
        <h1>npm & pip コマンド生成ツール</h1>
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

          {selectedLibSections.length > 0 && (
            selectedLibSections.map((libSection, index) => (
              <LibrarySection
                key={index}
                title={libSection.title}
                command={libSection.lib.map(lib => ({ name: lib.name, cmd: lib.cmd }))}
                copyToClipboard={(command) => copyToClipboard(command, libSection.id)}
                copiedIcon={copiedIcon}
                lib={libSection.id}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}