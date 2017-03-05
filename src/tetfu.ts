import {mino as _mino} from 'mino';
import {field as _field} from 'field';

declare function escape(s:string): string;

/*
テト譜について
左上（23段目最左）がindex === 0
右下（せり上がりライン最右）がindex === fldblks-1 === 239
*/
export namespace tetfu {
  type Field = _field.Field;
  type Type = _mino.Type;
  type Rotate = _mino.Rotate;
  type PositionType = _mino.PositionType;

  let Type = _mino.Type;
  let Rotate = _mino.Rotate;

  let name_by_type = _mino.name_by_type;

  type ActionFlags = {
    lock: boolean,
    is_comment:boolean,
    comment: string,
    prev_comment: string,
    color: boolean,
    mirror: boolean,
    block_up: boolean,
    index: number,
  };

  export namespace consts {
    export const TETFU_FIELD_TOP:number = 23;
    export const TETFU_FIELD_HEIGHT:number = TETFU_FIELD_TOP + 1;  // フィールド23 + せり上がり1
    export const TETFU_FIELD_WIDTH:number = 10;
    export const TETFU_FIELD_BLOCKS:number = TETFU_FIELD_HEIGHT * TETFU_FIELD_WIDTH;
  }

  namespace tables {
    const ENCODE_TABLE:string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const ASCII_TABLE:string = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'; // ASCII文字テーブル
    export const ENCODE_TABLE_SIZE:number = 64;
    export const ASCII_TABLE_SIZE:number = 96;

    function encode_value_to_char(value:number): string {
      return ENCODE_TABLE[value];
    }

    function decode_value_from_char(char:string): number {
      return ENCODE_TABLE.indexOf(char);
    }

    export function encode(values:number[]): string {
      return values.map(encode_value_to_char).reduce((prev, current, index) => prev + current, "");
    }

    export function decode(encoded:string): number[] {
      return encoded.split('').map(decode_value_from_char);
    }

    export function encode_comment_to_value(char:string): number {
        return Math.max(ASCII_TABLE.indexOf(char), 0) % ASCII_TABLE_SIZE;
      }
  }

  export const ENCODE_MAX_VALUE:number = tables.ENCODE_TABLE_SIZE;

  namespace encoder {
    let mino = _mino.mino;
    let create_initial_field = _field.create_initial_field;

    export function push_values(array:number[], value:number, split_count:number): void {
      let current:number = value;
      for (let count = 0; count < split_count; count++) {
        array.push(current % ENCODE_MAX_VALUE);
        current = Math.floor(current / ENCODE_MAX_VALUE);
      }
    }

    namespace inner {
      const TETFU_FIELD_BLOCKS = consts.TETFU_FIELD_BLOCKS;
      const TETFU_FIELD_HEIGHT = consts.TETFU_FIELD_HEIGHT;
      const TETFU_FIELD_WIDTH = consts.TETFU_FIELD_WIDTH;
      const TETFU_FIELD_TOP = consts.TETFU_FIELD_TOP;

      // フィールドをエンコードする
      // 前のフィールドがないときは空のフィールドを指定する
      // 入力フィールドの高さは23, 幅は10
      export function encode_field(prev:Field, current:Field): [number[], boolean] {
        // 変数の初期化
        let values:number[] = [];
        let prev_diff:number = get_diff(prev, current, 0, 0);
        let is_changed:boolean = false;

        // helper関数
        let record_block_counts = (diff:number, counter:number) => {
          let value:number = diff * TETFU_FIELD_BLOCKS + counter;
          push_values(values, value, 2);
        };

        // フィールド値から連続したブロック数に変換
        let counter:number = -1;
        for (let yindex = 0; yindex < TETFU_FIELD_HEIGHT; yindex++) {
          for (let xindex = 0; xindex < TETFU_FIELD_WIDTH; xindex++) {
            let diff:number = get_diff(prev, current, xindex, yindex);
            if (diff !== prev_diff) {
              record_block_counts(prev_diff, counter);
              counter = 0;
              prev_diff = diff;
              is_changed = true;
            } else {
              counter += 1;
            }
          }
        }

        // 最後の連続ブロックを処理
        record_block_counts(prev_diff, counter);

        return [values, is_changed];
      }

      // 前のフィールドとの差を計算: 0〜16
      function get_diff(prev:Field, current:Field, xindex:number, yindex:number): number {
        let x = xindex,
            y = (TETFU_FIELD_TOP - yindex - 1);

        if (y < 0)
          return 8;
        return <number>current.get_block(x, y).type - <number>prev.get_block(x, y).type + 8;
      }

