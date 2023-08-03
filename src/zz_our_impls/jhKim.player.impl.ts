import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

const MAX_LENGTH = 19;
const NET_SIZE = 5;
type Coord = { x: number; y: number };

export default class JKPlayer implements OmPlayer {
  getDescription(): PlayerDescription {
    return {
      nickname: "JK",
      tactics: "요행을 바라는 Defender",
    };
  }

  async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    const isFirst = yourFlag === "O";
    const turns = this.calculateMyTurns(fieldsStatus, yourFlag);
    try {
      const position = this.decisionNext(fieldsStatus, yourFlag, turns);
      return position;
    } catch (err) {
      console.log("panic", err);
      return this.getRandomPosition(fieldsStatus.fields);
    }
  }

  private calculateMyTurns(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): number {
    if (yourFlag === "O" && !fieldsStatus.lastStonePosition) {
      return 0;
    }
    let turns = 0;
    for (let y = 0; y < MAX_LENGTH; y++) {
      for (let x = 0; x < MAX_LENGTH; x++) {
        turns += fieldsStatus.fields[y][x] === yourFlag ? 1 : 0;
      }
    }
    return turns;
  }

  private decisionNext(
    fieldsStatus: FieldStatus,
    myFlag: "O" | "X",
    turns: number
  ): Position2D {
    if (turns === 0 && myFlag === "O") {
      return { x: 0, y: 0 };
    }
    if (turns === 1 && myFlag === "O") {
      if (fieldsStatus.fields[0][1] === "") {
        return { x: 1, y: 0 };
      }
    }
    if (turns === 2 && myFlag === "O") {
      if (fieldsStatus.fields[0][3] === "") {
        return { x: 3, y: 0 };
      }
    }
    if (turns === 3 && myFlag === "O") {
      if (fieldsStatus.fields[0][4] === "") {
        return { x: 4, y: 0 };
      }
    }
    if (turns === 4 && myFlag === "O") {
      if (fieldsStatus.fields[0][2] === "") {
        return { x: 2, y: 0 };
      }
    }

    const { queue, direction } = this.detectDangerous(fieldsStatus, myFlag);
    for (let i = 0; i < queue.length; i++) {
      if (fieldsStatus.fields[queue[i].y][queue[i].x] === "") {
        return { x: queue[i].x, y: queue[i].y };
      }
    }
    return this.getRandomPosition(fieldsStatus.fields);
  }

  private detectDangerous(
    fieldsStatus: FieldStatus,
    myFlag: "O" | "X"
  ): { queue: Array<Coord>; direction: number } {
    const enemy = myFlag === "O" ? "X" : "O";

    const countStones = (
      target: Array<Coord>
    ): { enemyCount: number; myCount: number } => {
      const k = target.reduce(
        (prev, curr) => {
          if (curr.y === 19) {
            return prev;
          }
          try {
            const c = fieldsStatus.fields[curr.y][curr.x];
            if (c === enemy) {
              prev.enemyCount += 1;
            } else if (c === myFlag) {
              prev.myCount += 1;
            }
            return prev;
          } catch (err) {
            throw new Error("panic2");
          }
        },
        { enemyCount: 0, myCount: 0 }
      );
      return k;
    };

    let most: Array<Coord> = [];

    const putMost = (target: Array<Coord>) => {
      const { enemyCount: e2, myCount: m2 } = countStones(target);
      const targetEmpties = NET_SIZE - e2 - m2;
      if (most.length === 0) {
        most = target;
        return;
      }
      if (targetEmpties === 0) {
        return;
      }

      const { enemyCount: e1, myCount: m1 } = countStones(most);
      const mostEmpties = NET_SIZE - e1 - m1;

      if (targetEmpties >= mostEmpties && e2 > e1) {
        most = target;
      }
    };

    // 가로 체크
    for (let y = 0; y < MAX_LENGTH; y++) {
      for (let x = 0; x < MAX_LENGTH - NET_SIZE; x++) {
        const liner: Array<Coord> = [
          { y, x },
          { y, x: x + 1 },
          { y, x: x + 2 },
          { y, x: x + 3 },
          { y, x: x + 4 },
        ];

        const { enemyCount, myCount } = countStones(liner);
        if (enemyCount + myCount < 5) {
          if (enemyCount >= 3 && myCount === 0) {
            return { queue: liner, direction: 0 };
          }
          putMost(liner);
        }
      }
    }

    // 세로체크
    for (let x = 0; x < MAX_LENGTH; x++) {
      for (let y = 0; y < MAX_LENGTH - NET_SIZE - 1; y++) {
        const liner: Array<Coord> = [
          { x, y },
          { x, y: y + 1 },
          { x, y: y + 2 },
          { x, y: y + 3 },
          { x, y: y + 4 },
        ];
        const { enemyCount, myCount } = countStones(liner);

        if (enemyCount + myCount < 5) {
          if (enemyCount > 3 && myCount === 0) {
            return { queue: liner, direction: 1 };
          }
          putMost(liner);
        }
      }
    }

    // 좌상-우하 대각선 체크
    for (let y = 0; y < MAX_LENGTH - NET_SIZE; y++) {
      for (let x = 0; x < MAX_LENGTH - NET_SIZE - 1; x++) {
        const liner: Array<Coord> = [
          { x, y },
          { x: x + 1, y: y + 1 },
          { x: x + 2, y: y + 2 },
          { x: x + 3, y: y + 3 },
          { x: x + 4, y: y + 4 },
        ];
        const { enemyCount, myCount } = countStones(liner);

        if (enemyCount > 3 && myCount === 0) {
          return { queue: liner, direction: 2 };
        }
        putMost(liner);
      }
    }

    // 좌하-우상 대각선 체크
    for (let y = MAX_LENGTH; y > NET_SIZE; y--) {
      for (let x = 0; x < MAX_LENGTH - NET_SIZE; x++) {
        const liner: Array<Coord> = [
          { x, y },
          { x: x + 1, y: y - 1 },
          { x: x + 2, y: y - 2 },
          { x: x + 3, y: y - 3 },
          { x: x + 4, y: y - 4 },
        ];
        const { enemyCount, myCount } = countStones(liner);

        if (enemyCount > 3 && myCount === 0) {
          return { queue: liner, direction: 3 };
        }
        putMost(liner);
      }
    }

    return { queue: most, direction: -1 };
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

    return { x, y };
  };
}
