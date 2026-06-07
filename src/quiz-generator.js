(() => {
const { randomInt } = window.MatrixRainQuiz;

const WORDS_BY_LENGTH = {
  3: ["サクラ", "メロン", "テレビ", "ラジオ", "カメラ", "バナナ", "ピアノ"],
  4: ["パソコン", "リモコン", "タクシー", "カラオケ", "コンビニ", "ステーキ"],
  5: ["レストラン", "プレゼント", "カレンダー", "オムライス", "コンサート", "マヨネーズ", "プリンター"],
  6: ["ハンバーガー", "サイクリング", "フードコート", "アスパラガス"],
  7: ["エスカレーター", "デジタルカメラ"],
  8: ["コーヒーメーカー"],
  9: ["ジェットコースター", "コミュニケーション", "カタカナタイピング", "マトリックスレイン", "マトリックスクイズ"],
  10: ["デジタルレインクイズ", "カタカナレインゲーム"],
  11: ["デジタルカタカナゲーム"],
  12: ["マトリックスレインゲーム"],
};

function randomWord(length) {
  const words = WORDS_BY_LENGTH[length] ?? WORDS_BY_LENGTH[3];
  return words[randomInt(0, words.length - 1)];
}

function createQuestion(index = 0) {
  const length = Math.min(12, 3 + index);
  const answer = randomWord(length);
  return {
    answer,
    length,
  };
}

function createQuestions(count = 10) {
  return Array.from({ length: count }, (_, index) => createQuestion(index));
}

Object.assign(window.MatrixRainQuiz, {
  createQuestion,
  createQuestions,
});
})();
