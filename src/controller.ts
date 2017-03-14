import {mino as _mino} from 'mino';
import {field as _field} from 'field';
import {game as _game} from 'game';
import {steps as _steps} from 'steps';
import {tetfu as _tetfu} from 'tetfu';
import {checkmate as _checkmate} from 'checkmate';
import {lock_candidate as _lock_candidate} from 'lock_candidate';
import {lock_searcher as _lock_searcher} from 'lock_searcher';

export namespace controller {
  type Game = _game.Game;
  type PositionType = _mino.PositionType;
  type LockCandidate = _lock_candidate.LockCandidate;
  type LockSearcher = _lock_searcher.LockSearcher;
  type Checkmate = _checkmate.Checkmate;

  let Game = _game.Game;
  let Type = _mino.Type;
  let Steps = _steps.Steps;
  let LockSearcher = _lock_searcher.LockSearcher;
  let LockCandidate = _lock_candidate.LockCandidate;
  let Checkmate = _checkmate.Checkmate;

  let create_initial_field = _field.create_initial_field
  let encode_with_quiz = _tetfu.encode_with_quiz;

  export type GameGenerator = () => Game;
  export type OperationCallbackType = (event_name:string, controller:Controller) => void;

  export type ControllerFlags = {
    max_undo_count:number,    // 保持する最大UNDO個数（同一Game内であればこの最大値によらずにUNDOできる）
    visible_field_height:number,    // 表示上のフィールドの縦のサイズ
    visible_field_width:number,    // 表示上のフィールドの横のサイズ
    next_count:number,
    is_candidate:boolean,   // 接着候補の表示
    is_perfect_candidate:boolean,    // 接着候補をパフェ用にする
    is_two_line_perfect:boolean,   // 2ラインパフェによる目標削除ラインを修正する
    game_generator:GameGenerator,
    bag_length:number,  // Bag 1巡分のミノ数
    operation_callback:OperationCallbackType,   // 操作後に呼ばれるcallback
  };

  export enum PerfectStatus {
    NotExecute,
    Found,
    NotFound,
    NotFoundYet,
    Stopped,
  }

  function pack(is_two_line_perfect:boolean, game:Game): string {
    let two_line_perfect = is_two_line_perfect ? "1" : "0";
    return two_line_perfect + game.pack();
  }

  function unpack(packed:string): [boolean, Game] {
    let is_two_line_perfect = packed[0] === "1";
    let game = Game.unpack(packed.slice(1));
    return [is_two_line_perfect, game];
  }

  export class Controller {
    private _candidates:PositionType[] = [];
    private _checkmate:Checkmate;
    private _searcher:LockSearcher = null;
    private _perfect_status:PerfectStatus = PerfectStatus.NotExecute;
    private _stock_games:string[] = [];

    constructor(private _game:Game, lock_candidate:LockCandidate, private _flags:ControllerFlags) {
      this._checkmate = new Checkmate(lock_candidate);
      this.spawn();
      this.update_searcher();
    }

    private spawn(): void {
      this.reset_perfect_status();
      this._game.respawn();
      this._game.move_down();
    }

    private update_searcher(): void {
      let max_y = this.get_max_y_for_candidate();
      this._searcher = new LockSearcher(this._game.field, this._game.current_mino.type, max_y);
      this.update_candidates();
    }

    private get_max_y_for_candidate(): number {
      let flags = this._flags;

      // 候補をパーフェクト用にしない場合はフィールド全体にする
      if (flags.is_perfect_candidate === false)
        return 20;
      // 候補をパーフェクト用にする場合
      else
        return this.get_max_y_for_perfect(this._game.clear_line_count, this._flags.is_two_line_perfect);
    }

    private get_max_y_for_perfect(clear_line_count:number, is_two_line_perfect:boolean): number {
      if (is_two_line_perfect === false)
        return 4 - (clear_line_count % 4);
      else
        return 4 - ((clear_line_count + 2) % 4);
    }

    private update_candidates(): void {
      let flags = this._flags;

      if (flags.is_candidate === true) {
        let current_mino = this._game.current_mino;
        let rotate = this._checkmate.get_main_rotation(current_mino.type, current_mino.rotate);
        let max_y = this.get_max_y_for_candidate();
        this._candidates = this._checkmate.get_next_candidates(this._searcher, rotate, max_y);
      }

      this._perfect_status = PerfectStatus.NotExecute;
    }

