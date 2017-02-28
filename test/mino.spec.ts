import * as chai from 'chai';
import {mino as _mino} from 'mino';

var expect = chai.expect;

describe("Block", () => {
  let Type = _mino.Type;

  it("should have T name and purple color", () => {
    let block = _mino.block(Type.T);
    expect(block.name).to.equal('T');
    expect(block.color).to.equal('#8e3194');
  });

  it("should have L name and orange color", () => {
    let block = _mino.block(Type.L);
    expect(block.name).to.equal('L');
    expect(block.color).to.equal('#f76e23');
  });

  it("should have J name and blue color", () => {
    let block = _mino.block(Type.J);
    expect(block.name).to.equal('J');
    expect(block.color).to.equal('#0f59b2');
  });

  it("should have S name and green color", () => {
    let block = _mino.block(Type.S);
    expect(block.name).to.equal('S');
    expect(block.color).to.equal('#67c133');
  });

  it("should have Z name and red color", () => {
    let block = _mino.block(Type.Z);
    expect(block.name).to.equal('Z');
    expect(block.color).to.equal('#d5212c');
  });

  it("should have I name and light blue color", () => {
    let block = _mino.block(Type.I);
    expect(block.name).to.equal('I');
    expect(block.color).to.equal('#1ca2d3');
  });

  it("should have O name and yellow color", () => {
    let block = _mino.block(Type.O);
    expect(block.name).to.equal('O');
    expect(block.color).to.equal('#f4c22f');
  });

  it("should have Empty name and null color", () => {
    let block = _mino.block(Type.Empty);
    expect(block.name).to.equal('E');
    expect(block.color).to.be.null;
  });

  it("should have Gray name and null color", () => {
    let block = _mino.block(Type.Gray);
    expect(block.name).to.equal('G');
    expect(block.color).to.equal('#cccccc');
  });
});

