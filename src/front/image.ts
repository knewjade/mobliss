import {mino as _mino} from 'mino';

export namespace image {
  type Type = _mino.Type;
  let Type = _mino.Type;

  export namespace Names {
    export const refresh = "Refresh";
    export const search = "Search";
    export const fumen = "Fumen";
    export const undo = "Undo";
    export const rotate_right = "RotateRight";
    export const rotate_left = "RotateLeft";
  }

  let images_paths:{ [type: string] : string } = {};
  images_paths["Type:" + Type.S] = "../img/green.png";
  images_paths["Type:" + Type.Z] = "../img/red.png";
  images_paths["Type:" + Type.L] = "../img/orange.png";
  images_paths["Type:" + Type.J] = "../img/blue.png";
  images_paths["Type:" + Type.T] = "../img/purple.png";
  images_paths["Type:" + Type.O] = "../img/yellow.png";
  images_paths["Type:" + Type.I] = "../img/sky.png";
  images_paths["Type:" + Type.Empty] = "../img/empty.png";
  images_paths["Type:" + Type.Gray] = "../img/gray.png";
  images_paths["Candidate"] = "../img/candidate.png";
  images_paths[Names.refresh] = "../img/refresh.png";
  images_paths[Names.search] = "../img/search.png";
  images_paths[Names.fumen] = "../img/fumen.png";
  images_paths[Names.undo] = "../img/undo.png";
  images_paths[Names.rotate_right] = "../img/rotate_right.png";
  images_paths[Names.rotate_left] = "../img/rotate_left.png";
  images_paths["Arrow"] = "../img/arrow.png";

  function wrap_load_image(key:string): Promise<[string, HTMLImageElement]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let image = new Image();
        image.onload = () => {
          resolve([key, image]);
        };
        image.src = images_paths[key];
      }, 0);
    });
  }

  export class ImageLoader {
    private _images:{ [type: string] : HTMLImageElement } = {};

    constructor(loaded_callback:() => void) {
      let keys:string[] = Object.keys(images_paths);
      this.load(keys, loaded_callback);
    }

    private load(keys:string[], loaded_callback:() => void): void {
      let loader:ImageLoader = this;
      Promise.all(keys.map((key) => wrap_load_image(key)))
        .then((objcts:[string, HTMLImageElement][]) => {
          for (let obj of objcts)
            loader._images[obj[0]] = obj[1];
          loaded_callback();
        })
        .catch((err:any) => { /* do nothing */ });
    }

    public get_block(type:Type): HTMLImageElement {
      return this._images["Type:" + type];
    }

    public get(key:string, width:number=100, height:number=100): HTMLImageElement {
      // let original = this._images[key];
      //
      // var oc = document.createElement('canvas'),
      //   octx = oc.getContext('2d');
      //
      // let steps = Math.min(
      //   Math.ceil(Math.log(original.width / width) / Math.log(2)),
      //   Math.ceil(Math.log(original.height / height) / Math.log(2)),
      // );
      //
      // if (steps <= 1)
      //   return original;
      //
      // oc.width  = original.width  * 0.5;
      // oc.height = original.height * 0.5;
      // octx.drawImage(original, 0, 0, oc.width, oc.height);
      //
      // if (steps === 1)
      //   return original;
      //
      // for (let count = 0; count < steps - 1; steps++) {
      //   octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);
      // }
      //
      //
      //
      // let new_key = key;
      // if (new_key in this._images)
      // console.log(this._images[key].width, this._images[key].height)

      return this._images[key];
    }
  }
}
