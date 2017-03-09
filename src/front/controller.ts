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
  type LockCandidate = _lock_candidate.LockCandidate;

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
  const NEXT_COUNT = points.NEXT_COUNT;

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

    constructor(private _game:Game, private _game_generator:() => Game, private _game_recorder:(controller:Controller) => void, private _is_perfect_lock:boolean, private _is_two_line_perfect:boolean=false, private _main_canvas:Canvas, private _dynamic_canvas:Canvas, lock_candidate:LockCandidate=new LockCandidate()) {
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
      this.commit();
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
      this._game.move_bottom();
      this.commit();
      this.update_searcher();
      this.update_all_canvas();
    }

    public commit(): void {
      this._game.commit();
      this.spawn();
      this._game_recorder(this);
    }

    public stock(): void {
      this.stock_game(this._game);
    }

    private stock_game(game:Game): void {
      if (MAX_UNDO <= this._stock_games.length)
        this._stock_games.shift();
      this._stock_games.push(game.pack());
    }

    public undo(): void {
      // hold済みなら元に戻して終了
      let is_changed = this._game.unhold();
      if (is_changed) {
        this.spawn();
        this.update_searcher();
        this.update_all_canvas();
        return;
      }

      // ストックがなければ履歴から作成する
      if (this._stock_games.length === 0) {
       this.undo_all();
     }

      // ストックがあれば元に戻す
      if (1 <= this._stock_games.length) {
        let packed = this._stock_games.pop();
        this._game = Game.unpack(packed);
      }
      this._game.respawn();
      this.spawn();
      this.update_searcher();
      this.update_all_canvas();
    }

    public restart(): void {
      this._game = this._game_generator();
      this.update_searcher();
      this.update_all_canvas();
    }

    public update_searcher(): void {
      let clear_line = this._is_two_line_perfect === true ? this._game.clear_line_count - 2 : this._game.clear_line_count;
      let lockable_max_y = this._is_perfect_lock ? 4 - (clear_line % 4) : 20;
      this._searcher = new LockSearcher(this._game.field, this._game.current_mino.type, lockable_max_y);
      this.update_candidates();
    }

    public update_candidates(): void {
      let current_mino = this._game.current_mino;
      let rotate = this._checkmate.get_main_rotation(current_mino.type, current_mino.rotate);
      let clear_line = this._is_two_line_perfect === true ? this._game.clear_line_count - 2 : this._game.clear_line_count;
      let lockable_max_y = this._is_perfect_lock ? 4 - (clear_line % 4) : 20;
      this._candidates = this._checkmate.get_next_candidates(this._searcher, rotate, lockable_max_y);
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

    private undo_all(): void {
      // まだ一度も置いていないとき
      if (this._game.steps.pop_count <= 1)
        return;

      let commit = this._game.commit_history;
      let order = this._game.get_order_history();

      let field = create_initial_field(23, FIELD_WIDTH);
      let steps = new Steps(order, this._game.steps.min_count, this._game.steps.bag_generator);
      let game = new Game(field, steps, this._game.appear_position);
      for (let index = 0; index < commit.length - 1; index++) {
        let c = commit[index];
        let type = c[0];
        let rotate = c[1];
        let x = c[2][0];
        let y = c[2][1];
        if (game.current_mino.type !== type)
          game.hold();
        game.teleport(x, y, rotate);
        game.commit();
        this.stock_game(game);
      }
    }

    public generate_tetfu_url(): string {
      // まだ一度も置いていないとき
      if (this._game.steps.pop_count <= 1)
        return undefined;

      let commit = this._game.commit_history;
      let order = this._game.get_order_history(NEXT_COUNT);

      let field = create_initial_field(23, FIELD_WIDTH);
      return encode_with_quiz(field, commit, order);
    }

    public check_perfect(): void {
      let perfect = (game:Game): PerfectStatus => {
        let field = game.field;
        let steps = game.steps;

        // 残りのブロック数を数える
        let clear_line = this._is_two_line_perfect === true ? this._game.clear_line_count - 2 : this._game.clear_line_count;
        let left_lines = 4 - (clear_line % 4);
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

    public get pop_count():number {
      return this._game.steps.pop_count;
    }

    public get is_two_line_perfect():boolean {
      return this._is_two_line_perfect;
    }
  }
}
