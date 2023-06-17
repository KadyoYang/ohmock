import { Fields, Position2D } from "./om.common.dto";
import {
  NinjaNoob,
  NinjaNoobAdvanced,
  NinjaNoobAdvanced2X,
} from "./player/sample";

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

const getRandomPosition = (fields: string[][]): Position2D => {
  const yMax = fields.length;
  const xMax = fields.flat().length / yMax;
  let x = 0,
    y = 0;
  while (true) {
    x = getRandomInt(0, xMax);
    y = getRandomInt(0, yMax);
    if (fields[y][x] === "") break;
  }

  return {
    x,
    y,
  };
};

const printFields = (fields: string[][]): void => {
  let range = (n: number) => Array.from(Array(n).keys());
  const yMax = fields.length;
  const xMax = fields.flat().length / yMax;

  console.log(
    "  " +
      range(xMax)
        .map((v) => String(v)[String(v).length - 1])
        .join(" ")
  );
  let i = 0;
  for (const y of fields) {
    console.log(
      String(i)[String(i).length - 1] +
        " " +
        y.map((v) => (!v ? " " : v)).join(" ")
    );
    i++;
  }
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

async function main() {
  console.log("시작");
  const fields = createNewFields(19, 19);
  printFields(fields);

  let toggle = true;
  let winnerExist = false;
  let position = { x: 0, y: 0 };
  while (!winnerExist) {
    // await sleep(1000);
    position = getRandomPosition(fields);
    fields[position.y][position.x] = toggle ? "O" : "X";
    console.log("======================================");
    printFields(fields);
    if (isFieldsFull(fields)) throw new Error("무승부");
    winnerExist = checkWinningCondition(fields, position);
    toggle = !toggle;
  }
  console.log("");
  console.log("끝");
  console.log(
    `${toggle ? "X" : "O"} 승리 lastPosition: x:${position.x} y:${position.y}`
  );
}

// main();

async function mainComputer(): Promise<boolean> {
  console.log("시작");
  const op = new NinjaNoob();
  const xp = new NinjaNoobAdvanced();
  const xxp = new NinjaNoobAdvanced2X();
  const fields = createNewFields(19, 19);
  // printFields(fields);

  let toggle = true;
  let winnerExist = false;
  let position = { x: 0, y: 0 };
  while (!winnerExist) {
    await sleep(1000);
    position = toggle
      ? await op.dropTheStone(
          { fields, lastStonePosition: { x: 0, y: 0 } },
          "O"
        )
      : await xxp.dropTheStone(
          { fields, lastStonePosition: { x: 0, y: 0 } },
          "X"
        );
    if (fields[position.y][position.x] !== "")
      throw new Error("rule violations detected");
    fields[position.y][position.x] = toggle ? "O" : "X";
    console.log("======================================");
    printFields(fields);
    if (isFieldsFull(fields)) throw new Error("무승부");
    winnerExist = checkWinningCondition(fields, position);
    toggle = !toggle;
  }
  console.log("");
  console.log("끝");
  console.log(
    `${toggle ? "X" : "O"} 승리 lastPosition: x:${position.x} y:${position.y}`
  );
  return toggle;
}

// mainComputer();

// (async function () {
//   while (true) {
//     await mainComputer();
//   }
// })();
