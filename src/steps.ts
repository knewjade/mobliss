import {mino as _mino} from 'mino';

export namespace steps {
  type Type = _mino.Type;

  let Type = _mino.Type;

  let name_by_type = _mino.name_by_type;
  let block_by_name = _mino.block_by_name;

  const all_types = [Type.T, Type.L, Type.J, Type.S, Type.Z, Type.I, Type.O];

  function create_random_bag(): Type[] {
    var shuffle = function (arr: any[]) {
      var i, j, temp;
      arr = arr.slice();
      i = arr.length;
      if (i === 0) {
        return arr;
      }
      while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
      return arr;
    };
    return shuffle(all_types);
  }

  export function create_random_steps(min_count:number): Steps {
    let bags:Type[] = [];
    for (let count = 0; count < 2; count++) {
      let bag = create_random_bag();
      bags = bags.concat(bag);
    }
    return new Steps(bags, min_count);
  }

  export class Steps {
    private _current: Type = null;
    private _hold: Type = null;
    private _is_held: boolean = false;
    private _is_first_held: boolean = false;
    private _types:Type[] = [];
    private _order_history:string = "";
    private _operation:string = "";
    private _pop_count:number = 0;

    constructor(types:Type[], private min_count:number=1, private _bag_generator:() => Type[]=create_random_bag) {
      this.push_to_next(types);
      this.pop_current();
    }

    public pop_current(): Type {
      this.fill();

      if (this._is_held === false)
        this._operation += 'v';
      else if (this._is_first_held === false)
        this._operation += 'H';
      else
        this._operation += 'X';

      let temp:Type = this._current;
      this._current = this._types.shift();
      this._pop_count += 1;
      this._is_held = false;
      this._is_first_held = false;
      return temp;
    }

    private fill(): void {
      while (this._types.length <= this.min_count) {
        let bag = this._bag_generator();
        this.push_to_next(bag);
      }
    }

    private push_to_next(types:Type[]): void {
      for (let type of types)
        this._order_history += name_by_type(type);
      this._types = this._types.concat(types);
    }

    public get next_count(): number {
      return this._types.length;
    }

    public get hold_type(): Type {
      return this._hold;
    }

    public get current_type(): Type {
      return this._current;
    }

    public hold(): void {
      if (this._is_held === true)
        return;

      let temp:Type = this._hold;
      this._hold = this._current;
      this._is_held = true;
      if (temp !== null) {
        this._current = temp;
      } else {
        this._is_first_held = true;
        this.pop_current();
      }
    }

    public order_history(next_pop_count:number=0): string {
      return this._order_history.slice(0, this._pop_count);
    }

    public undo(): void {
      // 現在のミノでの復元
      if (this._is_held === false) {
        // そのまま設置
        this._types.unshift(this._current);
        this._current = block_by_name(this._order_history.charAt(this._pop_count - 2)).type;
        this._pop_count -= 1;
      } else if (this._is_first_held === false) {
        // holdとの交換
        this._types.unshift(this._hold);
        this._hold = this._current;
        this._current = block_by_name(this._order_history.charAt(this._pop_count - 2)).type;
        this._pop_count -= 1;
      } else {
        // 初めてのhold
        this._types.unshift(this._hold);
        this._types.unshift(this._current);
        this._hold = null;
        this._current = block_by_name(this._order_history.charAt(this._pop_count - 3)).type;
        this._pop_count -= 2;
      }

      // ひとつ前のミノの操作を取得
      let last_operation = this._operation.charAt(this._operation.length - 1);
      this._operation = this._operation.slice(0, this._operation.length - 1);

      // ひとつ前のミノでの復元
      if (last_operation === 'v') {
        // そのまま設置
      } else if (last_operation === 'H') {
        // holdとの交換
        let temp:Type = this._hold;
        this._hold = this._current;
        this._current = temp;
      } else if (last_operation === 'X') {
        // 初めてのhold
        this._types.unshift(this._hold);
        this._hold = null;
        this._current = block_by_name(this._order_history.charAt(this._pop_count - 2)).type;
        this._pop_count -= 1;
      }

      // holdを解除
      this._is_held = false;
      this._is_first_held = false;
    }
  }
}
