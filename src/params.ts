import {mino as _mino} from 'mino';

export namespace params {
  type Rotate = _mino.Rotate;

  let Rotate = _mino.Rotate;

  type ParamType = { [key:string]: string };

  export const DEFAULT_ORDER_VALUE = 'Default';

  function parse_text(text:string):ParamType {
    if (text === '')
      return {};

    return text.split('&').reduce((obj:ParamType, current:string) => {
      let kv = current.split('=');
      obj[kv[0]] = kv[1];
      return obj;
    }, {});
  }

  namespace version001 {
    type ParamDefineType = (value:string) => string;

    // 入力からパラメータへの変換のための関数を定義
    // 失敗時は例外を送出する
    let pass:ParamDefineType = (value:string) => value;
    let get_index = (index:number):ParamDefineType => {
      return (value:string) => value[index];
    };
    let get_number_in_range= (min:number, max:number):ParamDefineType => {
      return (value:string) => {
        let v = parseFloat(value);
        if (v < min)
          return min.toString();
        else if (max < v)
          return max.toString();
        return value;
      };
    };

    // パラメータの定義
    let parameter_defines:{ [name:string]: [string, ParamDefineType, string] } = {
      "PivotSH": ["ps", get_index(0), "N"],
      "PivotSV": ["ps", get_index(1), "L"],
      "PivotZH": ["pz", get_index(0), "N"],
      "PivotZV": ["pz", get_index(1), "R"],
      "PivotIH": ["pi", get_index(0), "N"],
      "PivotIV": ["pi", get_index(1), "L"],
      "PivotO": ["po", get_index(0), "N"],
      "FieldType": ["fld", pass, "Empty"],
      "GarbageCount": ["gc", get_number_in_range(1, 19), "15"],
      "GarbageStep": ["gs", get_number_in_range(1, 19), "1"],
      "OrderType": ["ord", pass, DEFAULT_ORDER_VALUE],
      "CandidateVisibleFlag": ["fcv", get_index(0), "1"],
      "CandidateLimitPerfectFlag": ["fclp", get_index(0), "0"],
      "BagMarkFlag": ["fmb", get_index(0), "0"],
      "PerfectMarkFlag": ["fmp", get_index(0), "0"],
      "KeyboardEnableFlag": ["fke", get_index(0), "1"],
      "KeybindMoveRight": ["kmr", pass, "ArrowRight"],
      "KeybindMoveLeft": ["kml", pass, "ArrowLeft"],
      "KeybindMoveDown": ["kmd", pass, "ArrowDown"],
      "KeybindRotateLeft": ["krl", pass, "z"],
      "KeybindRotateRight": ["krr", pass, "x"],
      // "KeybindHold": ["khl", pass, "c"],
      "KeybindHold": ["khl", pass, "Shift"],
      "KeybindHarddrop": ["khd", pass, " "],  // Space
      "KeybindRestart": ["krs", pass, "r"],
      "KeybindUndo": ["kud", pass, "q"],
      "NextCount": ["nc", get_number_in_range(0, 5), "5"],
      "MaxDAS": ["md", get_number_in_range(0, 10000), "80"],
      "DASDelay": ["dd", get_number_in_range(0, 10000), "40"],
    };

    export function parse(input:{ [key:string]: string }):ParamType {
      // dictをもとにパラメータを作成
      let parameters:ParamType = {};
      for (let parameter_name in parameter_defines) {
        let define = parameter_defines[parameter_name];
        let key_name = define[0];
        let parser = define[1];
        let value:string = null;

        try {
          value = parser(input[key_name]) || define[2]; // 結果がundefinedなどのときはデフォルト値
        } catch (e) {
          value = define[2]; // デフォルト値
        }

        parameters[parameter_name] = value;
      }
      return parameters;
    }

    type KeyDefineFuncType = (key_name:string, param:ParamType) => string;

    type KeyDefineType = {
      key: string,
      func: KeyDefineFuncType,
      default: KeyDefineFuncType,
    };

    // パラメータから入力への変換のための関数を定義
    let get_key = (key_name:string, params:{ [key:string]: string }) => params[key_name];
    let get_default = (key_name:string, params:{ [key:string]: string }) => parameter_defines[key_name][2];

