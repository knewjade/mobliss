import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {lock_searcher as _lock_searcher} from 'lock_searcher';
import {lock_candidate as _lock_candidate} from 'lock_candidate';

export namespace checkmate {
  type Type = _mino.Type;
  type Rotate = _mino.Rotate;
  type PositionType = _mino.PositionType;
  type Field = _field.Field;
  type Mino = _mino.Mino;
  type LockCandidate = _lock_candidate.LockCandidate;
  type LockSearcher = _lock_searcher.LockSearcher;

  let Type = _mino.Type;
  let Rotate = _mino.Rotate;

  let mino = _mino.mino;
  let LockSearcher = _lock_searcher.LockSearcher;
  let LockCandidate = _lock_candidate.LockCandidate;

  const ALL_TYPES = _mino.ALL_TYPES;
  const ALL_ROTATES = _mino.ALL_ROTATES;

  export class Checkmate {
    private _memo:{ [key: string] : [Rotate, PositionType][] } = {};
    private _mino_pool:{ [type: number] : { [rotate: number] : Mino } };

    constructor(private _lock_candidate:LockCandidate) {
      this._mino_pool = {};
      for (let type of ALL_TYPES) {
        this._mino_pool[type] = {};
        for (let rotate of ALL_ROTATES)
          this._mino_pool[type][rotate] = mino(type, rotate);
      }
    }

    public search_perfect(field:Field, types:Type[], hold:Type): boolean;
    public search_perfect(field:Field, types:Type[], hold:Type, max_count:number): boolean;
    public search_perfect(field:Field, types:Type[], hold:Type, max_count:number, max_clearline:number): boolean;
    public search_perfect(field:Field, types:Type[], hold:Type, max_count:number, max_clearline:number, is_held_already:boolean): boolean;

    // max_count: パーフェクトまでにおけるミノ数
    // max_clearline: パーフェクトまでに消すライン数
    // is_held_already: 初手hold済みならtrue
    public search_perfect(field:Field, types:Type[], hold:Type, max_count?:number, max_clearline?:number, is_held_already?:boolean): boolean {
      if (hold === null)
        hold = types.shift();

      if (max_count === undefined)
        max_count = types.length + 1;
      else if (types.length + 1 < max_count)
        throw new TypeError('max count should be small than num of types + hold.');

      if (max_clearline === undefined)
        max_clearline = 4;

      if (is_held_already === undefined)
        is_held_already = false;

      return this.checks_all_steps([field], types, hold, max_count, max_clearline, is_held_already);
    }

    // hold !== nullであること
    private checks_all_steps(fields:Field[], types:Type[], hold:Type, max_count:number, max_clearline:number, is_held_already:boolean): boolean {
      let nexts:[Type[], Field, number][] = []; // Typeの最後の要素は最後のHOLDミノを表す
      for (let field of fields) {
        nexts.push([[types[0], hold], field, max_clearline]);
        if (!is_held_already)
          nexts.push([[hold, types[0]], field, max_clearline]);
      }

      // 候補がなくなるまで探索
      while (0 < nexts.length) {
        // 次の候補を取得
        let next_type_field_height = nexts.pop();
        let next_types = next_type_field_height[0];
        // if (next_types.length === max_count + 1)
          // console.log(next_types)

        let next_type = next_types[next_types.length - 2];
        let next_field = next_type_field_height[1];
        let max_height = next_type_field_height[2];

        // 次に置ける場所を探索
        let candidates = this.get_next_candidates_with_memo(next_field, next_type, max_height);
        for (let candidate of candidates) {
          let rotate = candidate[0];
          let x = candidate[1][0];
          let y = candidate[1][1];

          // 実際に置いて探索
          let mino = this._mino_pool[next_type][rotate];
          let new_field = next_field.freeze();
          new_field.set_mino(x, y, mino);
          let clear_lines = new_field.clear();
          let new_max_height = max_height - clear_lines.length;

          // パーフェクトなら終了
          if (new_field.is_perfect)
            return true;

          // typesを使い切って、hold分がのこっているとき
          let current_index = next_types.length - 1;
          if (current_index === types.length) {
            let copy = [].concat(next_types);
            copy.push(null);
            nexts.push([copy, new_field, new_max_height]);
            continue;
          }

          // max_count個 または types+1個 以上おいたらその先は探索しない
          if (max_count <= current_index || types.length < current_index)
            continue;

          // 最大の高さ以上のところにブロックがあるか
          if (new_field.is_empty_line(new_max_height)) {
            let new_type = types[current_index];

            // holdからとりだして、次のミノをholdする操作に相当
            let copy1 = [].concat(next_types);
            copy1.push(new_type);
            nexts.push([copy1, new_field, new_max_height]);

            // 次のミノをそのまま置く操作に相当
            let copy2 = [].concat(next_types);
            let temp = copy2[current_index];
            if (temp !== new_type) {
              // 次のミノとholdが同じなら上の操作だけ十分
              copy2[current_index] = new_type;
              copy2.push(temp);
              nexts.push([copy2, new_field, new_max_height]);
            }
          }
        }
      }

      return false;
    }

    // 次に置くことができる位置
    private get_next_candidates_with_memo(field:Field, type:Type, max_height:number): [Rotate, PositionType][] {
      let hash = field.hash(4) + type;
      if (hash in this._memo)
        return this._memo[hash];

      let searcher = new LockSearcher(field, type, max_height);
      let candidates = this.get_next_candidates_of_all_rotates(searcher, max_height);

      this._memo[hash] = candidates;

      return candidates;
    }

    private get_next_candidates_of_all_rotates(searcher:LockSearcher, max_height:number): [Rotate, PositionType][] {
      let candidates:[Rotate, PositionType][] = [];

      for (let rotate of ALL_ROTATES) {
        let current:PositionType[] = this.get_next_candidates(searcher, rotate, max_height);
        candidates = candidates.concat(current.map((e:PositionType):[Rotate, PositionType] => [rotate, e]));
      }

      return candidates;
    }

    public get_next_candidates(searcher:LockSearcher, rotate:Rotate, max_height:number): PositionType[] {
      let candidates:PositionType[] = [];

      let type = searcher.type;
      let mino = this._mino_pool[type][rotate];
      let max_y = max_height - mino.max_y;

      // 別の回転方向で確認できるか
      if (this._lock_candidate.is_transposed_target(type, rotate))
        return candidates;

      // 次に置くことができる位置を列挙
      let get_target_rotations = this._lock_candidate.get_target_rotations(type, rotate);
      for (let target_rotate of get_target_rotations) {
        let positions = searcher.search(target_rotate);
        let new_candidate:PositionType[] = this._lock_candidate.transpose(type, target_rotate, positions);
        let filter_under_maxy:PositionType[] = new_candidate.filter((e) => e[1] < max_y);
        candidates = candidates.concat(filter_under_maxy);
      }

      return candidates;
    }

    // あるrotateに対応するメイン回転方向を返却する
    public get_main_rotation(type:Type, rotate:Rotate): Rotate {
      return this._lock_candidate.get_main_rotation(type, rotate);
    }
  }
}