      // ミノの置く場所をエンコードする
      export function encode_action(type:Type, rotate:Rotate, position:PositionType, action_flags:ActionFlags): [number[], boolean] {
        let is_comment:boolean = action_flags.is_comment && action_flags.comment !== action_flags.prev_comment;

        let value = bool_to_int(!action_flags.lock);
        value *= 2;
        value += bool_to_int(is_comment);
        value *= 2;
        value += (bool_to_int(action_flags.color));
        value *= 2;
        value += bool_to_int(action_flags.mirror);
        value *= 2;
        value += bool_to_int(action_flags.block_up);
        value *= TETFU_FIELD_BLOCKS;
        value += coordinate_to_int(position, type, rotate);
        value *= 4;
        value += rotate_to_int(type, rotate);
        value *= 8;
        value += pentmino_to_int(type);

        let values:number[] = [];
        push_values(values, value, 3);

        return [values, is_comment];
      }

      function bool_to_int(v:boolean): number {
        return v ? 1 : 0;
      }

      function coordinate_to_int(position:PositionType, type:Type, rotate:Rotate): number {
        let x = position[0];
        let y = position[1];

        if (type == Type.O && rotate == Rotate.Normal)
          y += 1;
        else if (type == Type.O && rotate == Rotate.Reverse)
          x -= 1;
        else if (type == Type.O && rotate == Rotate.Left)
          x -= 1, y -= 1;
        else if (type == Type.I && rotate == Rotate.Reverse)
          x -= 1;
        else if (type == Type.I && rotate == Rotate.Left)
          y += 1;
        else if (type == Type.S && rotate == Rotate.Normal)
          y += 1;
        else if (type == Type.S && rotate == Rotate.Right)
          x += 1;
        else if (type == Type.Z && rotate == Rotate.Normal)
          y += 1;
        else if (type == Type.Z && rotate == Rotate.Left)
          x -= 1;

        return (TETFU_FIELD_TOP - y - 1) * TETFU_FIELD_WIDTH + x;
      }

      function rotate_to_int(type:Type, rotate:Rotate): number {
        if (rotate === Rotate.Reverse)
          return 0;
        else if (rotate === Rotate.Right)
          return type !== Type.I ? 1 : 3;
        else if (rotate === Rotate.Normal)
          return 2;
        else if (rotate === Rotate.Left)
          return type !== Type.I ? 3 : 1;
        return null;
      }

      function pentmino_to_int(type:Type): number {
        return type;
      }

      export function encode_comment(escaped_comment:string): number[] {
        let comment = escaped_comment;
        let values:number[] = [];

        push_values(values, comment.length, 2);

        // コメントを符号化
        for (let index = 0; index < comment.length; index += 4) {
          let value:number = 0;
          for (let count = 0; count < 4; count++)
            value += tables.encode_comment_to_value(comment[index + count]) * (tables.ASCII_TABLE_SIZE ** count);
          push_values(values, value, 5);
        }

        return values;
      }
    }

    export function encode_field(prev:Field, current:Field): number[] {
      return inner.encode_field(prev, current)[0];
    }

    export class Encoder {
      private _values:number[] = [];
      private _last_repeat_index:number = -1;

      // コメント・フィールドは初期設定のみ設定可能
      public encode(init_field:Field, steps:[Type, Rotate, PositionType][], init_comment:string=""): string {
        let field:Field = init_field.freeze();
        let prev_field:Field = create_initial_field(consts.TETFU_FIELD_HEIGHT, consts.TETFU_FIELD_WIDTH);
        let prev_comment:string = '';

        for (let index = 0; index < steps.length; index++) {
          // field settings
          // prev_fieldは、ひとつ前のミノを置いてできたフィールド
          // fieldは次に表示させたいフィールド。今回は、最初をのぞいてひとつ前のミノを置いてできたフィールド
          this.encode_field(prev_field, field);

          // action settings
          let action_flags:ActionFlags = {
            lock: true,
            is_comment: true,
            comment: init_comment,
            prev_comment: prev_comment,
            color: true && index === 0,
            mirror: false,
            block_up: false,
            index: index,
          };

          let type = steps[index][0];
          let rotate = steps[index][1];
          let position = steps[index][2];

          this.parse_action(type, rotate, position, action_flags);
          field.set_mino(position[0], position[1], mino(type, rotate));

          // next field
          prev_field = field;
          prev_comment = init_comment;
        }

        return tables.encode(this._values);
      }

      private encode_field(prev_field:Field, current_field:Field): void {
        let encoded_values = inner.encode_field(prev_field, current_field);
        let values = encoded_values[0],
            is_changed = encoded_values[1];

        if (is_changed === true) {
          // フィールドを記録して、リピートを終了する
          this._values = this._values.concat(values);
          this._last_repeat_index = -1;
        } else if (this._last_repeat_index < 0 || ENCODE_MAX_VALUE <= this._values[this._last_repeat_index]) {
          // フィールドを記録して、リピートを開始する
          this._values = this._values.concat(values);
          this._values.push(0);
          this._last_repeat_index = this._values.length - 1;
        } else if (this._values[this._last_repeat_index] < (ENCODE_MAX_VALUE - 1)) {
          // フィールドは記録せず、リピートを進める
          this._values[this._last_repeat_index] += 1;
        }
      }

