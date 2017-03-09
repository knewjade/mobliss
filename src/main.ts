import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {game as _game} from 'game';
import {steps as _steps} from 'steps';
import {lock_candidate as _lock_candidate} from 'lock_candidate';

import {canvas as _canvas} from "front/canvas";
import {event as _event} from "front/event";
import {controller as _controller} from "front/controller";
import {image as _image} from "front/image";
import {points as _points} from 'front/points';

// 4canvasのIDは固定とする
// windowsサイズは動的に変更できないものとする
namespace main {
  type Canvas = _canvas.Canvas;
  type ImageLoader = _image.ImageLoader;
  type EventController = _event.EventController;
  type Type = _mino.Type;
  type Game = _game.Game;
  type Mino = _mino.Mino;
  type Controller = _controller.Controller;
  type LockCandidate = _lock_candidate.LockCandidate;

  let Type = _mino.Type;
  let Rotate = _mino.Rotate;
  let Game = _game.Game;
  let Steps = _steps.Steps;
  let Canvas = _canvas.Canvas;
  let EventController = _event.EventController;
  let ImageLoader = _image.ImageLoader;
  let Controller = _controller.Controller;
  let PerfectStatus = _controller.PerfectStatus;
  let LockCandidate = _lock_candidate.LockCandidate;

  let mino = _mino.mino;
  let create_initial_field = _field.create_initial_field;
  let block_by_name = _mino.block_by_name;

  let points = _points;

  const FIELD_HEIGHT = points.FIELD_HEIGHT;
  const FIELD_WIDTH = points.FIELD_WIDTH;
  const names = _image.Names;

  const SESSION_GAME_NAME = "Game";
  const SESSION_PARAMS_NAME = "Params";

  namespace params {
    var QueryString = {
      parse: function(text:string, sep:string=undefined, eq:string=undefined, isDecode:boolean=true): { [key:string]: string } {
        text = text;
        sep = sep || '&';
        eq = eq || '=';
        if (!text)
          return {};
        var decode = (isDecode) ? decodeURIComponent : (a:string) => a;
        return text.split(sep).reduce((obj:{[type: string] : string}, v:string) => {
          var pair = v.split(eq);
          obj[pair[0]] = decode(pair[1]);
          return obj;
        }, {});
      },
      stringify: function(value:{[type: string] : string}, sep:string, eq:string, isEncode:boolean):string  {
        sep = sep || '&';
        eq = eq || '=';
        var encode = (isEncode) ? encodeURIComponent : (a:string) => a;
        return Object.keys(value).map((key:string) => {
          return key + eq + encode(value[key]);
        }).join(sep);
      },
    };

    export class Params {
      private _params:{ [key:string]: string };
      private _game_generator: () => Game;
      private _next_set_flag: boolean = false;
      private _next_perfect_flag: boolean = false;
      private _mobile_flag:boolean = false;
      private _center_flag:boolean = false;
      private _perfect_candidate_flag:boolean = false;
      private _one_bag_length:number = 7;

      constructor(private _text:string, private _lock_candidate:LockCandidate) {
        if (!this._text)
          this._text = "";
        this._params = QueryString.parse(this._text);
        this.parse();
      }

      private parse(): void {
        this.set_pivot();
        this.set_game_generator();
        this.set_next_set_flag();
        this.set_next_perfect_flag();
        this.set_mobile_flag();
        this.set_center_flag();
        this.set_perfect_candidate_flag();
      }

      private set_pivot(): void {
        let shv = this._params["PivotSHV"];
        if (shv) {
          this.set_main(Type.S, shv[0]);
          this.set_main(Type.S, shv[1]);
        }

        let zhv = this._params["PivotZHV"];
        if (zhv) {
          this.set_main(Type.Z, zhv[0]);
          this.set_main(Type.Z, zhv[1]);
        }

        let ihv = this._params["PivotIHV"];
        if (ihv) {
          this.set_main(Type.I, ihv[0]);
          this.set_main(Type.I, ihv[1]);
        }

        let o = this._params["PivotO"];
        if (o) {
          this.set_main(Type.O, o);
        }
      }

      private set_main(type:Type, value:string): void {
        if (value === "N") {
          this._lock_candidate.set_main(type, Rotate.Normal);
        } else if (value === "R") {
          this._lock_candidate.set_main(type, Rotate.Right);
        } else if (value === "2") {
          this._lock_candidate.set_main(type, Rotate.Reverse);
        } else if (value === "L") {
          this._lock_candidate.set_main(type, Rotate.Left);
        }
      }

