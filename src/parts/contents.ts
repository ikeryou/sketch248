
import { Bodies, Body, Composite, Composites, Constraint, Engine, Events, Mouse, MouseConstraint, Render, Runner } from "matter-js";
import { Func } from "../core/func";
import { MyDisplay } from "../core/myDisplay";
import { Tween } from "../core/tween";
import { Util } from "../libs/util";
import { Item } from "./item";

// -----------------------------------------
//
// -----------------------------------------
export class Contents extends MyDisplay {

  public engine:Engine;
  public render:Render;

  // 外枠
  private _frame:Array<Body> = [];

  private _stack:Array<Composite> = [];

  private _data:Array<any> = [
    {txt:'devdev Inc.', size:80},
    {txt:'devdev.Incはインタラクティブなデジタルコンテンツの開発をする会社です。', size:14},
    {txt:'プログラミングを使ったアニメーションやインタラクションの実装を得意としています。', size:14},
  ]

  // 表示用UIパーツ
  private _item:Array<Array<Item>> = [];


  constructor(opt:any) {
    super(opt)

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    // エンジン
    this.engine = Engine.create();

    // 重力方向変える
    this.engine.gravity.x = 1;
    this.engine.gravity.y = 0;

    // レンダラー
    this.render = Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        width: sw,
        height: sh,
        showAngleIndicator: false,
        showCollisions: false,
        showVelocity: false
      }
    });

    this._data.forEach((val,i) => {

      let txtArr = Array.from(val.txt);

      let group = Body.nextGroup(true);

      const stack = Composites.stack(60, 50 + [100, 270, 310][i], txtArr.length, 1, 0, 0, (x:any, y:any) => {
        return Bodies.rectangle(x, y, val.size, val.size, { collisionFilter: { group: group } });
      });

      Composites.chain(stack, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2, render: { type: 'line' } });
      Composite.add(stack, Constraint.create({
          bodyB: stack.bodies[0],
          pointB: { x: 0, y: 0 },
          pointA: { x: stack.bodies[0].position.x, y: stack.bodies[0].position.y },
          stiffness: 0.8
      }));

      Composite.add(this.engine.world, [
        stack,
      ]);
      this._stack.push(stack);

      // 表示用パーツ
      this._item[i] = []
      const num = stack.bodies.length;
      for(let l = 0; l < num; l++) {
        const el = document.createElement('div');
        el.classList.add('item');
        this.getEl().append(el);

        if(i == 0) {
          el.classList.add('-main');
        } else {
          el.classList.add('-sub');
        }

        const item = new Item({
          el:el,
          kake: (i == 0) ? 2 : 1.1,
          text: txtArr[l],
          width: val.size,
          height: val.size
        });
        this._item[i].push(item);
      }
    })

    console.log(this._item)




    // マウス
    const mouse = Mouse.create(this.render.canvas)
    const mouseConstraint = MouseConstraint.create(this.engine, {
      mouse:mouse,
    });
    Composite.add(this.engine.world, mouseConstraint);
    this.render.mouse = mouse;

    // run the renderer
    Render.run(this.render);

    // create runner
    const runner:Runner = Runner.create();

    // run the engine
    Runner.run(runner, this.engine);

    // 描画後イベント
    Events.on(this.render, 'afterRender', () => {
      this._eAfterRender();
    })



    this._resize();
  }


  private _eAfterRender(): void {

    // 物理演算結果をパーツに反映
    this._stack.forEach((val,i) => {
      val.bodies.forEach((val2,i2) => {
        const item = this._item[i][i2];
        const pos = val2.position
        if(i == 0) {
          Tween.instance.set(item.getEl(), {
            x:pos.x - item.size * 0.5 - [0,0,0,0,-5,0,0,30,  60,50,50,0][i2],
            y:pos.y - item.size * 1,
            rotationZ:Util.instance.degree(val2.angle),
          })
        } else {
          Tween.instance.set(item.getEl(), {
            x:pos.x - item.size * 0.5,
            y:pos.y - item.size * 1,
            rotationZ:Util.instance.degree(val2.angle),
          })
        }

      })
    })

  }


  private _makeFrame(): void {
    // 一旦破棄
    if(this._frame.length > 0) {
      Composite.remove(this.engine.world, this._frame[0])
      Composite.remove(this.engine.world, this._frame[1])
      Composite.remove(this.engine.world, this._frame[2])
      Composite.remove(this.engine.world, this._frame[3])
      this._frame = [];
    }

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    // 外枠
    const width = 100
    this._frame[0] = Bodies.rectangle(0, -width * 0, 9999, width, {isStatic:true});
    this._frame[1] = Bodies.rectangle(sw + width * 0 + 9999, 0, width, 9999, {isStatic:true}); // 最初引っかかるので今回はどけておく
    this._frame[2] = Bodies.rectangle(sw, sh + width * 0, 9999, width, {isStatic:true});
    this._frame[3] = Bodies.rectangle(-width * 0, 0, width, 9999, {isStatic:true});

    Composite.add(this.engine.world, [
      this._frame[0],
      this._frame[1],
      this._frame[2],
      this._frame[3],
    ])
  }


  protected _update(): void {
    super._update();
  }


  protected _resize(): void {
    super._resize();

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    this.render.canvas.width = sw;
    this.render.canvas.height = sh;

    this._makeFrame();
  }
}