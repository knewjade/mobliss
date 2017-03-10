import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {steps as _steps} from 'steps';
import {tetfu as _tetfu} from 'tetfu';

export namespace game {
  type Field = _field.Field;
  type Mino = _mino.Mino;
  type Type = _mino.Type;
  type PositionType = _mino.PositionType;
  type Rotate = _mino.Rotate;
  type Steps = _steps.Steps;

  let Rotate = _mino.Rotate;
  let Steps = _steps.Steps;

  let mino = _mino.mino;
  let block_by_name = _mino.block_by_name;
  let create_initial_field = _field.create_initial_field;
  let encode_value = _tetfu.encode_value;
  let decode_value = _tetfu.decode_value;
  let encode_field = _tetfu.encode_field;
  let decode_field = _tetfu.decode_field;

  let ENCODE_MAX_VALUE = _tetfu.ENCODE_MAX_VALUE;

  export const FIELD_HEIGHT = _tetfu.consts.TETFU_FIELD_TOP;
  export const FIELD_WIDTH = _tetfu.consts.TETFU_FIELD_WIDTH;
  const FIELD_BLOCKS = FIELD_WIDTH * FIELD_HEIGHT;

  export class Game {
    private _x:number;
    private _y:number;
    private _clear_line_counter:number = 0;
    private _mino:Mino;
    private _commit_history:string = "";

    constructor(private _field:Field, private _steps:Steps, private _appear_position:[number, number]=[4, 20]) {
      this.respawn();
      this._mino = mino(this._steps.current_type, Rotate.Normal);
    }

    public respawn(): void {
      this._x = this._appear_position[0];
      this._y = this._appear_position[1];
    }

    public rotate_right(): void {
      let pattern:[number, number] = this._field.rotate_right(this._x, this._y, this._mino);

      if (pattern != null) {
        this._x += pattern[0];
        this._y += pattern[1];
        this._mino.rotate_right();
      }
    }

    public rotate_left(): void {
      let pattern:[number, number] = this._field.rotate_left(this._x, this._y, this._mino);

      if (pattern != null) {
        this._x += pattern[0];
        this._y += pattern[1];
        this._mino.rotate_left();
      }
    }

    public move_down(): boolean {
      if (this._field.checks_empty(this._x, this._y - 1, this._mino.positions)) {
        this._y -= 1;
        return true;
      }
      return false;
    }

    public move_left(): boolean {
      if (this._field.checks_empty(this._x - 1, this._y, this._mino.positions)) {
        this._x -= 1;
        return true;
      }
      return false;
    }

    public move_right(): boolean {
      if (this._field.checks_empty(this._x + 1, this._y, this._mino.positions)) {
        this._x += 1;
        return true;
      }
      return false;
    }

    public move_bottom(): void {
      this._y = this._field.harddrop(this._x, this._y, this._mino);
    }

    // TODO: write unittest
    public teleport(x:number, y:number, rotate:Rotate): void {
      let rotate_count:number = (rotate - this._mino.rotate + 4) % 4;
      if (rotate_count === 1) {
        this._mino.rotate_right();
      } else if (rotate_count === 2) {
        this._mino.rotate_right();
        this._mino.rotate_right();
      } else if (rotate_count === 3) {
        this._mino.rotate_left();
      }

      this._x = x;
      this._y = y;
    }

    public harddrop(): void {
      this.move_bottom();
      this.commit();
    }

    public commit(): void {
      this._field.set_mino(this._x, this._y, this._mino);
      let clear_lines = this._field.clear();
      this._clear_line_counter += clear_lines.length;

      this.record(this._x, this._y, this._mino.rotate);

      let next_type = this._steps.next();
      this._mino = mino(next_type);

      this.respawn();
    }

    public record(x:number, y:number, rotate:Rotate): void {
      this._commit_history += this.encode_position_and_rotate(rotate, x, y);
    }

    private encode_position_and_rotate(rotate:Rotate, x:number, y:number): string {
      return encode_value(x + y * FIELD_WIDTH + rotate * FIELD_BLOCKS, 2);
    }