      private set_game_generator(): void {
        let bag_generator_count = this.get_bag_generator_count();
        let bag_generator = bag_generator_count[0];
        let field = this._params["Field"];

        this._one_bag_length = bag_generator_count[1];

        if (field === "PerfectRight") {
          this._game_generator = () => {
            let field = create_initial_field(23, FIELD_WIDTH);
            let steps = new Steps([Type.L, Type.O, Type.J, Type.S, Type.T, Type.Z, Type.I], points.NEXT_COUNT, bag_generator);
            let game = new Game(field, steps);

            game.teleport(1, 0, Rotate.Normal);
            game.commit();
            game.teleport(0, 1, Rotate.Normal);
            game.commit();
            game.teleport(1, 3, Rotate.Reverse);
            game.commit();
            game.teleport(5, 0, Rotate.Normal);
            game.commit();
            game.teleport(3, 1, Rotate.Right);
            game.commit();
            game.teleport(4, 2, Rotate.Normal);
            game.commit();

            return game;
          };
        } else {
          this._game_generator = () => {
            let field = create_initial_field(23, FIELD_WIDTH);
            let steps = new Steps([], points.NEXT_COUNT, bag_generator);
            return new Game(field, steps);
          };
        }
      }

      private get_bag_generator_count(): [() => Type[], number] {
        let order = this._params["Order"];

        if (order === "Random") {
          return [null, 7];
        } else {
          if (!order)
            return [null, 7];

          let types = order.toUpperCase().split('').map((e) => {
            try {
              return block_by_name(e).type;
            } catch (e) {
              return null;
            }
          });

          if (types.indexOf(null) !== -1)
            return [null, 7];

            this._one_bag_length = 7;

          return [() => {
            return types;
          }, 7];
        }
      }

      private set_next_set_flag(): void {
        let next_set = this._params["NextSet"];
        this._next_set_flag = next_set === "1";
      }

      private set_next_perfect_flag(): void {
        let next_perfect = this._params["NextPerfect"];
        this._next_perfect_flag = next_perfect === "1";
      }

      private set_mobile_flag(): void {
        this._mobile_flag = this.is_mobile();
      }

      private set_center_flag(): void {
        this._center_flag = this.is_mobile();
      }

      private set_perfect_candidate_flag(): void {
        let perfect_candidate = this._params["Candidate"];
        this._perfect_candidate_flag = perfect_candidate === "1";
      }

      private is_mobile(): boolean {
        var ua = navigator.userAgent;
        if (ua.indexOf('Vivaldi') > 0) {
          return false;
        } else if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
          return true;
        } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
          return true;
        } else {
          return false;
        }
      }

      public get lock_candidate(): LockCandidate {
        return this._lock_candidate;
      }

      public get game_generator(): () => Game {
        return this._game_generator;
      }

      public get next_set_flag(): boolean {
        return this._next_set_flag;
      }

      public get next_perfect_flag(): boolean {
        return this._next_perfect_flag;
      }

      public get mobile_flag(): boolean {
        return this._mobile_flag;
      }

      public get center_flag(): boolean {
        return this._center_flag;
      }

      public get perfect_candidate_flag(): boolean {
        return this._perfect_candidate_flag;
      }

      public get one_bag_length(): number {
        return this._one_bag_length;
      }

