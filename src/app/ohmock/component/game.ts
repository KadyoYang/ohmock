import { OmPlayer, Position2D } from "../player/om.player.interface";
import { checkWinningCondition, isFieldsFull } from "../util";
import { FieldStatus } from "../player/om.player.interface";

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
  let position: Position2D = { x: -1, y: -1 };
  try {
    position = turn
      ? await oPlayer.dropTheStone(
          JSON.parse(JSON.stringify(fieldsStatus)),
          "O"
        )
      : await xPlayer.dropTheStone(
          JSON.parse(JSON.stringify(fieldsStatus)),
          "X"
        );
  } catch (err) {
    console.error(err);
    console.error("돌을 두다가 갑자기 손이 빨라진 녀석 발생");

    // 예외 발생 돌을 두다가 갑자기 손이 빨라지는 녀석
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
