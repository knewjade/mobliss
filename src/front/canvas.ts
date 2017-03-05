export namespace canvas {
  export class Canvas {
    private _canvas:HTMLCanvasElement;
    private _context:CanvasRenderingContext2D;
    private _left_top: [number, number];
    private _scale: number;
    private _event: (canvas:Canvas) => void = undefined;

    constructor(id:string, private _canvas_size:[number, number], private _screen_size:[number, number], private _is_centering:boolean) {
      this._canvas = this.get_canvas(id);
      this._canvas.width = _canvas_size[0];
      this._canvas.height = _canvas_size[1];
      this._context = this._canvas.getContext('2d');

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
      this._event = draw_event;
    }

    public update(callback:() => void=undefined): void {
      if (this._event === undefined)
        return;

      setTimeout((canvas:Canvas) => {
        canvas.clear();
        this._event(canvas);
        if (callback)
          callback();
      }, 0, this);
    }

    public draw_image(image:HTMLImageElement, x:number, y:number, width:number, height:number): void;
    public draw_image(image:HTMLImageElement, x:number, y:number, width:number, height:number, alpha:number): void;

    public draw_image(image:HTMLImageElement, x:number, y:number, width:number, height:number, alpha?:number): void {
      if (alpha !== undefined)
        this._context.globalAlpha = alpha;

      let scale = this._scale;
      this._context.drawImage(image, scale * x + this._left_top[0], scale * y + this._left_top[1], scale * width, scale * height);

      this._context.globalAlpha = 1.0;
    }

    public draw_box(xy:[number, number], size:number, color:string): void {
      this.draw_rect(xy[0], xy[1], size, size, color);
    }

    private draw_rect(x:number, y:number, width:number, height:number, color:string): void {
      this.fill_rect(x, y, width, height, color);
    }

    public fill_rect(x:number, y:number, width:number, height:number, color:string, alpha?:number): void {
      if (alpha !== undefined)
        this._context.globalAlpha = alpha;

      this._context.fillStyle = color;
      let scale = this._scale;
      this._context.fillRect(scale * x + this._left_top[0], scale * y + this._left_top[1], scale * width, scale * height);

      this._context.globalAlpha = 1.0;
    }

    public clear(): void {
      this._context.clearRect(0, 0, this._canvas_size[0], this._canvas_size[1]);
    }

    public get screen_width(): number {
      return this._screen_size[0];
    }

    public get screen_height(): number {
      return this._screen_size[1];
    }

    public addEventListener(type:string, listner:any, useCapture:boolean): void {
      this._canvas.addEventListener(type, listner, useCapture);
    }

    public transpose_position_to_screen(canvas_x:number, canvas_y:number): [number, number] {
      return [(canvas_x - this._left_top[0]) / this._scale, (canvas_y - this._left_top[1]) / this._scale];
    }
  }
}