      public get text():string {
        return this._text;
      }
    }
  }

  class Main {
    constructor(image_loader:ImageLoader, param:params.Params) {
      // 画面サイズの設定
      let canvas_size:[number, number] = [window.innerWidth, window.innerHeight];
      let screen_size:[number, number] = [375, 647];

      // タッチイベントの作成
      let is_centering = param.center_flag;
      let is_mobile = param.mobile_flag;
      let event = new EventController('event', canvas_size, screen_size, is_centering, is_mobile);

      // キャンパスの作成
      let main = new Canvas('main', canvas_size, screen_size, is_centering);
      let background = new Canvas('background', canvas_size, screen_size, is_centering);
      let dynamic = new Canvas('dynamic', canvas_size, screen_size, is_centering);

      // ゲームの保存
      let game_recorder = (controller:Controller): void => {
        let two_line = controller.is_two_line_perfect ? "1" : "0";
        localStorage.setItem(SESSION_GAME_NAME, two_line + controller.game.pack());
      };

      // ゲームの復元
      let game_session = localStorage.getItem(SESSION_GAME_NAME);
      // console.log("Session:", SESSION_GAME_NAME, game_session);

      // メインコントローラの設定
      let game_generator:() => Game = param.game_generator;
      let is_two_line = false;
      let game = null;
      try {
        is_two_line = game_session !== null && game_session[0] === "1";
        game = game_session !== null ? Game.unpack(game_session.slice(1)) : game_generator();
      } catch (e) {
        game = game_generator();
      }
      let controller = new Controller(game, game_generator, game_recorder, param.perfect_candidate_flag, is_two_line, main, dynamic, param.lock_candidate);

      // タッチイベントのセットアップ
      event.setup_click_event(this.invoke_click_callback(event, controller));
      event.setup_keydown_event(this.invoke_keyboard_callback(controller));

      // キャンバスのセットアップ
      background.add_draw_event(this.create_draw_background_event(image_loader));
      main.add_draw_events(this.create_draw_main_events(image_loader, controller, param));
      dynamic.add_draw_events(this.create_draw_dynamic_events(image_loader, controller));

      // キャンバスの更新
      background.update();
      main.update();
      dynamic.update();
    }

    // 背景や空のフィールド
    public create_draw_background_event(image_loader:ImageLoader): (canvas:Canvas) => void {
      return (canvas:Canvas) => {
        // console.log('draw background');

        // 画面全体
        // canvas.fill_rect(0, 0, canvas.screen_width, canvas.screen_height, "rgb(33, 33, 33)", 0.1);
        canvas.fill_rect(0, 0, canvas.screen_width, canvas.screen_height, "rgb(255, 255, 255)");

        // フィールド
        let block_size = points.field.BLOCK_SIZE;
        for (let y = 0; y < FIELD_HEIGHT; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            let block_point = points.field.each_block(x, y);
            canvas.draw_image(image_loader.get_block(Type.Empty), block_point[0], block_point[1], block_size, block_size, 0.7);
          }
        }

        // next
        for (let count = 0; count < points.NEXT_COUNT; count++)
          canvas.draw_box(points.next.each_box(count), points.next.BOX_SIZE, "rgb(33, 33, 33)");

        // hold
        canvas.draw_box(points.hold.LEFT_TOP, points.hold.BOX_SIZE, "rgb(33, 33, 33)");

        // left rotate button
        canvas.draw_box(points.left_rotate.LEFT_TOP, points.left_rotate.BOX_SIZE, "rgb(33, 33, 33)");
        canvas.draw_image(image_loader.get(names.rotate_left), points.left_rotate.LEFT_TOP[0], points.left_rotate.LEFT_TOP[1], points.left_rotate.BOX_SIZE, points.left_rotate.BOX_SIZE);

        // right rotate button
        canvas.draw_box(points.right_rotate.LEFT_TOP, points.right_rotate.BOX_SIZE, "rgb(33, 33, 33)");
        canvas.draw_image(image_loader.get(names.rotate_right), points.right_rotate.LEFT_TOP[0], points.right_rotate.LEFT_TOP[1], points.right_rotate.BOX_SIZE, points.right_rotate.BOX_SIZE);

        // reset
        canvas.draw_box(points.reset.LEFT_TOP, points.reset.BOX_SIZE, "rgb(217, 83, 79)");
        canvas.draw_image(image_loader.get(names.refresh), points.reset.LEFT_TOP[0], points.reset.LEFT_TOP[1], points.reset.BOX_SIZE, points.reset.BOX_SIZE);

        // undo
        canvas.draw_box(points.undo.LEFT_TOP, points.undo.BOX_SIZE, "rgb(217, 83, 79)");
        canvas.draw_image(image_loader.get(names.undo), points.undo.LEFT_TOP[0], points.undo.LEFT_TOP[1], points.undo.BOX_SIZE, points.undo.BOX_SIZE);

        // perfect
        canvas.draw_box(points.perfect.LEFT_TOP, points.perfect.BOX_SIZE, "rgb(51, 122, 183)");
        canvas.draw_image(image_loader.get(names.search), points.perfect.LEFT_TOP[0], points.perfect.LEFT_TOP[1], points.perfect.BOX_SIZE, points.perfect.BOX_SIZE);

        // tetfu
        canvas.draw_box(points.tetfu.LEFT_TOP, points.tetfu.BOX_SIZE, "rgb(33, 33, 33)");
        canvas.draw_image(image_loader.get(names.fumen), points.tetfu.LEFT_TOP[0], points.tetfu.LEFT_TOP[1], points.tetfu.BOX_SIZE, points.tetfu.BOX_SIZE);
      };
    }

    // すでに設置したフィールドやNextなど
    public create_draw_main_events(image_loader:ImageLoader, controller:Controller, param:params.Params): ((canvas:Canvas) => void)[] {
      let next_set_flag = param.next_set_flag;
      let next_perfect_flag = param.next_perfect_flag;
      let one_bag_length = param.one_bag_length;
      function draw_mini_tetrimino(canvas:Canvas, mino:Mino, next_block_size:number, left_top:[number, number], half_box_size:[number, number]): void {
        let positions = mino.positions;
        let center = [left_top[0] + half_box_size[0], left_top[1] + half_box_size[1]];

        let pos = [(mino.max_x + mino.min_x + 1) / 2.0, (1 - mino.max_y - mino.min_y) / 2.0];
        for (let p of positions) {
          let k = [p[0] - pos[0], -p[1] - pos[1]];
          canvas.draw_image(image_loader.get_block(mino.type), center[0] + k[0] * next_block_size, center[1] + k[1] * next_block_size, next_block_size, next_block_size);
        }
      }

      // フィールドの描画
      let field_event = (canvas:Canvas) => {
        let field = controller.game.field;
        let block_size = points.field.BLOCK_SIZE;
        for (let y = 0; y < FIELD_HEIGHT; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            let block_point = points.field.each_block(x, y);
            let type = field.get_block(x, y).type;
            if (type !== Type.Empty)
              canvas.draw_image(image_loader.get_block(type), block_point[0], block_point[1], block_size, block_size);
          }
        }
      };

      // ネクストの描画
      let next_event = (canvas:Canvas) => {
        let pop_count = controller.pop_count;
        let half_box_size = points.next.HALF_BOX_SIZE;
        for (let index = 0; index < points.NEXT_COUNT; index++) {
          if (next_set_flag === true && (pop_count + index) % one_bag_length === 0) {
            let bias = points.next.POINT_BIAS;
            let box = points.next.each_box(index);
            canvas.draw_box([box[0] + bias[0], box[1] + bias[1]], points.next.POINT_SIZE, "rgb(226, 4, 27)");
          }

          if (next_perfect_flag === true && (pop_count + index) % 10 === 0) {
            let box_size = points.next.BOX_SIZE;
            let box = points.next.each_box(index);
            let point_bias = points.next.POINT_BIAS;
            let point_size = points.next.POINT_SIZE;

            let left_top:[number, number] = [box[0] + box_size - point_bias[0] - point_size, box[1] + point_bias[1]];
            canvas.draw_box(left_top, point_size, "rgb(133, 202, 133)");
          }

          let next_type = controller.game.get_next(index);
          let left_top = points.next.each_box(index);
          draw_mini_tetrimino(canvas, mino(next_type), 12, left_top, [half_box_size, half_box_size]);
        }
      };

      // ホールドの描画
      let hold_event = (canvas:Canvas) => {
        let half_box_size = points.hold.HALF_BOX_SIZE;
        let hold_type = controller.game.hold_type;
        if (hold_type !== null)
          draw_mini_tetrimino(canvas, mino(hold_type), 12, points.hold.LEFT_TOP, [half_box_size, half_box_size]);
      };

      return [field_event, next_event, hold_event];
    }

    // 現在位置・接着候補・ゴースト・パーフェクトフラグ
    public create_draw_dynamic_events(image_loader:ImageLoader, controller:Controller): ((canvas:Canvas) => void)[] {
      // 現在位置・接着候補・ゴーストの描画
      let mino_event = (canvas:Canvas) => {
        let game = controller.game;
        let current_mino = game.current_mino;
        let type = current_mino.type;
        let x = game.x;
        let y = game.y;
        let harddropy = game.field.harddrop(x, y, current_mino);
        let block_size = points.field.BLOCK_SIZE;

        for (let position of current_mino.positions) {
          let image = image_loader.get_block(type);

          let current_y = y + position[1];
          if (current_y < FIELD_HEIGHT) {
            let current_block_point = points.field.each_block(x + position[0], current_y);
            canvas.draw_image(image, current_block_point[0], current_block_point[1], block_size, block_size);
          }

          let ghost_y = harddropy + position[1];
          if (ghost_y < FIELD_HEIGHT) {
            let ghost_block_point = points.field.each_block(x + position[0], ghost_y);
            canvas.draw_image(image, ghost_block_point[0], ghost_block_point[1], block_size, block_size, 0.3);
          }
        }
      };

      // 接着候補の描画
      let candidates_event = (canvas:Canvas) => {
        let block_size = points.field.BLOCK_SIZE;
        let candidates = controller.candidates;
        let image_candidate = image_loader.get('Candidate');
        for (let candidate of candidates) {
          let block_point = points.field.each_block(candidate[0], candidate[1]);
          canvas.draw_image(image_candidate, block_point[0], block_point[1], block_size, block_size);
        }
      };

      // パーフェクトフラグの描画
      let perfect_event = (canvas:Canvas) => {
        let perfect_status = controller.perfect_status;
        if (perfect_status === PerfectStatus.FOUND) {
          canvas.draw_box(points.perfect.LEFT_TOP, points.perfect.BOX_SIZE, "rgb(33, 170, 33)");
        } else if (perfect_status === PerfectStatus.NOT_FOUND) {
          canvas.draw_box(points.perfect.LEFT_TOP, points.perfect.BOX_SIZE, "rgb(170, 33, 33)");
        } else if (perfect_status === PerfectStatus.NOT_FOUND_YET) {
          canvas.draw_box(points.perfect.LEFT_TOP, points.perfect.BOX_SIZE, "rgb(170, 170, 33)");
        } else if (perfect_status === PerfectStatus.STOPPED) {
          canvas.draw_box(points.perfect.LEFT_TOP, points.perfect.BOX_SIZE, "rgb(33, 33, 33)");
        }
      };

      return [mino_event, candidates_event, perfect_event];
    }

    public invoke_click_callback(event:EventController, controller:Controller): (x:number, y:number) => void {
      return (x:number, y:number) => {
        // console.log('click', x, y);
        // document.getElementById('debug_text').innerHTML += 'click<br>';

        let position = event.transpose_position_to_screen(x, y);
        let component = points.get_touch_component(position[0], position[1]);

        if (component === points.Component.FIELD) {
          let index = points.field.back_index(position[0], position[1]);
          let px = index[0];
          let py = index[1];
          let pdistace = index[2];
          if (pdistace <= 0.95)
            controller.put(px, py);
        } else if (component === points.Component.HOLD)
          controller.hold();
        else if (component === points.Component.LEFT_ROTATE)
          controller.rotate_left();
        else if (component === points.Component.RIGHT_ROTATE)
          controller.rotate_right();
        else if (component === points.Component.RESET)
          controller.restart();
        else if (component === points.Component.UNDO)
          controller.undo();
        else if (component === points.Component.PERFECT) {
          controller.check_perfect();
        } else if (component === points.Component.TETFU) {
          let tetfu_data = controller.generate_tetfu_url();
          if (tetfu_data)
            window.open('jump.html?d115@' + tetfu_data, '_blank');
        }
      };
    }

    public invoke_keyboard_callback(controller:Controller): (name:string) => void {
      let keymap:{ [name: string] : () => void } = {
        'ArrowLeft': controller.move_left,
        'ArrowRight': controller.move_right,
        'ArrowDown': controller.move_down,
        'ArrowUp': controller.harddrop,
        'a': controller.rotate_left,
        'd': controller.rotate_right,
        'e': controller.hold,
        'r': controller.restart,
      };
      return (name:string) => {
        // console.log('keydown', name);
        let map = keymap[name];
        if (map)
          map.call(controller);
      };
    }
  }

  export function onload(e:Event): void {
    let image_loader = new ImageLoader(() => {
      console.log('all completed');

      // パラメータの取得。Getパラメータになければ、キャッシュから取得
      let session_params = localStorage.getItem(SESSION_PARAMS_NAME);
      console.log("Session:", SESSION_PARAMS_NAME, session_params);
      let param_text:string = location.search.substr(1) || session_params;

      // Paramsオブジェクトの作成
      let lock_candidate = new LockCandidate();
      let param = new params.Params(param_text, lock_candidate);

      // パラメータの保存
      localStorage.setItem(SESSION_PARAMS_NAME, param.text);

      new Main(image_loader, param);
    });
  }
}

window.onload = (event:Event) => {
  main.onload(event);
}
