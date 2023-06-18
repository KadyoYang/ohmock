import { FieldStatus, OmPlayer, Position2D } from "../zz_our_impls/interface";

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const printFields = (fields: string[][]): void => {
  let range = (n: number) => Array.from(Array(n).keys());
  const yMax = fields.length;
  const xMax = fields.flat().length / yMax;

  console.dir(
    "  " +
      range(xMax)
        .map((v) => String(v)[String(v).length - 1])
        .join(" "),
    { depth: null }
  );
  let i = 0;
  for (const y of fields) {
    console.dir(
      String(i)[String(i).length - 1] +
        " " +
        y.map((v) => (!v ? " " : v)).join(" "),
      { depth: null }
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

export const game = async (
  oPlayer: OmPlayer,
  xPlayer: OmPlayer,
  fieldsStatus: FieldStatus,
  turn: boolean
): Promise<{
  fieldsStatus: FieldStatus;
  winner: null | "O" | "X";
  ruleViloator: null | "O" | "X";
  isDraw: boolean;
}> => {
  let fields = fieldsStatus.fields;

  let winner: null | "O" | "X" = null;
  let ruleViloator: null | "O" | "X" = null;
  let isDraw: boolean = false;

  // 선수에게 돌을 두라고 한다
  const position = turn
    ? await oPlayer.dropTheStone(JSON.parse(JSON.stringify(fieldsStatus)), "O")
    : await xPlayer.dropTheStone(JSON.parse(JSON.stringify(fieldsStatus)), "X");

  // runtime exception을 발생시키려고 하는 사람이 나왔을시
  // 규칙을 위반한 자가 나타났을 시 (빈 칸이 아닌곳에 돌을 둠)
  if (
    position.x > 18 ||
    position.y > 18 ||
    fields[position.y][position.x] !== ""
  ) {
    ruleViloator = turn ? "O" : "X";
    return {
      fieldsStatus: {
        fields,
        lastStonePosition: position,
      },
      winner,
      ruleViloator,
      isDraw,
    };
  }

  // 돌을 둔다
  fields[position.y][position.x] = turn ? "O" : "X";

  // 승리자가 있을 시
  if (checkWinningCondition(fields, position)) {
    winner = turn ? "O" : "X";
    return {
      fieldsStatus: {
        fields,
        lastStonePosition: position,
      },
      winner,
      ruleViloator,
      isDraw,
    };
  }

  // 무승부일시
  if (isFieldsFull(fields)) {
    isDraw = true;
    return {
      fieldsStatus: {
        fields,
        lastStonePosition: position,
      },
      winner,
      ruleViloator,
      isDraw,
    };
  }

  return {
    fieldsStatus: {
      fields,
      lastStonePosition: position,
    },
    winner,
    ruleViloator,
    isDraw,
  };
};
