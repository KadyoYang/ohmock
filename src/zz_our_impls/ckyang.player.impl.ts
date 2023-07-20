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
    /** 무승부값[4,5,6,7] 흑승값[8] 7이 안전하고 적절한듯하다. 최강은 쓰지않겠다 */
    const targetDepth = 7;
    const positions = await this.getCriticalPositions(fieldsStatus, yourFlag);
    if (positions.length === 1) {
      return positions[0];
    }

    const positionsWithPoint: Array<Position2D & { point: number }> = [];
    for (const position of positions) {
      const copiedFieldStatus = this.deepCopy(fieldsStatus);
      copiedFieldStatus.lastStonePosition = position;
      copiedFieldStatus.fields[position.y][position.x] = yourFlag;
      const point = await this.seeTheFuture(
        copiedFieldStatus,
        yourFlag,
        this.flipTurn(yourFlag),
        targetDepth,
        0
      );
      positionsWithPoint.push({ x: position.x, y: position.y, point });
    }

    positionsWithPoint.sort((a, b) => {
      return b.point - a.point;
    });

    return positionsWithPoint[0];
  }

  public async seeTheFuture(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X",
    turn: "O" | "X",
    maxDepth: number,
    depth: number = 0
  ): Promise<number> {
    if (depth > maxDepth) {
      return 0;
    }
    if (fieldsStatus.fields.flat().every((fe) => fe !== "")) {
      return 0;
    }
    let point = 0;
    const candidates = await this.getCriticalPositions(
      this.deepCopy(fieldsStatus),
      turn
    );

    // 경우의 수를 둬본다
    for (const candidate of candidates) {
      // 둬본다 승리? 패배? 숫자 합산
      // const copiedFieldStatus = this.deepCopy(fieldsStatus);
      const copiedFieldStatus = fieldsStatus;
      copiedFieldStatus.lastStonePosition = candidate;
      copiedFieldStatus.fields[candidate.y][candidate.x] = turn;

      if (
        this.checkWinningCondition(
          copiedFieldStatus.fields,
          copiedFieldStatus.lastStonePosition,
          5
        )
      ) {
        point += yourFlag === turn ? 1 : -1;
      } else {
        // 결과 안나오네? 더 둬봐
        point += await this.seeTheFuture(
          copiedFieldStatus,
          yourFlag,
          this.flipTurn(turn),
          maxDepth,
          depth + 1
        );
      }
      copiedFieldStatus.fields[candidate.y][candidate.x] = "";
    }

    return point;
  }

  public async getCriticalPositions(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Array<Position2D>> {
    const { fields, lastStonePosition } = fieldsStatus;

    // 첫수일때는 가운데에 둔다
    if (!lastStonePosition) {
      return [
        {
          x: Math.floor(fields[0].length / 2),
          y: Math.floor(fields.length / 2),
        },
      ];
    }

    // 창
    const attackPositions =
      this.runEMERGENCYDefenceAttackSystemTestingToolToWinTheGameAndMoneyBack(
        JSON.parse(JSON.stringify(fields)),
        yourFlag,
        5
      );
    if (attackPositions && attackPositions.length > 0) {
      return [attackPositions[0]];
    }

    // 방패
    const defencePositions =
      this.runEMERGENCYDefenceAttackSystemTestingToolToWinTheGameAndMoneyBack(
        JSON.parse(JSON.stringify(fields)),
        yourFlag === "O" ? "X" : "O",
        5
      );
    if (defencePositions && defencePositions.length > 0)
      return defencePositions;

    // 선제 방패
    const earlyDefencePositions =
      this.runEMERGENCYDefenceAttackSystemTestingToolToWinTheGameAndMoneyBack(
        JSON.parse(JSON.stringify(fields)),
        yourFlag === "O" ? "X" : "O",
        4
      );
    if (earlyDefencePositions && earlyDefencePositions.length > 0)
      return earlyDefencePositions;

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

    return list
      .filter((l) => l.point === list[0].point && l.isMine === list[0].isMine)
      .map((l) => {
        return {
          x: l.x,
          y: l.y,
        };
      });
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
  ): Array<Position2D> => {
    const yMax = fields.length;
    const xMax = fields[0].length;

    const candidates: Array<Position2D> = [];

    for (let yi = 0; yi < yMax; yi++) {
      for (let xi = 0; xi < xMax; xi++) {
        if (fields[yi][xi] === "") {
          fields[yi][xi] = targetFlag;
          const position = { y: yi, x: xi };
          if (this.checkWinningCondition(fields, position, targetCount)) {
            candidates.push(position);
          }

          fields[yi][xi] = "";
        }
      }
    }
    return candidates;
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

  private deepCopy = <T extends object>(src: T): T =>
    JSON.parse(JSON.stringify(src));

  private flipTurn = (src: "O" | "X"): "O" | "X" => (src === "O" ? "X" : "O");
}
