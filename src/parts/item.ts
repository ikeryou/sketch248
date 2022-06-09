
import { MyDisplay } from "../core/myDisplay";
import { Tween } from "../core/tween";

// -----------------------------------------
//
// -----------------------------------------
export class Item extends MyDisplay {

  public size:number = 0;

  constructor(opt:any) {
    super(opt)

    this.size = opt.height;
    this.getEl().innerHTML = opt.text;

    Tween.instance.set(this.getEl(), {
      fontSize:opt.height * opt.kake
    })
  }

}