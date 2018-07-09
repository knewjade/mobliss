import { mino, mino as _mino } from 'mino';
import {field as _field} from 'field';
import {game as _game} from 'game';
import { steps, steps as _steps } from 'steps';
import {params as _params} from 'params';
import {lock_candidate as _lock_candidate} from 'lock_candidate';

import {canvas as _canvas} from "front/canvas";
import {event as _event} from "front/event";
import {controller as _controller} from "controller";
import {image as _image} from "front/image";
import {points as _points} from 'front/points';

// 4canvasのIDは固定とする
// windowsサイズは動的に変更できないものとする
export namespace play {
  type Type = _mino.Type;
  type Canvas = _canvas.Canvas;
  type DrawEventFunc = _canvas.DrawEventFunc;
  type ImageLoader = _image.ImageLoader;
  type EventController = _event.EventController;
  type Game = _game.Game;
  type BagGenerator = _steps.BagGenerator;
  type Mino = _mino.Mino;
  type Controller = _controller.Controller;
  type GameGenerator = _controller.GameGenerator;
  type ControllerFlags = _controller.ControllerFlags;
  type OperationCallbackType = _controller.OperationCallbackType;
  type LockCandidate = _lock_candidate.LockCandidate;
  type Params = _params.Params;
  type FieldType = _params.FieldType;

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
  let Params = _params.Params;
  let FieldType = _params.FieldType;
  let create_random_bag = steps.create_random_bag;

  let mino = _mino.mino;
  let create_initial_field = _field.create_initial_field;
  let block_by_name = _mino.block_by_name;

  let points = _points;

  const FIELD_HEIGHT = points.FIELD_HEIGHT;
  const FIELD_WIDTH = points.FIELD_WIDTH;
  const DEFAULT_ORDER_VALUE = _params.DEFAULT_ORDER_VALUE;
  const IMAGE_NAMES = _image.Names;
  //
  const SESSION_GAME_NAME = "Game";
  const SESSION_PARAMS_NAME = "Params";
  const VERSION_NUMBERS = "001";

  type DynamicSettings = {
      canvas_size:[number, number],
      is_centering:boolean,
      is_mobile:boolean,
  };

  class Main {
    constructor(image_loader:ImageLoader, params:Params, settings:DynamicSettings) {
      // console.log(params);
      // console.log(settings);

      // 画面サイズの設定
      let canvas_size:[number, number] = settings.canvas_size;
      let screen_size:[number, number] = [points.WIDTH, points.HEIGHT];

      // タッチイベントの作成
      let is_centering = settings.is_centering;
      let is_mobile = settings.is_mobile;
      let is_keyboard_enable = params.keyboard_enable;
      let event = new EventController('event', canvas_size, screen_size, is_centering, is_mobile, is_keyboard_enable, [
        params.keybind_move_left, params.keybind_move_right, params.keybind_move_down
      ], params.max_das, params.das_delay);

      // キャンパスの作成
      let main = new Canvas('main', canvas_size, screen_size, is_centering);
      let background = new Canvas('background', canvas_size, screen_size, is_centering);
      let dynamic = new Canvas('dynamic', canvas_size, screen_size, is_centering);

      // ゲームの保存
      let game_recorder = (controller:Controller): void => {
        localStorage.setItem(SESSION_GAME_NAME, "v" + VERSION_NUMBERS + "@" + controller.pack());
      };

      // ゲームの復元
      let game_session:string = localStorage.getItem(SESSION_GAME_NAME) || "";
      console.log("Session:", SESSION_GAME_NAME, game_session);

      let session_version = game_session.slice(0, 5);
      if (session_version === 'v' + VERSION_NUMBERS + '@') {
        game_session = game_session.slice(5);
      } else {
        // バックアップ
        localStorage.setItem(SESSION_GAME_NAME + ':' + session_version, game_session);
        game_session = null;
      }

      // generatorの生成
      let bag_generator_and_length:[BagGenerator, number] = this.create_bag_generator(params.order_type);
      let bag_generator = bag_generator_and_length[0];
      let bag_length = bag_generator_and_length[1];
      let game_generator:GameGenerator = this.create_game_generator(params.field_type, params.order_type, params.next_count, bag_generator);

      // OperationCallbackTypeの設定
      let operation_callback:OperationCallbackType = (event_name:string, controller:Controller) => {
        if (event_name === 'commit') {
          game_recorder(controller);
          main.update();
          dynamic.update();
        } else if (event_name === 'operate') {
          dynamic.update();
        } else if (event_name === 'perfect') {
          dynamic.update();
        }
      };

      // Controllerの設定
      let lock_candidate:LockCandidate = this.create_lock_candidate(params);
      let controller_flags:ControllerFlags = this.create_controller_flags(params, bag_length, game_generator, operation_callback);

      // Controllerの復元
      let controller:Controller = null;
      try {
        if (game_session !== "")
          controller = Controller.unpack(game_session, lock_candidate, controller_flags);
      } catch (e) {
        // do nothing
      }

      // Controllerを復元できなかった場合は新規作成
      if (controller === null)
        controller = new Controller(game_generator(), lock_candidate, controller_flags);

      // タッチイベントのセットアップ
      event.setup_click_event(this.invoke_click_callback(controller, event));
      event.setup_keydown_event(this.invoke_keyboard_callback(controller, params));

      // キャンバスのセットアップ
      background.add_draw_event(this.create_draw_background_event(image_loader, params));
      main.add_draw_events(this.create_draw_main_events(controller, image_loader, params));
      dynamic.add_draw_events(this.create_draw_dynamic_events(controller, image_loader));

      // キャンバスの更新
      background.update();
      main.update();
      dynamic.update();
    }

