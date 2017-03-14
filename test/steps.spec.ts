import * as chai from 'chai';
import {mino as _mino} from 'mino';
import {steps as _steps} from 'steps';

var expect = chai.expect;

describe("Steps", () => {
  type Type = _mino.Type;

  let Type = _mino.Type;
  let Steps = _steps.Steps;
  let create_random_steps = _steps.create_random_steps;

  const ALL_TYPES:Type[] = [Type.T, Type.L, Type.J, Type.S, Type.Z, Type.I, Type.O];

  it("should have pop current mino", () => {
    let min_count = 10;
    let steps = create_random_steps(min_count);
    expect(steps.next_count).to.be.least(min_count);

    let types = [];
    for (let count = 0; count < 7; count++) {
      types.push(steps.current_type);
      steps.next();
    }

    expect(types).to.deep.include.members(ALL_TYPES);
    expect(steps.next_count).to.be.least(min_count);
  });

  it("should get next mino", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 6, generator);

    for (let index = 0; index < 6; index++)
      expect(steps.get_next_type(index)).to.equal(ALL_TYPES[index + 1]);

    expect(steps.get_next_type(6)).to.be.undefined;
  });

  it("should decide mino order by generator", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);

    for (let count = 0; count < 5; count++) {
      expect(steps.current_type).to.equal(Type.T);
      steps.next();
      expect(steps.current_type).to.equal(Type.L);
      steps.next();
      expect(steps.current_type).to.equal(Type.J);
      steps.next();
      expect(steps.current_type).to.equal(Type.S);
      steps.next();
      expect(steps.current_type).to.equal(Type.Z);
      steps.next();
      expect(steps.current_type).to.equal(Type.I);
      steps.next();
      expect(steps.current_type).to.equal(Type.O);
      steps.next();
    }
  });

  it("should get current mino with hold operation", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);
    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.be.null;

    steps.next();

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.be.null;

    steps.hold();

    expect(steps.current_type).to.equal(Type.J);
    expect(steps.hold_type).to.equal(Type.L);

    steps.next();

    expect(steps.current_type).to.equal(Type.S);
    expect(steps.hold_type).to.equal(Type.L);
  });

  it("should get next mino with hold operation", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);  // current is T

    let next_type1 = steps.hold();  // change to L, hold to T
    expect(next_type1).to.equal(Type.L);

    expect(steps.next()).to.equal(Type.J);
    expect(steps.next()).to.equal(Type.S);

    let next_type2 = steps.hold();  // change to T, hold to S
    expect(next_type2).to.equal(Type.T);
    let next_type3 = steps.hold();
    expect(next_type3).to.be.null;

    expect(steps.next()).to.equal(Type.Z);
    expect(steps.next()).to.equal(Type.I);
    expect(steps.next()).to.equal(Type.O);

    steps.hold();  // change to S, hold O

    expect(steps.next()).to.equal(Type.T);

    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.equal(Type.O);
  });

  it("should record mino history", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);
    steps.hold();
    steps.next();
    steps.next();
    steps.hold();
    steps.next();
    steps.next();
    steps.next();
    steps.hold();
    steps.next();
    expect(steps.order_history()).to.equal("TLJSZIOT");
  });

  it("should undo before hold", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);
    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.be.null;

    steps.next();

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.be.null;

    steps.next();

    expect(steps.current_type).to.equal(Type.J);
    expect(steps.hold_type).to.be.null;

    expect(steps.undo()).to.equal(Type.L);

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.be.null;

    expect(steps.undo()).to.equal(Type.T);

    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.be.null;

    steps.next();

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.be.null;
  });

  it("should undo after hold", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);
    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.be.null;

    steps.next();
    // L, null
    steps.hold();

    expect(steps.current_type).to.equal(Type.J);
    expect(steps.hold_type).to.equal(Type.L);

    steps.next();
    // S, L
    steps.hold();

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.equal(Type.S);

    steps.next();
    // Z, S
    steps.hold();

    expect(steps.current_type).to.equal(Type.S);
    expect(steps.hold_type).to.equal(Type.Z);

    expect(steps.undo()).to.equal(Type.L);

    expect(steps.current_type).to.equal(Type.S);
    expect(steps.hold_type).to.equal(Type.L);

    expect(steps.undo()).to.equal(Type.J);

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.be.null;

    expect(steps.undo()).to.equal(Type.T);

    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.be.null;

    steps.next();

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.be.null;
  });

  it("should freeze", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);

    steps.next();
    steps.hold();
    steps.next();
    steps.hold();

    let freeze = steps.freeze();

    steps.next();

    expect(freeze.current_type).to.equal(Type.L);
    expect(freeze.hold_type).to.equal(Type.S);
    expect(freeze.order_history(0)).to.equal("TLJS");
  });

  it("should pack and unpack", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);

    steps.next();
    steps.hold();
    steps.next();

    let packed = steps.pack();
    let unpacked = Steps.unpack(packed, generator);

    expect(unpacked.current_type).to.equal(steps.current_type);
    expect(unpacked.hold_type).to.equal(steps.hold_type);
    expect(unpacked.order_history(0)).to.equal(steps.order_history(0));
  });

  it("should pack and unpack, hold", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);

    steps.next();
    steps.hold();
    steps.next();
    steps.hold();

    let packed = steps.pack();
    let unpacked = Steps.unpack(packed, generator);

    // 最後のholdの情報は消える
    expect(unpacked.current_type).to.equal(steps.hold_type);
    expect(unpacked.hold_type).to.equal(steps.current_type);
    expect(unpacked.order_history(0)).to.equal(steps.order_history(0));
  });
});
