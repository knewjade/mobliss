import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {utillity as _utillity} from 'utillity';

export namespace lock_searcher {
  enum Action {
    Right = 0,
    Left = 1,
  }

  const ALL_ACTIONS = [Action.Right, Action.Left];

  type Type = _mino.Type;
  type Rotate = _mino.Rotate;
  type PositionType = _mino.PositionType;
  type Field = _field.Field;
  type Mino = _mino.Mino;

  let Type = _mino.Type;
  let Rotate = _mino.Rotate;

  let mino = _mino.mino;

  let get_next_right_rotate = _mino.get_next_right_rotate;
  let get_next_left_rotate = _mino.get_next_left_rotate;

  let decide_right_rotation_pattern = _field.decide_right_rotation_pattern;
  let decide_left_rotation_pattern = _field.decide_left_rotation_pattern;

  const ALL_TYPES = _mino.ALL_TYPES;
  const ALL_ROTATES = _mino.ALL_ROTATES;

  export class LockSearcher {
    private _width:number;
    private _height:number;
    private _spaceable:boolean[][][];
    private _lockable:boolean[][][];
    private _rotatable: PositionType[][][][];
    private _passible: boolean[][][];
    private _search_max_height:number;

    private _mino_pool:{ [type: number] : { [rotate: number] : Mino } };
    private _nexts: [number, number, Rotate][];

    constructor(private _field:Field, private _type:Type, search_max_height:number, appear_position:[number, number]=[4, 20]) {
      if (appear_position[0] < 0 || _field.width <= appear_position[0] || appear_position[1] < 0 || _field.height <= appear_position[1])
        throw RangeError('appear position is out in field');

      this._width = _field.width;
      this._height = _field.height;
      this._search_max_height = Math.min(search_max_height, this._height);
      this._nexts =  [[appear_position[0], appear_position[1], Rotate.Normal]];

      this._spaceable = _utillity.multidim_array([ALL_ROTATES.length, this._height, this._width], undefined);
      this._lockable  = _utillity.multidim_array([ALL_ROTATES.length, this._height, this._width], undefined);
      this._rotatable = _utillity.multidim_array([ALL_ROTATES.length, ALL_ACTIONS.length, this._height, this._width], undefined);
      this._passible  = _utillity.multidim_array([ALL_ROTATES.length, this._height, this._width], undefined);

      this._mino_pool = {};
      for (let type of ALL_TYPES) {
        this._mino_pool[type] = {};
        for (let rotate of ALL_ROTATES)
          this._mino_pool[type][rotate] = mino(type, rotate);
      }

      // テトリミノがおける空間を探索
      this.init_space_in_all();
    }

    private init_space_in_all(): void {
      for (let rotate of [Rotate.Normal, Rotate.Right, Rotate.Reverse, Rotate.Left]) {
        let mino = this._mino_pool[this._type][rotate];
        let positions = mino.positions;
        let min_xy:[number, number] = [mino.min_x, mino.min_y];
        let max_xy:[number, number] = [mino.max_x, mino.max_y];

        for (let y = this._height - 1; 0 <= y; y--) {
          for (let x = 0; x < this._width; x++) {
            this.search_space_in_point(x, y, rotate, positions, min_xy, max_xy);
          }
        }
      }
    }

    private search_space_in_point(x:number, y:number, rotate:Rotate, positions:PositionType[], min_xy:[number, number], max_xy:[number, number]): void {
      // すでに探索済み
      if (this._spaceable[rotate][y][x] !== undefined) {
        return;
      }

      // テトリミノがフィールド外にはみだしていないか (x方向)
      if (x < -min_xy[0] || this._width - max_xy[0] - 1 < x) {
        this._spaceable[rotate][y][x] = false;
        return;
      }

      // テトリミノがフィールド外にはみだしていないか (y方向)
      if (y < -min_xy[1] || this._height - max_xy[1] - 1 < y) {
        this._spaceable[rotate][y][x] = false;
        return;
      }

      //  各ブロック位置の確認
      let is_putable = true;
      for (let cp of positions) {
        let cx = x + cp[0];
        let cy = y + cp[1];

        // ブロックが存在するとき
        if (this._field.get_block(cx, cy).type !== Type.Empty) {
          is_putable = false;

          // そのブロックの影響をうける置き方についても同時に記録しておく
          for (let position of positions) {
            let invalid_x = cx - position[0];
            let invalid_y = cy - position[1];
            if (0 <= invalid_x && invalid_x < this._width && 0 <= invalid_y && invalid_y < this._height) {
              this._spaceable[rotate][invalid_y][invalid_x] = false;
            }
          }

          // 探索の打ち切り
          break;
        }
      }

      // その座標の結果を記録
      this._spaceable[rotate][y][x] = is_putable;
    }

    // 次におくことができる場所を列挙する
    public search(rotate:Rotate): [number, number][] {
      // spacableがすべて探索済みであること

      // 接着できる位置を探索
      let candidates = this.search_lockable(rotate);

      // 探索しつつ、その結果をもとに候補をフィルタリング
      return candidates.filter((candidate) => {
        return this.search_in_point(candidate[0], candidate[1], rotate);
      });
    }

