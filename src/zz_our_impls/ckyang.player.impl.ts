import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

export default class CkYangPlayer implements OmPlayer {
  public getDescription(): PlayerDescription {
    return {
      nickname: "CK Yang",
      tactics: "둔다.",
    };
  }
  public async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    const { fields, lastStonePosition } = fieldsStatus;

    // 첫수일때는 가운데에 둔다
    if (!lastStonePosition) {
      return {
        x: Math.floor(fields[0].length / 2),
        y: Math.floor(fields.length / 2),
      };
    }

    // 창
    const attackPosition =
      this.runEMERGENCYDefenceAttackSystemTestingToolToWinTheGameAndMoneyBack(
        JSON.parse(JSON.stringify(fields)),
        yourFlag,
        5
      );
    if (attackPosition) {
      console.log("attackposition");
      return attackPosition;
    }

    // 방패
    const defencePosition =
      this.runEMERGENCYDefenceAttackSystemTestingToolToWinTheGameAndMoneyBack(
        JSON.parse(JSON.stringify(fields)),
        yourFlag === "O" ? "X" : "O",
        5
      );
    if (defencePosition) return defencePosition;

    // 선제 방패
    const earlyDefencePosition =
      this.runEMERGENCYDefenceAttackSystemTestingToolToWinTheGameAndMoneyBack(
        JSON.parse(JSON.stringify(fields)),
        yourFlag === "O" ? "X" : "O",
        4
      );
    if (earlyDefencePosition) return earlyDefencePosition;

    const myPointMap = this.makePointMap(fields.length, fields[0].length);
    const enemyPointMap = this.makePointMap(fields.length, fields[0].length);

    // calc dot points
    this.clacDotPoints(fields, myPointMap, yourFlag);
    this.clacDotPoints(fields, enemyPointMap, yourFlag === "O" ? "X" : "O");

    // calc line points // subtract point if enemy stone exists by side
    this.clacLinePoints(fields, myPointMap, yourFlag);
    this.clacLinePoints(fields, enemyPointMap, yourFlag === "O" ? "X" : "O");

    // makePositionToPriorityList
    const list: Array<{
      x: number;
      y: number;
      point: number;
      isMine: boolean;
    }> = [];
    myPointMap.forEach((y, yi) =>
      y.forEach((x, xi) => {
        if (fields[yi][xi] === "")
          list.push({ x: xi, y: yi, point: myPointMap[yi][xi], isMine: true });
      })
    );
    enemyPointMap.forEach((y, yi) =>
      y.forEach((x, xi) => {
        if (fields[yi][xi] === "")
          list.push({
            x: xi,
            y: yi,
            point: enemyPointMap[yi][xi],
            isMine: false,
          });
      })
    );

    // sort
    list.sort((a, b) => {
      if (b.point === a.point) {
        if (b.isMine) return 1;
        if (a.isMine) return -1;
      }
      return b.point - a.point;
    });

    // console.dir(list, { depth: null });
    const printFields = (fields: number[][]): void => {
      const yMax = fields.length;
      const xMax = fields[0].length;
      let line = "";
      for (const y of fields) {
        line += y.map((v) => String(v)).join(" ");
        line += "\n";
      }
    };
    printFields(myPointMap);
    printFields(enemyPointMap);

