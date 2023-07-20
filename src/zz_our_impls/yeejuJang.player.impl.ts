import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

export default class YijuPlayer implements OmPlayer {
  private opponentFlag: "O" | "X";

  constructor(myFlag: "O" | "X") {
    this.opponentFlag = myFlag;
  }

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

    // Bonus for having additional stone nearby
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
    this.opponentFlag = yourFlag === "O" ? "X" : "O";

    let emptyPoints = this.getEmptyPoints(fieldsStatus.fields);

    // If the board is empty or only one stone is placed in the center, place the stone as close to the center as possible
    if (
      emptyPoints.length >=
      fieldsStatus.fields.length * fieldsStatus.fields.length - 1
    ) {
      let center = this.getCenterPosition(fieldsStatus.fields);
      let closestPoint: Position2D = emptyPoints[0];
      let minDistance = this.distanceFromCenter(emptyPoints[0], center);

      // Find the closest empty point to the center
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

    // Check each empty point
    for (let point of emptyPoints) {
      // Check each direction
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;

          // Calculate the point value for you
          let pointValueForYou = this.evaluatePoint(
            point,
            dx,
            dy,
            fieldsStatus.fields,
            yourFlag
          );

          // If this point is better for you, update bestPointForYou and maxPointValueForYou
          if (pointValueForYou > maxPointValueForYou) {
            maxPointValueForYou = pointValueForYou;
            bestPointForYou = point;
          }

          // Calculate the point value for the opponent
          let pointValueForOpponent = this.evaluatePoint(
            point,
            dx,
            dy,
            fieldsStatus.fields,
            this.opponentFlag
          );

          // If this point is better for the opponent, update bestPointForOpponent and maxPointValueForOpponent
          if (pointValueForOpponent > maxPointValueForOpponent) {
            maxPointValueForOpponent = pointValueForOpponent;
            bestPointForOpponent = point;
          }
        }
      }
    }

    // Decide the next move by comparing the best options for both you and the opponent
    return maxPointValueForYou >= maxPointValueForOpponent
      ? bestPointForYou
      : bestPointForOpponent;
  }
}
