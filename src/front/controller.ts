import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {game as _game} from 'game';
import {steps as _steps} from 'steps';
import {checkmate as _checkmate} from 'checkmate';
import {lock_searcher as _lock_searcher} from 'lock_searcher';
import {lock_candidate as _lock_candidate} from 'lock_candidate';
import {tetfu as _tetfu} from 'tetfu';

import {canvas as _canvas} from "front/canvas";
import {points as _points} from 'front/points';

export namespace controller {
  type Canvas = _canvas.Canvas;
  type Game = _game.Game;
  type Mino = _mino.Mino;
  type PositionType = _mino.PositionType;
  type Checkmate = _checkmate.Checkmate;
  type LockSearcher = _lock_searcher.LockSearcher;

  let Checkmate = _checkmate.Checkmate;
  let LockSearcher = _lock_searcher.LockSearcher;
  let LockCandidate = _lock_candidate.LockCandidate;
  let Steps = _steps.Steps;
  let Type = _mino.Type;
  let Game = _game.Game;

  let create_initial_field = _field.create_initial_field;
  let encode_with_quiz = _tetfu.encode_with_quiz;

  let points = _points;

  const MAX_UNDO:number = 20;

  const FIELD_HEIGHT = points.FIELD_HEIGHT;
  const FIELD_WIDTH = points.FIELD_WIDTH;

  export enum PerfectStatus {
    NOT_EXECUTE,
    FOUND,
    NOT_FOUND,
    NOT_FOUND_YET,
    STOPPED,
  }

  export class Controller {
    private _checkmate:Checkmate;
    private _candidates:PositionType[] = [];
    private _searcher:LockSearcher = null;
    private _stock_games:string[] = [];
    private _perfect_status:PerfectStatus = null;

    constructor(private _game:Game, private _game_generator:() => Game, private _game_recorder:(controller:Controller) => void, private _main_canvas:Canvas, private _dynamic_canvas:Canvas) {
      let lock_candidate = new LockCandidate();
      this._checkmate = new Checkmate(lock_candidate);

      this.spawn();
      this.update_searcher();
    }

    public spawn(): void {
      this._game.move_down();
    }

    public put(x:number, y:number): void {
      // console.log(x, y)

      if (this.candidates.map((e) => e[0] + e[1] * 10).indexOf(x + y * 10) === -1)
        return;

      // console.log('ok')

      let current_mino = this._game.current_mino;
      let rotate =  this._checkmate.get_main_rotation(current_mino.type, current_mino.rotate);

      this.stock();
      this._game.teleport(x, y, rotate);
      this._game.commit();
      this.spawn();
      this.update_searcher();
      this.update_all_canvas();
    }

    public hold(): void {
      let is_changed = this._game.hold();
      if (is_changed) {
        this.spawn();
        this.update_searcher();
        this.update_all_canvas();
      }
    }

    public move_left(): void {
      this._game.move_left();
      this.update_dynamic_canvas();
    }

    public move_right(): void {
      this._game.move_right();
      this.update_dynamic_canvas();
    }

    public move_down(): void {
      this._game.move_down();
      this.update_dynamic_canvas();
    }

    public rotate_left(): void {
      this._game.rotate_left();
      this.update_candidates();
      this.update_dynamic_canvas();
    }

    public rotate_right(): void {
      this._game.rotate_right();
      this.update_candidates();
      this.update_dynamic_canvas();
    }

    public harddrop(): void {
      this.stock();
      this._game.harddrop();
      this.spawn();
      this.update_searcher();
      this.update_all_canvas();
    }

    public stock(): void {
      if (MAX_UNDO <= this._stock_games.length)
        this._stock_games.shift();
      this._stock_games.push(this._game.pack());
      this._game_recorder(this);
    }

    public undo(): void {
      if (1 <= this._stock_games.length) {
        let packed = this._stock_games.pop();
        this._game = Game.unpack(packed);
      }
      this._game.respawn();
      this.update_searcher();
      this.update_all_canvas();
    }

    public restart(): void {
      this._game = this._game_generator();
      this.update_searcher();
      this.update_all_canvas();
    }

    public update_searcher(): void {
      this._searcher = new LockSearcher(this._game.field, this._game.current_mino.type, 4 - (this._game.clear_line_count % 4));
      this.update_candidates();
    }

    public update_candidates(): void {
      let current_mino = this._game.current_mino;
      let rotate = this._checkmate.get_main_rotation(current_mino.type, current_mino.rotate);
      this._candidates = this._checkmate.get_next_candidates(this._searcher, rotate, 4 - (this._game.clear_line_count % 4));
      this._perfect_status = PerfectStatus.NOT_EXECUTE;
    }

    public update_all_canvas(): void {
      this._main_canvas.update();
      this._dynamic_canvas.update();
    }

    public update_dynamic_canvas(): void {
      this._dynamic_canvas.update();
    }

    public get candidates(): PositionType[] {
      return this._candidates;
    }

    public get game(): Game {
      return this._game;
    }

    public get perfect_status(): PerfectStatus {
      return this._perfect_status;
    }

    public generate_tetfu_url(): string {
      // まだ一度も置いていないとき
      if (this._game.steps.order_history(0) === "")
        return;

      let commit = this._game.commit_history;
      let order = this._game.order_history;

      if (commit == [])
        return "";

      let field = create_initial_field(23, FIELD_WIDTH);
      return encode_with_quiz(field, commit, order);
    }

    public check_perfect(): void {
      let perfect = (game:Game): PerfectStatus => {
        let field = game.field;
        let steps = game.steps;

        // 残りのブロック数を数える
        let left_lines = 4 - (game.clear_line_count % 4);
        let left_count = 0;
        for (let y = 0; y < left_lines; y++)
          for (let x = 0; x < field.width; x++)
            if (field.get_block(x, y).type === Type.Empty)
              left_count += 1;

        // 条件を満たしていたら探索する
        let hold_type = game.hold_type;
        if (0 < left_count && (left_count <= 24 || (left_count === 28 && hold_type !== null)) && left_count % 4 == 0) {
          // 探索
          let lock_candidate = new LockCandidate();
          this._checkmate = new Checkmate(lock_candidate);
          let result = this._checkmate.search_perfect(field, [game.current_mino.type].concat(steps.next_types), game.hold_type, Math.floor(left_count / 4), left_lines, steps.is_held);

          if (result === true)
            return PerfectStatus.FOUND;
          else if (left_count === 28 && hold_type !== null)
          return PerfectStatus.NOT_FOUND_YET;
          else
            return PerfectStatus.NOT_FOUND;
        }
        return PerfectStatus.STOPPED;
      }

      this._perfect_status = perfect(this._game);
      this._dynamic_canvas.update();
    }
  }
}