describe("Mino", () => {
  type Mino = _mino.Mino;
  type Type = _mino.Type;

  let Type = _mino.Type;
  let Rotate = _mino.Rotate;
  let create_mino = _mino.mino;

  function assert_min_max(create_mino:Mino, min_max_x:[number, number], min_max_y:[number, number]) {
    expect(create_mino.min_x).to.equal(min_max_x[0]);
    expect(create_mino.max_x).to.equal(min_max_x[1]);
    expect(create_mino.min_y).to.equal(min_max_y[0]);
    expect(create_mino.max_y).to.equal(min_max_y[1]);
  }

  describe("T", () => {
    it("should have blocks", () => {
      let mino = create_mino(Type.T);

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [1, 0], [0, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);

      assert_min_max(mino, [-1, 1], [0, 1]);
    });

    it("should rotate right once", () => {
      let mino = create_mino(Type.T);
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [1, 0], [0, 1], [0, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Right);

      assert_min_max(mino, [0, 1], [-1, 1]);
    });

    it("should rotate right twice", () => {
      let mino = create_mino(Type.T);
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [1, 0], [0, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Reverse);

      assert_min_max(mino, [-1, 1], [-1, 0]);
    });

    it("should rotate right 3 time", () => {
      let mino = create_mino(Type.T);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [0, -1], [0, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Left);

      assert_min_max(mino, [-1, 0], [-1, 1]);
    });

    it("should rotate right 4 times", () => {
      let mino = create_mino(Type.T);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [1, 0], [0, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should get min,max each x,y", () => {
      let mino = create_mino(Type.T);
      expect(mino.min_x).to.equal(-1);
      expect(mino.max_x).to.equal(1);
      expect(mino.min_y).to.equal(0);
      expect(mino.max_y).to.equal(1);
    });
  });

  describe("I", () => {
    it("should have blocks", () => {
      let mino = create_mino(Type.I);

      expect(mino.positions).to.deep.include.members([[-1, 0], [0, 0], [1, 0], [2, 0]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);

      assert_min_max(mino, [-1, 2], [0, 0]);
    });

    it("should rotate right once", () => {
      let mino = create_mino(Type.I);
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, -2], [0, -1], [0, 0], [0, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Right);

      assert_min_max(mino, [0, 0], [-2, 1]);
    });

    it("should rotate right twice", () => {
      let mino = create_mino(Type.I);
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[-2, 0], [-1, 0], [0, 0], [1, 0]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Reverse);

      assert_min_max(mino, [-2, 1], [0, 0]);
    });

    it("should rotate right 3 time", () => {
      let mino = create_mino(Type.I);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, -1], [0, 0], [0, 1], [0, 2]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Left);

      assert_min_max(mino, [0, 0], [-1, 2]);
    });

    it("should rotate right 4 times", () => {
      let mino = create_mino(Type.I);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[-1, 0], [0, 0], [1, 0], [2, 0]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should get min,max each x,y", () => {
      let mino = create_mino(Type.I);
      expect(mino.min_x).to.equal(-1);
      expect(mino.max_x).to.equal(2);
      expect(mino.min_y).to.equal(0);
      expect(mino.max_y).to.equal(0);
    });
  });

  describe("S", () => {
    it("should have blocks", () => {
      let mino = create_mino(Type.S);

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [0, 1], [1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should rotate right once", () => {
      let mino = create_mino(Type.S);
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [0, 1], [1, 0], [1, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Right);
    });

    it("should rotate right twice", () => {
      let mino = create_mino(Type.S);
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [1, 0], [0, -1], [-1, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Reverse);
    });

    it("should rotate right 3 time", () => {
      let mino = create_mino(Type.S);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [-1, 1], [0, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Left);
    });

    it("should rotate right 4 times", () => {
      let mino = create_mino(Type.S);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [0, 1], [1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should get min,max each x,y", () => {
      let mino = create_mino(Type.S);
      expect(mino.min_x).to.equal(-1);
      expect(mino.max_x).to.equal(1);
      expect(mino.min_y).to.equal(0);
      expect(mino.max_y).to.equal(1);
    });
  });

  describe("Z", () => {
    it("should have blocks", () => {
      let mino = create_mino(Type.Z);

      expect(mino.positions).to.deep.include.members([[0, 0], [1, 0], [0, 1], [-1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should rotate right once", () => {
      let mino = create_mino(Type.Z);
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [1, 0], [1, 1], [0, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Right);
    });

    it("should rotate right twice", () => {
      let mino = create_mino(Type.Z);
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [0, -1], [1, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Reverse);
    });

    it("should rotate right 3 time", () => {
      let mino = create_mino(Type.Z);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 1], [0, 0], [-1, 0], [-1, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Left);
    });

    it("should rotate right 4 times", () => {
      let mino = create_mino(Type.Z);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [1, 0], [0, 1], [-1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should get min,max each x,y", () => {
      let mino = create_mino(Type.Z);
      expect(mino.min_x).to.equal(-1);
      expect(mino.max_x).to.equal(1);
      expect(mino.min_y).to.equal(0);
      expect(mino.max_y).to.equal(1);
    });
  });

  describe("L", () => {
    it("should have blocks", () => {
      let mino = create_mino(Type.L);

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [1, 0], [1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should rotate right once", () => {
      let mino = create_mino(Type.L);
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [0, 1], [0, -1], [1, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Right);
    });

    it("should rotate right twice", () => {
      let mino = create_mino(Type.L);
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [1, 0], [-1, 0], [-1, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Reverse);
    });

    it("should rotate right 3 time", () => {
      let mino = create_mino(Type.L);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [0, -1], [0, 1], [-1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Left);
    });

    it("should rotate right 4 times", () => {
      let mino = create_mino(Type.L);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [1, 0], [1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should get min,max each x,y", () => {
      let mino = create_mino(Type.L);
      expect(mino.min_x).to.equal(-1);
      expect(mino.max_x).to.equal(1);
      expect(mino.min_y).to.equal(0);
      expect(mino.max_y).to.equal(1);
    });
  });

  describe("J", () => {
    it("should have blocks", () => {
      let mino = create_mino(Type.J);

      expect(mino.positions).to.deep.include.members([[0, 0], [1, 0], [-1, 0], [-1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should rotate right once", () => {
      let mino = create_mino(Type.J);
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [0, -1], [0, 1], [1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Right);
    });

    it("should rotate right twice", () => {
      let mino = create_mino(Type.J);
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [1, 0], [1, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Reverse);
    });

    it("should rotate right 3 time", () => {
      let mino = create_mino(Type.J);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [0, 1], [0, -1], [-1, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Left);
    });

    it("should rotate right 4 times", () => {
      let mino = create_mino(Type.J);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [1, 0], [-1, 0], [-1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should get min,max each x,y", () => {
      let mino = create_mino(Type.J);
      expect(mino.min_x).to.equal(-1);
      expect(mino.max_x).to.equal(1);
      expect(mino.min_y).to.equal(0);
      expect(mino.max_y).to.equal(1);
    });
  });

  describe("O", () => {
    it("should have blocks", () => {
      let mino = create_mino(Type.O);

      expect(mino.positions).to.deep.include.members([[0, 0], [1, 0], [0, 1], [1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should rotate right once", () => {
      let mino = create_mino(Type.O);
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [1, 0], [0, -1], [1, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Right);
    });

    it("should rotate right twice", () => {
      let mino = create_mino(Type.O);
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [-1, 0], [0, -1], [-1, -1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Reverse);
    });

    it("should rotate right 3 time", () => {
      let mino = create_mino(Type.O);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [0, 1], [-1, 0], [-1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Left);
    });

    it("should rotate right 4 times", () => {
      let mino = create_mino(Type.O);
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();
      mino.rotate_right();

      expect(mino.positions).to.deep.include.members([[0, 0], [1, 0], [0, 1], [1, 1]]);
      expect(mino.positions).to.have.lengthOf(4);
      expect(mino.rotate).to.equal(Rotate.Normal);
    });

    it("should get min,max each x,y", () => {
      let mino = create_mino(Type.O);
      expect(mino.min_x).to.equal(0);
      expect(mino.max_x).to.equal(1);
      expect(mino.min_y).to.equal(0);
      expect(mino.max_y).to.equal(1);
    });
  });

  describe("All", () => {
    it("should rotate left once", () => {
      let all_types = [Type.T, Type.L, Type.J, Type.S, Type.Z, Type.I, Type.O];
      for (let type of all_types) {
        let left_mino = create_mino(type);
        left_mino.rotate_left();

        let right_mino = create_mino(type);
        right_mino.rotate_right();
        right_mino.rotate_right();
        right_mino.rotate_right();

        expect(left_mino.positions).to.deep.include.members(right_mino.positions);
        expect(left_mino.positions).to.have.lengthOf(4);
        expect(left_mino.rotate).to.equal(right_mino.rotate);
      }
    });

    it("should rotate left twice", () => {
      let all_types = [Type.T, Type.L, Type.J, Type.S, Type.Z, Type.I, Type.O];
      for (let type of all_types) {
        let left_mino = create_mino(type);
        left_mino.rotate_left();
        left_mino.rotate_left();

        let right_mino = create_mino(type);
        right_mino.rotate_right();
        right_mino.rotate_right();

        expect(left_mino.positions).to.deep.include.members(right_mino.positions);
        expect(left_mino.positions).to.have.lengthOf(4);
        expect(left_mino.rotate).to.equal(right_mino.rotate);
      }
    });

    it("should rotate left 3 times", () => {
      let all_types = [Type.T, Type.L, Type.J, Type.S, Type.Z, Type.I, Type.O];
      for (let type of all_types) {
        let left_mino = create_mino(type);
        left_mino.rotate_left();
        left_mino.rotate_left();
        left_mino.rotate_left();

        let right_mino = create_mino(type);
        right_mino.rotate_right();

        expect(left_mino.positions).to.deep.include.members(right_mino.positions);
        expect(left_mino.positions).to.have.lengthOf(4);
        expect(left_mino.rotate).to.equal(right_mino.rotate);
      }
    });

    it("should rotate left 4 times", () => {
      let all_types = [Type.T, Type.L, Type.J, Type.S, Type.Z, Type.I, Type.O];
      for (let type of all_types) {
        let left_mino = create_mino(type);
        left_mino.rotate_left();
        left_mino.rotate_left();
        left_mino.rotate_left();
        left_mino.rotate_left();

        let right_mino = create_mino(type);

        expect(left_mino.positions).to.deep.include.members(right_mino.positions);
        expect(left_mino.positions).to.have.lengthOf(4);
        expect(left_mino.rotate).to.equal(right_mino.rotate);
      }
    });

    it("should have next rotate to left", () => {
      let all_types = [Type.T, Type.L, Type.J, Type.S, Type.Z, Type.I, Type.O];
      for (let type of all_types) {
        let mino = create_mino(type);
        expect(mino.rotate).to.equal(Rotate.Normal);

        mino.rotate_left();
        expect(mino.rotate).to.equal(Rotate.Left);

        mino.rotate_left();
        expect(mino.rotate).to.equal(Rotate.Reverse);

        mino.rotate_left();
        expect(mino.rotate).to.equal(Rotate.Right);

        mino.rotate_left();
        expect(mino.rotate).to.equal(Rotate.Normal);
      }
    });

    it("should have next rotate to right", () => {
      let all_types = [Type.T, Type.L, Type.J, Type.S, Type.Z, Type.I, Type.O];
      for (let type of all_types) {
        let mino = create_mino(type);
        expect(mino.rotate).to.equal(Rotate.Normal);

        mino.rotate_right();
        expect(mino.rotate).to.equal(Rotate.Right);

        mino.rotate_right();
        expect(mino.rotate).to.equal(Rotate.Reverse);

        mino.rotate_right();
        expect(mino.rotate).to.equal(Rotate.Left);

        mino.rotate_right();
        expect(mino.rotate).to.equal(Rotate.Normal);
      }
    });

    it("should create mino by name", () => {
      let expected_map: { [name: string] : Type } = {
        'T': Type.T,
        'S': Type.S,
        'Z': Type.Z,
        'J': Type.J,
        'L': Type.L,
        'O': Type.O,
        'I': Type.I,
      };
      for (let name in expected_map) {
        let type = expected_map[name];
        expect(_mino.mino_by_name(name).type).to.equal(create_mino(type).type);
      }
    });
  });
});
