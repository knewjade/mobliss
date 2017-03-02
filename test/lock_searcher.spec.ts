import * as chai from 'chai';
import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {lock_searcher as _lock_searcher} from 'lock_searcher';

var expect = chai.expect;

describe("Lock Searcher", () => {
  let Type = _mino.Type;
  let Rotate = _mino.Rotate;

  let LockSearcher = _lock_searcher.LockSearcher;
  let create_gray_field = _field.create_gray_field;

  function assert_to_search(actual: [number, number][], expected: number[]): void {
    let actual_number = actual.map((e) => e[1] * 10 + e[0]);
    expect(actual_number.sort()).to.deep.equal(expected.sort());
  }

  it("should find next candidate pattern 1", () => {
    let field = create_gray_field(23, 10, [
      [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
    ]);

    let searcher = new LockSearcher(field, Type.T, 20);

    assert_to_search(searcher.search(Rotate.Normal), [
      5, 25, 34, 41, 42, 43, 46, 47, 48
    ]);
  });

  it("should find next candidate pattern 2", () => {
    let field = create_gray_field(23, 10, [
      [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      [1, 0, 1, 1, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 1, 1, 0, 0, 1, 1, 1],
      [1, 0, 1, 1, 0, 0, 0, 1, 1, 1],
    ]);

    let searcher = new LockSearcher(field, Type.T, 20);

    assert_to_search(searcher.search(Rotate.Normal), [
      5, 25, 34, 41, 42, 43, 46, 47, 48
    ]);
  });

  it("should find next candidate pattern 3", () => {
    let field = create_gray_field(23, 10, [
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    ]);

    let searcher = new LockSearcher(field, Type.T, 5);
    assert_to_search(searcher.search(Rotate.Left), [
      34, 35, 36, 37, 38, 39,
      41, 42, 43
    ]);
  });

  it("should find next candidate pattern 4 [repeat]", () => {
    let field = create_gray_field(23, 10, [
      [1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    ]);

    let searcher = new LockSearcher(field, Type.T, 4);

    for (let count = 0; count < 10; count++) {
      assert_to_search(searcher.search(Rotate.Normal), [
        4, 5, 24, 33
      ]);
      assert_to_search(searcher.search(Rotate.Right), [
        14, 15, 33
      ]);
      assert_to_search(searcher.search(Rotate.Reverse), [
        15, 24, 33
      ]);
      assert_to_search(searcher.search(Rotate.Left), [
        15, 16, 24, 33
      ]);
    }
  });

  it("should find next candidate pattern 5", () => {
    let field = create_gray_field(23, 10, [
      [1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
    ]);

    let searcher = new LockSearcher(field, Type.J, 5);
    assert_to_search(searcher.search(Rotate.Normal), [
      4, 21, 22, 23, 24, 25, 26, 27, 28
    ]);
  });
});
