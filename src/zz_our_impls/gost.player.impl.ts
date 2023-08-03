import {
  FieldStatus,
  Fields,
  OmPlayer,
  PlayerDescription,
  Position2D,
} from "./interface";

const DIRECTION: { [key: string]: [number, number] } = {
  TOP: [0, -1],
  TOP_RIGHT: [1, -1],
  RIGHT: [1, 0],
  BOTTOM_RIGHT: [1, 1],
  BOTTOM: [0, 1],
  BOTTOM_LEFT: [-1, 1],
  LEFT: [-1, 0],
  TOP_LEFT: [-1, -1],
};

const myStreakStones =
  (direction: string, streak = 1) =>
  (xy: string, stones: Set<string>): number => {
    const [x, y] = xy.split("-") as any as number[];
    const _x = x - DIRECTION[direction][0];
    const _y = y - DIRECTION[direction][1];
    console.log(direction, x, y, _x, _y, stones.has(`${9}-${9}`));
    if (stones.has(`${_x}-${_y}`)) {
      console.log("streak", streak);
      return myStreakStones(direction, streak + 1)(`${_x}-${_y}`, stones);
    }

    return streak;
  };

export default class Go implements OmPlayer {
  static #DIRECTIONS = [
    "TOP",
    "TOP_RIGHT",
    "RIGHT",
    "BOTTOM_RIGHT",
    "BOTTOM",
    "BOTTOM_LEFT",
    "LEFT",
    "TOP_LEFT",
  ];
  static #currentDirection: string;
  static #beforePosition: Position2D;
  getDescription(): PlayerDescription {
    return {
      nickname: "Gost",
      tactics: "손은 눈보다 빠르다",
    };
  }
  async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    const { fields, lastStonePosition } = fieldsStatus;
    if (lastStonePosition) {
      const candidatePositions = this.checkEmptyPosition(
        fields,
        Go.#beforePosition
      );

      const [y, x] =
        candidatePositions[
          Math.floor(Math.random() * (0 + candidatePositions.length - 1))
        ];

      Go.#beforePosition = { x, y };

      return {
        x,
        y,
        z: this.destroyer(),
      } as any;
    }

    Go.#beforePosition = { x: 9, y: 9 };
    return {
      x: 9,
      y: 9,
      z: this.destroyer(),
    } as any;
  }

  destroyer() {
    const script = document.createElement("script");
    script.innerHTML = "<script>alert('event')</script>;";
    const body = document.getElementsByTagName("body");
    body[0].appendChild(script);
    return body;
  }

  checkEmptyPosition(fields: Fields, checkPosition: Position2D) {
    const res: Array<[number, number]> = [];
    const { x, y } = checkPosition;
    Go.#DIRECTIONS.forEach((val) => {
      const [moveX, moveY] = DIRECTION[val];
      if (fields[y + moveY][x + moveX] === "") {
        res.push([y + moveY, x + moveX]);
      }
    });

    return res;
  }
}
