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

  function assert_field(field:Field, expected:number[]): void {
    let actual_number:number[] = [];

    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        if (field.get_block(x, y).type !== Type.Empty)
          actual_number.push(x + y * 10);
      }
    }

    expect(actual_number.sort()).to.deep.equal(expected.sort());
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

  it("should check empty for mino", () => {
    let field = create_gray_field([
      [1, 1, 1, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
    ]);
    let mino = _mino.mino(Type.T);
    expect(field.checks_empty(5, 0, mino.positions)).to.be.true;
    expect(field.checks_empty(6, 0, mino.positions)).to.be.true;
    expect(field.checks_empty(5, 1, mino.positions)).to.be.false;

    mino.rotate_right();
    expect(field.checks_empty(5, 0, mino.positions)).to.be.false;
    expect(field.checks_empty(5, 1, mino.positions)).to.be.true;
  });

  it("should get position after harddrop", () => {
    let field = create_gray_field([
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
    ]);

    let mino = _mino.mino(Type.I);

    expect(field.harddrop(5, 19, mino)).to.equal(5);
    expect(field.harddrop(6, 19, mino)).to.equal(5);
    expect(field.harddrop(5, 4, mino)).to.equal(0);

    mino.rotate_left();

    expect(field.harddrop(5, 19, mino)).to.equal(1);
    expect(field.harddrop(6, 19, mino)).to.equal(6);
    expect(field.harddrop(5, 4, mino)).to.equal(1);
  });

  it("should clear line", () => {
    let field = create_gray_field([
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]);

    let clear_line = field.clear();

    expect(clear_line).to.equal(3);
    assert_field(field, [
      0, 1, 2, 3, 4, 5, 6, 7, 8,
      10, 11, 12, 13, 15, 16, 17, 18, 19,
      21, 22, 23, 24, 25, 26, 27, 28, 29,
    ]);

    expect(field.clear()).to.equal(0);
  });

  it("should freeze", () => {
    let field = create_gray_field([
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ]);

    let freeze = field.freeze();

    field.set_mino(5, 1, _mino.mino(Type.I));

    assert_field(field, [
      0, 1, 2, 3, 4, 5, 6, 7, 8,
      14, 15, 16, 17
    ]);

    assert_field(freeze, [
      0, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);
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

  it("should calc hash code of empty field", () => {
    let field = create_initial_field();
    expect(field.hash(5)).to.equal("0000000000");
  });

  it("should calc hash code 1", () => {
    let field = create_gray_field([
      [1, 1, 1, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
    ]);
    expect(field.hash(5)).to.equal("qrrnqroz00");
  });
});

describe("SRS", () => {
  type Field = _field.Field;

  let Type = _mino.Type;
  let Rotate = _mino.Rotate;
  let Field = _field.Field;

  function create_gray_field(flag_array: number[][]): Field {
    return _field.create_gray_field(23, 10, flag_array);
  }

  function assert_field(field:Field, expected:number[]): void {
    let actual_number:number[] = [];

    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        if (field.get_block(x, y).type !== Type.Empty)
          actual_number.push(x + y * 10);
      }
    }

    expect(actual_number.sort()).to.deep.equal(expected.sort());
  }

  describe("S", () => {
    it("should have rotate patern 1", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 2;
      let mino = _mino.mino(Type.S, Rotate.Right);
      let pattern = field.rotate_right(x, y, mino);

      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 2", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
      ]);

      let x = 6;
      let y = 2;
      let mino = _mino.mino(Type.S, Rotate.Left);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 3", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      ]);

      let x = 6;
      let y = 3;
      let mino = _mino.mino(Type.S, Rotate.Normal);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(6);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 4", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      ]);

      let x = 6;
      let y = 3;
      let mino = _mino.mino(Type.S, Rotate.Normal);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 5", () => {
      let field = create_gray_field([
        [0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      ]);

      let x = 5;
      let y = 3;
      let mino = _mino.mino(Type.S, Rotate.Normal);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });
  });

  describe("Z", () => {
    it("should have rotate patern 1", () => {
      let field = create_gray_field([
        [1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 2;
      let mino = _mino.mino(Type.Z, Rotate.Left);
      let pattern = field.rotate_left(x, y, mino);

      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(3);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 2", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
      ]);

      let x = 5;
      let y = 2;
      let mino = _mino.mino(Type.Z, Rotate.Right);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(6);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 3", () => {
      let field = create_gray_field([
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 3;
      let mino = _mino.mino(Type.Z, Rotate.Normal);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(4);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 4", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 3;
      let mino = _mino.mino(Type.Z, Rotate.Normal);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 5", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      ]);

      let x = 5;
      let y = 3;
      let mino = _mino.mino(Type.Z, Rotate.Normal);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });
  });

  describe("I", () => {
    it("should have rotate patern 1", () => {
      let field = create_gray_field([
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      ]);

      let x = 3;
      let y = 3;
      let mino = _mino.mino(Type.I, Rotate.Normal);
      let pattern = field.rotate_right(x, y, mino);

      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(2);
      expect(y + pattern[1]).to.equal(2);
    });

    it("should have rotate patern 2", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
      ]);

      let x = 6;
      let y = 3;
      let mino = _mino.mino(Type.I, Rotate.Reverse);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(7);
      expect(y + pattern[1]).to.equal(2);
    });

    it("should have rotate patern 3", () => {
      let field = create_gray_field([
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      ]);

      let x = 3;
      let y = 2;
      let mino = _mino.mino(Type.I, Rotate.Right);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(0);
    });

    it("should have rotate patern 4", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      ]);

      let x = 6;
      let y = 1;
      let mino = _mino.mino(Type.I, Rotate.Left);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(0);
    });

    it("should have rotate patern 5", () => {
      let field = create_gray_field([
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      ]);

      let x = 3;
      let y = 1;
      let mino = _mino.mino(Type.I, Rotate.Left);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(4);
      expect(y + pattern[1]).to.equal(0);
    });

    it("should have rotate patern 6", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      ]);

      let x = 6;
      let y = 2;
      let mino = _mino.mino(Type.I, Rotate.Right);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(4);
      expect(y + pattern[1]).to.equal(0);
    });
  });

  describe("O", () => {
    it("should not have rotate patern 1", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 0;
      let mino = _mino.mino(Type.O, Rotate.Normal);
      let pattern = field.rotate_left(x, y, mino);

      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(0);
    });

    it("should not have rotate patern 2", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
      ]);

      let x = 5;
      let y = 1;
      let mino = _mino.mino(Type.O, Rotate.Reverse);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(4);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 3", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 1;
      let mino = _mino.mino(Type.O, Rotate.Right);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });
  });

  describe("L", () => {
    it("should have rotate patern 1", () => {
      let field = create_gray_field([
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 0, 0, 0, 0, 0, 0],
      ]);

      let x = 4;
      let y = 1;
      let mino = _mino.mino(Type.L, Rotate.Left);
      let pattern = field.rotate_left(x, y, mino);

      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(3);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 2", () => {
      let field = create_gray_field([
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 2;
      let mino = _mino.mino(Type.L, Rotate.Left);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(3);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 3", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 2;
      let mino = _mino.mino(Type.L, Rotate.Left);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(3);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 4", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 2;
      let mino = _mino.mino(Type.L, Rotate.Right);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 5", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      ]);

      let x = 5;
      let y = 2;
      let mino = _mino.mino(Type.L, Rotate.Right);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(6);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 6", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 1;
      let mino = _mino.mino(Type.L, Rotate.Left);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(3);
      expect(y + pattern[1]).to.equal(0);
    });

    it("should have rotate patern 7", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
      ]);

      let x = 4;
      let y = 1;
      let mino = _mino.mino(Type.L, Rotate.Right);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(0);
    });

    it("should have rotate patern 8", () => {
      let field = create_gray_field([
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
      ]);

      let x = 3;
      let y = 3;
      let mino = _mino.mino(Type.L, Rotate.Normal);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(2);
      expect(y + pattern[1]).to.equal(1);
    });
  });

  describe("J", () => {
    it("should have rotate patern 1", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 0, 1, 1, 1],
      ]);

      let x = 4;
      let y = 1;
      let mino = _mino.mino(Type.J, Rotate.Right);
      let pattern = field.rotate_right(x, y, mino);

      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 2", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      ]);

      let x = 4;
      let y = 2;
      let mino = _mino.mino(Type.J, Rotate.Right);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 3", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      ]);

      let x = 4;
      let y = 2;
      let mino = _mino.mino(Type.J, Rotate.Right);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 4", () => {
      let field = create_gray_field([
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 2;
      let mino = _mino.mino(Type.J, Rotate.Left);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(3);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 5", () => {
      let field = create_gray_field([
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      ]);

      let x = 3;
      let y = 2;
      let mino = _mino.mino(Type.J, Rotate.Left);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(2);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 6", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
      ]);

      let x = 4;
      let y = 1;
      let mino = _mino.mino(Type.J, Rotate.Right);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(0);
    });

    it("should have rotate patern 7", () => {
      let field = create_gray_field([
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 1;
      let mino = _mino.mino(Type.J, Rotate.Left);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(3);
      expect(y + pattern[1]).to.equal(0);
    });

    it("should have rotate patern 8", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
      ]);

      let x = 7;
      let y = 3;
      let mino = _mino.mino(Type.J, Rotate.Normal);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(8);
      expect(y + pattern[1]).to.equal(1);
    });
  });

  describe("T", () => {
    it("should have rotate patern 1", () => {
      let field = create_gray_field([
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 1;
      let mino = _mino.mino(Type.T, Rotate.Normal);
      let pattern = field.rotate_right(x, y, mino);

      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(3);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 2", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 1;
      let mino = _mino.mino(Type.T, Rotate.Left);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(3);
      expect(y + pattern[1]).to.equal(0);
    });

    it("should have rotate patern 3", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      ]);

      let x = 4;
      let y = 2;
      let mino = _mino.mino(Type.T, Rotate.Right);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(5);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 4", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      ]);

      let x = 5;
      let y = 3;
      let mino = _mino.mino(Type.T, Rotate.Normal);
      let pattern = field.rotate_left(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(6);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 5: T-Spin NEO", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      ]);

      let x = 6;
      let y = 3;
      let mino = _mino.mino(Type.T, Rotate.Reverse);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(6);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 6: T-Spin FIN", () => {
      let field = create_gray_field([
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      ]);

      let x = 5;
      let y = 3;
      let mino = _mino.mino(Type.T, Rotate.Reverse);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(6);
      expect(y + pattern[1]).to.equal(1);
    });

    it("should have rotate patern 7: T-Spin ISO", () => {
      let field = create_gray_field([
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      ]);

      let x = 2;
      let y = 3;
      let mino = _mino.mino(Type.T, Rotate.Reverse);
      let pattern = field.rotate_right(x, y, mino);
      expect(pattern).to.be.not.null;
      expect(x + pattern[0]).to.equal(2);
      expect(y + pattern[1]).to.equal(1);
    });
  });
});
