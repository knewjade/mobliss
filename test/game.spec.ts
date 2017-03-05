import * as chai from 'chai';
import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {checkmate as _checkmate} from 'checkmate';
import {game as _game} from 'game';
import {steps as _steps} from 'steps';

var expect = chai.expect;

describe("Game", () => {
  type Game = _game.Game;
  type Field = _field.Field;

  let Type = _mino.Type;
  let Rotate = _mino.Rotate;
  let Game = _game.Game;
  let Steps = _steps.Steps;

  let create_initial_field = _field.create_initial_field;
  let create_gray_field = _field.create_gray_field;

  const FIELD_HEIGHT =_game.FIELD_HEIGHT;
  const FIELD_WIDTH = _game.FIELD_WIDTH;

  function move_and_harddrop(game:Game, to_x:number) {
    let diff = to_x - game.x;
    let is_right = 0 < diff;
    for (let count = 0; count < Math.abs(diff); count++) {
      if (is_right === true)
        game.move_right();
      else
        game.move_left();
    }
    game.harddrop();
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

  it("should decide mino when start", () => {
    let field = create_initial_field(FIELD_HEIGHT, FIELD_WIDTH);
    let steps = new Steps([Type.T], 1);
    let game = new Game(field, steps);

    expect(game.current_mino.type).to.equal(Type.T);
    expect(game.hold_type).to.equal(null);
    expect(game.x).to.equal(4);
    expect(game.y).to.equal(20);
  });

  it("should operate", () => {
    let field = create_initial_field(FIELD_HEIGHT, FIELD_WIDTH);
    let steps = new Steps([Type.I, Type.S, Type.T, Type.Z, Type.L, Type.O, Type.J], 1);
    let game = new Game(field, steps);

    game.rotate_right();  // I
    move_and_harddrop(game, 0);

    move_and_harddrop(game, 2); // S

    game.rotate_right();
    move_and_harddrop(game, 1); // T

    move_and_harddrop(game, 3); // Z

    move_and_harddrop(game, 8); // L

    game.rotate_right();  // O
    game.rotate_right();
    game.rotate_right();
    move_and_harddrop(game, 8);

    game.rotate_right();  // J
    game.rotate_right();
    move_and_harddrop(game, 8);

    assert_field(game.field, [
      0, 1, 2, 7, 8, 9,
      10, 11, 12, 13, 17, 18, 19,
      20, 21, 22, 23, 24, 27, 28, 29,
      30, 31, 32, 33, 37, 38, 39
    ]);
  });

  it("should freeze", () => {
    let field = create_gray_field(FIELD_HEIGHT, FIELD_WIDTH, [
      [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    ]);
    let steps = new Steps([], 1);
    let game = new Game(field, steps);

    game.hold();
    game.rotate_right();

    let freeze = game.freeze();

    expect(freeze.x).to.equal(game.x);
    expect(freeze.y).to.equal(game.y);
    expect(freeze.clear_line_count).to.equal(game.clear_line_count);

    game.rotate_right();

    expect(freeze.current_mino.type).to.equal(game.current_mino.type);
    expect(freeze.current_mino.rotate).to.equal(Rotate.Right);
    expect(freeze.steps.pack()).to.equal(game.steps.pack());
    expect(freeze.field.hash()).to.equal(game.field.hash());
  });

  it("should pack and unpack", () => {
    let field = create_gray_field(FIELD_HEIGHT, FIELD_WIDTH, [
      [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    ]);
    let steps = new Steps([], 1);
    let game = new Game(field, steps, [4, 20]);

    game.hold();
    game.rotate_right();

    let packed = game.pack();
    let unpacked = Game.unpack(packed);

    // 最後のミノの操作は消える
    expect(unpacked.x).to.equal(4);
    expect(unpacked.y).to.equal(20);
    expect(unpacked.clear_line_count).to.equal(0);
    expect(unpacked.current_mino.type).to.equal(game.hold_type);
    expect(unpacked.current_mino.rotate).to.equal(Rotate.Normal);
    expect(unpacked.steps.pack()).to.equal(game.steps.pack());
    expect(unpacked.field.hash()).to.equal(game.field.hash());
  });
});