    return { x: list[0].x, y: list[0].y };
  }

  public makePointMap(yMax: number, xMax: number): number[][] {
    const pointMap: number[][] = [];
    // init pointMap
    for (let y = 0; y < yMax; y++) {
      const yTemp = [];
      for (let x = 0; x < xMax; x++) {
        yTemp.push(0);
      }
      pointMap.push(yTemp);
    }

    return pointMap;
  }
  public clacDotPoints(
    fields: Fields,
    pointMap: ReturnType<typeof this.makePointMap>,
    targetMarker: "O" | "X"
  ): void {
    const yMax = pointMap.length;
    const xMax = pointMap[0].length;
    pointMap.forEach((y, yi) =>
      y.forEach((x, xi) => {
        if (fields[yi][xi] === "") return;

        for (const direction of [
          { x: -1, y: 1 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
          { x: -1, y: -1 },
          { x: 0, y: -1 },
          { x: 1, y: -1 },
        ] as Position2D[]) {
          const targetX = xi + direction.x;
          const targetY = yi + direction.y;
          if (targetX < 0 || targetY < 0 || targetX >= xMax || targetY >= yMax)
            continue;
          if (
            fields[targetY][targetX] === "" ||
            fields[targetY][targetX] === targetMarker
          ) {
            pointMap[targetY][targetX] +=
              Math.abs(direction.x) + Math.abs(direction.y) + 1;
          }
        } // the end of directions loop
      })
    );
    return;
  }

  /**
   * 선 포인트 처리
   *
   * 이어져 있는것 끝까지 가서 처리
   * */
  public clacLinePoints(
    fields: Fields,
    pointMap: ReturnType<typeof this.makePointMap>,
    targetMarker: "O" | "X"
  ): void {
    // const enemyFlag = targetMarker === "O" ? "X" : "O";
    const yMax = pointMap.length;
    const xMax = pointMap[0].length;

    for (let yi = 0; yi < yMax; yi++) {
      for (let xi = 0; xi < xMax; xi++) {
        // console.log(yi, xi);
        for (const direction of [
          { x: -1, y: 1 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
          { x: -1, y: -1 },
          { x: 0, y: -1 },
          { x: 1, y: -1 },
        ] as Position2D[]) {
          if (fields[yi][xi] === "") continue;

          // targetMarker가 아닌 것을 중심으로 처리할때는 -연산 적용
          // targetMarker인 것을 중심으로 처리할때는 +연산 적용
          const linePointTargetMeta = this.getLinePointTargetMeta(
            fields,
            { x: xi, y: yi },
            direction
          );

          if (!linePointTargetMeta) continue;

          // 가중치 구하지 않아야할 놈
          if (
            (targetMarker === fields[yi][xi] &&
              linePointTargetMeta.mode === "sub") ||
            (targetMarker !== fields[yi][xi] &&
              linePointTargetMeta.mode === "add")
          )
            continue;

          pointMap[linePointTargetMeta.position.y][
            linePointTargetMeta.position.x
          ] +=
            linePointTargetMeta.mode === "add"
              ? 3 + linePointTargetMeta.count
              : -3; // *
          // Math.abs(direction.x) +
          // Math.abs(direction.y) +
          // (linePointTargetMeta.mode === "add" ? 1 : -1);
        } // the end of directions loop
      }
    }
    // pointMap.forEach((y, yi) =>
    //   y.forEach((x, xi) => {

    //   })
    // );
    return;
  }

  public getLinePointTargetMeta(
    fields: Fields,
    initPosition: Position2D,
    direction: Position2D
  ): { position: Position2D; mode: "add" | "sub"; count: number } | null {
    const yMax = fields.length;
    const xMax = fields[0].length;

    let currentX = initPosition.x + direction.x;
    let currentY = initPosition.y + direction.y;
    const initFlag = fields[initPosition.y][initPosition.x];
    if (currentX < 0 || currentY < 0 || currentX >= xMax || currentY >= yMax)
      return null;
    const targetFlag = fields[currentY][currentX];
    const mode: "add" | "sub" = initFlag === targetFlag ? "add" : "sub";

    // 이어지지않았다 첫장부터 꽝이다 더 이상 전진할 필요가 없어...
    if (fields[currentY][currentX] === "") return null;
    let count = 1;
    while (true) {
      // 인덱스 탈출시
      if (currentX < 0 || currentY < 0 || currentX >= xMax || currentY >= yMax)
        return null;
      // 마침내 공백 찾다
      if (fields[currentY][currentX] === "") {
        return {
          position: { x: currentX, y: currentY },
          mode,
          count,
        };
      }
      // 원하던 놈이 이어지는게 아니다
      if (fields[currentY][currentX] !== targetFlag) {
        return null;
      }
      // targetFlag가 이어진다
      currentX += direction.x;
      currentY += direction.y;
      count *= 2;
    }
  }

  private runEMERGENCYDefenceAttackSystemTestingToolToWinTheGameAndMoneyBack = (
    fields: string[][],
    targetFlag: "O" | "X",
    targetCount: number
  ): Position2D | null => {
    const yMax = fields.length;
    const xMax = fields[0].length;

    for (let yi = 0; yi < yMax; yi++) {
      for (let xi = 0; xi < xMax; xi++) {
        if (fields[yi][xi] === "") {
          fields[yi][xi] = targetFlag;
          const position = { y: yi, x: xi };
          if (this.checkWinningCondition(fields, position, targetCount)) {
            return position;
          }
          fields[yi][xi] = "";
        }
      }
    }
    return null;
  };

  private checkWinningCondition = (
    fields: string[][],
    lastPosition: Position2D,
    targetCount: number
  ): boolean => {
    const yMax = fields.length;
    const xMax = fields.flat().length / yMax;

    for (const direction of [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ]) {
      let count = -1;

      for (const inc of [1, -1]) {
        const currentPosition = {
          y: lastPosition.y,
          x: lastPosition.x,
        };
        while (
          currentPosition.x >= 0 &&
          currentPosition.x < xMax &&
          currentPosition.y >= 0 &&
          currentPosition.y < yMax
        ) {
          if (
            fields[currentPosition.y][currentPosition.x] ===
            fields[lastPosition.y][lastPosition.x]
          ) {
            count++;
          } else {
            break;
          }
          currentPosition.y += direction[0] * inc;
          currentPosition.x += direction[1] * inc;
        }
      }

      if (count === targetCount) {
        return true;
      }
    }
    return false;
  };
}