    // [generator or null, bagの個数]
    private create_bag_generator(order_type:string): [BagGenerator, number] {
      // はじめを指定した数だけスライドする
      if (order_type.startsWith('>>')) {
        return [null, 7];
      }

      // 固定ミノ+ランダム
      if (order_type.endsWith('*')) {
        return [null, 7];
      }

      if (order_type === DEFAULT_ORDER_VALUE) {
        return [null, 7];
      }

      // 空文字 or undefinedのときはdefault
      if (!order_type)
        return [null, 7];

      // Typeに変換
      let types = order_type.toUpperCase().split('').map((e) => {
        try {
          return block_by_name(e).type;
        } catch (e) {
          return null;
        }
      });

      // 不明な文字が含まれるときはdefault
      if (types.indexOf(null) !== -1)
        return [null, 7];

      return [() => {
        return types;
      }, 7];
    }

    private create_game_generator(field_type:FieldType, order_type:string, next_count:number, bag_generator:BagGenerator): GameGenerator {
      if (field_type === FieldType.Empty) {
        return () => {
            // はじめを指定した数だけスライドする
            let types:Type[] = [];
            if (order_type.startsWith('>>')) {
                types = create_random_bag().slice(Number(order_type.substr(2).trim()[0]));
            }

            // 固定ミノ+ランダム
            if (order_type.endsWith('*')) {
                // Typeに変換
                types = order_type.substring(0, order_type.lastIndexOf('*')).toUpperCase().split('').map((e) => {
                    try {
                        return block_by_name(e).type;
                    } catch (e) {
                        return null;
                    }
                });

                // 不明な文字が含まれるときはdefault
                if (types.indexOf(null) !== -1)
                    types = [];
            }

            let field = create_initial_field(23, FIELD_WIDTH);
          let steps = new Steps(types, next_count, bag_generator);
          return new Game(field, steps);
        };
      } else if (field_type === FieldType.PerfectTRight) {
        return () => {
          let field = create_initial_field(23, FIELD_WIDTH);
          let steps = new Steps([
            Type.L, Type.O, Type.J, Type.S, Type.T, Type.Z, Type.I,
          ], next_count, bag_generator);
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
      } else if (field_type === FieldType.PerfectTLeft) {
        return () => {
          let field = create_initial_field(23, FIELD_WIDTH);
          let steps = new Steps([
            Type.L, Type.O, Type.J, Type.Z, Type.T, Type.S, Type.I,
          ], next_count, bag_generator);
          let game = new Game(field, steps);

          game.teleport(8, 0, Rotate.Normal);
          game.commit();
          game.teleport(7, 1, Rotate.Normal);
          game.commit();
          game.teleport(8, 3, Rotate.Reverse);
          game.commit();
          game.teleport(4, 0, Rotate.Normal);
          game.commit();
          game.teleport(6, 1, Rotate.Left);
          game.commit();
          game.teleport(5, 2, Rotate.Normal);
          game.commit();

          return game;
        };
      } else {
        throw Error('Illegal error: Not found Field Type');
      }
    }

    private create_lock_candidate(params:Params): LockCandidate {
      let lock_candidate = new LockCandidate();
      lock_candidate.set_main(Type.S, params.pivot_s_h);
      lock_candidate.set_main(Type.S, params.pivot_s_v);
      lock_candidate.set_main(Type.Z, params.pivot_z_h);
      lock_candidate.set_main(Type.Z, params.pivot_z_v);
      lock_candidate.set_main(Type.I, params.pivot_i_h);
      lock_candidate.set_main(Type.I, params.pivot_i_v);
      lock_candidate.set_main(Type.O, params.pivot_o);
      return lock_candidate;
    }

    private create_controller_flags(params:Params, bag_length:number, game_generator:GameGenerator, operation_callback:OperationCallbackType): ControllerFlags {
      return {
        max_undo_count: 20,
        visible_field_height: points.FIELD_HEIGHT,
        visible_field_width: points.FIELD_WIDTH,
        next_count: params.next_count,
        is_candidate: params.candidate_visible,
        is_perfect_candidate: params.candidate_limit_perfect,
        is_two_line_perfect: false,
        bag_length: bag_length,
        game_generator: game_generator,
        operation_callback: operation_callback,
      };
    }

    private invoke_click_callback(controller:Controller, event:EventController): (x:number, y:number) => void {
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
          let tetfu_data = controller.generate_tetfu();
          if (tetfu_data !== '')
            window.open('jump.html?d115@' + tetfu_data, '_blank');
        }
      };
    }

