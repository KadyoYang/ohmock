"use client";
import { Fields } from "@/game/om.common.dto";
import { createNewFields } from "@/game/om.core";
import { OmPlayer } from "@/game/om.player.interface";
import {
  NinjaNoob,
  NinjaNoobAdvanced,
  NinjaNoobAdvanced2X,
} from "@/game/player/sample";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { game } from "./game";

/** 19줄 바둑판  */
export default function Board() {
  console.log("refresh");
  const [fields, setFields] = useState<Fields>(createNewFields(19, 19));
  const [turn, setTurn] = useState<boolean>(true);

  const [oPlayer, setOplayer] = useState<OmPlayer>(new NinjaNoob());
  const [xPlayer, setXPlayer] = useState<OmPlayer>(new NinjaNoobAdvanced2X());
  const [winner, setWinner] = useState<string>();
  const [isDraw, setIsDraw] = useState<boolean>(false);
  // const [oGame, setOGame] = useState<any>(game(oPlayer, xPlayer));
  const delayMs = 100;
  // const oPlayer = new NinjaNoob();
  // const xPlayer = new NinjaNoob();

  // useEffect(() => {
  //   // setOplayer(new NinjaNoob());
  //   // setXPlayer(new NinjaNoob());
  // }, []);
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
        const result = await game(oPlayer, xPlayer, [...fields], turn);
        setFields(result.fields);
        await sleep(delayMs);
        if (result.winner) {
          setWinner(result.winner);
        }
        if (result.isDraw) {
          // 꽉 찼을때 빈배열 찾느라 무한루프 돌아서 렉걸리는 이슈가 있었다 비기는거 체크하면 끝
          // 흠 잘 안되는 원인 찾았으니까 클로저 다시 써도 무관 아니야?
          setIsDraw(result.isDraw);
        }
        setTurn(!turn);
      } catch (err) {
        console.log("catchcatch");
      } finally {
        await sleep(delayMs);
      }
    }
    if (winner || isDraw) {
      return;
    }
    gameCounter();
  }, [turn]);

  const lines = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  ];

  return (
    <BoardWrapper>
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
      </OhmockBoard>
    </BoardWrapper>
  );
}

const BoardWrapper = styled.div`
  background: #4f4f4f;
  padding: 20px 20px 20px 20px;
  margin: 0px;
  border-radius: 1px;
  border: 3px solid #bf4f74;
  color: "#BF4F74";
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
`;
