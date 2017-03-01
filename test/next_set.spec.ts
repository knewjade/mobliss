import * as chai from 'chai';
import {mino as _mino} from 'mino';
import {next_set as _next_set} from 'next_set';

var expect = chai.expect;

describe("Next Set", () => {
  let Type = _mino.Type;

  const all_types = [Type.T, Type.L, Type.J, Type.S, Type.Z, Type.I, Type.O];

  it("should have pop next mino", () => {
    let min_count = 10;
    let next_set = _next_set.create_random_next_set(min_count);
    expect(next_set.count).to.be.least(min_count);

    let types = [];
    for (let count = 0; count < 7; count++)
      types.push(next_set.pop());

    expect(types).to.deep.include.members(all_types);
    expect(next_set.count).to.be.least(min_count);
  });
});
