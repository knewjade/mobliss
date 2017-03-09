import {mino as _mino} from 'mino';

export namespace points {
  type Rotate = _mino.Rotate;

  let Rotate = _mino.Rotate;

  export enum Component {
    FIELD,
    HOLD,
    LEFT_ROTATE,
    RIGHT_ROTATE,
    RESET,
    UNDO,
    PERFECT,
    TETFU,
    NONE,
  }

  export const FIELD_HEIGHT = 20;
  export const FIELD_WIDTH = 10;
  export const NEXT_COUNT = 5;

  export const HEIGHT = 647;
  export const WIDTH = 375;

  export function get_touch_component(x:number, y:number): Component {
    let mod = field;
    if (checks_in_component(field, x, y)) {
      return Component.FIELD;
    } else if (checks_in_component(hold, x, y)) {
      return Component.HOLD;
    } else if (checks_in_component(left_rotate, x, y)) {
      return Component.LEFT_ROTATE;
    } else if (checks_in_component(right_rotate, x, y)) {
      return Component.RIGHT_ROTATE;
    } else if (checks_in_component(reset, x, y)) {
      return Component.RESET;
    } else if (checks_in_component(undo, x, y)) {
      return Component.UNDO;
    } else if (checks_in_component(perfect, x, y)) {
      return Component.PERFECT;
    } else if (checks_in_component(tetfu, x, y)) {
      return Component.TETFU;
    }

    return Component.NONE;
  }

  function checks_in_component(_module:any, x:number, y:number): boolean {
    return _module.LEFT_TOP[0] <= x && x < _module.RIGHT_BOTTOM[0] && _module.LEFT_TOP[1] <= y && y < _module.RIGHT_BOTTOM[1];
  }

  export module field {
    export const BLOCK_SIZE:number = 27;
    const HALF_BLOCK_SIZE:number = BLOCK_SIZE / 2.0;
    export const LEFT_TOP:[number, number] = [20, 20];
    export const RIGHT_BOTTOM:[number, number] = [LEFT_TOP[0] + BLOCK_SIZE * 10, LEFT_TOP[1] + BLOCK_SIZE * 20];

    export function each_block(xindex:number, yindex:number): [number, number] {
      return [LEFT_TOP[0] + xindex * BLOCK_SIZE, LEFT_TOP[1] + (19 - yindex) * BLOCK_SIZE];
    }

    export function back_index(x:number, y:number): [number, number, number] {
      let xindex = Math.floor((x - LEFT_TOP[0]) / BLOCK_SIZE);
      let yindex = 19 - Math.floor((y - LEFT_TOP[1]) / BLOCK_SIZE);

      let block_point = each_block(xindex, yindex);
      let center_point = [block_point[0] + HALF_BLOCK_SIZE, block_point[1] + HALF_BLOCK_SIZE];

      let dx = (x - center_point[0]) / HALF_BLOCK_SIZE;
      let dy = (y - center_point[1]) / HALF_BLOCK_SIZE;
      let distance = Math.sqrt(dx * dx + dy * dy);

      return [xindex, yindex, distance];
    }
  }

  export module next {
    export const BOX_SIZE:number = 50;
    export const HALF_BOX_SIZE:number = BOX_SIZE / 2.0;
    const LEFT_TOP:[number, number] = [305, 20];
    const MARGIN_BETWEEN_BOX:number= 15;

    export const POINT_SIZE:number = 8;
    export const POINT_BIAS:[number, number] = [3, 3];

    export function each_box(index:number): [number, number] {
      let diff = (BOX_SIZE + MARGIN_BETWEEN_BOX) * index;
      return [LEFT_TOP[0], LEFT_TOP[1] + diff];
    }
  }

  export module hold {
    export const BOX_SIZE:number = 50;
    export const HALF_BOX_SIZE:number = BOX_SIZE / 2.0;
    export const LEFT_TOP:[number, number] = [305, 510];
    export const RIGHT_BOTTOM:[number, number] = [LEFT_TOP[0] + BOX_SIZE, LEFT_TOP[1] + BOX_SIZE];
  }

  export module left_rotate {
    export const BOX_SIZE:number = 50;
    export const HALF_BOX_SIZE:number = BOX_SIZE / 2.0;
    export const LEFT_TOP:[number, number] = [180, 580];
    export const RIGHT_BOTTOM:[number, number] = [LEFT_TOP[0] + BOX_SIZE, LEFT_TOP[1] + BOX_SIZE];
  }

  export module right_rotate {
    export const BOX_SIZE:number = 50;
    export const HALF_BOX_SIZE:number = BOX_SIZE / 2.0;
    export const LEFT_TOP:[number, number] = [280, 580];
    export const RIGHT_BOTTOM:[number, number] = [LEFT_TOP[0] + BOX_SIZE, LEFT_TOP[1] + BOX_SIZE];
  }

  export module reset {
    export const BOX_SIZE:number = 50;
    export const HALF_BOX_SIZE:number = BOX_SIZE / 2.0;
    export const LEFT_TOP:[number, number] = [20, 580];
    export const RIGHT_BOTTOM:[number, number] = [LEFT_TOP[0] + BOX_SIZE, LEFT_TOP[1] + BOX_SIZE];
  }

  export module undo {
    export const BOX_SIZE:number = 50;
    export const HALF_BOX_SIZE:number = BOX_SIZE / 2.0;
    export const LEFT_TOP:[number, number] = [305, 450];
    export const RIGHT_BOTTOM:[number, number] = [LEFT_TOP[0] + BOX_SIZE, LEFT_TOP[1] + BOX_SIZE];
  }

  export module perfect {
    export const BOX_SIZE:number = 50;
    export const HALF_BOX_SIZE:number = BOX_SIZE / 2.0;
    export const LEFT_TOP:[number, number] = [305, 390];
    export const RIGHT_BOTTOM:[number, number] = [LEFT_TOP[0] + BOX_SIZE, LEFT_TOP[1] + BOX_SIZE];
  }

  export module tetfu {
    export const BOX_SIZE:number = 35;
    export const HALF_BOX_SIZE:number = BOX_SIZE / 2.0;
    export const LEFT_TOP:[number, number] = [305, 345];
    export const RIGHT_BOTTOM:[number, number] = [LEFT_TOP[0] + BOX_SIZE, LEFT_TOP[1] + BOX_SIZE];
  }
}
