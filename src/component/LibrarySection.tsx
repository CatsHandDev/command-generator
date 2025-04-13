import React, { useState, useMemo } from 'react'; // useState, useMemo をインポート
import styles from '../commandGenerator.module.scss'; // SCSSモジュールのパスを確認してください
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

// Propsの型定義 (親コンポーネントと合わせる)
type LibrarySectionProps = {
  title: string;
  libs: { name: string; cmd: string }[]; // libs に変更
  sectionId: string;                     // sectionId に変更
  copyToClipboard: (command: string, key: string) => void; // key 引数を追加
  copiedStates: { [key: string]: boolean }; // copiedStates に変更
};

export const LibrarySection: React.FC<LibrarySectionProps> = ({ // React.FCを使用し、Props名を修正
  title,
  libs,
  sectionId,
  copyToClipboard,
  copiedStates,
}) => {
  // State: 選択中のライブラリ (型を明示)
  const [selectedLib, setSelectedLib] = useState<{ name: string; cmd: string } | null>(null);

  // ハンドラ: ライブラリ選択
  const handleLibSelect = (lib: { name: string; cmd: string }) => {
    setSelectedLib(lib);
  };

  // 表示・コピー対象のコマンドと、それに対応するコピー状態管理用のキーを計算
  // useMemo を使って、依存関係が変わらない限り再計算しないようにする
  const currentTarget = useMemo(() => {
    // 優先度1: ユーザーがライブラリを選択した場合
    if (selectedLib) {
      return {
        cmd: selectedLib.cmd,
        key: `lib-${sectionId}-${selectedLib.name}`, // 親で管理しているキー形式に合わせる
      };
    }
    // 優先度2: まだ選択されておらず、ライブラリリストが存在する場合、最初のライブラリ
    if (libs.length > 0) {
      return {
        cmd: libs[0].cmd,
        key: `lib-${sectionId}-${libs[0].name}`, // 親で管理しているキー形式に合わせる
      };
    }
    // 表示・コピーする対象がない場合 (libsが空など)
    return null;
  }, [selectedLib, libs, sectionId]); // selectedLib, libs, sectionId が変更されたら再計算

  // ライブラリリストが空の場合の表示
  if (libs.length === 0) {
    return (
      <section>
        <h2 className={styles.h2}>{title}</h2>
        <p className={styles.noLibsMessage}>このカテゴリには利用可能なライブラリがありません。</p>
        {/* 必要に応じてスタイルを調整してください */}
      </section>
    );
  }

  return (
    <section>
      <h2 className={styles.h2}>{title}</h2>
      {/* ライブラリ選択ボタン */}
      <div>
        {libs.map((lib, index) => ( // command -> libs に変更
          <button
            key={`${lib.name}-${index}`} // key は一意であればOK
            onClick={() => handleLibSelect(lib)}
            className={
              // selectedLibが指定されているか、または最初の要素の場合にアクティブ
              currentTarget?.key === `lib-${sectionId}-${lib.name}`
                ? `${styles.libraryButton} ${styles.active}`
                : styles.libraryButton
            }
            // スタイル名は適宜調整してください
          >
            {lib.name}
          </button>
        ))}
      </div>

      {/* コマンド表示とコピーボタン (currentTargetが存在する場合のみ表示) */}
      {currentTarget && (
        <div className={styles.commandBox}>
          <p className={styles.commandInput}>
            {currentTarget.cmd}
          </p>
          <button onClick={() => copyToClipboard(currentTarget.cmd, currentTarget.key)}>
            {/* copiedStates から、currentTarget.key を使って状態を取得 */}
            {copiedStates[currentTarget.key] ? <ThumbUpIcon /> : <ContentCopyIcon />}
          </button>
        </div>
      )}
    </section>
  );
};