    private invoke_keyboard_callback(controller:Controller, params:Params): (name:string) => void {
      // TODO: keybinds from params
      let keymap:{ [name: string] : () => void } = {};
      keymap[params.keybind_move_left] = controller.move_left;
      keymap[params.keybind_move_right] = controller.move_right;
      keymap[params.keybind_move_down] = controller.move_down;
      keymap[params.keybind_rotate_right] = controller.rotate_right;
      keymap[params.keybind_rotate_left] = controller.rotate_left;
      keymap[params.keybind_hold] = controller.hold;
      keymap[params.keybind_harddrop] = controller.harddrop;
      keymap[params.keybind_restart] = controller.restart;
      keymap[params.keybind_undo] = controller.undo;

      return (name:string) => {
        // console.log('keydown', name);
        let func = keymap[name];
        if (func !== undefined)
          func.call(controller);
      };
    }

    // 背景や空のフィールド
    public create_draw_background_event(image_loader:ImageLoader, params:Params): DrawEventFunc {
      let next_count = params.next_count;

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
        for (let count = 0; count < next_count; count++)
          canvas.draw_box(points.next.each_box(count), points.next.BOX_SIZE, "rgb(33, 33, 33)");

        // hold
        canvas.draw_box(points.hold.LEFT_TOP, points.hold.BOX_SIZE, "rgb(33, 33, 33)");

        // left rotate button
        canvas.draw_box(points.left_rotate.LEFT_TOP, points.left_rotate.BOX_SIZE, "rgb(33, 33, 33)");
        canvas.draw_image(image_loader.get(IMAGE_NAMES.rotate_left), points.left_rotate.LEFT_TOP[0], points.left_rotate.LEFT_TOP[1], points.left_rotate.BOX_SIZE, points.left_rotate.BOX_SIZE);

        // right rotate button
        canvas.draw_box(points.right_rotate.LEFT_TOP, points.right_rotate.BOX_SIZE, "rgb(33, 33, 33)");
        canvas.draw_image(image_loader.get(IMAGE_NAMES.rotate_right), points.right_rotate.LEFT_TOP[0], points.right_rotate.LEFT_TOP[1], points.right_rotate.BOX_SIZE, points.right_rotate.BOX_SIZE);

        // reset
        canvas.draw_box(points.reset.LEFT_TOP, points.reset.BOX_SIZE, "rgb(217, 83, 79)");
        canvas.draw_image(image_loader.get(IMAGE_NAMES.refresh), points.reset.LEFT_TOP[0], points.reset.LEFT_TOP[1], points.reset.BOX_SIZE, points.reset.BOX_SIZE);

        // undo
        canvas.draw_box(points.undo.LEFT_TOP, points.undo.BOX_SIZE, "rgb(217, 83, 79)");
        canvas.draw_image(image_loader.get(IMAGE_NAMES.undo), points.undo.LEFT_TOP[0], points.undo.LEFT_TOP[1], points.undo.BOX_SIZE, points.undo.BOX_SIZE);

        // perfect
        canvas.draw_box(points.perfect.LEFT_TOP, points.perfect.BOX_SIZE, "rgb(51, 122, 183)");
        canvas.draw_image(image_loader.get(IMAGE_NAMES.search), points.perfect.LEFT_TOP[0], points.perfect.LEFT_TOP[1], points.perfect.BOX_SIZE, points.perfect.BOX_SIZE);

        // tetfu
        canvas.draw_box(points.tetfu.LEFT_TOP, points.tetfu.BOX_SIZE, "rgb(33, 33, 33)");
        canvas.draw_image(image_loader.get(IMAGE_NAMES.fumen), points.tetfu.LEFT_TOP[0], points.tetfu.LEFT_TOP[1], points.tetfu.BOX_SIZE, points.tetfu.BOX_SIZE);
      };
    }

    // すでに設置したフィールドやNextなど
    public create_draw_main_events(controller:Controller, image_loader:ImageLoader, params:Params): DrawEventFunc[] {
      let is_bag_mark = params.bag_mark;
      let is_perfect_mark = params.perfect_mark;
      let next_count = params.next_count;

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
        for (let index = 0; index < next_count; index++) {
          // 1巡ごとにマークをつける
          if (is_bag_mark === true && controller.is_top_in_bag(index) === true) {
            let bias = points.next.POINT_BIAS;
            let box = points.next.each_box(index);
            canvas.draw_box([box[0] + bias[0], box[1] + bias[1]], points.next.POINT_SIZE, "rgb(226, 4, 27)");
          }

          // パーフェクト1巡ごとにマークをつける
          if (is_perfect_mark === true && controller.is_top_in_perfect_cycle(index) === true) {
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
    public create_draw_dynamic_events(controller:Controller, image_loader:ImageLoader): DrawEventFunc[] {
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
        if (perfect_status === PerfectStatus.Found) {
          canvas.draw_box(points.perfect.LEFT_TOP, points.perfect.BOX_SIZE, "rgb(33, 170, 33)");
        } else if (perfect_status === PerfectStatus.NotFound) {
          canvas.draw_box(points.perfect.LEFT_TOP, points.perfect.BOX_SIZE, "rgb(170, 33, 33)");
        } else if (perfect_status === PerfectStatus.NotFoundYet) {
          canvas.draw_box(points.perfect.LEFT_TOP, points.perfect.BOX_SIZE, "rgb(170, 170, 33)");
        } else if (perfect_status === PerfectStatus.Stopped) {
          canvas.draw_box(points.perfect.LEFT_TOP, points.perfect.BOX_SIZE, "rgb(33, 33, 33)");
        }
      };

      return [mino_event, candidates_event, perfect_event];
    }
  }

  export function entry(e:Event): void {
    let image_loader = new ImageLoader(() => {
      console.log('all completed');

      // パラメータの取得。Getパラメータになければ、キャッシュから取得
      let session_params = localStorage.getItem(SESSION_PARAMS_NAME);
      console.log("Session:", SESSION_PARAMS_NAME, session_params);
      let param_text:string = decodeURI(location.search.substr(1)) || session_params;

      // Paramsオブジェクトの作成
      let params:Params = null;
      try {
        params = new Params(param_text);
      } catch (e) {
        console.error(e);
        params = new Params();
      }

      // パラメータの保存
      localStorage.setItem(SESSION_PARAMS_NAME, params.text);

      new Main(image_loader, params, {
          canvas_size: [window.innerWidth, window.innerHeight],
          is_centering: is_mobile(),
          is_mobile: is_mobile(),
      });
    });
  }

  function is_mobile(): boolean {
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
}
