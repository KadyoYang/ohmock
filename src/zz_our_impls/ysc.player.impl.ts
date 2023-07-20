import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

export default class YschoiPlayerImpl implements OmPlayer {
  getDescription(): PlayerDescription {
    return {
      nickname: "ys",
      tactics: "화이팅",
    };
  }

  async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    const { fields } = fieldsStatus;
    const otherSideFlag = yourFlag === "O" ? "X" : "O";
    // console.log(yourFlag);
    // console.log(fields);
    // console.log(lastStonePosition);

    // 중앙에 돌이 없으면 둔다.
    if (!fields[9][9]) {
      return this.starPoint();
    }

    // 반드시 막아야한다.
    const block = this.mustBlock(yourFlag, otherSideFlag, fieldsStatus);
    console.log(block);

    // 너가 놓으려는 자리에 돌이 있니??
    const { x, y } = block.length
      ? { x: block[0].x, y: block[0].y }
      : this.tt(
          { x: this.getRandomInt(0, 18), y: this.getRandomInt(0, 18) },
          fieldsStatus
        );
    return { x, y };
  }

  private tt(a: Position2D, fieldsStatus: FieldStatus) {
    while (true) {
      const isEx = fieldsStatus.fields[a.x][a.y];
      if (isEx) {
        a = { x: this.getRandomInt(0, 18), y: this.getRandomInt(0, 18) };
      } else {
        return { x: a.x, y: a.y };
      }
    }
  }

  private starPoint() {
    return { x: 9, y: 9 };
  }

  private mustBlock(
    yourFlag: "O" | "X",
    otherSideFlag: "O" | "X",
    fieldsStatus: FieldStatus
  ): Array<Position2D> {
    const result: Array<Position2D> = [];
    const caseArr: {
      [k in string]: Array<string>;
    } = {
      // case1
      // ["", "O", "O", "O", ""]
      case1: Array(5)
        .fill(otherSideFlag)
        .map((val, idx) => {
          if (idx === 0 || idx === 4) {
            return "";
          }
          return val;
        }),

      // case2
      // ["O", "O", "", "O", "O"]
      case2: Array(5)
        .fill(otherSideFlag)
        .map((val, idx) => {
          if (idx === 2) {
            return "";
          }
          return val;
        }),

      // case3
      // ["", "O", "", "O", "O", ""]
      case3: Array(6)
        .fill(otherSideFlag)
        .map((val, idx) => {
          if (idx === 0 || idx === 2 || idx === 5) {
            return "";
          }
          return val;
        }),

      // case4
      // ["", "O", "O", "", "O", ""]
      case4: Array(6)
        .fill(otherSideFlag)
        .map((val, idx) => {
          if (idx === 0 || idx === 3 || idx === 5) {
            return "";
          }
          return val;
        }),

      // case5
      // ["", "O", "O", "O", "O", "X"]
      case5: Array(6)
        .fill(otherSideFlag)
        .map((val, idx) => {
          if (idx === 0) {
            return "";
          }
          if (idx === 5) {
            return yourFlag;
          }
          return val;
        }),

      // case6
      // ["X", "O", "O", "O", "O", ""]
      case6: Array(6)
        .fill(otherSideFlag)
        .map((val, idx) => {
          if (idx === 0) {
            return yourFlag;
          }
          if (idx === 5) {
            return "";
          }
          return val;
        }),
    };

    const keys = Object.keys(caseArr);
    for (const key of keys) {
      result.push(...this.mustBlockRowCase(fieldsStatus, caseArr[key], key));
      result.push(...this.mustBlockColumnCase(fieldsStatus, caseArr[key], key));
      result.push(
        ...this.mustBlockDiagonalCase(fieldsStatus, caseArr[key], key)
      );
      result.push(
        ...this.mustBlockDiagonalReverseCase(fieldsStatus, caseArr[key], key)
      );
    }

    return result.length ? result : [];
  }

  private mustBlockRowCase(
    fieldsStatus: FieldStatus,
    shape: Array<string>,
    key: string
  ): Array<Position2D> {
    const shapeToString = JSON.stringify(shape);
    const shapeLength = shape.length;
    for (let y = 0; y < 19; y++) {
      for (let x = 0; x < (shapeLength === 5 ? 15 : 14); x++) {
        const currentRow = JSON.stringify(
          fieldsStatus.fields[y].slice(x, x + shapeLength)
        );
        if (shapeToString === currentRow && key === "case1") {
          return [
            { x, y },
            { x: x + 4, y },
          ];
        }

        if (shapeToString === currentRow && key === "case2") {
          return [{ x: x + 2, y }];
        }

        if (shapeToString === currentRow && key === "case3") {
          return [
            { x, y },
            { x: x + 2, y },
            { x: x + 5, y },
          ];
        }

        if (shapeToString === currentRow && key === "case4") {
          return [
            { x, y },
            { x: x + 3, y },
            { x: x + 5, y },
          ];
        }

        if (shapeToString === currentRow && key === "case5") {
          return [{ x, y }];
        }

        if (shapeToString === currentRow && key === "case6") {
          return [{ x: x + 5, y }];
        }
      }
    }
    return [];
  }

  private mustBlockColumnCase(
    fieldsStatus: FieldStatus,
    shape: Array<string>,
    key: string
  ) {
    const shapeToString = JSON.stringify(shape);
    const shapeLength = shape.length;
    for (let y = 0; y < (shapeLength === 5 ? 15 : 14); y++) {
      for (let x = 0; x < 19; x++) {
        const arr = [];
        for (let z = 0; z < shape.length; z++) {
          const val = fieldsStatus.fields[y + z][x];
          arr.push(val);
        }
        const currentColumn = JSON.stringify(arr);

        if (shapeToString === currentColumn && key === "case1") {
          return [
            { x, y },
            { x, y: y + 4 },
          ];
        }

        if (shapeToString === currentColumn && key === "case2") {
          return [{ x, y: y + 2 }];
        }

        if (shapeToString === currentColumn && key === "case3") {
          return [
            { x, y },
            { x, y: y + 2 },
            { x, y: y + 5 },
          ];
        }

        if (shapeToString === currentColumn && key === "case4") {
          return [
            { x, y },
            { x, y: y + 3 },
            { x, y: y + 5 },
          ];
        }

        if (shapeToString === currentColumn && key === "case5") {
          return [{ x, y }];
        }

        if (shapeToString === currentColumn && key === "case6") {
          return [{ x, y: y + 5 }];
        }
      }
    }
    return [];
  }

  private mustBlockDiagonalReverseCase(
    fieldsStatus: FieldStatus,
    shape: Array<string>,
    key: string
  ) {
    const shapeToString = JSON.stringify(shape);
    const shapeLength = shape.length;
    for (let y = 18 - (shapeLength === 5 ? 14 : 13); y < 0; y--) {
      for (let x = 18 - (shapeLength === 5 ? 14 : 13); x < 0; x--) {
        const arr = [];
        for (let z = 0; z < shape.length; z++) {
          const val = fieldsStatus.fields[x + z][y + z];
          arr.push(val);
        }
        const currentDiagonalReverse = JSON.stringify(arr);

        if (shapeToString === currentDiagonalReverse && key === "case1") {
          return [
            { x, y },
            { x: x - 4, y: y - 4 },
          ];
        }

        if (shapeToString === currentDiagonalReverse && key === "case2") {
          return [{ x: x - 2, y: y - 2 }];
        }

        if (shapeToString === currentDiagonalReverse && key === "case3") {
          return [
            { x, y },
            { x: x - 2, y: y - 2 },
            { x: x - 5, y: y - 5 },
          ];
        }

        if (shapeToString === currentDiagonalReverse && key === "case4") {
          return [
            { x, y },
            { x: x - 3, y: y - 3 },
            { x: x - 5, y: y - 5 },
          ];
        }

        if (shapeToString === currentDiagonalReverse && key === "case5") {
          return [{ x, y }];
        }

        if (shapeToString === currentDiagonalReverse && key === "case6") {
          return [{ x: x - 5, y: y - 5 }];
        }
      }
    }
    return [];
  }

  private mustBlockDiagonalCase(
    fieldsStatus: FieldStatus,
    shape: Array<string>,
    key: string
  ) {
    const shapeToString = JSON.stringify(shape);
    const shapeLength = shape.length;
    for (let y = 0; y < (shapeLength === 5 ? 14 : 13); y++) {
      for (let x = 0; x < (shapeLength === 5 ? 14 : 13); x++) {
        const arr = [];
        for (let z = 0; z < shape.length; z++) {
          const val = fieldsStatus.fields[x + z][y + z];
          arr.push(val);
        }
        const currentDiagonal = JSON.stringify(arr);

        if (shapeToString === currentDiagonal && key === "case1") {
          return [
            { x, y },
            { x: x + 4, y: y + 4 },
          ];
        }

        if (shapeToString === currentDiagonal && key === "case2") {
          return [{ x: x + 2, y: y + 2 }];
        }

        if (shapeToString === currentDiagonal && key === "case3") {
          return [
            { x, y },
            { x: x + 2, y: y + 2 },
            { x: x + 5, y: y + 5 },
          ];
        }

        if (shapeToString === currentDiagonal && key === "case4") {
          return [
            { x, y },
            { x: x + 3, y: y + 3 },
            { x: x + 5, y: y + 5 },
          ];
        }

        if (shapeToString === currentDiagonal && key === "case5") {
          return [{ x, y }];
        }

        if (shapeToString === currentDiagonal && key === "case6") {
          return [{ x: x + 5, y: y + 5 }];
        }
      }
    }
    return [];
  }

  private isExist(
    expectDropStonPosition: Position2D,
    fieldsStatus: FieldStatus
  ): Position2D {
    if (
      fieldsStatus.fields[expectDropStonPosition.x][expectDropStonPosition.y]
    ) {
      console.log("123123123", fieldsStatus);
      return this.isExist(
        {
          x: this.getRandomInt(0, 18),
          y: this.getRandomInt(0, 18),
        },
        fieldsStatus
      );
    }
    return {
      x: expectDropStonPosition.x,
      y: expectDropStonPosition.y,
    };
  }

  private limitPoint(x: number, y: number) {
    if (x > 18 || y > 18 || x < 0 || y < 0) {
      return;
    }
  }

  private getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }
}
