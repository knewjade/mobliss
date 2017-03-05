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
    private _operations:string = "";
    private _pop_count:number = 0;

    constructor(types:Type[], private _min_count:number=1, private _bag_generator:() => Type[]=null) {
      if (this._bag_generator === null)
        this._bag_generator = create_random_bag;
      this.push_to_next(types);
      this.pop_inner();
    }

    public next(): Type {
      if (this._is_held === false)
        this._operations += 'v';
      else if (this._is_first_held === false)
        this._operations += 'H';
      else
        this._operations += 'X';

      let next_type:Type = this.pop_inner();
      this._is_held = false;
      this._is_first_held = false;
      return next_type;
    }

    private pop_inner(): Type {
      this.fill();
      let next_type = this._types.shift();
      this._current = next_type;
      this._pop_count += 1;
      return next_type;
    }

    private fill(): void {
      while (this._types.length <= this._min_count) {
        let bag = this._bag_generator();
        this.push_to_next(bag);
      }
    }

    private push_to_next(types:Type[]): void {
      for (let type of types)
        this._order_history += name_by_type(type);
      this._types = this._types.concat(types);
    }

    public get_next(index:number): Type {
      if (this._min_count <= index)
        return undefined;

      this.fill();
      return this._types[index];
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

    // TODO: write unittest
    public get next_types(): Type[] {
      return this._types;
    }

    // TODO: write unittest
    public get is_held(): boolean {
      return this._is_held;
    }

    public hold(): Type {
      if (this._is_held === true)
        return null;

      let next_type:Type = this._hold;
      this._hold = this._current;
      this._is_held = true;
      if (next_type !== null) {
        this._current = next_type;
      } else {
        this._is_first_held = true;
        next_type = this.pop_inner();
      }

      return next_type;
    }

    public order_history(next_pop_count:number=0): string {
      if (this._min_count < next_pop_count)
        next_pop_count = this._min_count;
      return this._order_history.slice(0, this._pop_count + next_pop_count);
    }

    // TODO: write unittest
    public get commit_history(): Type[] {
      let hold:string = null;
      let pointer:number = 0;
      let types:string = "";
      for (let index = 0; index < this._operations.length; index++) {
        let o = this._operations[index];
        if (o === 'v') {
          types += this._order_history[pointer];
          pointer++;
        } else if (o === 'H') {
          types += hold;
          hold = this._order_history[pointer];
          pointer++;
        } else {
          hold = this._order_history[pointer];
          types += this._order_history[pointer + 1];
          pointer += 2;
        }
      }
      return types.split('').map((e) => block_by_name(e).type);
    }

    //　最後に置いたミノを返す
    public undo(): Type {
      // 現在のミノでの復元
      if (this._is_held === true) {
        if (this._is_first_held === true) {
          // 初めてのhold
          this._types.unshift(this._current);
          this._current = this._hold;
          this._hold = null;
          this._pop_count -= 1;
        } else {
          // holdとの交換
          let temp:Type = this._hold;
          this._hold = this._current;
          this._current = temp;
        }
      }

      // ひとつ前のミノの操作を取得
      let last_operation = this._operations[this._operations.length - 1];
      this._operations = this._operations.slice(0, this._operations.length - 1);

      // holdを解除
      this._is_held = false;
      this._is_first_held = false;

      // ひとつ前の最初の状況に復元
      if (last_operation === 'v') {
        // そのまま設置
        this._types.unshift(this._current);
        this._current = block_by_name(this._order_history[this._pop_count - 2]).type;
        this._pop_count -= 1;

        return this._current;
      } else if (last_operation === 'X') {
        // 初めてのhold
        this._types.unshift(this._current);
        this._current = this._hold;
        this._hold = null;
        this._pop_count -= 2;

        return block_by_name(this._order_history[this._pop_count]).type;
      } else if (last_operation === 'H') {
        // holdとの交換
        let prev_hold_index = this._operations.lastIndexOf('H') + 1;
        if (prev_hold_index === 0)
          prev_hold_index = this._operations.lastIndexOf('X');

        this._types.unshift(this._current);
        this._current = this._hold;
        this._hold = block_by_name(this._order_history[prev_hold_index]).type;
        this._pop_count -= 1;

        return this._hold;
      }
    }

    public freeze(): Steps {
      let copy:Steps = new Steps(this._types, this._min_count, this._bag_generator);
      copy._current = this._current;
      copy._hold = this._hold;
      copy._is_held = this._is_held;
      copy._is_first_held = this._is_first_held;
      copy._types = [].concat(this._types);
      copy._order_history = this._order_history;
      copy._operations = this._operations;
      copy._pop_count = this._pop_count;
      return copy;
    }

    public pack(): string {
      return [this._order_history, this._operations, this._min_count.toString()].join(',');
    }

    // 接着ミノ順と復元後のStepsインスタンスを返却
    static unpack(packed:string, bag_generator:() => Type[]=create_random_bag): Steps {
      let split = packed.split(',');
      let order_history = split[0];
      let operations = split[1];
      let min_count = parseInt(split[2]);

      let types = order_history.split('').map((current) => block_by_name(current).type);

      let copy:Steps = new Steps(types, min_count, bag_generator);

      for (let operation of operations.split('')) {
        if (operation !== 'v')
          copy.hold()
        copy.next();
      }

      return copy;
    }
  }
}
