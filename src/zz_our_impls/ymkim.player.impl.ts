import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

export default class Cactus implements OmPlayer {
  getDescription(): PlayerDescription {
    return {
      nickname: "기묭",
      tactics: "묭",
    };
  }
  async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    // ~~ 구현
    const max = fieldsStatus.fields.length;
    return {
      x: Math.floor(Math.floor(Math.random() * (max - 1) + 1)),
      y: Math.floor(Math.floor(Math.random() * (max - 1) + 1)),
    };
  }
}