    // 入力の定義
    let key_defines:{ [name:string]: KeyDefineType[] } = {
      "ps": [
        { key: "PivotSH", func: get_key , default: get_default },
        { key: "PivotSV", func: get_key, default: get_default },
      ],
      "pz": [
        { key: "PivotZH", func: get_key , default: get_default },
        { key: "PivotZV", func: get_key, default: get_default },
      ],
      "pi": [
        { key: "PivotIH", func: get_key , default: get_default },
        { key: "PivotIV", func: get_key, default: get_default },
      ],
      "po": [
        { key: "PivotO", func: get_key , default: get_default },
      ],
      "fld": [
        { key: "FieldType", func: get_key , default: get_default },
      ],
      "gc": [
        { key: "GarbageCount", func: get_key , default: get_default },
      ],
      "gs": [
        { key: "GarbageStep", func: get_key , default: get_default },
      ],
      "ord": [
        { key: "OrderType", func: get_key , default: get_default },
      ],
      "fcv": [
        { key: "CandidateVisibleFlag", func: get_key , default: get_default },
      ],
      "fclp": [
        { key: "CandidateLimitPerfectFlag", func: get_key , default: get_default },
      ],
      "fmb": [
        { key: "BagMarkFlag", func: get_key , default: get_default },
      ],
      "fmp": [
        { key: "PerfectMarkFlag", func: get_key , default: get_default },
      ],
      "fke": [
        { key: "KeyboardEnableFlag", func: get_key , default: get_default },
      ],
      "kmr": [
        { key: "KeybindMoveRight", func: get_key , default: get_default },
      ],
      "kml": [
        { key: "KeybindMoveLeft", func: get_key , default: get_default },
      ],
      "kmd": [
        { key: "KeybindMoveDown", func: get_key , default: get_default },
      ],
      "krl": [
        { key: "KeybindRotateLeft", func: get_key , default: get_default },
      ],
      "krr": [
        { key: "KeybindRotateRight", func: get_key , default: get_default },
      ],
      "khl": [
        { key: "KeybindHold", func: get_key , default: get_default },
      ],
      "khd": [
        { key: "KeybindHarddrop", func: get_key , default: get_default },
      ],
      "krs": [
        { key: "KeybindRestart", func: get_key , default: get_default },
      ],
      "kud": [
        { key: "KeybindUndo", func: get_key , default: get_default },
      ],
      "nc": [
        { key: "NextCount", func: get_key , default: get_default },
      ],
      "md": [
        { key: "MaxDAS", func: get_key , default: get_default },
      ],
      "dd": [
        { key: "DASDelay", func: get_key , default: get_default },
      ],
    };

    export function store(params:ParamType):string {
      let results:string[] = ['version=001'];
      for (let key_name in key_defines) {
        let value = key_defines[key_name].map((define) => define.func(define.key, params)).join('');
        let default_value = key_defines[key_name].map((define) => define.default(define.key, params)).join('');
        if (value !== default_value)
          results.push(key_name + '=' + value);
      }
      return results.join('&');
    }
  }

  export enum FieldType {
    Empty,
    PerfectTRight,
    PerfectTLeft,
    Garbage,
  }

  namespace map {
    let to_rotate_map:{ [value:string]: Rotate } = {
      'N': Rotate.Normal,
      'R': Rotate.Right,
      '2': Rotate.Reverse,
      'L': Rotate.Left,
    };

    let from_rotate_map:{ [rotate:number]: string } = {};
    for (let name in to_rotate_map)
      from_rotate_map[to_rotate_map[name]] = name;

    export function parse_to_rotate(value:string): Rotate {
      let rotate = to_rotate_map[value];
      if (rotate !== undefined)
        return rotate;
      console.error('Error: Cannot parse string to roate: Illegal string value');
      return Rotate.Normal;
    }

    export function parse_rotate_to_string(rotate:Rotate): string {
      let value = from_rotate_map[rotate];
      if (value !== undefined)
        return value;
      console.error('Error: Cannot parse rotate to string: Illegal rotate value');
      return from_rotate_map[Rotate.Normal];
    }

    let to_field_type_map:{ [value:string]: FieldType } = {
      'Empty': FieldType.Empty,
      'PerfectTRight': FieldType.PerfectTRight,
      'PerfectTLeft': FieldType.PerfectTLeft,
      'Garbage': FieldType.Garbage,
    };

