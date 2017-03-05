import {mino as _mino} from 'mino';

export namespace lock_candidate {
  type Type = _mino.Type;
  type Rotate = _mino.Rotate;
  type PositionType = _mino.PositionType;

  let Type = _mino.Type;
  let Rotate = _mino.Rotate;

  let default_map = (e:PositionType): PositionType => e;
  let down_map = (e:PositionType): PositionType => [e[0], e[1] - 1];
  let left_map = (e:PositionType): PositionType => [e[0] - 1, e[1]];
  let left_down_map = (e:PositionType): PositionType => [e[0] - 1, e[1] - 1];
  let right_map = (e:PositionType): PositionType => [e[0] + 1, e[1]];

  export class LockCandidate {
    private _testmap: { [type: number] : { [rotate: number] : [Rotate, (position:PositionType) => PositionType][] }} = {};

    constructor() {
      let testmap = this._testmap;

      // 先頭の要素がメイン回転方向
      testmap[Type.S] = {};
      testmap[Type.S][Rotate.Normal] = testmap[Type.S][Rotate.Reverse] = [[Rotate.Normal, default_map], [Rotate.Reverse, down_map]];
      testmap[Type.S][Rotate.Right] = testmap[Type.S][Rotate.Left] = [[Rotate.Left, default_map], [Rotate.Right, right_map]];

      testmap[Type.Z] = {};
      testmap[Type.Z][Rotate.Normal] = testmap[Type.Z][Rotate.Reverse] = [[Rotate.Normal, default_map], [Rotate.Reverse, down_map]];
      testmap[Type.Z][Rotate.Right] = testmap[Type.Z][Rotate.Left] = [[Rotate.Right, default_map], [Rotate.Left, left_map]];

      testmap[Type.I] = {};
      testmap[Type.I][Rotate.Normal] = testmap[Type.I][Rotate.Reverse] = [[Rotate.Normal, default_map], [Rotate.Reverse, left_map]];
      testmap[Type.I][Rotate.Right] = testmap[Type.I][Rotate.Left] = [[Rotate.Left, default_map], [Rotate.Right, down_map]];

      testmap[Type.O] = {};
      testmap[Type.O][Rotate.Normal] = testmap[Type.O][Rotate.Reverse] = testmap[Type.O][Rotate.Right] = testmap[Type.O][Rotate.Left] = [[Rotate.Normal, default_map], [Rotate.Right, down_map], [Rotate.Reverse, left_down_map], [Rotate.Left, left_map]];
    }

    // transposeの対象であるtype, rotateならtrueを返却
    public is_transposed_target(type:Type, rotate:Rotate): boolean {
      if (type in this._testmap)
        return this._testmap[type][rotate][0][0] !== rotate;
      return false;
    }

    // あるrotateに対応する回転をすべて取得
    public get_target_rotations(type:Type, rotate:Rotate): Rotate[] {
      if (type in this._testmap)
        return this._testmap[type][rotate].map(current => current[0]);
      return [rotate];
    }

    // あるrotateに対応するメイン回転方向を返却する
    public get_main_rotation(type:Type, rotate:Rotate): Rotate {
      return this.get_target_rotations(type, rotate)[0];
    }

    // 指定した回転方向時のpositionを、メイン回転方向時の位置へ移動させる
    public transpose(type:Type, rotate:Rotate, positions:PositionType[]): PositionType[] {
      return positions.map(this.get_testmap(type, rotate));
    }

    private get_testmap(type:Type, rotate:Rotate): (position:PositionType) => PositionType {
      if (type in this._testmap)
        for (let map of this._testmap[type][rotate])
        if (map[0] === rotate)
          return map[1];
      return default_map;
    }
  }
}
