import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {game as _game} from 'game';
import {steps as _steps} from 'steps';

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
  type Game = _game.Game;
  type Mino = _mino.Mino;
  type Controller = _controller.Controller;

  let Type = _mino.Type;
  let Game = _game.Game;
  let Steps = _steps.Steps;
  let Canvas = _canvas.Canvas;
  let EventController = _event.EventController;
  let ImageLoader = _image.ImageLoader;
  let Controller = _controller.Controller;
  let PerfectStatus = _controller.PerfectStatus;

  let mino = _mino.mino;
  let create_initial_field = _field.create_initial_field;

  let points = _points;

  const FIELD_HEIGHT = points.FIELD_HEIGHT;
  const FIELD_WIDTH = points.FIELD_WIDTH;

  const SESSION_GAME_NAME = "Game";

  class Main {
    constructor(image_loader:ImageLoader, is_centering:boolean) {
      let canvas_size:[number, number] = [window.innerWidth, window.innerHeight];
      let screen_size:[number, number] = [375, 647];

      let event = new EventController('event', canvas_size, screen_size, is_centering);

      let main = new Canvas('main', canvas_size, screen_size, is_centering);
      let background = new Canvas('background', canvas_size, screen_size, is_centering);
      let dynamic = new Canvas('dynamic', canvas_size, screen_size, is_centering);

      let game_generator = (): Game => {
        let field = create_initial_field(23, FIELD_WIDTH);
        let steps = new Steps([], points.NEXT_COUNT);
        return new Game(field, steps);
      };
      let game_recorder = (controller:Controller): void => {
        localStorage.setItem(SESSION_GAME_NAME, controller.game.pack());
      };
      let game_session = localStorage.getItem(SESSION_GAME_NAME);
      console.log("Session:", SESSION_GAME_NAME, game_session);
      let game = game_session !== null ? Game.unpack(game_session) : game_generator();
      let controller = new Controller(game, game_generator, game_recorder, main, dynamic);

      event.setup_click_event(this.invoke_click_callback(event, controller));
      event.setup_keydown_event(this.invoke_keyboard_callback(controller));

      background.add_draw_event(this.draw_background(image_loader));
      main.add_draw_event(this.draw_main(image_loader, controller));
      dynamic.add_draw_event(this.draw_dynamic(image_loader, controller));

      background.update();
      main.update();
      dynamic.update();
    }

    // 背景や空のフィールド
    public draw_background(image_loader:ImageLoader): (canvas:Canvas) => void {
      return (canvas:Canvas) => {
        // console.log('draw background');

        // 画面全体
        canvas.fill_rect(0, 0, canvas.screen_width, canvas.screen_height, "rgb(33,33,33)", 0.1);

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
        canvas.draw_image(image_loader.get("Arrow"), points.left_rotate.LEFT_TOP[0], points.left_rotate.LEFT_TOP[1], points.left_rotate.BOX_SIZE, points.left_rotate.BOX_SIZE);

        // right rotate button
        canvas.draw_box(points.right_rotate.LEFT_TOP, points.right_rotate.BOX_SIZE, "rgb(33, 33, 33)");
        canvas.draw_image(image_loader.get("Arrow"), points.right_rotate.LEFT_TOP[0], points.right_rotate.LEFT_TOP[1], points.right_rotate.BOX_SIZE, points.right_rotate.BOX_SIZE);

        // reset
        canvas.draw_box(points.reset.LEFT_TOP, points.reset.BOX_SIZE, "rgb(170, 33, 33)");
        canvas.draw_image(image_loader.get("Arrow"), points.reset.LEFT_TOP[0], points.reset.LEFT_TOP[1], points.reset.BOX_SIZE, points.reset.BOX_SIZE);

        // undo
        canvas.draw_box(points.undo.LEFT_TOP, points.undo.BOX_SIZE, "rgb(170, 33, 33)");
        canvas.draw_image(image_loader.get("Arrow"), points.undo.LEFT_TOP[0], points.undo.LEFT_TOP[1], points.undo.BOX_SIZE, points.undo.BOX_SIZE);

        // perfect
        canvas.draw_box(points.perfect.LEFT_TOP, points.perfect.BOX_SIZE, "rgb(33, 33, 170)");
        canvas.draw_image(image_loader.get("Arrow"), points.perfect.LEFT_TOP[0], points.perfect.LEFT_TOP[1], points.perfect.BOX_SIZE, points.perfect.BOX_SIZE);

        // tetfu
        canvas.draw_box(points.tetfu.LEFT_TOP, points.tetfu.BOX_SIZE, "rgb(33, 33, 33)");
        canvas.draw_image(image_loader.get("Arrow"), points.tetfu.LEFT_TOP[0], points.tetfu.LEFT_TOP[1], points.tetfu.BOX_SIZE, points.tetfu.BOX_SIZE);
      };
    }

    // すでに設置したフィールドやNextなど
    public draw_main(image_loader:ImageLoader, controller:Controller): (canvas:Canvas) => void {
      function draw_mini_tetrimino(canvas:Canvas, mino:Mino, next_block_size:number, left_top:[number, number], half_box_size:[number, number]): void {
        let positions = mino.positions;
        let center = [left_top[0] + half_box_size[0], left_top[1] + half_box_size[1]];

        let pos = [(mino.max_x + mino.min_x + 1) / 2.0, (1 - mino.max_y - mino.min_y) / 2.0];
        for (let p of positions) {
          let k = [p[0] - pos[0], -p[1] - pos[1]];
          canvas.draw_image(image_loader.get_block(mino.type), center[0] + k[0] * next_block_size, center[1] + k[1] * next_block_size, next_block_size, next_block_size);
        }
      }

      return (canvas:Canvas) => {
        // console.log('draw main');

        let game = controller.game;
        let field = game.field;

        // フィールド
        let block_size = points.field.BLOCK_SIZE;
        for (let y = 0; y < FIELD_HEIGHT; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            let block_point = points.field.each_block(x, y);
            let type = field.get_block(x, y).type;
            if (type !== Type.Empty)
              canvas.draw_image(image_loader.get_block(type), block_point[0], block_point[1], block_size, block_size);
          }
        }

        // next
        for (let index = 0; index < points.NEXT_COUNT; index++) {
          let next_type = game.get_next(index);
          let left_top = points.next.each_box(index);
          draw_mini_tetrimino(canvas, mino(next_type), 12, left_top, [points.next.HALF_BOX_SIZE, points.next.HALF_BOX_SIZE]);
        }

        // hold
        let hold_type = game.hold_type;
        if (hold_type !== null)
          draw_mini_tetrimino(canvas, mino(hold_type), 12, points.hold.LEFT_TOP, [points.hold.HALF_BOX_SIZE, points.hold.HALF_BOX_SIZE]);
      };
    }

    // 現在位置・接着候補・ゴースト
    public draw_dynamic(image_loader:ImageLoader, controller:Controller): (canvas:Canvas) => void {
      return (canvas:Canvas) => {
        // console.log('draw dynamic');

        let game = controller.game;
        let field = game.field;
        let current_mino = game.current_mino;
        let type = current_mino.type;
        let rotate = current_mino.rotate;
        let x = game.x;
        let y = game.y;
        let harddropy = game.field.harddrop(x, y, current_mino);

        let block_size = points.field.BLOCK_SIZE;

        // 現在位置・ゴースト
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

        // 接着候補
        let candidates = controller.candidates;
        let image_candidate = image_loader.get('Candidate');
        for (let candidate of candidates) {
          let block_point = points.field.each_block(candidate[0], candidate[1]);
          canvas.draw_image(image_candidate, block_point[0], block_point[1], points.field.BLOCK_SIZE, points.field.BLOCK_SIZE);
        }

        // パーフェクトフラグ
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
    }

    public invoke_click_callback(event:EventController, controller:Controller): (x:number, y:number) => void {
      return (x:number, y:number) => {
        // console.log('click', x, y);
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
          if (tetfu_data !== "")
            window.open('http://fumen.zui.jp/?d115@' + tetfu_data, '_blank');
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

  function is_centering(): boolean {
    var ua = navigator.userAgent;

    if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
      return false;
    } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
      return false;
    } else {
      return false;
    }
  }

  export function onload(e:Event): void {
    let image_loader = new ImageLoader();
    image_loader.wait_for_complete(() => {
      console.log('all completed');
      let center_flag = is_centering();
      new Main(image_loader, center_flag);
    });
  }
}

window.onload = (event:Event) => {
  main.onload(event);
}