    private search_lockable(rotate:Rotate): [number, number][] {
      // spacableがすべて探索済みであること

      let mino = this._mino_pool[this._type][rotate];
      let positions = mino.positions;

      let lockable = this._lockable[rotate];

      // 接着確認に必要なチェック位置
      let grounds:PositionType[] = positions.map((pos): PositionType => {
        return [pos[0], pos[1] - 1];
      }).filter((gpos: PositionType) => {
        return !positions.some((pos): boolean => {
            return pos[0] == gpos[0] && pos[1] == gpos[1];
        })
      });

      // 候補を記録するための配列
      let candidates: [number, number][] = [];

      // テトリミノを接着できるか
      for (let y = this._search_max_height - 1; 0 <= y; y--) {
        for (let x = 0; x < this._width; x++) {
          // すでに探索済み
          if (lockable[y][x] !== undefined) {
            if (lockable[y][x] === true)
              candidates.push([x, y]);
            continue;
          }

          // テトリミノをおけるスペースがない
          if (this._spaceable[rotate][y][x] === false) {
            lockable[y][x] = false;
            continue;
          }

          // 結果を初期化する
          lockable[y][x] = false;

          //  各ブロック位置の確認
          for (let gp of grounds) {
            let gx = x + gp[0];
            let gy = y + gp[1];

            // フィールド外かブロックが存在するとき
            if (gy < 0 || this._field.get_block(gx, gy).type !== Type.Empty) {
              lockable[y][x] = true;
              candidates.push([x, y]);

              // そのブロックの影響をうける置き方についても同時に記録しておく
              for (let ground of grounds) {
                let valid_x = gx - ground[0];
                let valid_y = gy - ground[1];
                if (0 <= valid_x && valid_x < this._width  && 0 <= valid_y && valid_y < this._height && this._spaceable[rotate][valid_y][valid_x] === true) {
                  if (lockable[valid_y][valid_x] === undefined) {
                    lockable[valid_y][valid_x] = true;
                  }
                }
              }

              // 探索の打ち切り
              break;
            }
          }
        }
      }

      return candidates.filter((e) => e[1] < this._search_max_height);
    }

    private search_in_point(goal_x:number, goal_y:number, goal_rotate:Rotate): boolean {
      // spacable & locableがすべて探索済みであること

      // 目標地点から探索を始める
      let nexts = this._nexts;

      // すでにゴール済みなら探索終了
      if (this._passible[goal_rotate][goal_y][goal_x] === true)
        return true;

      // 回転時の処理を定義
      let check_and_push_when_rotate = (x:number, y:number, current_rotate:Rotate, action:Action) => {
        let get_next_rotate = action === Action.Left ? get_next_left_rotate : get_next_right_rotate;

        this.search_rotatable(x, y, current_rotate, action);
        let position = this._rotatable[current_rotate][action][y][x];
        if (position !== null) {
          let next_rotate = get_next_rotate(current_rotate);
          nexts.push([x + position[0], y + position[1], next_rotate]);
        }
      };

      while (0 < nexts.length) {
        // 次の探索位置
        let next = nexts.shift();
        let x = next[0],
            y = next[1],
            current_rotate = next[2];

        // すでに到達済みか確認する
        if (this._passible[current_rotate][y][x] === true) {
          continue;
        }

        // 到達したことを記録
        this._passible[current_rotate][y][x] = true;

        // 下に移動できる
        if (0 <= y - 1 && this._spaceable[current_rotate][y - 1][x] === true) {
          nexts.unshift([x, y - 1, current_rotate]);
        }

        // 左に移動できる
        if (0 <= x - 1 && this._spaceable[current_rotate][y][x - 1] === true) {
          nexts.unshift([x - 1, y, current_rotate]);
        }

        // 右に移動できる
        if (x + 1 < this._width && this._spaceable[current_rotate][y][x + 1] === true) {
          nexts.unshift([x + 1, y, current_rotate]);
        }

        // 左回転できる（その場での回転も含む）
        check_and_push_when_rotate(x, y, current_rotate, Action.Left);

        // 右回転できる（その場での回転も含む）
        check_and_push_when_rotate(x, y, current_rotate, Action.Right);

        // ゴールなら探索終了
        if (x === goal_x && y === goal_y && current_rotate === goal_rotate)
          return true;
      }

      return false;
    }

    private search_rotatable(x:number, y:number, current_rotate:Rotate, action:Action): void {
      let decide_rotation_pattern = action === Action.Left ? decide_left_rotation_pattern : decide_right_rotation_pattern;
      if (this._rotatable[current_rotate][action][y][x] === undefined) {
        let mino = this._mino_pool[this._type][current_rotate];
        let position = decide_rotation_pattern(x, y, this._field, mino);
        this._rotatable[current_rotate][action][y][x] = position;
      }
    }

    public get type(): Type {
      return this._type;
    }
  }
}
