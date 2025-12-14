// クラス名の結合ユーティリティ（clsx + tailwind-mergeの簡易版）
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// 漢数字・全角数字・ひらがな読みを半角数字に変換するパーサー
export const parseVoiceInput = (text: string): number | 'PASS' | null => {
  if (!text) return null;

  let str = text.trim();

  // 1. パスワード検知
  if (/パス|スキップ|次|next|skip/gi.test(str)) {
    return 'PASS';
  }

  // 2. 漢数字の単純置換
  const kanjiMap: { [key: string]: number } = {
    '〇':0, '一':1, '二':2, '三':3, '四':4, '五':5, '六':6, '七':7, '八':8, '九':9,
    '０':0, '１':1, '２':2, '３':3, '４':4, '５':5, '６':6, '７':7, '８':8, '９':9
  };

  str = str.split('').map(char => kanjiMap[char] !== undefined ? kanjiMap[char] : char).join('');

  // 3. 数字以外を削除
  str = str.replace(/[^0-9]/g, "");

  if (str === "") return null;
  
  const num = parseInt(str, 10);
  return isNaN(num) ? null : num;
};