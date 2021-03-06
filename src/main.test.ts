import WordleSolver from './main';

describe('WordleSolver', () => {
  it('creates empty char freq maps', () => {
    const charFreqMap = new WordleSolver(['aback']).createEmptyCharFreqMap();
    expect(Object.values(charFreqMap)).toEqual(new Array(26).fill(0));
    expect(charFreqMap['a']).toEqual(0);
    expect(charFreqMap['z']).toEqual(0);
  });

  it('has valid hit count', () => {
    const solver = new WordleSolver(['aback']);

    expect(solver.hitCount()).toEqual(0);
    expect(solver.nonHits()).toEqual([0, 1, 2, 3, 4]);

    solver.update('zbazz', 'fhhff');

    expect(solver.hitCount()).toEqual(2);
    expect(solver.nonHits()).toEqual([0, 3, 4]);
  });

  it('guesses', () => {
    const solver = new WordleSolver(['aback', 'abask', 'flask']);

    expect(solver.guess()).toEqual('flask');
  });

  it('updates hits', () => {
    const solver = new WordleSolver(['aback', 'backs', 'hacks']); // answer: hacks

    solver.update('backs', 'fhhhh');

    expect(solver.left).not.toContain('aback');
    expect(solver.left).not.toContain('backs');
    expect(solver.left).toContain('hacks');
    expect(solver.hits).toEqual([null, 'a', 'c', 'k', 's']);
  });

  it('updates fails', () => {
    const solver = new WordleSolver(['aback', 'abask', 'flask', 'utfel']);
    expect(solver.left).toContain('aback');

    solver.update('aback', 'fffff');

    ['aback', 'abask', 'flask'].forEach((word) => expect(solver.left).not.toContain(word));
    expect(solver.left).toContain('utfel');
  });

  it('removes failed words', () => {
    const solver = new WordleSolver(['cares', 'soily']); // answer: soily

    solver.update('cares', 'fffff');

    expect(solver.left.length).toBe(0);
  });
});
