import {mino as _mino} from 'mino';

export namespace next_set {
  type Type = _mino.Type;

  let Type = _mino.Type;

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

  export function create_random_next_set(min_count:number): NextSet {
    let bags:Type[] = [];
    for (let count = 0; count < 2; count++) {
      let bag = create_random_bag();
      bags = bags.concat(bag);
    }
    return new NextSet(bags, min_count);
  }

  class NextSet {
    private _bag_generator: () => Type[];
    constructor(private _types:Type[]=[], private min_count:number) {
      this._bag_generator = create_random_bag;
    }

    public push(types:Type[]): void {
      this._types = this._types.concat(types);
    }

    public pop(): Type {
      while (this._types.length <= this.min_count) {
        let bag = this._bag_generator();
        this.push(bag);
      }
      return this._types.shift();
    }

    public get count(): number {
      return this._types.length;
    }
  }
}
