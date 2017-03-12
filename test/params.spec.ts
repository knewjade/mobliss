import * as chai from 'chai';
import {params as _params} from 'params';

var expect = chai.expect;

describe("Params", () => {
  let Params = _params.Params;

  it("should get default when input empty text", () => {
    let params = new Params('');
    let result = params.text.split('&');
    expect(result).has.lengthOf(1);
    expect(result).to.deep.include.members(['version=001']);
  });

  it("should parse text: pivot", () => {
    let params = new Params('ps=NR&pz=2L&pi=NR&po=R&version=001');
    let result = params.text.split('&');
    expect(result).has.lengthOf(5);
    expect(result).to.deep.include.members([
      'version=001', 'ps=NR', 'pz=2L', 'pi=NR', 'po=R'
    ]);
  });

  it("should parse text: candidate", () => {
    let params = new Params('fcv=0&fclp=1&version=001');
    let result = params.text.split('&');
    expect(result).has.lengthOf(3);
    expect(result).to.deep.include.members([
      'version=001', 'fcv=0', 'fclp=1'
    ]);
  });

  it("should parse text: mark", () => {
    let params = new Params('fmb=1&fmp=1&version=001');
    let result = params.text.split('&');
    expect(result).has.lengthOf(3);
    expect(result).to.deep.include.members([
      'version=001', 'fmb=1', 'fmp=1'
    ]);
  });

  it("should parse text: field", () => {
    let params = new Params('fld=PerfectRight&version=001');
    let result = params.text.split('&');
    expect(result).has.lengthOf(2);
    expect(result).to.deep.include.members([
      'version=001', 'fld=PerfectRight'
    ]);
  });

  it("should parse text: order", () => {
    let params = new Params('ord=TLJIOSZ&version=001');
    let result = params.text.split('&');
    expect(result).has.lengthOf(2);
    expect(result).to.deep.include.members([
      'version=001', 'ord=TLJIOSZ'
    ]);
  });

  it("should parse text: keyboard", () => {
    let params = new Params('fke=0&version=001');
    let result = params.text.split('&');
    expect(result).has.lengthOf(2);
    expect(result).to.deep.include.members([
      'version=001', 'fke=0'
    ]);
  });

  it("should parse text: next", () => {
    let params = new Params('nc=6&version=001');
    let result = params.text.split('&');

    expect(params.next_count).to.equal(5);
    expect(result).has.lengthOf(1);
    expect(result).to.deep.include.members([
      'version=001'
    ]);
  });
});
