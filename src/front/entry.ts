import {params as _params} from 'params';

import {play as _play} from 'front/play';

declare var window:any;

namespace entry {
  enum FormType {
    Radio,
    Select,
    Checkbox,
    Text,
    Custom,
  }

  type Params = _params.Params;

  let Params = _params.Params;

  const DEFAULT_ORDER_VALUE = _params.DEFAULT_ORDER_VALUE;

  namespace index {
    declare var document:any;

    var SESSION_PARAMS_NAME = "Params";

    type ToFormFuncType = (params:Params) => any;
    type ToParamFuncType = (params:Params, value:any) => void;

    type ParamDefineType = {
      type: FormType,
      form_name: string,
      to_value: ToFormFuncType,
      to_param: ToParamFuncType,
    };

    // 変換関数の定義
    // 戻り値の型: 代入先のフォームの型
    let get_rotate = (param_name:string):ToFormFuncType => {
      return (params:any):string => Params.parse_rotate_to_string(params[param_name]);
    };
    let get_field_type = (param_name:string):ToFormFuncType => {
      return (params:any):string => Params.parse_field_type_to_string(params[param_name]);
    };
    let get_string = (param_name:string):ToFormFuncType => {
      return (params:any):string => params[param_name];
    };
    let get_boolean = (param_name:string):ToFormFuncType => {
      return (params:any):boolean => params[param_name];
    };
    let get_integer = (param_name:string):ToFormFuncType => {
      return (params:any):number => params[param_name];
    };

    // valueの型: 代入先のフォームの型
    let set_rotate = (param_name:string):ToParamFuncType => {
      return (params:any, value:string):void => { params[param_name] = Params.parse_to_rotate(value); };
    };
    let set_field_type = (param_name:string):ToParamFuncType => {
      return (params:any, value:string):void => { params[param_name] = Params.parse_to_field_type(value); };
    };
    let set_string = (param_name:string):ToParamFuncType => {
      return (params:any, value:string):void => { params[param_name] = value; };
    };
    let set_boolean = (param_name:string):ToParamFuncType => {
      return (params:any, value:boolean):void => { params[param_name] = value; };
    };
    let set_integer = (param_name:string):ToParamFuncType => {
      return (params:any, value:number):void => { params[param_name] = value; };
    };

    // フォーム化の定義
    // 管理上の名前 => フォームの種類・フォーム名・各変換関数
    let form_defines:{ [name:string]: ParamDefineType } = {
      "PivotSH": {
        type: FormType.Radio, form_name: "pivot_s_h", to_value: get_rotate("pivot_s_h"), to_param: set_rotate("pivot_s_h")
      },
      "PivotSV": {
        type: FormType.Radio, form_name: "pivot_s_v", to_value: get_rotate("pivot_s_v"), to_param: set_rotate("pivot_s_v")
      },
      "PivotZH": {
        type: FormType.Radio, form_name: "pivot_z_h", to_value: get_rotate("pivot_z_h"), to_param: set_rotate("pivot_z_h")
      },
      "PivotZV": {
        type: FormType.Radio, form_name: "pivot_z_v", to_value: get_rotate("pivot_z_v"), to_param: set_rotate("pivot_z_v")
      },
      "PivotIH": {
        type: FormType.Radio, form_name: "pivot_i_h", to_value: get_rotate("pivot_i_h"), to_param: set_rotate("pivot_i_h")
      },
      "PivotIV": {
        type: FormType.Radio, form_name: "pivot_i_v", to_value: get_rotate("pivot_i_v"), to_param: set_rotate("pivot_i_v")
      },
      "PivotO": {
        type: FormType.Radio, form_name: "pivot_o", to_value: get_rotate("pivot_o"), to_param: set_rotate("pivot_o")
      },
      "FieldType": {
        type: FormType.Select, form_name: "field_type", to_value: get_field_type("field_type"), to_param: set_field_type("field_type")
      },
      "OrderType": {
        type: FormType.Custom, form_name: null, to_value: get_string("order_type"), to_param: set_string("order_type")
      },
      "CandidateVisibleFlag": {
        type: FormType.Checkbox, form_name: "candidate_visible", to_value: get_boolean("candidate_visible"), to_param: set_boolean("candidate_visible")
      },
      "CandidateLimitPerfectFlag": {
        type: FormType.Checkbox, form_name: "candidate_limit_perfect", to_value: get_boolean("candidate_limit_perfect"), to_param: set_boolean("candidate_limit_perfect")
      },
      "BagMarkFlag": {
        type: FormType.Checkbox, form_name: "bag_mark", to_value: get_boolean("bag_mark"), to_param: set_boolean("bag_mark")
      },
      "PerfectMarkFlag": {
        type: FormType.Checkbox, form_name: "perfect_mark", to_value: get_boolean("perfect_mark"), to_param: set_boolean("perfect_mark")
      },
      "KeyboardEnableFlag": {
        type: FormType.Checkbox, form_name: "keyboard_enable", to_value: get_boolean("keyboard_enable"), to_param: set_boolean("keyboard_enable")
      },
      "KeybindMoveRight": {
        type: FormType.Text, form_name: "move_right", to_value: get_string("keybind_move_right"), to_param: set_string("keybind_move_right")
      },
      "KeybindMoveLeft": {
        type: FormType.Text, form_name: "move_left", to_value: get_string("keybind_move_left"), to_param: set_string("keybind_move_left")
      },
      "KeybindMoveDown": {
        type: FormType.Text, form_name: "move_down", to_value: get_string("keybind_move_down"), to_param: set_string("keybind_move_down")
      },
      "KeybindHarddrop": {
        type: FormType.Text, form_name: "harddrop", to_value: get_string("keybind_harddrop"), to_param: set_string("keybind_harddrop")
      },
      "KeybindRotateRight": {
        type: FormType.Text, form_name: "rotate_right", to_value: get_string("keybind_rotate_right"), to_param: set_string("keybind_rotate_right")
      },
      "KeybindRotateLeft": {
        type: FormType.Text, form_name: "rotate_left", to_value: get_string("keybind_rotate_left"), to_param: set_string("keybind_rotate_left")
      },
      "KeybindHold": {
        type: FormType.Text, form_name: "hold", to_value: get_string("keybind_hold"), to_param: set_string("keybind_hold")
      },
      "KeybindRestart": {
        type: FormType.Text, form_name: "restart", to_value: get_string("keybind_restart"), to_param: set_string("keybind_restart")
      },
      "KeybindUndo": {
        type: FormType.Text, form_name: "undo", to_value: get_string("keybind_undo"), to_param: set_string("keybind_undo")
      },
      "NextCount": {
        type: FormType.Text, form_name: "next_count", to_value: get_integer("next_count"), to_param: set_integer("next_count")
      },
      "MaxDAS": {
        type: FormType.Text, form_name: "max_das", to_value: get_integer("max_das"), to_param: set_integer("max_das")
      },
      "DASDelay": {
        type: FormType.Text, form_name: "das_delay", to_value: get_integer("das_delay"), to_param: set_integer("das_delay")
      },
    };

