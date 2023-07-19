import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

/** 좀 발전한 하급 닌자 */
export default class Lv2Player implements OmPlayer {
  public getDescription(): PlayerDescription {
    return {
      nickname: "Lv_2",
      tactics: "저는 구역으로 나눠서 랜덤으로 둡니다",
    };
  }
  public async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    const dividedFields = this.divideField(fieldsStatus.fields);
    const candidate = dividedFields.filter((v) =>
      v.fields.flat().some((v) => v === "")
    );
    candidate.sort(
      (a, b) =>
        b.fields.flat().filter((v) => v === yourFlag).length -
        a.fields.flat().filter((v) => v === yourFlag).length
    );

    let count = 0;
    let ranMax = 0;
    for (; ranMax < candidate.length - 1 && count < 5; ranMax++, count++) {}

    let ranIdx = this.getRandomInt(0, ranMax);
    const position = this.getRandomPosition(candidate[ranIdx].fields);

    console.log(position);
    console.dir(
      {
        x: position.x + candidate[ranIdx].x,
        y: position.y + candidate[ranIdx].y,
      },
      { depth: null }
    );
    return {
      x: position.x + candidate[ranIdx].x,
      y: position.y + candidate[ranIdx].y,
    };
  }

  private getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }

  private getRandomPosition = (fields: Fields): Position2D => {
    const yMax = fields.length;
    const xMax = fields.flat().length / yMax;
    let x = 0,
      y = 0;
    while (true) {
      x = this.getRandomInt(0, xMax);
      y = this.getRandomInt(0, yMax);
      if (fields[y][x] === "") break;
    }
    return {
      x,
      y,
    };
  };

  private divideField(
    fields: Fields,
    y = 0,
    x = 0
  ): { fields: Fields; y: number; x: number }[] {
    const yMax = fields.length;
    const xMax = fields.flat().length / yMax;
    const yMid = Math.round(yMax / 2);
    const xMid = Math.round(xMax / 2);

    if (yMax < 2 || xMax < 2) {
      return [{ fields, x, y }];
    }

    return [
      ...this.divideField(
        fields.reduce((prev, curr, idx) => {
          if (idx < yMid) {
            prev.push(curr.slice(0, xMid));
          }
          return prev;
        }, [] as Fields),
        y,
        x
      ),
      ...this.divideField(
        fields.reduce((prev, curr, idx) => {
          if (idx < yMid) {
            prev.push(curr.slice(xMid));
          }
          return prev;
        }, [] as Fields),
        y,
        x + xMid
      ),
      ...this.divideField(
        fields.reduce((prev, curr, idx) => {
          if (idx >= yMid) {
            prev.push(curr.slice(0, xMid));
          }
          return prev;
        }, [] as Fields),
        y + yMid,
        x
      ),
      ...this.divideField(
        fields.reduce((prev, curr, idx) => {
          if (idx >= yMid) {
            prev.push(curr.slice(xMid));
          }
          return prev;
        }, [] as Fields),
        y + yMid,
        x + xMid
      ),
    ];
  }
}
