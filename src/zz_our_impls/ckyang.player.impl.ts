import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

/**
 * 점, 선 가중치를 계산하여 둘만한 수를 가려내고
 * 둘만한 수가 많을 경우 몇 수 앞을 둬서 괜찮을 수를 찾는다
 */
export default class CkYangPlayer implements OmPlayer {
  public getDescription(): PlayerDescription {
    return {
      nickname: "CK Yang",
      tactics: "둔다.",
    };
  }

  /** 돌을 둔다 */
  public async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    /** 몇 수 앞을 볼지 정하는 값
     * 무승부값[4,5,6,7] 흑승값[8] 7이 안전하고 적절한듯하다. 최강은 쓰지않겠다
     */
    const targetDepth = 7;

    // getCriticalPositions 로 둘만한 곳을 찾아본다
    const positions = await this.getCriticalPositions(fieldsStatus, yourFlag);

    // 둘만한 곳이 딱 한곳만 존재하면 바로 리턴한다
    if (positions.length === 1) {
      return positions[0];
    }

    // 둘만한 곳이 여러개이면 각 수마다 점수를 매긴다
    const positionsWithPoint: Array<Position2D & { point: number }> = [];
    for (const position of positions) {
      const copiedFieldStatus = this.deepCopy(fieldsStatus);
      copiedFieldStatus.lastStonePosition = position;
      copiedFieldStatus.fields[position.y][position.x] = yourFlag;
      // seeTheFuture로 점수를 구한다
      const point = await this.seeTheFuture(
        copiedFieldStatus,
        yourFlag,
        this.flipTurn(yourFlag),
        targetDepth,
        0
      );
      positionsWithPoint.push({ x: position.x, y: position.y, point });
    }

    // 점수 내림차순으로 정렬한다
    positionsWithPoint.sort((a, b) => {
      return b.point - a.point;
    });

    // 가장 점수가 높은 수를 리턴한다
    return positionsWithPoint[0];
  }

  /** 몇 수 앞을 보면서 점수를 계산하는 메소드 */
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
      // 둬본다 const copiedFieldStatus = this.deepCopy(fieldsStatus);
      const copiedFieldStatus = fieldsStatus;
      copiedFieldStatus.lastStonePosition = candidate;
      copiedFieldStatus.fields[candidate.y][candidate.x] = turn;

      // 승리 조건 만족할 경우 점수를 더한다, 단 적이 이겼을 경우 -1 을 더한다
      if (
        this.checkWinningCondition(
          copiedFieldStatus.fields,
          copiedFieldStatus.lastStonePosition,
          5
        )
      ) {
        point += yourFlag === turn ? 1 : -1;
      } else {
        // 승리 조건을 만족하지 않을 경우 더 둬본다 재귀를 돈다
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

  /** 두기 괜찮은 수들을 리턴한다 */
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
    // 공격하면 반드시 이기는 경우는 바로 해당 수를 리턴한다
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
    // 방어하지않으면 반드시 지는 경우는 바로 해당 막는 수들을 리턴한다
    const defencePositions =
      this.runEMERGENCYDefenceAttackSystemTestingToolToWinTheGameAndMoneyBack(
        JSON.parse(JSON.stringify(fields)),
        yourFlag === "O" ? "X" : "O",
        5
      );
    if (defencePositions && defencePositions.length > 0)
      return defencePositions;

    // 선제 방패
    // 상대방이 3개인 경우 막아야하는 수들을 리턴한다 (optional 이것은 제거해도된다, 제거할 경우 호전적으로 둔다)
    const earlyDefencePositions =
      this.runEMERGENCYDefenceAttackSystemTestingToolToWinTheGameAndMoneyBack(
        JSON.parse(JSON.stringify(fields)),
        yourFlag === "O" ? "X" : "O",
        4
      );
    if (earlyDefencePositions && earlyDefencePositions.length > 0)
      return earlyDefencePositions;

    // 내 관점, 상대 관점의 포인트맵 (19*19) 생성한다
    const myPointMap = this.makePointMap(fields.length, fields[0].length);
    const enemyPointMap = this.makePointMap(fields.length, fields[0].length);

    // 점 관점의 포인트를 계산한다
    this.clacDotPoints(fields, myPointMap, yourFlag);
    this.clacDotPoints(fields, enemyPointMap, yourFlag === "O" ? "X" : "O");

    // 선 관점의 포인트를 계산한다
    this.clacLinePoints(fields, myPointMap, yourFlag);
    this.clacLinePoints(fields, enemyPointMap, yourFlag === "O" ? "X" : "O");

    // 정렬하기 좋은 리스트 구조로 포인트맵데이터를 변환한다
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

    // 정렬한다. 똑같은 가중치일경우 내 공격을 우선한다.
    list.sort((a, b) => {
      if (b.point === a.point) {
        if (b.isMine) return 1;
        if (a.isMine) return -1;
      }
      return b.point - a.point;
    });

    // 정렬된 수 리스트를 리턴하는데 0번째 엘레먼트(최선의 수) 와 점수가 동일한 것을 리턴한다
    return list
      .filter((l) => l.point === list[0].point && l.isMine === list[0].isMine)
      .map((l) => {
        return {
          x: l.x,
          y: l.y,
        };
      });
  }

  /** 포인트맵 생성한다 [유틸] */
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

  /** 점 관점의 가중치를 계산한다 */
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

        // 각 방향마다 처리를 한다. 대각선은 점수가 더 높다 대각선은 항상 유리하기 때문
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
   * 선 관점의 가중치를 계산한다
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
              : -3;
          // Math.abs(direction.x) +
          // Math.abs(direction.y) +
          // (linePointTargetMeta.mode === "add" ? 1 : -1);
        } // the end of directions loop
      }
    }

    return;
  }

  /** 선 관점의 가중치를 구한다 */
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

  /** 아주 중요한 함수 어이없이 기회를 날리거나 어이없이 패배하는 경우를 제거하기 위해 탄생한 메소드 */
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

  /** 승리 조건에 만족하는지 확인하는 메소드 */
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
