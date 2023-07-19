import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

/** 하급 닌자 */
export default class Lv1Player implements OmPlayer {
  count = 1;
  public getDescription(): PlayerDescription {
    return {
      nickname: "Lv_1",
      tactics: "랜덤으로 둡니다",
    };
  }
  public async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    const position = this.getRandomPosition(fieldsStatus.fields);
    return position;
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
}
