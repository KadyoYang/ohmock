import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

export default class CloneJuPlayer implements OmPlayer {
  public getDescription(): PlayerDescription {
    return {
      nickname: "클론 주",
      tactics: "천재 장이주에 대적할 클론 주 개발",
    };
  }

  private getEmptyPoints(fields: Fields): Position2D[] {
    let points: Position2D[] = [];
    for (let y = 0; y < fields.length; y++) {
      for (let x = 0; x < fields[y].length; x++) {
        if (fields[y][x] === "") {
          points.push({ x: x, y: y });
        }
      }
    }
    return points;
  }

  private countConsecutiveStones(
    start: Position2D,
    dx: number,
    dy: number,
    fields: Fields,
    flag: "O" | "X"
  ): number {
    let count = 0;
    let x = start.x + dx;
    let y = start.y + dy;

    while (
      x >= 0 &&
      y >= 0 &&
      x < fields.length &&
      y < fields.length &&
      fields[y][x] === flag
    ) {
      count++;
      x += dx;
      y += dy;
    }

    return count;
  }

  private evaluatePoint(
    point: Position2D,
    dx: number,
    dy: number,
    fields: Fields,
    flag: "O" | "X"
  ): number {
    let consecutiveStones = this.countConsecutiveStones(
      point,
      dx,
      dy,
      fields,
      flag
    );
    let x = point.x + dx * (consecutiveStones + 1);
    let y = point.y + dy * (consecutiveStones + 1);
    let value = consecutiveStones;

    if (
      x >= 0 &&
      y >= 0 &&
      x < fields.length &&
      y < fields.length &&
      fields[y][x] === flag
    ) {
      value += 1;
    }

    return value;
  }

  private getCenterPosition(fields: Fields): Position2D {
    let center = Math.floor(fields.length / 2);
    return { x: center, y: center };
  }

  private distanceFromCenter(point: Position2D, center: Position2D): number {
    return Math.abs(point.x - center.x) + Math.abs(point.y - center.y);
  }

  public async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    const opponentFlag = yourFlag === "O" ? "X" : "O";
    let emptyPoints = this.getEmptyPoints(fieldsStatus.fields);

    for (let point of emptyPoints) {
      if (this.canWinPerfectly(point, fieldsStatus.fields, yourFlag)) {
        return point;
      }
      if (this.canWinPerfectly(point, fieldsStatus.fields, opponentFlag)) {
        return point;
      }
    }

    if (
      emptyPoints.length >=
      fieldsStatus.fields.length * fieldsStatus.fields.length - 1
    ) {
      let center = this.getCenterPosition(fieldsStatus.fields);
      let closestPoint: Position2D = emptyPoints[0];
      let minDistance = this.distanceFromCenter(emptyPoints[0], center);

      for (let point of emptyPoints) {
        let distance = this.distanceFromCenter(point, center);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      }

      return closestPoint;
    }

    let bestPointForYou: Position2D = emptyPoints[0];
    let maxPointValueForYou = 0;

    let bestPointForOpponent: Position2D = emptyPoints[0];
    let maxPointValueForOpponent = 0;

    for (let point of emptyPoints) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;

          let pointValueForYou = this.evaluatePoint(
            point,
            dx,
            dy,
            fieldsStatus.fields,
            yourFlag
          );

          if (pointValueForYou > maxPointValueForYou) {
            maxPointValueForYou = pointValueForYou;
            bestPointForYou = point;
          }

          let pointValueForOpponent = this.evaluatePoint(
            point,
            dx,
            dy,
            fieldsStatus.fields,
            opponentFlag
          );

          if (pointValueForOpponent > maxPointValueForOpponent) {
            maxPointValueForOpponent = pointValueForOpponent;
            bestPointForOpponent = point;
          }
        }
      }
    }

    return maxPointValueForYou >= maxPointValueForOpponent
      ? bestPointForYou
      : bestPointForOpponent;
  }

  private canWinPerfectly(
    point: Position2D,
    fields: Fields,
    flag: "O" | "X"
  ): boolean {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        let consecutiveStones = this.countConsecutiveStones(
          point,
          dx,
          dy,
          fields,
          flag
        );
        if (consecutiveStones === 2) {
          count++;
          if (count >= 2) return true;
        }
      }
    }
    return false;
  }
}
