import {mino as _mino} from 'mino';

export namespace field {
  namespace super_rotation_system {
    let Type = _mino.Type;
    let Rotate = _mino.Rotate;

    type Rotate = _mino.Rotate;

    let rotate_positions_to_right = _mino.rotate_positions_to_right;
    let rotate_positions_to_left = _mino.rotate_positions_to_left;

    let get_next_right_rotate = _mino.get_next_right_rotate;
    let get_next_left_rotate = _mino.get_next_left_rotate;

    export let rotate_testmap: { [type: number] : { [rotate: number] : PositionType[] }} = {};
    rotate_testmap[Type.T] = {};
    rotate_testmap[Type.S] = {};
    rotate_testmap[Type.Z] = {};
    rotate_testmap[Type.J] = {};
    rotate_testmap[Type.L] = {};
    rotate_testmap[Type.I] = {};
    rotate_testmap[Type.O] = {};
    rotate_testmap[Type.T][Rotate.Normal] = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
    rotate_testmap[Type.T][Rotate.Right] = [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]];
    rotate_testmap[Type.T][Rotate.Reverse] = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
    rotate_testmap[Type.T][Rotate.Left] = [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]];
    rotate_testmap[Type.J][Rotate.Normal] = rotate_testmap[Type.L][Rotate.Normal] = rotate_testmap[Type.S][Rotate.Normal]
      = rotate_testmap[Type.Z][Rotate.Normal] = rotate_testmap[Type.T][Rotate.Normal];
    rotate_testmap[Type.J][Rotate.Right] = rotate_testmap[Type.L][Rotate.Right] = rotate_testmap[Type.S][Rotate.Right]
      = rotate_testmap[Type.Z][Rotate.Right] = rotate_testmap[Type.T][Rotate.Right];
    rotate_testmap[Type.J][Rotate.Reverse] = rotate_testmap[Type.L][Rotate.Reverse] = rotate_testmap[Type.S][Rotate.Reverse]
      = rotate_testmap[Type.Z][Rotate.Reverse] = rotate_testmap[Type.T][Rotate.Reverse];
    rotate_testmap[Type.J][Rotate.Left] = rotate_testmap[Type.L][Rotate.Left] = rotate_testmap[Type.S][Rotate.Left]
      = rotate_testmap[Type.Z][Rotate.Left] = rotate_testmap[Type.T][Rotate.Left];
    rotate_testmap[Type.I][Rotate.Normal] = [[0, 0], [-1, 0], [2, 0], [-1, 0], [2, 0]];
    rotate_testmap[Type.I][Rotate.Right] = [[-1, 0], [0, 0], [0, 0], [0, 1], [0, -2]];
    rotate_testmap[Type.I][Rotate.Reverse] = [[-1, 1], [1, 1], [-2, 1], [1, 0], [-2, 0]];
    rotate_testmap[Type.I][Rotate.Left] = [[0, 1], [0, 1], [0, 1], [0, -1], [0, 2]];
    rotate_testmap[Type.O][Rotate.Normal] = [[0, 0]];
    rotate_testmap[Type.O][Rotate.Right] = [[0, -1]];
    rotate_testmap[Type.O][Rotate.Reverse] = [[-1, -1]];
    rotate_testmap[Type.O][Rotate.Left] = [[-1, 0]];

    export function decide_right_rotation_pattern(x:number, y:number, field:Field, current_mino:Mino): [number, number] {
      let type = current_mino.type;
      let current_rotate = current_mino.rotate;
      let next_rotate = get_next_right_rotate(current_rotate);

      let current_map = rotate_testmap[type][current_rotate],
          next_map = rotate_testmap[type][next_rotate];

      let next_positions = rotate_positions_to_right(current_mino.positions);

      for (let index = 0; index < current_map.length; index++) {
        let pattern:PositionType = [current_map[index][0] - next_map[index][0], current_map[index][1] - next_map[index][1]];
        if (field.checks_empty(x + pattern[0], y + pattern[1], next_positions))
          return pattern;
      }

      return null;
    }

    export function decide_left_rotation_pattern(x:number, y:number, field:Field, current_mino:Mino): [number, number] {
      let type = current_mino.type;
      let current_rotate = current_mino.rotate;
      let next_rotate = get_next_left_rotate(current_rotate);

      let current_map = rotate_testmap[type][current_rotate],
          next_map = rotate_testmap[type][next_rotate];

      let next_positions = rotate_positions_to_left(current_mino.positions);

      for (let index = 0; index < current_map.length; index++) {
        let pattern:PositionType = [current_map[index][0] - next_map[index][0], current_map[index][1] - next_map[index][1]];
        if (field.checks_empty(x + pattern[0], y + pattern[1], next_positions))
          return pattern;
      }

      return null;
    }
  }

  type Block = _mino.Block;
  type Type = _mino.Type;
  type Mino = _mino.Mino;
  type PositionType = _mino.PositionType;

  let Type = _mino.Type;
  let block = _mino.block;

  export function create_initial_field(height:number, width:number): Field {
    var blocks: Block[][] = Array.apply(null, Array(height)).map(() => {
      return Array(width);
    });
    for (var index in blocks) {
      blocks[index] = Array.apply(null, blocks[index]).map(() => {
        return block(Type.Empty);
      });
    }
    return new Field(blocks);
  }

  export function create_gray_field(height:number, width:number, flag_array: number[][]): Field {
    let field = create_initial_field(height, width);
    for (let index = 0; index < flag_array.length; index++) {
      let y = flag_array.length - index - 1;
      for (let x = 0; x < flag_array[index].length; x++) {
        if (flag_array[index][x])
          field.set_block(x, y, Type.Gray);
      }
    }
    return field;
  }

  export class Field {
    constructor(private _field:Block[][]) {
    }

    public get_block(x:number, y:number): Block {
      return this._field[y][x];
    }

    public get height(): number {
      return this._field.length;
    }

    public get width(): number  {
      return this._field[0].length;
    }

    public set_mino(x:number, y:number, mino:Mino): void {
      let position:PositionType[] = mino.positions;
      for (let p of position)
        this._field[y + p[1]][x + p[0]] = mino.block;
    }

    public set_block(x:number, y:number, type:Type): void {
      this._field[y][x] = block(type);
    }

    public checks_empty(x:number, y:number, positions:PositionType[]): boolean {
      return positions.every((position) => {
        let px = x + position[0],
            py = y + position[1];

        if (0 <= px && px < this.width && 0 <= py && py < this.height)
          return this._field[py][px].type === Type.Empty;
        return false;
      });
    }

    public harddrop(current_x:number, current_y:number, mino:Mino): number {
      let min_y = Math.max(-mino.min_y, 0);
      for (let y = Math.min(this.height - mino.max_y, this.height, current_y) - 1; min_y <= y; y--)
        if (!this.checks_empty(current_x, y, mino.positions))
          return y + 1;
      return min_y;
    }

    public clear(): number {
      let next = 0;
      let delete_count = 0;

      for (let y = 0; y < this.height; y++) {
        if (this._field[y].every((element) => { return element.type != Type.Empty })) {
          delete_count += 1;
        } else {
          this._field[next] = this._field[y];
          next += 1;
        }
      }

      for (let y = next; y < this.height; y++) {
        this._field[y] = Array.apply(null, this._field[y]).map(() => {
          return block(Type.Empty);
        });
      }

      return delete_count;
    }

    public freeze(): Field {
      let new_field = this._field.map((line) => [].concat(line));
      return new Field(new_field);
    }

    public rotate_right(x:number, y:number, current_mino:Mino): [number, number] {
      return super_rotation_system.decide_right_rotation_pattern(x, y, this, current_mino);
    }

    public rotate_left(x:number, y:number, current_mino:Mino): [number, number] {
      return super_rotation_system.decide_left_rotation_pattern(x, y, this, current_mino);
    }

    public get is_perfect(): boolean {
      return this._field.every((line) => {
        return line.every((e) => e.type === Type.Empty);
      });
    }

    public is_empty_line(y:number): boolean {
      return this._field[y].every((e) => e.type === Type.Empty);
    }

    public hash(max:number): string {
      return this._field.slice(0, max).reduce((prev_line_string, current_line_array) => {
        let current = current_line_array.reduce((prev_string, current_block) => prev_string + (current_block.type !== Type.Empty ? 1 : 0), "");
        return prev_line_string +('0' + parseInt(current, 2).toString(36)).substr(-2);
      }, "");
    }
  }
}