      private parse_action(type:Type, rotate:Rotate, position:PositionType, action_flags:ActionFlags) {
        let encoded_values = inner.encode_action(type, rotate, position, action_flags);
        let action_values = encoded_values[0],
            is_comment = encoded_values[1];

        this._values = this._values.concat(action_values);

        if (is_comment === true) {
          let comment_values = inner.encode_comment(action_flags.comment);
          this._values = this._values.concat(comment_values);
        }
      }
    }
  }

  namespace decoder {
    const TETFU_FIELD_BLOCKS = consts.TETFU_FIELD_BLOCKS;
    const TETFU_FIELD_HEIGHT = consts.TETFU_FIELD_HEIGHT;
    const TETFU_FIELD_WIDTH = consts.TETFU_FIELD_WIDTH;
    const TETFU_FIELD_TOP = consts.TETFU_FIELD_TOP;

    // 入力フィールドの高さは23, 幅は10
    export function decode_field(prev_field:Field, values:number[]): Field {
      // ひとつ前のフィールドのブロック種類を取得する関数
      let get_prev_block = (x:number, y:number) => 0 <= y ? prev_field.get_block(x, y).type : Type.Empty;

      let current = 0;
      let field = _field.create_initial_field(TETFU_FIELD_TOP, TETFU_FIELD_WIDTH);

      for (let index = 0; index < values.length; index += 2) {
        let x = current % 10,
            y = (TETFU_FIELD_TOP - Math.floor(current / 10) - 1),
            value = decode_value(values.slice(index, index + 2));

        // ブロック種類と個数を復元
        let type:number = Math.floor(value / TETFU_FIELD_BLOCKS) + get_prev_block(x, y) - 8;
        let count:number = value % TETFU_FIELD_BLOCKS;

        // 個数分、ブロックを繰り返し配置する
        for (let repeat = 0; repeat <= count; repeat++) {
          x = current % 10;
          y = (TETFU_FIELD_TOP - Math.floor(current / 10) - 1);
          if (0 <= y)
            field.set_block(x, y, <Type>type);
          current += 1;
        }
      }

      return field;
    }

    export function decode_value(array:number[]): number {
      let value:number = array[array.length - 1];
      for (let index = array.length - 2; 0 <= index; index--) {
        value *= ENCODE_MAX_VALUE;
        value += array[index];
      }
      return value;
    }
  }

  // 入力フィールドの高さは23, 幅は10
  export function encode(field:Field, steps:[Type, Rotate, PositionType][]): string {
    let data = new encoder.Encoder().encode(field, steps);
    return data.split('').reduce((prev, current, index) => prev + current + (index % 47 == 41 ? '?' : ''), "");
  }

  // 入力フィールドの高さは23, 幅は10
  export function encode_with_quiz(field:Field, steps:[Type, Rotate, PositionType][], mino_history:Type[]): string {
    let quiz:string = parse_quiz_comment(mino_history, steps[0][0]);
    let data = new encoder.Encoder().encode(field, steps, quiz);
    return data.split('').reduce((prev, current, index) => prev + current + (index % 47 == 41 ? '?' : ''), "");
  }

  function parse_quiz_comment(mino_history:Type[], first_type:Type): string {
    // 最初のツモを決める
    let hold = null;
    if (mino_history[0] !== first_type)
      hold = mino_history.shift();

    // 文字列に変換
    let get_name = (type:Type) => (type !== null ? name_by_type(type): '');
    let comment:string = "#Q=[" + get_name(hold) + "](" + get_name(mino_history[0]) + ")" + mino_history.slice(1).reduce((prev, current) => prev + get_name(current), "");
    return escape_comment(comment);
  }

  function escape_comment(comment:string): string {
    return escape(comment).substring(0,4095);
  }

  // 入力フィールドの高さは23, 幅は10
  export function encode_field(prev_field:Field, current_field:Field): string {
    let values = encoder.encode_field(prev_field, current_field);
    return tables.encode(values);
  }

  // 入力フィールドの高さは23, 幅は10
  export function decode_field(prev_field:Field, encoded:string): Field {
    let values:number[] = tables.decode(encoded);
    return decoder.decode_field(prev_field, values);
  }

  export function encode_value(value:number, split_count:number): string {
    let values:number[] = [];
    encoder.push_values(values, value, split_count)
    return tables.encode(values);
  }

  export function decode_value(encoded:string): number {
    let values = tables.decode(encoded);
    return decoder.decode_value(values);
  }
}
