import * as chai from 'chai';
import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {tetfu as _tetfu} from 'tetfu';

var expect = chai.expect;

describe("Tetfu", () => {
  let Type = _mino.Type;
  let Rotate = _mino.Rotate;

  let mino = _mino.mino;
  let create_initial_field = _field.create_initial_field;
  let encode = _tetfu.encode;
  let encode_with_quiz = _tetfu.encode_with_quiz;

  let encode_field = _tetfu.encode_field;
  let decode_field = _tetfu.decode_field;

  it("should have encode 1", () => {
    let field = create_initial_field(23, 10);
    let data = encode(field, [
      [Type.T, Rotate.Normal, [5, 0]],
    ]);
    expect(data).to.equal("vhA1QJ");
  });

  it("should have encode 2", () => {
    let field = create_initial_field(23, 10);
    let data = encode(field, [
      [Type.L, Rotate.Normal, [4, 0]],
      [Type.J, Rotate.Normal, [8, 0]],
      [Type.I, Rotate.Left, [6, 1]],
      [Type.S, Rotate.Normal, [4, 1]],
      [Type.Z, Rotate.Normal, [8, 1]],
      [Type.T, Rotate.Normal, [4, 3]],
      [Type.O, Rotate.Normal, [0, 0]],
      [Type.J, Rotate.Right, [0, 3]],
    ]);
    expect(data).to.equal("vhHSQJWyBJnBXmBUoBVhBTpBOfB");
  });

  it("should have encode 3", () => {
    let field = create_initial_field(23, 10);
    let data = encode(field, [
      [Type.I, Rotate.Reverse, [5, 0]],
      [Type.S, Rotate.Reverse, [5, 2]],
      [Type.J, Rotate.Left, [9, 1]],
      [Type.O, Rotate.Right, [0, 1]],
      [Type.Z, Rotate.Left, [3, 1]],
      [Type.L, Rotate.Right, [0, 3]],
      [Type.T, Rotate.Reverse, [7, 1]],
    ]);
    expect(data).to.equal("vhGBQJnmB+tBLpBcqBKfBlsB");
  });

  it("should have encode 4 [Quiz]", () => {
    let field = create_initial_field(23, 10);
    let data = encode_with_quiz(field, [
      [Type.L, Rotate.Right, [0, 1]],
    ], [
      Type.L
    ]);
    expect(data).to.equal("vhAKJYUAFLDmClcJSAVDEHBEooRBMoAVB");
  });

  it("should have encode 5 [Quiz]", () => {
    let field = create_initial_field(23, 10);
    let data = encode_with_quiz(field, [
      [Type.L, Rotate.Right, [0, 1]],
      [Type.J, Rotate.Left, [3, 1]],
    ], [
      Type.J,
      Type.L
    ]);
    expect(data).to.equal("vhBKJYVAFLDmClcJSAVTXSAVG88AYS88AZAAAA+qB");
  });
  //
  it("should have encode 6", () => {
    let field = create_initial_field(23, 10);
    field.set_mino(1, 0, mino(Type.I));

    let data = encode(field, [
      [Type.I, Rotate.Normal, [5, 0]],
    ]);
    expect(data).to.equal("bhzhPexQJ");
  });

  it("should have encode 7", () => {
    let field = create_initial_field(23, 10);
    field.set_mino(1, 0, mino(Type.I));

    let data = encode(field, [
      [Type.I, Rotate.Reverse, [6, 0]],
    ]);
    expect(data).to.equal("bhzhPehQJ");
  });

  it("should have decode 1", () => {
    let field = create_initial_field(23, 10);
    field.set_mino(4, 0, mino(Type.I));

    let prev_field = create_initial_field(23, 10);
    let encoded = encode_field(prev_field, field);
    let decoded = decode_field(prev_field, encoded);

    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++)
        expect(decoded.get_block(x, y).type).to.equal(field.get_block(x, y).type);
    }
  });
});
