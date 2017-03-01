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
    for (let count = 0; count < 7; count++)
      types.push(steps.pop_current());

    expect(types).to.deep.include.members(ALL_TYPES);
    expect(steps.next_count).to.be.least(min_count);
  });

  it("should decide mino order by generator", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);

    for (let count = 0; count < 5; count++) {
      expect(steps.pop_current()).to.equal(Type.T);
      expect(steps.pop_current()).to.equal(Type.L);
      expect(steps.pop_current()).to.equal(Type.J);
      expect(steps.pop_current()).to.equal(Type.S);
      expect(steps.pop_current()).to.equal(Type.Z);
      expect(steps.pop_current()).to.equal(Type.I);
      expect(steps.pop_current()).to.equal(Type.O);
    }
  });

  it("should get current mino, hold mino", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);
    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.be.null;

    steps.pop_current();

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.be.null;

    steps.hold();

    expect(steps.current_type).to.equal(Type.J);
    expect(steps.hold_type).to.equal(Type.L);

    steps.pop_current();

    expect(steps.current_type).to.equal(Type.S);
    expect(steps.hold_type).to.equal(Type.L);
  });

  it("should record mino history", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);
    steps.hold();
    expect(steps.pop_current()).to.equal(Type.L);
    expect(steps.pop_current()).to.equal(Type.J);
    steps.hold();
    steps.hold();  // disable
    steps.hold();  // disable
    expect(steps.pop_current()).to.equal(Type.T);
    expect(steps.pop_current()).to.equal(Type.Z);
    expect(steps.pop_current()).to.equal(Type.I);
    steps.hold();
    expect(steps.pop_current()).to.equal(Type.S);

    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.equal(Type.O);
  });

  it("should record mino history", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);
    steps.hold();
    steps.pop_current();
    steps.pop_current();
    steps.hold();
    steps.pop_current();
    steps.pop_current();
    steps.pop_current();
    steps.hold();
    steps.pop_current();
    expect(steps.order_history()).to.equal("TLJSZIOT");
  });

  it("should undo before hold", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);
    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.be.null;

    steps.pop_current();

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.be.null;

    steps.pop_current();

    expect(steps.current_type).to.equal(Type.J);
    expect(steps.hold_type).to.be.null;

    steps.undo();

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.be.null;

    steps.undo();

    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.be.null;

    steps.pop_current();

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.be.null;
  });

  it("should undo after hold", () => {
    let generator: () => Type[] = (): Type[] => ALL_TYPES;
    let steps = new Steps([], 1, generator);
    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.be.null;

    steps.pop_current();
    steps.hold();

    expect(steps.current_type).to.equal(Type.J);
    expect(steps.hold_type).to.equal(Type.L);

    steps.pop_current();
    steps.hold();

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.equal(Type.S);

    steps.undo();

    expect(steps.current_type).to.equal(Type.J);
    expect(steps.hold_type).to.equal(Type.L);

    steps.undo();

    expect(steps.current_type).to.equal(Type.T);
    expect(steps.hold_type).to.be.null;

    steps.pop_current();

    expect(steps.current_type).to.equal(Type.L);
    expect(steps.hold_type).to.be.null;
  });
});