    public hold(): void {
      let is_changed = this._game.hold();
      if (is_changed) {
        this.spawn();
        this.update_searcher();
        this.callback_after_commit();
        this.reset_perfect_status();
      }
    }

    private reset_perfect_status(): void {
      this._perfect_status = PerfectStatus.NotExecute;
    }

    public harddrop(): void {
      this.stock();
      this._game.move_bottom();
      this.commit();
      this.update_searcher();
      this.callback_after_commit();
    }

    public move_left(): void {
      let is_changed = this._game.move_left();
      if (is_changed)
        this.callback_after_operate();
    }

    public move_right(): void {
      let is_changed = this._game.move_right();
      if (is_changed)
        this.callback_after_operate();
    }

    public move_down(): void {
      let is_changed = this._game.move_down();
      if (is_changed)
        this.callback_after_operate();
    }

    public rotate_left(): void {
      this._game.rotate_left();
      this.update_candidates();
      this.callback_after_operate();
    }

    public rotate_right(): void {
      this._game.rotate_right();
      this.update_candidates();
      this.callback_after_operate();
    }

    private callback_after_operate(): void {
      this._flags.operation_callback('operate', this);
    }

    public put(x:number, y:number): void {
      // 候補にない位置が指定された時は何もしない
      if (this._candidates.map((e) => e[0] + e[1] * 10).indexOf(x + y * 10) === -1)
        return;

      let current_mino = this._game.current_mino;
      let rotate =  this._checkmate.get_main_rotation(current_mino.type, current_mino.rotate);

      this.stock();
      this._game.teleport(x, y, rotate);
      this.commit();
      this.update_searcher();
      this.callback_after_commit();
    }

    private stock(): void {
      this.stock_game(this._flags.is_two_line_perfect, this._game);
    }

    private stock_game(is_two_line_perfect:boolean, game:Game): void {
      let flags = this._flags;

      if (flags.max_undo_count <= this._stock_games.length)
        this._stock_games.shift();
      this._stock_games.push(pack(is_two_line_perfect, game));
    }

    private commit(): void {
      let flags = this._flags;
      let game = this._game;

      game.commit();

      // パーフェクトしたとき clear line % 4 が 2 なら、2ラインパフェフラグをたてる
      if (game.field.is_perfect == true)
        flags.is_two_line_perfect = game.clear_line_count % 4 === 2;

      this.spawn();
    }

    private callback_after_commit(): void {
      this._flags.operation_callback('commit', this);
    }

    // TODO: write unittest: restartしたら2lineパフェの記録が消えることを確認
    public restart(): void {
      let flags = this._flags;

      this.stock();
      this._game = flags.game_generator();
      this.update_searcher();
      this.spawn();
      flags.operation_callback('commit', this);
    }

    public generate_tetfu(): string {
      // まだ一度も置いていないとき
      if (this._game.steps.pop_count <= 1)
        return undefined;

      let flags = this._flags;
      let commits = this._game.commit_history;
      let order = this._game.get_order_history(flags.next_count);

      let field = create_initial_field(23, 10);
      return encode_with_quiz(field, commits, order);
    }

    public check_perfect(): void {
      // 実行済みならスキップする
      if (this._perfect_status !== PerfectStatus.NotExecute)
        return;

      let next_count = this._flags.next_count;
      let perfect_function = (game:Game, max_y:number): PerfectStatus => {
        let field = game.field;
        let steps = game.steps;
        let hold_type = game.hold_type;

        // 残りのブロック数を数える
        let left_blocks = 0;
        for (let y = 0; y < max_y; y++)
          for (let x = 0; x < field.width; x++)
            if (field.get_block(x, y).type === Type.Empty)
              left_blocks += 1;

        // 指定した高さ内でつくることができない場合
        if (left_blocks <= 0 || left_blocks % 4 != 0)
          return PerfectStatus.Stopped;

        // 条件を満たしていたら探索する
        if (left_blocks <= 4 * (next_count + 1) || (left_blocks === 4 * (next_count + 2) && hold_type !== null)) {
          // 探索
          let lock_candidate = new LockCandidate();
          let checkmate = new Checkmate(lock_candidate);
          let order = [game.current_mino.type].concat(steps.next_types);
          let max_mino_count = Math.floor(left_blocks / 4);
          let result = checkmate.search_perfect(field, order, game.hold_type, max_mino_count, max_y, steps.is_held);

          // 結果
          if (result === true)
            return PerfectStatus.Found;
          else if (left_blocks === 4 * (next_count + 2) && hold_type !== null)
            return PerfectStatus.NotFoundYet;   // 現状パフェはできない。ただし、次のミノがみえないため、ツモ次第で結果が変わる可能性がある
          else
            return PerfectStatus.NotFound;
        }
        return PerfectStatus.Stopped;
      };

      let max_y = this.get_max_y_for_perfect(this._game.clear_line_count, this._flags.is_two_line_perfect);
      this._perfect_status = perfect_function(this._game, max_y);
      this._flags.operation_callback('perfect', this);
    }