    private decode_position_and_rotate(encoded:string): [Rotate, PositionType] {
      let value = decode_value(encoded);
      let x = value % FIELD_WIDTH;
      value = Math.floor(value / FIELD_WIDTH);
      let y = value % FIELD_HEIGHT;
      value = Math.floor(value / FIELD_HEIGHT);
      let rotate = <Rotate>(value % 4);
      return [rotate, [x, y]];
    }

    public hold(): boolean {
      let next_type = this._steps.hold();
      if (next_type === null)
        return false;

      this._x = this._appear_position[0];
      this._y = this._appear_position[1];
      this._mino = mino(next_type);
      return true;
    }

    public unhold(): boolean {
      let current_type = this._steps.unhold();
      if (current_type === null)
        return false;

      this._x = this._appear_position[0];
      this._y = this._appear_position[1];
      this._mino = mino(current_type);
      return true;
    }

    public get_next(index:number): Type {
      return this._steps.get_next(index);
    }

    public get x(): number {
      return this._x;
    }

    public get y(): number {
      return this._y;
    }

    public get field(): Field {
      return this._field;
    }

    public get current_mino(): Mino {
      return this._mino;
    }

    public get hold_type(): Type {
      return this._steps.hold_type;
    }

    public get steps(): Steps {
      return this._steps;
    }

    public get clear_line_count(): number {
      return this._clear_line_counter;
    }

    // TODO: write unittest
    public get appear_position(): [number, number] {
      return this._appear_position;
    }

    // TODO: write unittest
    public get commit_history(): [Type, Rotate, PositionType][] {
      var reg = new RegExp(".{2}", "g");
      var splited = this._commit_history.match(reg);
      let rotate_positions:[Rotate, PositionType][] = splited.map(this.decode_position_and_rotate);
      let types:Type[] = this._steps.commit_history;
      return rotate_positions.map((rotate_position, index):[Type, Rotate, PositionType] => [types[index], rotate_position[0], rotate_position[1]]);
    }

    // TODO: write unittest
    public get_order_history(next_count?:number): Type[] {
      if (next_count === undefined)
        next_count = this._steps.next_count;
      return this._steps.order_history(next_count).split('').map((name) => block_by_name(name).type);
    }

    public freeze(): Game {
      let game = new Game(this._field.freeze(), this._steps.freeze(), <[number, number]>[].concat(this._appear_position));
      game._x = this._x;
      game._y = this._y;
      game._clear_line_counter = this._clear_line_counter;
      game._mino = mino(this._mino.type, this._mino.rotate);
      game._commit_history = this._commit_history;

      return game;
    }

    public pack(): string {
      let current_field = this._field;
      let prev_field = create_initial_field(current_field.height, current_field.width);
      let encoded_field = encode_field(prev_field, current_field);
      let packed_steps = this._steps.pack();
      let packed_appear = this.encode_position(this._appear_position[0], this._appear_position[1]);

      return [encoded_field, packed_steps, packed_appear, this._commit_history, this._clear_line_counter.toString()].join('=');
    }

    private encode_position(x:number, y:number): string {
      return encode_value(x + y * FIELD_WIDTH, 2);
    }

    static unpack(packed:string, bag_generator:() => Type[]=null): Game {
      let split = packed.split('=');
      let unpacked_field = split[0];
      let unpacked_steps = split[1];
      let unpacked_appear = split[2];
      let commit_history = split[3];
      let clear_line_counter = parseInt(split[4]);

      let prev_field = create_initial_field(FIELD_HEIGHT, FIELD_WIDTH);
      let field = decode_field(prev_field, unpacked_field);

      let steps = Steps.unpack(unpacked_steps, bag_generator);
      let appear_position = Game.decode_position(unpacked_appear);

      let game = new Game(field, steps, appear_position);

      game._x = appear_position[0];
      game._y = appear_position[1];
      game._clear_line_counter = clear_line_counter;
      game._mino = mino(steps.current_type, Rotate.Normal);
      game._commit_history = commit_history;

      return game;
    }

    static decode_position(encoded:string): [number, number] {
      let value = decode_value(encoded);
      return [value % FIELD_WIDTH, Math.floor(value / FIELD_WIDTH)];
    }
  }
}
