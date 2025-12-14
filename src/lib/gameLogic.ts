import { Difficulty, Problem } from '@/types';

export const generateProblem = (diff: Difficulty): Problem => {
  let a = 0, gap = 0;

  switch (diff) {
    case 'EASY': // 隣り合わせ (例: 13-15)
      a = Math.floor(Math.random() * 80) + 10; // 10-90
      gap = 2;
      break;
    case 'NORMAL': // 差: 2-10, 2桁 (10-99)
      a = Math.floor(Math.random() * 80) + 10;
      gap = (Math.floor(Math.random() * 5) + 1) * 2; // 2,4,6,8,10
      break;
    case 'HARD': // 差: 2-200, 最大4桁
      a = Math.floor(Math.random() * 9000) + 100;
      gap = (Math.floor(Math.random() * 100) + 1) * 2; // 2-200 (偶数)
      break;
  }
  
  return { a, b: a + gap };
};

export const calculateCorrectAnswer = (a: number, b: number): number => {
  return (a + b) / 2;
};