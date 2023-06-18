"use client";
import { useCallback, useEffect, useState } from "react";
import { styled } from "styled-components";
import * as playerImpls from "./player/impl";
import * as ourPlayerImpls from "../../zz_our_impls";
import { OmPlayer } from "./player/om.player.interface";

import {
  BigPlayerProfile,
  SmallPlayerProfile,
} from "./component/player-profile";
import GameBoard from "./component/game-board";

export default function OhMock() {
  console.log("ohmock refresh");
  const [begin, setBegin] = useState<boolean>(false);
  const [sleepMs, setSleepMs] = useState<number>(1000);
  const [players, setPlayers] = useState<Array<OmPlayer>>([]);

  const [bPlayer, setBPlayer] = useState<OmPlayer | null>(null);
  const [wPlayer, setWPlayer] = useState<OmPlayer | null>(null);

  const playerInstances = useCallback(() => {
    return [
      ...Object.values(playerImpls).map((omClass) => new omClass()),
      ...Object.values(ourPlayerImpls).map((omClass) => new omClass()),
    ];
  }, []);
  useEffect(() => {
    setPlayers(playerInstances);
  }, [playerInstances]);

  const addCandidate = (player: OmPlayer) => {
    if (!bPlayer) {
      //@ts-ignore
      setBPlayer(new player.constructor());
    } else if (!wPlayer) {
      //@ts-ignore
      setWPlayer(new player.constructor());
    } else {
      console.log("player 꽉참");
    }
  };

  // load classes

  // pick a player

  // begin the game sd

  // result;

  if (begin && bPlayer && wPlayer) {
    return (
      <GameBoard
        oPlayer={bPlayer}
        xPlayer={wPlayer}
        onGameEnd={() => setBegin(false)}
        delayMs={sleepMs}
      />
    );
  }

  return (
    <OhMockWrapper>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <BigPlayerProfile
          description={bPlayer?.getDescription()}
          customClickEvent={() => setBPlayer(null)}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
          }}
        >
          <button
            onClick={() => {
              setBegin(true);
            }}
          >
            {"Drop the stone"}
          </button>
          <button
            onClick={() => {
              const i = Math.floor(Math.random() * 2);
              if (i) {
                const temp = bPlayer;
                setBPlayer(wPlayer);
                setWPlayer(temp);
              }
            }}
          >
            {"Suffle"}
          </button>
          <input
            style={{ backgroundColor: "black" }}
            type="number"
            placeholder="sleep ms(default 1000)"
            value={sleepMs}
            onChange={(e) => setSleepMs(Number.parseInt(e.target.value))}
          />
        </div>

        <BigPlayerProfile
          description={wPlayer?.getDescription()}
          customClickEvent={() => setWPlayer(null)}
        />
      </div>

      <OhMockPlayerInstances>
        {players.map((p, i) => {
          return (
            <SmallPlayerProfile
              description={p.getDescription()}
              key={i}
              customClickEvent={() => {
                addCandidate(p);
              }}
              //   onClick={() => console.log("click    ")}
            />
          );
        })}
      </OhMockPlayerInstances>
    </OhMockWrapper>
  );
}

const OhMockWrapper = styled.div`
  margin: 0 auto;
  background: grey;
  display: flex;
  flex-direction: column;
`;

const OhMockSelectedPlayer = styled.div`
  margin: 10px 10px;
  width: 100px;
  height: 100px;
  background: blue;
`;

const OhMockPlayerInstances = styled.div`
  background: pink;
  display: flex;
  justify-content: center;
`;
