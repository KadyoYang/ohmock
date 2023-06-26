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

    // 첫수일때는 가운데에 둔다
    if (!lastStonePosition) {
      return {
        x: Math.floor(fields[0].length / 2),
        y: Math.floor(fields.length / 2),
      };
    }

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
      console.log(line);
    };
    printFields(myPointMap);
    printFields(enemyPointMap);

    console.dir({ a: list[0], b: list[1], c: list[2] }, { depth: null });

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
}
