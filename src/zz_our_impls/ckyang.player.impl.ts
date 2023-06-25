import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

export default class CkyangPlayerImpl implements OmPlayer {
  public getDescription(): PlayerDescription {
    return {
      nickname: "ck yang the noobie",
      tactics:
        "가중치를 정해서. 둠. 점. 가중치. 선. 가중치. 밀집 형세를 활용. 신중하게 판단.",
    };
  }
  public async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    const { fields, lastStonePosition } = fieldsStatus;
    const myPointMap = this.makePointMap(
      fields.length,
      fields.length / fields[0].length
    );
    const enemyPointMap = this.makePointMap(
      fields.length,
      fields.length / fields[0].length
    );

    // calc dot points
    this.clacDotPoints(fields, myPointMap, yourFlag);
    this.clacDotPoints(fields, enemyPointMap, yourFlag === "O" ? "X" : "O");

    // calc line points // subtract point if enemy stone exists by side
    this.clacLinePoints(fields, myPointMap, yourFlag);
    this.clacLinePoints(fields, enemyPointMap, yourFlag === "O" ? "X" : "O");

    // makePositionToPriorityList
    const list: Array<{ x: number; y: number; point: number }> = [];
    myPointMap.forEach((y, yi) =>
      y.forEach((x, xi) => {
        if (fields[yi][xi] === "")
          list.push({ x: xi, y: yi, point: myPointMap[yi][xi] });
      })
    );
    enemyPointMap.forEach((y, yi) =>
      y.forEach((x, xi) => {
        if (fields[yi][xi] === "")
          list.push({ x: xi, y: yi, point: myPointMap[yi][xi] });
      })
    );

    list.sort((a, b) => a.point - b.point);
    // sort

    return { x: list[0].x, y: list[0].y };
  }

  private makePointMap(yMax: number, xMax: number): number[][] {
    const pointMap: number[][] = [];
    // init pointMap
    const yTemp = [];
    for (let y = 0; y < yMax; y++) {
      for (let x = 0; x < xMax; x++) {}
      yTemp.push(0);
      pointMap.push(yTemp);
    }

    return pointMap;
  }
  private clacDotPoints(
    fields: Fields,
    pointMap: ReturnType<typeof this.makePointMap>,
    targetMarker: "O" | "X"
  ): void {
    const yMax = pointMap.length;
    const xMax = yMax / pointMap[0].length;
    pointMap.forEach((y, yi) =>
      y.forEach((x, xi) => {
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
  private clacLinePoints(
    fields: Fields,
    pointMap: ReturnType<typeof this.makePointMap>,
    targetMarker: "O" | "X"
  ): void {
    // const enemyFlag = targetMarker === "O" ? "X" : "O";
    // const yMax = pointMap.length;
    // const xMax = yMax / pointMap[0].length;
    pointMap.forEach((y, yi) =>
      y.forEach((x, xi) => {
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
          if (fields[yi][xi] === "") return;

          // targetMarker가 아닌 것을 중심으로 처리할때는 -연산 적용
          // targetMarker인 것을 중심으로 처리할때는 +연산 적용
          const linePointTargetMeta = this.getLinePointTargetMeta(
            fields,
            { x: xi, y: yi },
            direction
          );

          if (linePointTargetMeta === null || linePointTargetMeta === undefined)
            return;

          // 가중치 구하지 않아야할 놈
          if (
            (targetMarker === fields[yi][xi] &&
              linePointTargetMeta.mode === "sub") ||
            (targetMarker !== fields[yi][xi] &&
              linePointTargetMeta.mode === "add")
          )
            return;

          pointMap[linePointTargetMeta.position.y][
            linePointTargetMeta.position.x
          ] +=
            (Math.abs(direction.x) + Math.abs(direction.y)) *
            (linePointTargetMeta.mode === "add" ? 1 : -1);
        } // the end of directions loop
      })
    );
    return;
  }

  private getLinePointTargetMeta(
    fields: Fields,
    initPosition: Position2D,
    direction: Position2D
  ): { position: Position2D; mode: "add" | "sub" } | null {
    const yMax = fields.length;
    const xMax = yMax / fields[0].length;

    let currentX = initPosition.x + direction.x;
    let currentY = initPosition.y + direction.y;
    const initFlag = fields[initPosition.y][initPosition.x];
    if (currentX < 0 || currentY < 0 || currentX >= xMax || currentY >= yMax)
      return null;
    const targetFlag = fields[currentY][currentX];
    const mode: "add" | "sub" = initFlag === targetFlag ? "add" : "sub";

    while (true) {
      // 인덱스 탈출시
      if (currentX < 0 || currentY < 0 || currentX >= xMax || currentY >= yMax)
        return null;
      // 마침내 공백 찾다
      if (fields[currentY][currentX] === "") {
        return {
          position: { x: currentX, y: currentY },
          mode,
        };
      }
      // 막힌 경우
      if (fields[currentY][currentX] !== targetFlag) {
        return null;
      }
      // targetFlag가 이어진다
      currentX += direction.x;
      currentY += direction.y;
    }
  }
}
