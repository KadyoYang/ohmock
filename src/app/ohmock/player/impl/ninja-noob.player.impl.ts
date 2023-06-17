import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
} from "../om.common.dto";
import { OmPlayer } from "../om.player.interface";

/** 하급 닌자 */
export default class NinjaNoob implements OmPlayer {
  count = 1;
  public getDescription(): PlayerDescription {
    return {
      nickname: "컴퓨터_하급",
      tactics: "랜덤으로 아무대나 둡니다. 행운은 언제나 그곳에",
    };
  }
  public async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    const position = this.getRandomPosition(fieldsStatus.fields);
    console.log(this.count++);
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
