export namespace canvas {
  // for debug
  function wait(time:number=100) {
    var time1 = new Date().getTime();
    var time2 = new Date().getTime();

    while ((time2 -  time1)<time){
        time2 = new Date().getTime();
    }
  }

  export class Canvas {
    private _canvases:HTMLCanvasElement[] = [];
    private _visible_canvas_index:number = 0;
    private _back_canvas_index:number = 1;
    private _drawing_context:CanvasRenderingContext2D;
    private _left_top: [number, number];
    private _scale: number;
    private _draw_events: ((canvas:Canvas) => void)[] = [];
    private _update_counter:number = 0;

    constructor(id:string, private _canvas_size:[number, number], private _screen_size:[number, number], private _is_centering:boolean, private _is_double_buffring:boolean=true) {
      let canvas = this.get_canvas(id);
      canvas.width = this._canvas_size[0];
      canvas.height = this._canvas_size[1];
      this._canvases.push(canvas);

      if (this._is_double_buffring === true) {
        let canvas_back = this.get_canvas(id + "_second");
        canvas_back.width = this._canvas_size[0];
        canvas_back.height = this._canvas_size[1];
        this._canvases.push(canvas_back);
      }

      for (let canvas of this._canvases) {
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      this._canvases[this._visible_canvas_index].style.visibility = 'visible';
      if (this._is_double_buffring === true) {
        this._canvases[this._back_canvas_index].style.visibility = 'hidden';
        this._drawing_context = this._canvases[this._back_canvas_index].getContext('2d');
      } else {
        this._drawing_context = this._canvases[this._visible_canvas_index].getContext('2d');
      }


      let scaleX = _canvas_size[0] / _screen_size[0];
      let scaleY = _canvas_size[1] / _screen_size[1];

      if (_is_centering === false) {
        this._scale = Math.min(scaleX, scaleY);
        this._left_top = [0, 0];
      } else if (scaleX < scaleY) {
        // 横にあわせる (縦が余る)
        let margin = _canvas_size[1] - _screen_size[1] * scaleX;
        this._scale = scaleX;
        this._left_top = [0, margin / 2];
      } else {
        // 縦にあわせる (横が余る)
        let margin = _canvas_size[0] - _screen_size[0] * scaleY;
        this._scale = scaleY;
        this._left_top = [margin / 2, 0];
      }
    }

    private get_canvas(id:string): HTMLCanvasElement {
      return <HTMLCanvasElement> document.getElementById(id);
    }

    public add_draw_event(draw_event:(canvas:Canvas) => void) {
      this._draw_events.push(draw_event);
    }

    public add_draw_events(draw_events:((canvas:Canvas) => void)[]) {
      this._draw_events = this._draw_events.concat(draw_events);
    }

    private wrap_clear_event(obj:[Canvas, number]): Promise<[Canvas, number]> {
      let canvas = obj[0];
      return canvas.wrap_draw_event((canvas:Canvas) => canvas.clear())(obj)
    }

    private wrap_draw_event(event:(canvas:Canvas) => void): (obj:[Canvas, number]) => Promise<[Canvas, number]> {
      return (obj:[Canvas, number]) => {
        let canvas = obj[0];
        let counter = obj[1];
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (counter !== canvas._update_counter) {
              reject(obj);
              return;
            }

            event(canvas);
            resolve(obj);
          }, 0);
        });
      };
    }

    public update(callback:() => void=undefined): void {
      if (this._draw_events == [])
        return;

      let wrap_clear_event = this.wrap_clear_event;
      let wrap_draw_event = this.wrap_draw_event;
      this._update_counter += 1;

      let current_counter = this._update_counter;
      setTimeout((canvas:Canvas) => {
        // キャンバスの消去
        let promise = wrap_clear_event([canvas, current_counter]);

        // 各描画処理を実行
        // 次の描画が割り込まれた時は停止する
        for (let draw_event of this._draw_events)
          promise = promise.then(wrap_draw_event(draw_event));

        // 描画成功時・失敗時の処理
        promise
          .then((data:[Canvas, number]): void => {
            if (this._is_double_buffring === true) {
              // canvasを切り替える
              this._canvases[this._visible_canvas_index].style.visibility = 'hidden';
              this._canvases[this._back_canvas_index].style.visibility = 'visible';

              this._visible_canvas_index = this._back_canvas_index;
              this._back_canvas_index = (this._back_canvas_index + 1) % this._canvases.length;
              this._drawing_context = this._canvases[this._back_canvas_index].getContext('2d');
            }

            if (callback)
              callback();
          })
          .catch((data:any): void => { /* do nothing */ });
      }, 0, this);
    }

    public draw_image(image:HTMLImageElement, x:number, y:number, width:number, height:number): void;
    public draw_image(image:HTMLImageElement, x:number, y:number, width:number, height:number, alpha:number): void;

    public draw_image(image:HTMLImageElement, x:number, y:number, width:number, height:number, alpha?:number): void {
      if (alpha !== undefined)
        this._drawing_context.globalAlpha = alpha;

      let scale = this._scale;
      this._drawing_context.drawImage(image, scale * x + this._left_top[0], scale * y + this._left_top[1], scale * width, scale * height);

      this._drawing_context.globalAlpha = 1.0;
    }

    public draw_box(xy:[number, number], size:number, color:string): void {
      this.fill_rect(xy[0], xy[1], size, size, color);
    }

    private draw_rect(x:number, y:number, width:number, height:number, color:string): void {
      this.fill_rect(x, y, width, height, color);
    }

    public fill_rect(x:number, y:number, width:number, height:number, color:string, alpha?:number): void {
      if (alpha !== undefined)
        this._drawing_context.globalAlpha = alpha;

      this._drawing_context.fillStyle = color;
      let scale = this._scale;
      this._drawing_context.fillRect(scale * x + this._left_top[0], scale * y + this._left_top[1], scale * width, scale * height);

      if (alpha !== undefined)
        this._drawing_context.globalAlpha = 1.0;
    }

    public clear(): void {
      let left = this._left_top[0];
      let top = this._left_top[1];
      this._drawing_context.clearRect(left, top, this._canvas_size[0] - left, this._canvas_size[1] - top);
    }

    public get screen_width(): number {
      return this._screen_size[0];
    }

    public get screen_height(): number {
      return this._screen_size[1];
    }

    public addEventListener(type:string, listner:any, useCapture:boolean): void {
      this._canvases[0].addEventListener(type, listner, useCapture);
    }

    public transpose_position_to_screen(canvas_x:number, canvas_y:number): [number, number] {
      return [(canvas_x - this._left_top[0]) / this._scale, (canvas_y - this._left_top[1]) / this._scale];
    }
  }
}
