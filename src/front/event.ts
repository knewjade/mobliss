import {canvas as _canvas} from "front/canvas";

export namespace event {
  type Canvas = _canvas.Canvas;

  let Canvas = _canvas.Canvas;

  const MAX_DAS:number = 80;
  const DAS_DELAY:number = 40;

  export class EventController {
    private _canvas:Canvas;

    constructor(id:string, canvas_size:[number, number], screen_size:[number, number], is_centering:boolean) {
      this._canvas = new Canvas(id, canvas_size, screen_size, is_centering);
    }

    public setup_click_event(callback:(x:number, y:number) => void): void {
      if (!callback)
        return;

      function onClick(e:MouseEvent) {
        /*
         * rectでcanvasの絶対座標位置を取得し、
         * クリック座標であるe.clientX,e.clientYからその分を引く
         * ※クリック座標はdocumentからの位置を返すため
         * ※rectはスクロール量によって値が変わるので、onClick()内でつど定義
         */
        let target:HTMLInputElement = <HTMLInputElement> e.target;
        let rect = target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        callback(x, y);
      }

      this._canvas.addEventListener('click', onClick, false);
    }

    public setup_keydown_event(callback:(name:string) => void): void {
      let das_target_names:{ [name:string]: any } = {
        'ArrowLeft': null,
        'ArrowRight': null,
        'ArrowDown': null,
      };

      if (!callback)
        return;

      let key_status: { [type: string]:[number, number, boolean] } = {};

      // キーを押したとき
      function onKeyDown(e:KeyboardEvent) {
        // ステータスがないとき初期化
        let key = e.key;
        if (!(key in key_status))
          key_status[key] = [0, 0, false];

        // DAS対応かチェックする
        if (key in das_target_names) {
          onDASKeyDown(key);
        } else {
          if (key_status[key][0] === key_status[key][1]) {
            callback(key);
            key_status[key][0] += 1;
          }
        }
      }

      // DAS対応のキーを押したとき
      function onDASKeyDown(key:string): void {
        // キーイベントの連続発火防止
        if (key_status[key][0] !== key_status[key][1])
          return;

        // 新しいDAS入力の開始
        key_status[key][0] += 1;
        key_status[key][2] = false;
        setTimeout(check_das, MAX_DAS, key, key_status[key][0]);  //millisec
      }

      // キーが上がったとき
      function onKeyUp(e:KeyboardEvent) {
        let key = e.key;
        key_status[key][1] = key_status[key][0];

        // DAS対応キーではないとき何もしない
        if (!(key in das_target_names))
          return;

        // すでにDASが発動済み
        if (key_status[key][2] === true)
          return;

        // DASの発動
        callback(key);
      }

      // DAS中の操作
      function check_das(key:string, prev_counter:number): void {
        // すでにキーが離されているか、一度キーが離されている
        if (key_status[key][0] === key_status[key][1] || key_status[key][0] !== prev_counter)
          return;

        // DASの発動
        callback(key);

        setTimeout(check_das, DAS_DELAY, key, prev_counter);  //millisec
      }

      // EventListnerに追加
      document.addEventListener('keydown', onKeyDown, false);
      document.addEventListener('keyup', onKeyUp, false);
    }

    public transpose_position_to_screen(canvas_x:number, canvas_y:number): [number, number] {
      return this._canvas.transpose_position_to_screen(canvas_x, canvas_y);
    }
  }
}
