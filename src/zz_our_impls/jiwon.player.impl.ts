import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

type Flag = "O" | "X";

export default class JiwonPlayer implements OmPlayer {
  getDescription(): PlayerDescription {
    return {
      nickname: "jiwon",
      tactics: "개미는 오늘도 일을 하네",
    };
  }
  async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    const { fields, lastStonePosition } = fieldsStatus;

    const flag = yourFlag;
    const candidateFlag: Flag = yourFlag === "O" ? "X" : "O";

    try {
      const position = this.getPositionInt(
        fields,
        flag,
        candidateFlag,
        lastStonePosition
      );
      return position;
    } catch (err) {
      return this.getRandomPosition(fields);
    }
  }

  private getPositionInt(
    fields: Fields,
    yourFlag: Flag,
    candidateFlag: Flag,
    lastStonePosition?: Position2D
  ): Position2D {
    const isFirstInfo = this.isFirst(fields);
    if (isFirstInfo.isFirst) {
      return isFirstInfo.position;
    }

    let position: Position2D = { x: -1, y: -1 };
    if (lastStonePosition !== undefined) {
      position = this.attack(fields, yourFlag, 4);

      if (!this.isValidate(position, fields)) {
        position = this.defense(
          fields,
          lastStonePosition,
          candidateFlag,
          yourFlag,
          4,
          false
        );
      }

      if (!this.isValidate(position, fields)) {
        position = this.defense(
          fields,
          lastStonePosition,
          candidateFlag,
          yourFlag,
          3,
          true
        );
      }

      if (!this.isValidate(position, fields)) {
        position = this.defense(
          fields,
          lastStonePosition,
          candidateFlag,
          yourFlag,
          3,
          false
        );
      }

      if (!this.isValidate(position, fields)) {
        position = this.attack(fields, yourFlag, 3);
      }

      if (!this.isValidate(position, fields)) {
        position = this.assist(lastStonePosition, fields, "");
        // position = this.findDropPosition(lastStonePosition, fields, yourFlag);
      }
    }

    if (this.isValidate(position, fields)) {
      return position;
    }

    return this.getRandomPosition(fields);
  }

  // 계산한 값이 돌을 놔도 되는지 확인
  private isValidate(position: Position2D, fields: Fields): boolean {
    if (
      position.x !== -1 &&
      position.y !== -1 &&
      fields[position.y][position.x] === ""
    ) {
      return true;
    }
    return false;
  }

  // 처음 두는 돌
  private isFirst(fields: Fields): { isFirst: boolean; position: Position2D } {
    if (fields[9][9] === "") {
      return { isFirst: true, position: { x: 9, y: 9 } };
    }

    if (fields[9][10] === "") {
      return { isFirst: true, position: { x: 10, y: 9 } };
    }

    return { isFirst: false, position: { x: -1, y: -1 } };
  }

  private attack(fields: Fields, flag: Flag, stoneCount: number): Position2D {
    // 가로
    for (let i = 0; i < 19; i++) {
      for (let k = 0; k < 19 - stoneCount + 1; k++) {
        const horizontalArray: string[] = [];
        for (let m = 0; m <= stoneCount; m++) {
          horizontalArray.push(fields[i][k + m]);
        }

        if (
          horizontalArray.filter((a) => a === flag).length === stoneCount &&
          horizontalArray.filter((a) => a === "").length === 1
        ) {
          const index = horizontalArray.indexOf("");
          if (i + index < 19 && fields[i][k + index] === "") {
            return { x: k + index, y: i };
          }
        }
      }
    }
    // 세로
    for (let i = 0; i < 19; i++) {
      for (let k = 0; k < 15; k++) {
        const verticalArray: string[] = [];
        for (let m = 0; m <= stoneCount; m++) {
          verticalArray.push(fields[k + m][i]);
        }

        if (
          verticalArray.filter((a) => a === flag).length === stoneCount &&
          verticalArray.filter((a) => a === "").length === 1
        ) {
          const index = verticalArray.indexOf("");
          if (i + index < 19 && fields[k + index][i] === "") {
            return { x: i, y: k + index };
          }
        }
      }
    }
    // 대각선 (오른쪽 위에서 왼쪽 아래로)
    for (let i = 4; i < 19; i++) {
      for (let k = 0; k < 15; k++) {
        const diagnolArray: string[] = [];
        for (let m = 0; m <= stoneCount; m++) {
          diagnolArray.push(fields[i - m][k + m]);
        }

        if (
          diagnolArray.filter((a) => a === flag).length === 4 &&
          diagnolArray.filter((a) => a === "").length === 1
        ) {
          const index = diagnolArray.indexOf("");
          if (
            k + index < 19 &&
            i - index > 0 &&
            fields[i - index][k + index] === ""
          ) {
            return { x: k + index, y: i - index };
          }
        }
      }
    }
    // 대각선 (왼쪽 위에서 오른쪽 아래로)
    for (let i = 0; i < 15; i++) {
      for (let k = 0; k < 15; k++) {
        const diagnolArray: string[] = [];
        for (let m = 0; m <= stoneCount; m++) {
          diagnolArray.push(fields[i + m][k + m]);
        }

        if (
          diagnolArray.filter((a) => a === flag).length === 4 &&
          diagnolArray.filter((a) => a === "").length === 1
        ) {
          const index = diagnolArray.indexOf("");
          if (
            k + index < 19 &&
            i + index < 19 &&
            fields[i + index][k + index] === ""
          ) {
            return { x: k + index, y: i + index };
          }
        }
      }
    }

    return { x: -1, y: -1 };
  }

  private findDropPosition(
    lastStonePosition: Position2D,
    field: Fields,
    flag: Flag
  ): Position2D {
    let position: Position2D = { x: -1, y: -1 };

    // 상대방 돌 근처에 있는 내 돌 근처에 돌을 두기
    const myFlagPosition = this.assist(lastStonePosition, field, flag);
    position = this.assist(myFlagPosition, field, "");

    // 둘 곳이 없다면 상대방 돌 근처에 돌을 두기
    if (!this.isValidate(position, field)) {
      position = this.assist(lastStonePosition, field, "");
    }

    if (this.isValidate(position, field)) {
      return position;
    }

    return { x: -1, y: -1 };
  }

  private assist(
    position: Position2D,
    field: Fields,
    flag: Flag | string
  ): Position2D {
    const { x, y } = position;

    if (x - 1 > 0 && field[y][x - 1] === flag) {
      return { x: x - 1, y };
    }

    if (x + 1 < 19 && field[y][x + 1] === flag) {
      return { x: x + 1, y };
    }

    if (y - 1 > 0 && x - 1 > 0 && field[y - 1][x - 1] === flag) {
      return { x: x - 1, y: y - 1 };
    }

    if (y - 1 > 0 && field[y - 1][x] === flag) {
      return { x, y: y - 1 };
    }

    if (y - 1 > 0 && x + 1 < 19 && field[y - 1][x + 1] === flag) {
      return { x: x + 1, y: y - 1 };
    }

    if (y + 1 < 19 && x - 1 > 0 && field[y + 1][x - 1] === flag) {
      return { x: x - 1, y: y + 1 };
    }

    if (y + 1 < 19 && field[y + 1][x] === flag) {
      return { x, y: y + 1 };
    }

    if (y + 1 < 19 && x + 1 < 19 && field[y + 1][x + 1] === flag) {
      return { x: x + 1, y: y + 1 };
    }

    return { x: -1, y: -1 };
  }

  private defense(
    fields: Fields,
    lastStonePosition: Position2D,
    candidateFlag: Flag,
    flag: Flag,
    stoneCount: number,
    isCheckedMyStone: boolean
  ): Position2D {
    const { x: lastStonePositionX, y: lastStonePositionY } = lastStonePosition;
    const array: Array<Position2D> = [];

    let horizontalCount: number = 0;
    // 가로
    for (
      let i = Math.max(lastStonePositionX - stoneCount + 1, 0);
      i <= lastStonePositionX;
      i++
    ) {
      const horizontalArray: string[] = [];
      for (let m = 0; m <= stoneCount; m++) {
        horizontalArray.push(fields[lastStonePositionY][i + m]);
      }

      if (
        horizontalArray.filter((a) => a === candidateFlag).length ===
          stoneCount &&
        horizontalArray.filter((a) => a === "").length === 1
      ) {
        const index = horizontalArray.indexOf("");
        if (i + index < 19 && fields[lastStonePositionY][i + index] === "") {
          horizontalCount++;
          array.push({ x: i + index, y: lastStonePositionY });
        }
      }
      if (
        isCheckedMyStone &&
        horizontalArray.filter((a) => a === candidateFlag).length ===
          stoneCount &&
        horizontalArray.filter((a) => a === flag).length === 1
      ) {
        for (let m = 0; m < horizontalCount; m++) {
          array.pop();
        }
        break;
      }
    }

    let verticalCount: number = 0;
    // 세로
    for (
      let i = Math.max(lastStonePositionY - stoneCount + 1, 0);
      i <= lastStonePositionY;
      i++
    ) {
      const verticalArray: string[] = [];
      for (let m = 0; m <= stoneCount; m++) {
        verticalArray.push(fields[i + m][lastStonePositionX]);
      }

      if (
        verticalArray.filter((a) => a === candidateFlag).length ===
          stoneCount &&
        verticalArray.filter((a) => a === "").length === 1
      ) {
        const index = verticalArray.indexOf("");
        if (i + index < 19 && fields[i + index][lastStonePositionX] === "") {
          verticalCount++;
          array.push({ x: lastStonePositionX, y: i + index });
        }
      }
      if (
        isCheckedMyStone &&
        verticalArray.filter((a) => a === candidateFlag).length ===
          stoneCount &&
        verticalArray.filter((a) => a === flag).length === 1
      ) {
        for (let m = 0; m < verticalCount; m++) {
          array.pop();
        }
        break;
      }
    }

    let diagnolCount: number = 0;
    // 대각선 (오른쪽 위에서 왼쪽 아래로)
    for (
      let i = Math.max(lastStonePositionX - stoneCount + 1, 0);
      i <= lastStonePositionX;
      i++
    ) {
      for (
        let k = Math.min(lastStonePositionY + stoneCount - 1, 18);
        k >= lastStonePositionY;
        k--
      ) {
        const diagnolArray: string[] = [];
        for (let m = 0; m <= stoneCount; m++) {
          diagnolArray.push(fields[k - m][i + m]);
        }

        if (
          diagnolArray.filter((a) => a === candidateFlag).length ===
            stoneCount &&
          diagnolArray.filter((a) => a === "").length === 1
        ) {
          const index = diagnolArray.indexOf("");
          if (
            i + index < 19 &&
            k - index > 0 &&
            fields[k - index][i + index] === ""
          ) {
            diagnolCount++;
            array.push({ x: i + index, y: k - index });
          }
        }
        if (
          isCheckedMyStone &&
          diagnolArray.filter((a) => a === candidateFlag).length ===
            stoneCount &&
          diagnolArray.filter((a) => a === flag).length === 1
        ) {
          for (let m = 0; m < diagnolCount; m++) {
            array.pop();
          }
          break;
        }
      }
    }

    let diagnolCount2: number = 0;
    // 대각선 (왼쪽 위에서 오른쪽 아래로)
    for (
      let i = Math.max(lastStonePositionX - stoneCount + 1, 0);
      i <= lastStonePositionX;
      i++
    ) {
      for (
        let k = Math.max(lastStonePositionY - stoneCount + 1, 0);
        k <= lastStonePositionY;
        k++
      ) {
        const diagnolArray: string[] = [];
        for (let m = 0; m <= stoneCount; m++) {
          diagnolArray.push(fields[k + m][i + m]);
        }

        if (
          diagnolArray.filter((a) => a === candidateFlag).length ===
            stoneCount &&
          diagnolArray.filter((a) => a === "").length === 1
        ) {
          const index = diagnolArray.indexOf("");
          if (
            i + index < 19 &&
            k + index > 0 &&
            fields[k + index][i + index] === ""
          ) {
            diagnolCount2++;
            array.push({ x: i + index, y: k + index });
          }
        }
        if (
          isCheckedMyStone &&
          diagnolArray.filter((a) => a === candidateFlag).length ===
            stoneCount &&
          diagnolArray.filter((a) => a === flag).length === 1
        ) {
          for (let m = 0; m < diagnolCount2; m++) {
            array.pop();
          }
          break;
        }
      }
    }

    const position = array.find((e) => {
      const hasMyStone = this.assist(e, fields, flag);
      if (hasMyStone.x !== -1 && hasMyStone.y !== -1) {
        return e;
      }
    });

    if (position !== undefined) {
      return position;
    }

    if (array.length) {
      return array[0];
    }

    return { x: -1, y: -1 };
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
