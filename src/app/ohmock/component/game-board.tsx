"use client";
import { createNewFields } from "../util";

import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { game } from "./game";
import { Position2D, OmPlayer, Fields } from "../player/om.player.interface";

/** 19줄 바둑판  */
const GameBoard: React.FC<{
  oPlayer: OmPlayer;
  xPlayer: OmPlayer;
  onGameEnd: () => void;
  delayMs: number;
}> = ({ oPlayer, xPlayer, onGameEnd, delayMs }) => {
  console.log("refresh");
  const [fields, setFields] = useState<Fields>(createNewFields(19, 19));
  const [stoneHistory, setStoneHistory] = useState<Array<Position2D>>([]);
  const [turn, setTurn] = useState<boolean>(true);

  const [winner, setWinner] = useState<string>();
  const [isDraw, setIsDraw] = useState<boolean>(false);
  const [isRuleViolator, setIsRuleViolator] = useState<boolean>(false);

  function sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  useEffect(() => {}, [fields]);

  // game counter
  useEffect(() => {
    console.log("ggcgc");
    async function gameCounter() {
      try {
        const result = await game(
          oPlayer,
          xPlayer,
          {
            fields: [...fields],
            lastStonePosition:
              stoneHistory.length > 0
                ? stoneHistory[stoneHistory.length - 1]
                : undefined,
          },
          turn
        );
        setFields(result.fieldsStatus.fields);
        setStoneHistory([
          ...stoneHistory,
          result.fieldsStatus.lastStonePosition as Position2D,
        ]);

        await sleep(delayMs);
        if (result.winner) {
          setWinner(result.winner);
        }
        if (result.isDraw) {
          setIsDraw(result.isDraw);
        }
        if (result.ruleViloator) {
          setIsRuleViolator(true);
        }
        setTurn(!turn);
      } catch (err) {
        console.log("catchcatch");
        console.error(err);
      } finally {
        await sleep(delayMs);
      }
    }
    if (winner || isDraw || isRuleViolator) {
      return;
    }
    gameCounter();
  }, [turn]);

  const lines = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  ];

  return (
    <BoardWrapper>
      <StatusBoard>
        <h4>상황판 - {stoneHistory.length} 수</h4>
        {winner && (
          <>
            <h1>
              {"승자는 " +
                (winner === "O"
                  ? `흑돌 (${oPlayer.getDescription().nickname})`
                  : `백돌 (${xPlayer.getDescription().nickname})`)}
            </h1>
            <button onClick={() => onGameEnd()}>{"끝내기"}</button>
          </>
        )}
        {isRuleViolator && (
          <>
            <h1>
              {"규칙 위반 발생 몰수패" +
                (turn
                  ? `흑돌 (${oPlayer.getDescription().nickname})`
                  : `백돌 (${xPlayer.getDescription().nickname})`)}
            </h1>
            <button onClick={() => onGameEnd()}>{"끝내기"}</button>
          </>
        )}
        {isDraw && (
          <>
            <h1>{"무승부"}</h1>
            <button onClick={() => onGameEnd()}>{"끝내기"}</button>
          </>
        )}
      </StatusBoard>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div>{`흑돌 (${oPlayer.getDescription().nickname})`}</div>
        </div>
        <OhmockBoard>
          {lines.map((line, index) => {
            return <VerticalLine key={index} line={line} />;
          })}
          {lines.map((line, index) => {
            return <HorizontalLine key={index} line={line} />;
          })}

          {fields.map((y, yIdx) => {
            return y.map((x, xIdx) => {
              return (
                <Circle
                  key={xIdx}
                  linex={xIdx}
                  liney={yIdx}
                  color={x === "O" ? "black" : "white"}
                  visibility={x !== ""}
                />
              );
            });
          })}

          {stoneHistory.length > 0 && (
            <RedEmptyCircle
              linex={stoneHistory[stoneHistory.length - 1].x}
              liney={stoneHistory[stoneHistory.length - 1].y}
            />
          )}
        </OhmockBoard>
        <div>
          <div>{`백돌 (${xPlayer.getDescription().nickname})`}</div>
        </div>
      </div>
    </BoardWrapper>
  );
};

const BoardWrapper = styled.div`
  background: #4f4f4f;
  padding: 20px 20px 20px 20px;
  margin: 0px;
  border-radius: 1px;
  border: 3px solid #bf4f74;
  color: "#BF4F74";
`;

const StatusBoard = styled.div`
  background: black;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const OhmockBoard = styled.div`
  background: grey;
  margin: 0 auto;
  width: 760px;
  height: 760px;
  position: relative;
`;

const VerticalLine = styled.div<{ line: number }>`
  border-left: 2px solid black;
  height: 760px;
  left: ${(props) => props.line * (760 / 18)}px;
  position: absolute;
`;

const HorizontalLine = styled.div<{ line: number }>`
  border-top: 2px solid black;
  width: 760px;
  top: ${(props) => props.line * (760 / 18)}px;
  position: absolute;
`;

const Circle = styled.div<{
  linex: number;
  liney: number;
  color: string;
  visibility: boolean;
}>`
  /* width: 30px;
  height: 30px; */
  padding: 15px;
  border: 2px;
  border-radius: 30px;
  background: ${(props) => props.color};
  display: ${(props) => (props.visibility ? "block" : "none")};

  top: ${(props) => props.liney * (760 / 18) - 14}px;
  left: ${(props) => props.linex * (760 / 18) - 14}px;

  position: absolute;
  z-index: 98;
`;

const RedEmptyCircle = styled.div<{
  linex: number;
  liney: number;
}>`
  /* width: 30px;
  height: 30px; */
  padding: 12px;
  border: 3px solid red;
  border-radius: 30px;
  background: transparent;
  z-index: 99;

  top: ${(props) => props.liney * (760 / 18) - 14}px;
  left: ${(props) => props.linex * (760 / 18) - 14}px;

  position: absolute;
`;

export default GameBoard;