    public undo(): void {
      let flags = this._flags;

      // hold済みなら元に戻して終了
      let is_changed = this._game.unhold();
      if (is_changed) {
        this.spawn();
        this.update_searcher();
        flags.operation_callback('commit', this);
        return;
      }

      // ストックがなければ履歴から作成する
      if (this._stock_games.length === 0) {
       this.undo_all();
     }

      // ストックがあれば元に戻す
      if (1 <= this._stock_games.length) {
        let packed = this._stock_games.pop();
        let unpacked = unpack(packed);
        flags.is_two_line_perfect = unpacked[0];
        this._game = unpacked[1];
      }
      this.spawn();
      this.update_searcher();
      flags.operation_callback('commit', this);
    }

    // TODO: write unittest: undoしたら2lineパフェの記録が戻ることを確認
    private undo_all(): void {
      // まだ一度も置いていないとき
      if (this._game.steps.pop_count <= 1)
        return;

      // 最初の状態を作成
      let field = create_initial_field(23, 10);
      let order = this._game.get_order_history();
      let steps = new Steps(order, this._game.steps.min_count, this._game.steps.bag_generator);
      let game = new Game(field, steps, this._game.appear_position);

      // 操作履歴を取得
      let commits = this._game.commit_history;

      // 実際の操作を再現
      let commits_length = commits.length - 1;
      let max_undo_count = this._flags.max_undo_count;
      let is_two_line_perfect = false;
      for (let index = 0; index < commits_length; index++) {
        // Undo記録対象の範囲なら記録
        if (commits_length - max_undo_count - 1<= index)
          this.stock_game(is_two_line_perfect, game);

        let commit = commits[index];
        let type = commit[0];
        let rotate = commit[1];
        let x = commit[2][0];
        let y = commit[2][1];

        // 現在のミノと実際に置いたミノが違うときは、Holdと判断
        if (game.current_mino.type !== type)
          game.hold();

        // 実際に置く
        game.teleport(x, y, rotate);
        game.commit();

        // パーフェクトしたとき clear line % 4 が 2 なら、2ラインパフェフラグをたてる
        if (game.field.is_perfect == true)
          is_two_line_perfect = game.clear_line_count % 4 === 2;
      }

      // 最後の状態を記録
      this.stock_game(is_two_line_perfect, game);
    }

    // TODO: write unittest
    public pack(): string {
      return pack(this._flags.is_two_line_perfect, this._game);
    }

    public get game(): Game {
      return this._game;
    }

    public get candidates(): PositionType[] {
      return this._candidates;
    }

    public get perfect_status(): PerfectStatus {
      return this._perfect_status;
    }

    // TODO: write unittest
    public get pop_count(): number {
      return this._game.steps.pop_count;
    }

    // TODO: write unittest
    public is_top_in_bag(next_index:number): boolean {
      let bag_length = this._flags.bag_length;
      return (this.pop_count + next_index) % bag_length === 0;
    }

    // TODO: write unittest
    public is_top_in_perfect_cycle(next_index:number): boolean {
      let cycle_top_count = this._flags.is_two_line_perfect === true ? 5 : 0;
      return (this.pop_count + next_index) % 10 === cycle_top_count;
    }

    // TODO: write unittest
    static unpack(packed:string, lock_candidate:LockCandidate, flags:ControllerFlags): Controller {
      let unpacked = unpack(packed);
      flags.is_two_line_perfect = unpacked[0];
      return new Controller(unpacked[1], lock_candidate, flags);
    }
  }
}
