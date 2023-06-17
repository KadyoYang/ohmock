import { Fields, Position2D } from "@/game/om.common.dto";
import { checkWinningCondition, isFieldsFull } from "@/game/om.core";
import { OmPlayer } from "@/game/om.player.interface";

export const game = async (
  oPlayer: OmPlayer,
  xPlayer: OmPlayer,
  fields: Fields,
  turn: boolean
): Promise<{
  fields: Fields;
  winner: null | "O" | "X";
  ruleViloator: null | "O" | "X";
  isDraw: boolean;
}> => {
  let lastStonePosition: Position2D = { x: -1, y: -1 };

  let winner: null | "O" | "X" = null;
  let ruleViloator: null | "O" | "X" = null;
  let isDraw: boolean = false;

  const position = turn
    ? await oPlayer.dropTheStone({ fields, lastStonePosition }, "O")
    : await xPlayer.dropTheStone({ fields, lastStonePosition }, "X");

  if (fields[position.y][position.x] !== "") {
    // throw new Error("rule violations detected");
    ruleViloator = turn ? "O" : "X";
    return {
      fields,
      winner,
      ruleViloator,
      isDraw,
    };
  }

  fields[position.y][position.x] = turn ? "O" : "X";

  if (checkWinningCondition(fields, position)) {
    winner = turn ? "O" : "X";
    return {
      fields,
      winner,
      ruleViloator,
      isDraw,
    };
  }
  if (isFieldsFull(fields)) {
    isDraw = true;
    return {
      fields,
      winner,
      ruleViloator,
      isDraw,
    };
  }
  return {
    fields,
    winner,
    ruleViloator,
    isDraw,
  };
};
