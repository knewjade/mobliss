import * as chai from 'chai';
import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {lock_candidate as _lock_candidate} from 'lock_candidate';

var expect = chai.expect;

describe("Lock Candidate", () => {
  type Type = _mino.Type;
  type Rotate = _mino.Rotate;
  type PositionType = _mino.PositionType;
  type LockCandidate = _lock_candidate.LockCandidate;

  let Type = _mino.Type;
  let Rotate = _mino.Rotate;
  let LockCandidate = _lock_candidate.LockCandidate;

  function assert_target_rotations(lock_candidate:LockCandidate, type:Type, rotate:Rotate, expected:Rotate[]): void {
    expect(lock_candidate.get_target_rotations(type, rotate).sort()).to.deep.equal(expected.sort());
  }

  function assert_position(actual:PositionType[], expected:PositionType[]): void {
    let to_index = (position:PositionType) => position[0] + 10 * position[1];
    expect(actual.map(to_index).sort()).to.deep.equal(expected.map(to_index).sort());
  }

  it("should check transposed target: S", () => {
    let lock_candidate = new LockCandidate();
    expect(lock_candidate.is_transposed_target(Type.S, Rotate.Normal)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.S, Rotate.Reverse)).to.be.true;

    assert_target_rotations(lock_candidate, Type.S, Rotate.Normal, [Rotate.Normal, Rotate.Reverse]);
    assert_target_rotations(lock_candidate, Type.S, Rotate.Reverse, [Rotate.Normal, Rotate.Reverse]);

    expect(lock_candidate.is_transposed_target(Type.S, Rotate.Left)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.S, Rotate.Right)).to.be.true;

    assert_target_rotations(lock_candidate, Type.S, Rotate.Left, [Rotate.Left, Rotate.Right]);
    assert_target_rotations(lock_candidate, Type.S, Rotate.Right, [Rotate.Left, Rotate.Right]);
  });

  it("should transpose: S", () => {
    let lock_candidate = new LockCandidate();
    assert_position(lock_candidate.transpose(Type.S, Rotate.Normal, [[0, 0]]), [[0, 0]]);
    assert_position(lock_candidate.transpose(Type.S, Rotate.Reverse, [[0, 1]]), [[0, 0]]);

    assert_position(lock_candidate.transpose(Type.S, Rotate.Left, [[0, 0]]), [[0, 0]]);
    assert_position(lock_candidate.transpose(Type.S, Rotate.Right, [[-1, 0]]), [[0, 0]]);
  });

  it("should check transposed target: Z", () => {
    let lock_candidate = new LockCandidate();
    expect(lock_candidate.is_transposed_target(Type.Z, Rotate.Normal)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.Z, Rotate.Reverse)).to.be.true;

    assert_target_rotations(lock_candidate, Type.Z, Rotate.Normal, [Rotate.Normal, Rotate.Reverse]);
    assert_target_rotations(lock_candidate, Type.Z, Rotate.Reverse, [Rotate.Normal, Rotate.Reverse]);

    expect(lock_candidate.is_transposed_target(Type.Z, Rotate.Right)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.Z, Rotate.Left)).to.be.true;

    assert_target_rotations(lock_candidate, Type.Z, Rotate.Left, [Rotate.Left, Rotate.Right]);
    assert_target_rotations(lock_candidate, Type.Z, Rotate.Right, [Rotate.Left, Rotate.Right]);
  });

  it("should transpose: Z", () => {
    let lock_candidate = new LockCandidate();
    assert_position(lock_candidate.transpose(Type.Z, Rotate.Normal, [[0, 0]]), [[0, 0]]);
    assert_position(lock_candidate.transpose(Type.Z, Rotate.Reverse, [[0, 1]]), [[0, 0]]);

    assert_position(lock_candidate.transpose(Type.Z, Rotate.Right, [[0, 0]]), [[0, 0]]);
    assert_position(lock_candidate.transpose(Type.Z, Rotate.Left, [[1, 0]]), [[0, 0]]);
  });

  it("should check transposed target: I", () => {
    let lock_candidate = new LockCandidate();
    expect(lock_candidate.is_transposed_target(Type.I, Rotate.Normal)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.I, Rotate.Reverse)).to.be.true;

    assert_target_rotations(lock_candidate, Type.I, Rotate.Normal, [Rotate.Normal, Rotate.Reverse]);
    assert_target_rotations(lock_candidate, Type.I, Rotate.Reverse, [Rotate.Normal, Rotate.Reverse]);

    expect(lock_candidate.is_transposed_target(Type.I, Rotate.Left)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.I, Rotate.Right)).to.be.true;

    assert_target_rotations(lock_candidate, Type.I, Rotate.Left, [Rotate.Left, Rotate.Right]);
    assert_target_rotations(lock_candidate, Type.I, Rotate.Right, [Rotate.Left, Rotate.Right]);
  });

  it("should transpose: I", () => {
    let lock_candidate = new LockCandidate();
    assert_position(lock_candidate.transpose(Type.I, Rotate.Normal, [[0, 0]]), [[0, 0]]);
    assert_position(lock_candidate.transpose(Type.I, Rotate.Reverse, [[1, 0]]), [[0, 0]]);

    assert_position(lock_candidate.transpose(Type.I, Rotate.Left, [[0, 0]]), [[0, 0]]);
    assert_position(lock_candidate.transpose(Type.I, Rotate.Right, [[0, 1]]), [[0, 0]]);
  });

  it("should check transposed target: T", () => {
    let lock_candidate = new LockCandidate();
    expect(lock_candidate.is_transposed_target(Type.T, Rotate.Normal)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.T, Rotate.Right)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.T, Rotate.Reverse)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.T, Rotate.Left)).to.be.false;

    assert_target_rotations(lock_candidate, Type.T, Rotate.Normal, [Rotate.Normal]);
    assert_target_rotations(lock_candidate, Type.T, Rotate.Right, [Rotate.Right]);
    assert_target_rotations(lock_candidate, Type.T, Rotate.Reverse, [Rotate.Reverse]);
    assert_target_rotations(lock_candidate, Type.T, Rotate.Left, [Rotate.Left]);
  });

  it("should check transposed target: L", () => {
    let lock_candidate = new LockCandidate();
    expect(lock_candidate.is_transposed_target(Type.L, Rotate.Normal)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.L, Rotate.Right)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.L, Rotate.Reverse)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.L, Rotate.Left)).to.be.false;

    assert_target_rotations(lock_candidate, Type.L, Rotate.Normal, [Rotate.Normal]);
    assert_target_rotations(lock_candidate, Type.L, Rotate.Right, [Rotate.Right]);
    assert_target_rotations(lock_candidate, Type.L, Rotate.Reverse, [Rotate.Reverse]);
    assert_target_rotations(lock_candidate, Type.L, Rotate.Left, [Rotate.Left]);
  });

  it("should check transposed target: J", () => {
    let lock_candidate = new LockCandidate();
    expect(lock_candidate.is_transposed_target(Type.J, Rotate.Normal)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.J, Rotate.Right)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.J, Rotate.Reverse)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.J, Rotate.Left)).to.be.false;

    assert_target_rotations(lock_candidate, Type.J, Rotate.Normal, [Rotate.Normal]);
    assert_target_rotations(lock_candidate, Type.J, Rotate.Right, [Rotate.Right]);
    assert_target_rotations(lock_candidate, Type.J, Rotate.Reverse, [Rotate.Reverse]);
    assert_target_rotations(lock_candidate, Type.J, Rotate.Left, [Rotate.Left]);
  });

  it("should check transposed target: O", () => {
    let lock_candidate = new LockCandidate();
    expect(lock_candidate.is_transposed_target(Type.O, Rotate.Normal)).to.be.false;
    expect(lock_candidate.is_transposed_target(Type.O, Rotate.Right)).to.be.true;
    expect(lock_candidate.is_transposed_target(Type.O, Rotate.Reverse)).to.be.true;
    expect(lock_candidate.is_transposed_target(Type.O, Rotate.Left)).to.be.true;

    assert_target_rotations(lock_candidate, Type.O, Rotate.Normal, [Rotate.Normal, Rotate.Right, Rotate.Reverse, Rotate.Left]);
    assert_target_rotations(lock_candidate, Type.O, Rotate.Right, [Rotate.Normal, Rotate.Right, Rotate.Reverse, Rotate.Left]);
    assert_target_rotations(lock_candidate, Type.O, Rotate.Reverse, [Rotate.Normal, Rotate.Right, Rotate.Reverse, Rotate.Left]);
    assert_target_rotations(lock_candidate, Type.O, Rotate.Left, [Rotate.Normal, Rotate.Right, Rotate.Reverse, Rotate.Left]);
  });

  it("should transpose: O", () => {
    let lock_candidate = new LockCandidate();
    assert_position(lock_candidate.transpose(Type.O, Rotate.Normal, [[0, 0]]), [[0, 0]]);
    assert_position(lock_candidate.transpose(Type.O, Rotate.Right, [[0, 1]]), [[0, 0]]);
    assert_position(lock_candidate.transpose(Type.O, Rotate.Reverse, [[1, 1]]), [[0, 0]]);
    assert_position(lock_candidate.transpose(Type.O, Rotate.Left, [[1, 0]]), [[0, 0]]);
  });
});
