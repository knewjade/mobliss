import * as chai from 'chai';
import {mino as _mino} from 'mino';
import {field as _field} from 'field';

var expect = chai.expect;

describe("Field", () => {
  type Field = _field.Field;

  let Type = _mino.Type;
  let Field = _field.Field;

  function create_initial_field(): Field {
    return _field.create_initial_field(23, 10);
  }

  function create_gray_field(flag_array: number[][]): Field {
    return _field.create_gray_field(23, 10, flag_array);
  }

  it("should have empty block in 23 height, 10 width", () => {
    let field = create_initial_field();
    expect(field.height).to.equal(23);
    expect(field.width).to.equal(10);

    for (let y = 0; y < field.height; y++)
      for (let x = 0; x < field.width; x++)
        expect(field.get_block(x, y).type).to.equal(Type.Empty);
  });

  it("should set mino", () => {
    let field = create_initial_field();
    field.set_mino(5, 5, _mino.mino(Type.T));

    var blocks:number[] = [54, 55, 56, 65];

    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        if (0 <= blocks.indexOf(x + y * 10)) {
          expect(field.get_block(x, y).type).to.not.equal(Type.Empty);
        } else {
          expect(field.get_block(x, y).type).to.equal(Type.Empty);
        }
      }
    }
  });

  it("should check perfect", () => {
    let field = create_initial_field();
    expect(field.is_perfect).to.be.true;

    field.set_block(5, 5, Type.T);
    expect(field.is_perfect).to.be.false;
  });

  it("should check empty in line", () => {
    let field = create_initial_field();
    expect(field.is_empty_line(5)).to.be.true;

    field.set_block(5, 5, Type.T);
    expect(field.is_empty_line(5)).to.be.false;
  });

  it("should calc hash code", () => {
    let field = create_initial_field();
    expect(field.hash(5)).to.equal("0000000000");

    let field2 = create_gray_field([
      [1, 1, 1, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
    ]);
    expect(field2.hash(5)).to.equal("qrrnqroz00");
  });
});