    export function entry(e:Event): void {
      // 過去の設定を読み込む
      let session_params = localStorage.getItem(SESSION_PARAMS_NAME);
      console.log("Session:", SESSION_PARAMS_NAME, session_params);

      try {
        // パラメータ化
        let params = new Params(session_params);

        // フォームに値を反映
        update_form(params);
      } catch (e) {
        console.error('Error: ' + e);
      }

      window.submit = submit;
    }

    function update_form(params:Params): void {
      for (let key in form_defines) {
        let define = form_defines[key];

        // フォームのプロパティの決める
        let property_name = 'value';
        if (define.type === FormType.Checkbox)
          property_name = 'checked';

        // console.log(key);
        // if (key !== 'OrderType')
        //   console.log(document.forms.settings[define.form_name][property_name]);

        // 実際に反映させる
        if (define.type === FormType.Custom) {
          if (key === 'OrderType') {
            let order = define.to_value(params);
            if (params.is_default_order) {
              document.forms.settings.order_type.value = 'Default';
            } else {
              document.forms.settings.order_type.value = 'Custom';
              document.forms.settings.custom_order.value = order;
            }
          }
        } else {
          document.forms.settings[define.form_name][property_name] = define.to_value(params);
        }
      }
    }

    function submit(): void {
      // console.log('submit');

      // フォームから値を取得
      let params = new Params();
      for (let key in form_defines) {
        let define = form_defines[key];

        // フォームのプロパティの決める
        let property_name = 'value';
        if (define.type === FormType.Checkbox)
          property_name = 'checked';

        // 現在の値を取得する
        if (define.type === FormType.Custom) {
          if (key === 'OrderType') {
            if (document.forms.settings.order_type.value === 'Default')
              define.to_param(params, DEFAULT_ORDER_VALUE);
            else
              define.to_param(params, document.forms.settings.custom_order.value);
          }
        } else {
          define.to_param(params, document.forms.settings[define.form_name][property_name]);
        }
      }

      let text = params.text;
      localStorage.setItem(SESSION_PARAMS_NAME, text);
      console.log(text);

      window.open('play.html?' + text, '_blank');
    }
  }

  namespace jump {
    export function entry(e:Event): void {
      var param = location.search.substr(2);
      var div = document.getElementById("link");

      if (param.slice(0, 4) !== "115@") {
        document.body.innerHTML = 'parameter error';
        return;
      }

      var link_div = document.getElementById("link");

      var targets:{ [name:string]: string } = {
        'Edit': "http://fumen.zui.jp/?v",
        'List': "http://fumen.zui.jp/?d",
        'View': "http://fumen.zui.jp/?m",
      };

      for (var target in targets) {
        var div:HTMLElement = document.createElement("div");
        div.className = "col-xs-3 col-sm-3 col-md-2 col-lg-2";

        var a:HTMLAnchorElement = document.createElement("a");
        a.href = targets[target] + param;
        a.target = "_top";
        a.style.fontSize = "xx-large";
        a.style.color = "#ffffff";
        a.innerHTML = '<span class="bg-primary">[' + target + ']</span>';

        div.appendChild(a);
        link_div.appendChild(div);
      }

      var frame:HTMLFrameElement = <HTMLFrameElement>document.getElementById("tetfu");
      frame.width = 550;
      frame.height = window.innerHeight;
      frame.src = targets["List"] + param;
    }
  }

  namespace play {
    export function entry(e:Event): void {
      _play.entry(e);
    }
  }

  // Entry pointの定義
  export function entry_point(): any {
    return {
      index: index.entry,
      play: play.entry,
      jump: jump.entry,
    };
  }
}

// HTMLからEntry pointへアクセスできるように公開する
window.entry_point = entry.entry_point();