    let from_field_type_map:{ [type:number]: string } = {};
    for (let name in to_field_type_map)
      from_field_type_map[to_field_type_map[name]] = name;

    export function parse_to_field_type(value:string): FieldType {
      let field_type = to_field_type_map[value];
      if (field_type !== undefined)
        return field_type;
      console.error('Error: Cannot parse string to field type: Illegal string value');
      return FieldType.Empty;
    }

    export function parse_field_type_to_string(type:FieldType): string {
      let value = from_field_type_map[type];
      if (value !== undefined)
        return value;
      console.error('Error: Cannot parse field type to string: Illegal field type value');
      return from_field_type_map[FieldType.Empty];
    }
  }

  export class Params {
    private _params:ParamType = {};

    constructor(text:string='') {
      text = text || '';
      let input = parse_text(text);
      this._params = version001.parse(input);
    }

    public get text(): string {
      return version001.store(this._params);;
    }

    public get pivot_s_h(): Rotate {
      return Params.parse_to_rotate(this._params['PivotSH']);
    }

    public get pivot_s_v(): Rotate {
      return Params.parse_to_rotate(this._params['PivotSV']);
    }

    public get pivot_z_h(): Rotate {
      return Params.parse_to_rotate(this._params['PivotZH']);
    }

    public get pivot_z_v(): Rotate {
      return Params.parse_to_rotate(this._params['PivotZV']);
    }

    public get pivot_i_h(): Rotate {
      return Params.parse_to_rotate(this._params['PivotIH']);
    }

    public get pivot_i_v(): Rotate {
      return Params.parse_to_rotate(this._params['PivotIV']);
    }

    public get pivot_o(): Rotate {
      return Params.parse_to_rotate(this._params['PivotO']);
    }

    public get field_type(): FieldType {
      return Params.parse_to_field_type(this._params['FieldType']);
    }

    public get garbage_count(): number {
      return Params.parse_to_integer(this._params['GarbageCount']);
    }

    public get garbage_step(): number {
      return Params.parse_to_integer(this._params['GarbageStep']);
    }

    public get order_type(): string {
      return this._params['OrderType'];
    }

    public get is_default_order(): boolean {
      return this._params['OrderType'] === DEFAULT_ORDER_VALUE;
    }

    public get candidate_visible(): boolean {
      return Params.parse_to_boolean(this._params['CandidateVisibleFlag']);
    }

    public get candidate_limit_perfect(): boolean {
      return Params.parse_to_boolean(this._params['CandidateLimitPerfectFlag']);
    }

    public get bag_mark(): boolean {
      return Params.parse_to_boolean(this._params['BagMarkFlag']);
    }

    public get perfect_mark(): boolean {
      return Params.parse_to_boolean(this._params['PerfectMarkFlag']);
    }

    public get keyboard_enable(): boolean {
      return Params.parse_to_boolean(this._params['KeyboardEnableFlag']);
    }

    public get keybind_move_left(): string {
      return this._params['KeybindMoveLeft'];
    }

    public get keybind_move_right(): string {
      return this._params['KeybindMoveRight'];
    }

    public get keybind_move_down(): string {
      return this._params['KeybindMoveDown'];
    }

    public get keybind_rotate_right(): string {
      return this._params['KeybindRotateRight'];
    }

    public get keybind_rotate_left(): string {
      return this._params['KeybindRotateLeft'];
    }

    public get keybind_hold(): string {
      return this._params['KeybindHold'];
    }

    public get keybind_harddrop(): string {
      return this._params['KeybindHarddrop'];
    }

    public get keybind_restart(): string {
      return this._params['KeybindRestart'];
    }

    public get keybind_undo(): string {
      return this._params['KeybindUndo'];
    }

    public get next_count(): number {
      return Params.parse_to_integer(this._params['NextCount']);
    }

    public get max_das(): number {
      return Params.parse_to_integer(this._params['MaxDAS']);
    }

    public get das_delay(): number {
      return Params.parse_to_integer(this._params['DASDelay']);
    }

    public set pivot_s_h(rotate:Rotate) {
      this._params['PivotSH'] = Params.parse_rotate_to_string(rotate);
    }

