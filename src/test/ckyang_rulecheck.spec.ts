import RandomRandomRandom from "../zz_our_impls/random.player.impl";
import { Position2D } from "../zz_our_impls/interface";
import { createNewFields, game } from "./test_util";
import CkyangPlayerImpl from "../zz_our_impls/ckyang.player.impl";

// 테스트하고자 하는 것을 위치
const dstClass = CkyangPlayerImpl;

describe("오목 구현체 테스트[ckyang.player.impl.ts]", () => {
  it("두면 안되는 곳에 두지 않아야한다 [1회차]", async () => {
    async function check(): Promise<boolean> {
      const fields = createNewFields(19, 19);
      const stoneHistory: Position2D[] = [];
      // @ts-ignore
      const op = new dstClass();
      // @ts-ignore
      const xp = new RandomRandomRandom();
      let turn: boolean = true;

      let winner: string | null = null;
      let isDraw = false;
      let isRuleViolator = false;

      while (true) {
        const result = await game(
          op,
          xp,
          {
            fields,
            lastStonePosition:
              stoneHistory.length > 0
                ? stoneHistory[stoneHistory.length - 1]
                : undefined,
          },
          turn
        );

        stoneHistory.push(result.fieldsStatus.lastStonePosition as Position2D);
        if (result.winner) {
          //   winner = result.winner;
        }
        if (result.isDraw) {
          isDraw = result.isDraw;
        }
        if (result.ruleViloator) {
          isRuleViolator = true;
          throw new Error("룰 어기는 상황 발생");
        }

        if (winner || isDraw || isRuleViolator) {
          break;
        }
      }
      return false;
    }

    await check();
  });

  it("두면 안되는 곳에 두지 않아야한다 [2회차]", async () => {
    async function check(): Promise<boolean> {
      const fields = createNewFields(19, 19);
      const stoneHistory: Position2D[] = [];
      // @ts-ignore
      const op = new RandomRandomRandom();
      // @ts-ignore
      const xp = new dstClass();
      let turn: boolean = true;

      let winner: string | null = null;
      let isDraw = false;
      let isRuleViolator = false;

      while (true) {
        const result = await game(
          op,
          xp,
          {
            fields,
            lastStonePosition:
              stoneHistory.length > 0
                ? stoneHistory[stoneHistory.length - 1]
                : undefined,
          },
          turn
        );

        stoneHistory.push(result.fieldsStatus.lastStonePosition as Position2D);
        if (result.winner) {
          //   winner = result.winner;
        }
        if (result.isDraw) {
          isDraw = result.isDraw;
        }
        if (result.ruleViloator) {
          isRuleViolator = true;
          throw new Error("룰 어기는 상황 발생");
        }

        if (winner || isDraw || isRuleViolator) {
          break;
        }
      }
      return false;
    }

    await check();
  });

  it("정상적인 승리까지 예외가 없어야한다 [1회차]", async () => {
    async function check(): Promise<boolean> {
      const fields = createNewFields(19, 19);
      const stoneHistory: Position2D[] = [];
      // @ts-ignore
      const op = new dstClass();
      // @ts-ignore
      const xp = new RandomRandomRandom();
      let turn: boolean = true;

      let winner: string | null = null;
      let isDraw = false;
      let isRuleViolator = false;

      while (true) {
        const result = await game(
          op,
          xp,
          {
            fields,
            lastStonePosition:
              stoneHistory.length > 0
                ? stoneHistory[stoneHistory.length - 1]
                : undefined,
          },
          turn
        );

        stoneHistory.push(result.fieldsStatus.lastStonePosition as Position2D);
        if (result.winner) {
          winner = result.winner;
        }
        if (result.isDraw) {
          isDraw = result.isDraw;
        }
        if (result.ruleViloator) {
          isRuleViolator = true;
          throw new Error("룰 어기는 상황 발생");
        }

        if (winner || isDraw || isRuleViolator) {
          break;
        }
      }
      return false;
    }

    await check();
  });

  it("정상적인 승리까지 예외가 없어야한다 [2회차]", async () => {
    async function check(): Promise<boolean> {
      const fields = createNewFields(19, 19);
      const stoneHistory: Position2D[] = [];
      // @ts-ignore
      const op = new RandomRandomRandom();
      // @ts-ignore
      const xp = new dstClass();
      let turn: boolean = true;

      let winner: string | null = null;
      let isDraw = false;
      let isRuleViolator = false;

      while (true) {
        const result = await game(
          op,
          xp,
          {
            fields,
            lastStonePosition:
              stoneHistory.length > 0
                ? stoneHistory[stoneHistory.length - 1]
                : undefined,
          },
          turn
        );

        stoneHistory.push(result.fieldsStatus.lastStonePosition as Position2D);
        if (result.winner) {
          winner = result.winner;
        }
        if (result.isDraw) {
          isDraw = result.isDraw;
        }
        if (result.ruleViloator) {
          isRuleViolator = true;
          throw new Error("룰 어기는 상황 발생");
        }

        if (winner || isDraw || isRuleViolator) {
          break;
        }
      }
      return false;
    }

    await check();
  });
});
