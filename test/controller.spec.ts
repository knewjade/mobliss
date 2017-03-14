import * as chai from 'chai';
import {mino as _mino} from 'mino';
import {game as _game} from 'game';
import {field as _field} from 'field';
import {steps as _steps} from 'steps';
import {controller as _controller} from 'controller';
import {lock_candidate as _lock_candidate} from 'lock_candidate';

var expect = chai.expect;

describe("Controller", () => {
  const FIELD_HEIGHT = _game.FIELD_HEIGHT;
  const FIELD_WIDTH = _game.FIELD_WIDTH;

  type Controller = _controller.Controller;
  type Field = _field.Field;
  type Type = _mino.Type;

  let Steps = _steps.Steps;
  let Game = _game.Game;
  let Type = _mino.Type;
  let LockCandidate = _lock_candidate.LockCandidate;
  let Controller = _controller.Controller;
  let PerfectStatus = _controller.PerfectStatus;

  let create_initial_field = _field.create_initial_field;

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

  let default_game_generator = (types:Type[]=[]) => {
    return () => {
      let field = create_initial_field(FIELD_HEIGHT, FIELD_WIDTH);
      let steps = new Steps(types, 5);
      return new Game(field, steps);
    };
  };

  it("should appear x:4, y:19", () => {
    let game_generator = default_game_generator([Type.I, Type.J, Type.O, Type.T, Type.L, Type.Z, Type.S, Type.T, Type.O, Type.S, Type.Z]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 5,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: false,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {},
    });

    expect(controller.game.x).to.equal(4);
    expect(controller.game.y).to.equal(19);

    controller.move_right();
    controller.harddrop();

    expect(controller.game.x).to.equal(4);
    expect(controller.game.y).to.equal(19);

    controller.move_left();
    controller.hold();

    expect(controller.game.x).to.equal(4);
    expect(controller.game.y).to.equal(19);

    controller.move_down();
    controller.harddrop();
    controller.undo();

    expect(controller.game.x).to.equal(4);
    expect(controller.game.y).to.equal(19);

    controller.move_left();
    controller.hold();
    controller.undo();

    expect(controller.game.x).to.equal(4);
    expect(controller.game.y).to.equal(19);

    controller.move_right();
    controller.restart();

    expect(controller.game.x).to.equal(4);
    expect(controller.game.y).to.equal(19);
  });

  it("should operate from button", () => {
    let game_generator = default_game_generator([Type.I, Type.J, Type.O, Type.T, Type.L, Type.Z, Type.S, Type.T, Type.O, Type.S, Type.Z]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 5,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: false,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {},
    });

    expect(controller.game.field.is_perfect).to.be.true;
    expect(controller.candidates).to.be.empty;

    // hold I
    controller.hold();

    // put J
    for (let count = 0; count < 5; count++)
      controller.move_right();
    controller.harddrop();

    // put O
    for (let count = 0; count < 10; count++)
      controller.move_right();
    controller.harddrop();

    // put T
    controller.rotate_right();
    for (let count = 0; count < 10; count++)
      controller.move_left();
    controller.harddrop();

    // put L
    controller.rotate_left();
    controller.rotate_left();
    for (let count = 0; count < 10; count++)
      controller.move_right();
    controller.harddrop();

    // put Z
    for (let count = 0; count < 3; count++)
      controller.move_left();
    controller.harddrop();

    // put S
    for (let count = 0; count < 19; count++)
      controller.move_down();
    controller.move_left();
    controller.move_left();
    controller.harddrop();

    // put T
    controller.rotate_left();
    controller.move_right();
    controller.harddrop();

    // hold O => pop I
    controller.hold();

    // put I
    controller.rotate_right();
    controller.move_right();
    controller.harddrop();

    // put Z
    controller.harddrop();

    // put S
    controller.rotate_left();
    for (let count = 0; count < 17; count++)
      controller.move_down();
    controller.rotate_left();
    controller.harddrop();

    expect(controller.game.field.is_perfect).to.be.true;
  });

  it("should restart", () => {
    let game_generator = default_game_generator();
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 1,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: false,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {},
    });

    expect(controller.game.field.is_perfect).to.be.true;

    for (let count = 0; count < 10; count++)
      controller.harddrop();

    expect(controller.game.field.is_perfect).to.be.false;

    controller.restart();

    expect(controller.game.field.is_perfect).to.be.true;
  });

  it("should operate from directly", () => {
    let game_generator = default_game_generator([Type.T, Type.J]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 5,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: true,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {},
    });

    expect(controller.game.field.is_perfect).to.be.true;

    // put T
    expect(controller.candidates).to.deep.include.members([
      [1, 0], [2, 0], [3, 0], [4, 0],
      [5, 0], [6, 0], [7, 0], [8, 0],
    ]);
    controller.rotate_right();
    controller.put(0, 1);

    // put J
    controller.rotate_left();
    controller.put(9, 1);

    assert_field(game.field, [
      0, 8, 9,
      10, 11, 19,
      20, 29,
    ]);
  });

  it("should not put without candidates", () => {
    let game_generator = default_game_generator();
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 5,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: true,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {},
    });

    expect(controller.game.field.is_perfect).to.be.true;

    // put T
    controller.put(1, 1);   // no candidates

    expect(controller.game.field.is_perfect).to.be.true;
  });

  it("should not put when 'is_candidate' is false", () => {
    let game_generator = default_game_generator();
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 5,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: false,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {},
    });

    expect(controller.game.field.is_perfect).to.be.true;

    // put T
    controller.put(1, 0);   // candidate, but 'is_candidate' is false

    expect(controller.game.field.is_perfect).to.be.true;
  });

  it("should candidate 4 line after 2 line perfect", () => {
    let game_generator = default_game_generator([Type.O, Type.O, Type.J, Type.I, Type.L, Type.I]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 5,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: true,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {},
    });

    controller.put(0, 0);
    controller.put(2, 0);
    controller.put(5, 0);
    controller.put(6, 1);
    controller.put(8, 0);

    // type I
    controller.rotate_right();

    expect(controller.candidates).to.deep.include.members([
      [0, 1], [1, 1], [1, 1], [3, 1], [4, 1],
      [5, 1], [6, 1], [7, 1], [8, 1], [9, 1],
    ]);
  });

  it("should undo", () => {
    let game_generator = default_game_generator([Type.I, Type.O]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 5,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: false,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {},
    });

    expect(controller.game.field.is_perfect).to.be.true;
    expect(controller.game.current_mino.type).to.equal(Type.I);

    controller.undo();  //　何も起きない

    expect(controller.game.field.is_perfect).to.be.true;
    expect(controller.game.current_mino.type).to.equal(Type.I);
    expect(controller.game.hold_type).to.be.null;

    controller.hold();

    expect(controller.game.current_mino.type).to.equal(Type.O);
    expect(controller.game.hold_type).to.equal(Type.I);

    controller.undo();  //　holdの取り消し

    expect(controller.game.current_mino.type).to.equal(Type.I);
    expect(controller.game.hold_type).to.be.null;

    // max_undo_countを超えて、繰り返しharddropをして記録する
    let field_hashs = [];
    for (let count = 0; count < 10; count++) {
      field_hashs.push(controller.game.field.hash());
      controller.harddrop();
    }

    // 記録通りにundoされていることを確認
    while (0 < field_hashs.length) {
      controller.undo();
      let field_hash = field_hashs.pop();
      expect(controller.game.field.hash()).to.equal(field_hash);
    }
  });

  it("should undo with multi games", () => {
    let game_generator = default_game_generator([Type.I, Type.O]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 10,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: false,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {},
    });

    // 繰り返しharddropをして記録する
    let field_hashs = [];
    for (let count = 0; count < 10; count++) {
      field_hashs.push(controller.game.field.hash());
      controller.harddrop();
    }

    field_hashs.push(controller.game.field.hash());
    controller.restart();

    field_hashs.push(controller.game.field.hash());
    controller.restart();

    // max_undo_count内で、繰り返しharddropをして記録する
    for (let count = 0; count < 5; count++) {
      field_hashs.push(controller.game.field.hash());
      controller.harddrop();
    }

    // 記録通りにundoされていることを確認
    while (0 < field_hashs.length) {
      controller.undo();
      let field_hash = field_hashs.pop();
      expect(controller.game.field.hash()).to.equal(field_hash);
    }
  });

  it("should generate tetfu", () => {
    let game_generator = () => {
      let field = create_initial_field(FIELD_HEIGHT, FIELD_WIDTH);
      let steps = new Steps([Type.I, Type.O, Type.S, Type.Z, Type.J, Type.L, Type.T], 1);
      return new Game(field, steps);
    };
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 10,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: false,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {},
    });

    // 繰り返しharddropをして記録する
    let field_hashs = [];
    for (let count = 0; count < 5; count++) {
      field_hashs.push(controller.game.field.hash());
      controller.harddrop();
    }

    let expected_tetfu = 'vhERQYaAFLDmClcJSAVDEHBEooRBJoAVBPtzPCsOBA?ATmBXcBUSBWNB';
    expect(controller.generate_tetfu()).to.equal(expected_tetfu);
  });

  it("should check perfect 1: Stopped", (done) => {
    let game_generator = default_game_generator([Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 10,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: false,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {
        if (event_name === 'perfect') {
          // 実行後に結果が反映されている
          expect(controller.perfect_status).to.equal(PerfectStatus.Stopped);

          controller.harddrop();

          // // 実行後に操作すると結果が消える
          expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

          done();
        }
      },
    });

    expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

    controller.check_perfect();
  });

  it("should check perfect 2: Found", (done) => {
    let game_generator = default_game_generator([Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.T, Type.I]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 10,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: true,
      is_perfect_candidate: false,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {
        if (event_name === 'perfect') {
          // 実行後に結果が反映されている
          expect(controller.perfect_status).to.equal(PerfectStatus.Found);

          controller.undo();

          // 実行後に操作すると結果が消える
          expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

          done();
        }
      },
    });

    controller.rotate_right();
    controller.put(0, 1);

    controller.rotate_right();
    controller.put(1, 1);

    controller.rotate_right();
    controller.put(2, 1);

    controller.rotate_right();
    controller.put(3, 1);

    controller.hold();

    controller.check_perfect();
  });

  it("should check perfect 3: Found [hold]", (done) => {
    let game_generator = default_game_generator([Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 10,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: true,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {
        if (event_name === 'perfect') {
          // 実行後に結果が反映されている
          expect(controller.perfect_status).to.equal(PerfectStatus.Found);

          controller.hold();

          // // 実行後に操作すると結果が消える
          expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

          done();
        }
      },
    });

    expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

    controller.hold();

    controller.rotate_right();
    controller.put(0, 1);

    controller.rotate_right();
    controller.put(1, 1);

    controller.rotate_right();
    controller.put(2, 1);

    controller.check_perfect();
  });

  it("should check perfect 4: NotFound", function (done) {
    this.timeout(5000);

    let game_generator = default_game_generator([Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 10,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: true,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 7,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {
        if (event_name === 'perfect') {
          // 実行後に結果が反映されている
          expect(controller.perfect_status).to.equal(PerfectStatus.NotFound);

          controller.hold();

          // // 実行後に操作すると結果が消える
          expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

          done();
        }
      },
    });

    expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

    controller.rotate_right();
    controller.put(0, 1);

    controller.put(2, 0);

    controller.put(3, 1);

    controller.put(2, 2);

    controller.check_perfect();
  });

  it("should check perfect 5: NotFoundYet", function (done) {
    this.timeout(20000);

    let game_generator = default_game_generator([Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I, Type.I]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 10,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: true,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 1,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {
        if (event_name === 'perfect') {
          // 実行後に結果が反映されている
          expect(controller.perfect_status).to.equal(PerfectStatus.NotFoundYet);

          controller.hold();

          // // 実行後に操作すると結果が消える
          expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

          done();
        }
      },
    });

    expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

    controller.hold();

    controller.rotate_right();
    controller.put(0, 1);

    controller.put(2, 0);

    controller.put(3, 1);

    controller.check_perfect();
  });

  it("should check perfect 6: NotFoundYet", function (done) {
    this.timeout(120000);

    let game_generator = default_game_generator([Type.T, Type.J, Type.Z, Type.L, Type.O, Type.J, Type.S, Type.O, Type.J, Type.S, Type.Z]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 10,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: true,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 1,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {
        if (event_name === 'perfect') {
          // 実行後に結果が反映されている
          expect(controller.perfect_status).to.equal(PerfectStatus.NotFoundYet);

          controller.hold();

          // // 実行後に操作すると結果が消える
          expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

          done();
        }
      },
    });

    expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

    controller.hold();

    controller.put(1, 0);

    controller.put(3, 0);

    controller.rotate_left();
    controller.put(4, 2);

    controller.check_perfect();
  });

  it("should check perfect 7: Found", function (done) {
    this.timeout(20000);

    let game_generator = default_game_generator([Type.T, Type.J, Type.Z, Type.L, Type.O, Type.J, Type.S, Type.O, Type.J, Type.S, Type.Z]);
    let game = game_generator();
    let lock_candidate = new LockCandidate();
    let controller = new Controller(game, lock_candidate, {
      max_undo_count: 10,
      visible_field_height: 20,
      visible_field_width: 10,
      next_count: 5,
      is_candidate: true,
      is_perfect_candidate: true,
      is_two_line_perfect: false,
      bag_length: 1,
      game_generator: game_generator,
      operation_callback: (event_name:string, controller:Controller) => {
        if (event_name === 'perfect') {
          // 実行後に結果が反映されている
          expect(controller.perfect_status).to.equal(PerfectStatus.Found);

          controller.hold();

          // // 実行後に操作すると結果が消える
          expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

          done();
        }
      },
    });

    expect(controller.perfect_status).to.equal(PerfectStatus.NotExecute);

    controller.hold();

    controller.put(1, 0);

    controller.put(3, 0);

    controller.rotate_left();
    controller.put(4, 2);

    controller.put(8, 0);

    controller.check_perfect();
  });
});