    public set pivot_s_v(rotate:Rotate) {
      this._params['PivotSV'] = Params.parse_rotate_to_string(rotate);
    }

    public set pivot_z_h(rotate:Rotate) {
      this._params['PivotZH'] = Params.parse_rotate_to_string(rotate);
    }

    public set pivot_z_v(rotate:Rotate) {
      this._params['PivotZV'] = Params.parse_rotate_to_string(rotate);
    }

    public set pivot_i_h(rotate:Rotate) {
      this._params['PivotIH'] = Params.parse_rotate_to_string(rotate);
    }

    public set pivot_i_v(rotate:Rotate) {
      this._params['PivotIV'] = Params.parse_rotate_to_string(rotate);
    }

    public set pivot_o(rotate:Rotate) {
      this._params['PivotO'] = Params.parse_rotate_to_string(rotate);
    }

    public set field_type(type:FieldType) {
      this._params['FieldType'] = Params.parse_field_type_to_string(type);
    }

    public set garbage_count(value:number) {
      this._params['GarbageCount'] = Params.parse_number_to_string(value);
    }

    public set garbage_step(value:number) {
      this._params['GarbageStep'] = Params.parse_number_to_string(value);
    }

    public set order_type(value:string) {
      this._params['OrderType'] = value;
    }

    public set candidate_visible(flag:boolean) {
      this._params['CandidateVisibleFlag'] = Params.parse_boolean_to_string(flag);
    }

    public set candidate_limit_perfect(flag:boolean) {
      this._params['CandidateLimitPerfectFlag'] = Params.parse_boolean_to_string(flag);
    }

    public set bag_mark(flag:boolean) {
      this._params['BagMarkFlag'] = Params.parse_boolean_to_string(flag);
    }

    public set perfect_mark(flag:boolean) {
      this._params['PerfectMarkFlag'] = Params.parse_boolean_to_string(flag);
    }

    public set keyboard_enable(flag:boolean) {
      this._params['KeyboardEnableFlag'] = Params.parse_boolean_to_string(flag);
    }

    public set keybind_move_left(value:string) {
      this._params['KeybindMoveLeft'] = value;
    }

    public set keybind_move_right(value:string) {
      this._params['KeybindMoveRight'] = value;
    }

    public set keybind_move_down(value:string) {
      this._params['KeybindMoveDown'] = value;
    }

    public set keybind_rotate_right(value:string) {
      this._params['KeybindRotateRight'] = value;
    }

    public set keybind_rotate_left(value:string) {
      this._params['KeybindRotateLeft'] = value;
    }

    public set keybind_hold(value:string) {
      this._params['KeybindHold'] = value;
    }

    public set keybind_harddrop(value:string) {
      this._params['KeybindHarddrop'] = value;
    }

    public set keybind_restart(value:string) {
      this._params['KeybindRestart'] = value;
    }

    public set keybind_undo(value:string) {
      this._params['KeybindUndo'] = value;
    }

    public set next_count(count:number) {
      this._params['NextCount'] = Params.parse_number_to_string(count);
    }

    public set max_das(value:number) {
      this._params['MaxDAS'] = Params.parse_number_to_string(value);
    }

    public set das_delay(value:number) {
      this._params['DASDelay'] = Params.parse_number_to_string(value);
    }

    static parse_to_rotate(value:string): Rotate {
      return map.parse_to_rotate(value);
    }

    static parse_rotate_to_string(rotate:Rotate): string {
      return map.parse_rotate_to_string(rotate);
    }

    static parse_to_boolean(value:string): boolean {
      if (value === '0')
        return false;
      else if (value === '1')
        return true;
      console.error('Error: Cannot parse string to boolean: Illegal string value');
      return true;
    }

    static parse_boolean_to_string(flag:boolean): string {
      if (flag === false)
        return "0";
      else if (flag === true)
        return "1";
      console.error('Error: Cannot parse boolean to string: Illegal boolean value');
      return "1";
    }

    static parse_to_field_type(value:string): FieldType {
      return map.parse_to_field_type(value);
    }

    static parse_field_type_to_string(type:FieldType): string {
      return map.parse_field_type_to_string(type);
    }

    static parse_to_integer(value:string): number {
      return parseInt(value);
    }

    static parse_number_to_string(value:number): string {
      return value.toString();
    }
  }
}
