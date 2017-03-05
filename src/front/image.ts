import {mino as _mino} from 'mino';

export namespace image {
  type Type = _mino.Type;
  let Type = _mino.Type;

  let images: { [type: string] : HTMLImageElement } = {};
  images["Type:" + Type.S] = get_image("../img/green.png");
  images["Type:" + Type.Z] = get_image("../img/red.png");
  images["Type:" + Type.L] = get_image("../img/orange.png");
  images["Type:" + Type.J] = get_image("../img/blue.png");
  images["Type:" + Type.T] = get_image("../img/purple.png");
  images["Type:" + Type.O] = get_image("../img/yellow.png");
  images["Type:" + Type.I] = get_image("../img/sky.png");
  images["Type:" + Type.Empty] = get_image("../img/empty.png");
  images["Type:" + Type.Gray] = get_image("../img/gray.png");
  images["Candidate"] = get_image("../img/candidate.png");
  images["Arrow"] = get_image("../img/arrow.png");

  function get_image(path:string): HTMLImageElement {
    var image = new Image();
    image.src = path;
    return image;
  }

  function check(callback:() => void, wait_time:number=200): void {
    for (let image_key in images) {
      let image = images[image_key];
      if (image.complete === false) {
        setTimeout(check, wait_time, callback);
        return;
      }
    }
    callback();
  }

  export class ImageLoader {
    public wait_for_complete(callback:() => void) {
      setTimeout(check, 0, callback);
    }

    public get_block(type:Type): HTMLImageElement {
      return images["Type:" + type];
    }

    public get(key:string): HTMLImageElement {
      return images[key];
    }
  }
}
