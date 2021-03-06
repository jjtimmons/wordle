import * as seedrandom from 'seedrandom';
import WordleSolver from './main';
import * as WORDS from './data/wordle.words.json';
import * as BENCHMARK from './data/wordle.benchmark.json';

/**
 * Return the number of guesses required to answer the question.
 *
 * @param answer we're benchmarking
 */
export const solve = (solver: WordleSolver, answer: string, expected = 10): number => {
  const history = [];
  for (let i = 0; i < 10; i++) {
    const guess = solver.guess();
    if (!guess || solver.guesses > expected) {
      console.error(solver.left.length);
      console.warn(history);
      throw Error('Ran out of words');
    }
    if (guess === answer) {
      return solver.guesses;
    }

    const missCount = solver.createEmptyCharFreqMap();
    answer.split('').forEach((c) => (missCount[c] += 1));

    const results = new Array(5).fill(null);
    guess.split('').forEach((c, i) => {
      if (c == answer[i]) {
        results[i] = 'h';
        missCount[c] -= 1;
      } else if (!answer.includes(c)) {
        results[i] = 'f';
      }
    });

    guess.split('').forEach((c, i) => {
      if (c == answer[i]) {
        return;
      } else if (c != answer[i] && missCount[c]) {
        results[i] = 'm';
        missCount[c] -= 1;
      } else {
        results[i] = 'f';
      }
    });

    const result = results.join('');
    history.push(`answer: ${answer}, guess: ${guess}, result: ${result}, left: ${solver.left.length}`);
    solver.update(guess, result);
  }

  return 10;
};

describe('Benchmarks', () => {
  test.only('solves (regression tests)', () => {
    const regression = {
      squid: 5,
      light: 3,
      wrung: 4,
      yahoo: 4,
      wafer: 6,
    };

    Object.entries(regression).forEach(([k, v]) => {
      expect(solve(new WordleSolver(WORDS), k, v)).toBeLessThanOrEqual(v);
    });
  });

  // low score = 1149
  test('benchmark', () => {
    const n = 1000;
    const random = seedrandom('42');
    const samples = new Array(n).fill(null).map(() => BENCHMARK[Math.round(BENCHMARK.length * random.double())]);

    const hist = new Array(10).fill(null).map(() => 0);
    const guesses = samples.map((word) => {
      const solver = new WordleSolver(WORDS);
      return solve(solver, word);
    });

    guesses.forEach((g) => (hist[g] += 1));
    const total = guesses.reduce((acc, g) => acc + g, 0);

    console.warn(
      total,
      total / n,
      hist.map((v) => v),
    );

    let histResult = 'guesses (10s)\n';
    hist.forEach((c, i) => {
      if (i == 0 || !Math.floor(c / 10)) return;
      histResult += `${i} | ${'#'.repeat(Math.floor(c / 10))}\n`;
    });
    console.warn(histResult);
  });
});
