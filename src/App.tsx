import { useState } from 'react'; // useEffect を追加
import styles from './commandGenerator.module.scss';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { LibrarySection } from './component/LibrarySection'; // LibrarySection をインポート
// data.json が updata_data.json の内容に更新されている前提
import dataJson from './data/data.json';

// プラットフォーム選択肢（現状Windowsのみ）
const platforms = ['Windows'];

// ライブラリの型定義 (data.json の lib 配列要素)
type Lib = {
  name: string;
  cmd: string;
};

// ライブラリセクションの型定義 (data.json の libraries 配列要素)
type LibrarySectionData = {
  id: string;
  title: string;
  lib: Lib[];
};

// フレームワークの型定義 (data.json の framework 配列要素)
type FrameworkData = {
    name: string;
    cmd: { // cmd がオブジェクトになった
        pmc: string;
        package: string;
        version?: string[]; // version はオプショナルかもしれない
    };
};

// data.json のトップレベル要素の型定義
type PackageManagerData = {
  pm: string;
  actions?: { [key: string]: string };
  options?: { [key: string]: string };
  framework: FrameworkData[];
  libraries: LibrarySectionData[];
};

// インポートしたデータに型を明示的に適用
const data: PackageManagerData[] = dataJson;

export default function CommandGenerator() {
  const [platform, setPlatform] = useState('Windows');
  const [packageManager, setPackageManager] = useState<string>('');
  const [framework, setFramework] = useState<string>('');
  const [commandFramework, setCommandFramework] = useState<string>('');
  const [selectedLibSections, setSelectedLibSections] = useState<LibrarySectionData[]>([]);
  const [copiedIcon, setCopiedIcon] = useState<{ [key: string]: boolean }>({});

  // --- ヘルパー関数: フレームワークコマンド生成 ---
  const generateFrameworkCommand = (pm: string, fwName: string): string => {
    const pmData = data.find((d) => d.pm === pm);
    const selectedFrameworkData = pmData?.framework.find((f) => f.name === fwName);

    if (selectedFrameworkData?.cmd) {
      const { pmc, package: pkgName } = selectedFrameworkData.cmd;
      const baseCmd = pmc;
      let finalCommand = "";

      if (baseCmd === 'npx' || (baseCmd === 'npm' && pkgName.startsWith('create'))) {
        finalCommand = `${baseCmd} ${pkgName}`;
      } else if (baseCmd === 'pip') {
        finalCommand = `${baseCmd} install ${pkgName}`;
      } else {
        const installAction = pmData?.actions?.install ?? '';
        finalCommand = `${baseCmd} ${installAction} ${pkgName}`.trim().replace(/\s+/g, ' ');
      }
      return finalCommand;
    }
    return ''; // コマンドが見つからない場合
  };

  // --- イベントハンドラ: プラットフォーム選択 ---
  const handlePlatformSelect = (pf: string) => {
    setPlatform(pf);
    // 必要に応じてリセット
    // setPackageManager('');
    // setFramework('');
    // setCommandFramework('');
    // setSelectedLibSections([]);
    // setCopiedIcon({});
  };

  // --- イベントハンドラ: パッケージマネージャー選択 ---
  const handlePackageManagerSelect = (pm: string) => {
    setPackageManager(pm);
    setCopiedIcon({}); // コピー状態リセット

    const pmData = data.find((d) => d.pm === pm);

    // ライブラリのセット
    if (pmData?.libraries) {
      setSelectedLibSections(pmData.libraries);
    } else {
      setSelectedLibSections([]);
    }

    // フレームワークの初期選択とコマンド生成
    if (pmData?.framework && pmData.framework.length > 0) {
      const initialFramework = pmData.framework[0]; // 最初のフレームワークを取得
      setFramework(initialFramework.name); // Stateにセット
      const initialCommand = generateFrameworkCommand(pm, initialFramework.name); // コマンド生成
      setCommandFramework(initialCommand); // Stateにセット
    } else {
      // フレームワークがない場合はリセット
      setFramework('');
      setCommandFramework('');
    }
  };

  // --- イベントハンドラ: フレームワーク選択 ---
  const handleFrameworkSelect = (fw: string) => {
    setFramework(fw); // 選択されたフレームワークをStateにセット
    const command = generateFrameworkCommand(packageManager, fw); // 対応するコマンドを生成
    setCommandFramework(command); // Stateにセット
    setCopiedIcon(prev => ({ ...prev, framework: false })); // フレームワークコピー状態をリセット
  };

  // --- クリップボードコピー関数 (変更なし) ---
  const copyToClipboard = (command: string, key: string) => {
    if (!command) return;
    navigator.clipboard.writeText(command).then(() => {
      setCopiedIcon(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedIcon(prev => ({ ...prev, [key]: false }));
      }, 1500);
    }).catch(err => {
      console.error('クリップボードへのコピーに失敗:', err);
    });
  };

  // 選択中のPMに対応するデータを取得 (レンダリングで使用)
  const currentPmData = data.find((d) => d.pm === packageManager);
  // フレームワークが存在するかどうか
  const hasFrameworks = currentPmData?.framework && currentPmData.framework.length > 0;

  // --- レンダリング ---
  return (
    <div className={styles.container}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <h1>Cmd Palette</h1>
      </div>

      <div className={styles.contentWrapper}>
        {/* サイドバー */}
        <aside className={styles.sidebar}>
          <h2>Platform</h2>
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

        {/* メインコンテンツ */}
        <main className={styles.main}>
          {/* パッケージマネージャー選択 */}
          <section>
            <h2 className={styles.h2}>Package Manager</h2>
            <div>
              {data.map((pmData) => (
                <button
                  key={pmData.pm}
                  onClick={() => handlePackageManagerSelect(pmData.pm)}
                  className={packageManager === pmData.pm ? styles.active : ''}
                >
                  {pmData.pm}
                </button>
              ))}
            </div>
          </section>

          {/* --- 修正箇所: フレームワークセクションの表示条件 --- */}
          {/* packageManagerが選択されており、かつフレームワークが存在する場合のみ表示 */}
          {packageManager && hasFrameworks && (
            <section>
              {/* h2の表示条件もこれでOK */}
              <h2 className={styles.h2}>Framework</h2>
              <div>
                {/* currentPmDataが未定義でないことを確認してからmap */}
                {currentPmData?.framework.map((fwItem) => (
                  <button
                    key={`${packageManager}-${fwItem.name}`}
                    onClick={() => handleFrameworkSelect(fwItem.name)}
                    // framework state と fwItem.name が一致すれば active
                    className={framework === fwItem.name ? styles.active : ''}
                  >
                    {fwItem.name}
                  </button>
                ))}
              </div>

              {/* フレームワークコマンド表示 (コマンドが空でない場合) */}
              {/* framework state に値があるかではなく、 commandFramework が空でないかで判定 */}
              {commandFramework && (
                <div className={styles.commandBox}>
                  <p className={styles.commandInput}>{commandFramework}</p>
                  <button onClick={() => copyToClipboard(commandFramework, 'framework')}>
                    {copiedIcon['framework'] ? <ThumbUpIcon /> : <ContentCopyIcon />}
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ライブラリセクション表示 */}
          {packageManager && selectedLibSections.length > 0 && (
            <section>
              {/* <h2 className={styles.h2}>Libraries</h2> */}
              {selectedLibSections.map((libSection) => (
                <LibrarySection
                  key={libSection.id}
                  title={libSection.title}
                  libs={libSection.lib}
                  sectionId={libSection.id}
                  copyToClipboard={copyToClipboard}
                  copiedStates={copiedIcon}
                />
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
