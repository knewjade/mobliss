export namespace mino {
  export enum Type {
    Empty = 0,
    I = 1,
    L = 2,
    O = 3,
    Z = 4,
    T = 5,
    J = 6,
    S = 7,
    Gray = 8,
  }

  export enum Rotate {
    Normal = 0,
    Right = 1,
    Reverse = 2,
    Left = 3,
  }

  export type PositionType = [number, number];

  // inner namespaces
  namespace blocks {
    let block_map: { [type: number]:Block } = {};
    block_map[Type.T] = { name: "T", color: "#8e3194", type: Type.T };
    block_map[Type.L] = { name: "L", color: "#f76e23", type: Type.L };
    block_map[Type.J] = { name: "J", color: "#0f59b2", type: Type.J };
    block_map[Type.S] = { name: "S", color: "#67c133", type: Type.S };
    block_map[Type.Z] = { name: "Z", color: "#d5212c", type: Type.Z };
    block_map[Type.I] = { name: "I", color: "#1ca2d3", type: Type.I };
    block_map[Type.O] = { name: "O", color: "#f4c22f", type: Type.O };
    block_map[Type.Gray] = { name: "G", color: "#cccccc", type: Type.Gray };
    block_map[Type.Empty] = { name: "E", color: null, type: Type.Empty };

    export function create_block(type:Type): Block {
      if (!(type in block_map))
        throw new RangeError('Not found type in block map');

      return block_map[type];
    }

    export function create_block_by_name(type_name:String): Block {
      for (let type in block_map) {
        let block = block_map[type];
        if (block.name === type_name)
          return block;
      }
      throw new RangeError('Not found type in block map');
    }

    export function get_name_by_type(type:Type): string {
      return create_block(type).name;
    }
  }

  namespace mino_rotation {
    let right_rotation_map: (current:[number, number])=>[number, number] = (current:[number, number]) => [current[1], current[0] ? -current[0] : 0];
    let left_rotation_map: (current:[number, number])=>[number, number] = (current:[number, number]) => [current[1] ? -current[1] : 0, current[0]];

    export function get_next_right_rotate(current:Rotate): Rotate {
      return (current + 1) % 4;
    }

    export function get_next_left_rotate(current:Rotate): Rotate {
      return (current + 3) % 4;
    }

    export function rotate_positions_to_right(positions:[number, number][]): [number, number][] {
      return positions.map(right_rotation_map);
    }

    export function rotate_positions_to_left(positions:[number, number][]): [number, number][] {
      return positions.map(left_rotation_map);
    }
  }

  namespace minos {
    let mino_map: { [type: number] : PositionType[] } = {};
    mino_map[Type.T] = [[0, 0], [1, 0], [-1, 0], [0, 1]];
    mino_map[Type.I] = [[-1, 0], [0, 0], [1, 0], [2, 0]];
    mino_map[Type.S] = [[0, 0], [-1, 0], [0, 1], [1, 1]];
    mino_map[Type.Z] = [[0, 0], [1, 0], [0, 1], [-1, 1]];
    mino_map[Type.L] = [[0, 0], [-1, 0], [1, 0], [1, 1]];
    mino_map[Type.J] = [[0, 0], [1, 0], [-1, 0], [-1, 1]];
    mino_map[Type.O] = [[0, 0], [1, 0], [0, 1], [1, 1]];

    export function create_mino(type:Type, rotate?:Rotate): Mino {
      if (!(type in mino_map))
        throw new RangeError('Not found type in mino map');

      if (rotate === undefined)
        rotate = Rotate.Normal;

      let position:PositionType[] = [];
      for (let pos of mino_map[type])
        position.push([pos[0], pos[1]]);

      let mino = new Mino(block(type), position);

      if (rotate === Rotate.Right) {
        mino.rotate_right();
      } else if (rotate === Rotate.Left) {
        mino.rotate_left();
      } else if (rotate === Rotate.Reverse) {
        mino.rotate_right();
        mino.rotate_right();
      }

      return mino;
    }

    export function create_mino_by_name(type_name:String): Mino {
      return create_mino(block_by_name(type_name).type);
    }

    export class Mino {
      private _min_max_x:[number, number];
      private _min_max_y:[number, number];
      private _rotate:Rotate = Rotate.Normal;

      constructor(private _block:Block, private _positions:PositionType[]) {
        this._min_max_x = this.get_min_max_x();
        this._min_max_y = this.get_min_max_y();
      }

      private get_min_max_x(): [number, number] {
        let xs:number[] = this._positions.map((e) => { return e[0]; });
        return [Math.min.apply(null, xs), Math.max.apply(null, xs)];
      }

      private get_min_max_y(): [number, number] {
        let ys:number[] = this._positions.map((e) => { return e[1]; });
        return [Math.min.apply(null, ys), Math.max.apply(null, ys)];
      }

      public rotate_right(): void {
        this._positions = rotate_positions_to_right(this._positions);
        this._rotate = this.next_right_rotate;
        this._min_max_x = this.get_min_max_x();
        this._min_max_y = this.get_min_max_y();
      }

      private get next_right_rotate(): Rotate {
        return mino_rotation.get_next_right_rotate(this._rotate);
      }

      public rotate_left(): void {
        this._positions = rotate_positions_to_left(this._positions);
        this._rotate = this.next_left_rotate;
        this._min_max_x = this.get_min_max_x();
        this._min_max_y = this.get_min_max_y();
      }

      private get next_left_rotate(): Rotate {
        return mino_rotation.get_next_left_rotate(this._rotate);
      }

      public get positions(): PositionType[] {
        return this._positions;
      }

      public get rotate(): Rotate {
        return this._rotate;
      }

      public get block(): Block {
        return this._block;
      }

      public get type(): Type {
        return this._block.type;
      }

      public get min_x(): number {
        return this._min_max_x[0];
      }

      public get max_x(): number {
        return this._min_max_x[1];
      }

      public get min_y(): number {
        return this._min_max_y[0];
      }

      public get max_y(): number {
        return this._min_max_y[1];
      }
    }
  }

  // public
  export let name_by_type = blocks.get_name_by_type;

  export let block = blocks.create_block;
  export let block_by_name = blocks.create_block_by_name;

  export let mino = minos.create_mino;
  export let mino_by_name = minos.create_mino_by_name;

  export let rotate_positions_to_right = mino_rotation.rotate_positions_to_right;
  export let rotate_positions_to_left = mino_rotation.rotate_positions_to_left;

  export let get_next_right_rotate = mino_rotation.get_next_right_rotate;
  export let get_next_left_rotate = mino_rotation.get_next_left_rotate;

  export type Mino = minos.Mino;
  export let Mino = minos.Mino;

  export const ALL_TYPES:Type[] = [Type.I, Type.L, Type.O, Type.Z, Type.T, Type.J, Type.S];
  export const ALL_ROTATES:Rotate[] = [Rotate.Normal, Rotate.Right, Rotate.Reverse, Rotate.Left];

  // enums, types
  export interface Block {
    name: string;
    color: string;
    type: Type;
  }
}
