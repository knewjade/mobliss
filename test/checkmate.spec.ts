import * as chai from 'chai';
import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {checkmate as _checkmate} from 'checkmate';

var expect = chai.expect;

describe("Checkmate", () => {
  let Type = _mino.Type;
  let Checkmate = _checkmate.Checkmate;

  let create_gray_field = _field.create_gray_field;

  it("should find perfect pattern 1 [just types, no hold]", () => {
    let field = create_gray_field(23, 10, [
      [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
    ]);

    let checkmate = new Checkmate();
    let hold = null;
    let types = [Type.T, Type.J, Type.I];
    expect(checkmate.search_perfect(field, types, hold)).to.be.true;
  });

  it("should find perfect pattern 2 [just types, hold]", () => {
    let field = create_gray_field(23, 10, [
      [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
    ]);

    let checkmate = new Checkmate();
    let hold = Type.O;
    let types = [Type.T, Type.I];
    expect(checkmate.search_perfect(field, types, hold)).to.be.true;
  });

  it("should find perfect pattern 3 [over types, no hold]", () => {
    let field = create_gray_field(23, 10, [
      [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
    ]);

    let checkmate = new Checkmate();
    let hold = null;
    let types = [Type.Z, Type.I, Type.O, Type.L, Type.J, Type.T];
    expect(checkmate.search_perfect(field, types, hold, 3)).to.be.true;
  });

  it("should find perfect pattern 4 [over types, hold]", () => {
    let field = create_gray_field(23, 10, [
      [1, 1, 1, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
    ]);

    let checkmate = new Checkmate();
    let hold = Type.I;
    let types = [Type.J, Type.O, Type.S, Type.T, Type.I, Type.L];
    expect(checkmate.search_perfect(field, types, hold, 4)).to.be.true;
  });

  it("should find perfect pattern 5 [over types, hold, 2 lines]", () => {
    let field = create_gray_field(23, 10, [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);

    let checkmate = new Checkmate();
    let hold = Type.O;
    let types = [Type.I, Type.J, Type.O, Type.L, Type.T, Type.S, Type.Z];
    expect(checkmate.search_perfect(field, types, hold, 5, 2)).to.be.true;
  });

  it("should find perfect pattern 6 [over types, hold, long]", function() {
    this.timeout(5000);

    let field = create_gray_field(23, 10, [
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
    ]);

    let checkmate = new Checkmate();
    let hold = Type.I;
    let types = [Type.J, Type.O, Type.Z, Type.O, Type.Z, Type.I];
    expect(checkmate.search_perfect(field, types, hold)).to.be.true;
  });

  it("should find perfect pattern 7 [over types, hold, long]", function() {
    this.timeout(10000);

    let field = create_gray_field(23, 10, [
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 0, 0, 0, 1, 0, 0],
      [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    ]);

    let checkmate = new Checkmate();
    let hold = Type.O;
    let types = [Type.I, Type.O, Type.L, Type.J, Type.L, Type.S];
    expect(checkmate.search_perfect(field, types, hold)).to.be.true;
  });

  it("should not find perfect pattern 8 [over types, hold, not first hold]", () => {
    let field = create_gray_field(23, 10, [
      [1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
    ]);

    let checkmate = new Checkmate();
    let hold = Type.O;
    let types = [Type.L, Type.I, Type.S, Type.Z];
    expect(checkmate.search_perfect(field, types, hold, undefined, undefined, true)).to.be.false;
  });
});
