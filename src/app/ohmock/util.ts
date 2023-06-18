import { Position2D } from "./player/om.player.interface";

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const createNewFields = (ySize: number, xSize: number): string[][] => {
  const result: string[][] = [];
  for (let i = 0; i < ySize; i++) {
    const yArray: Array<"" | "O" | "X"> = [];
    for (let j = 0; j < xSize; j++) {
      yArray.push("");
    }
    result.push(yArray);
  }
  return result;
};

export const checkWinningCondition = (
  fields: string[][],
  lastPosition: Position2D
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

    if (count === 5) {
      return true;
    }
  }
  return false;
};

/** 판이 꽉 찼는지 확인한다. */
export const isFieldsFull = (fields: string[][]): boolean =>
  fields.flat().every((v: any) => ["O", "X"].includes(v));
