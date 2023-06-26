import CkyangPlayerImpl from "./ckyang.player.impl";
import { Fields } from "./interface";

const log = (args: any) => console.dir(args, { depth: null });

describe("ck 구현체 테스트", () => {
  const player = new CkyangPlayerImpl();
  it("makePointMap이 잘 동작", () => {
    // const player = new CkyangPlayerImpl();
    const map = player.makePointMap(3, 3);

    expect(map.length).toBe(3);
    expect(map[0].length).toBe(3);
    expect(map.flat().length).toBe(9);
    expect(map.flat().filter((v) => v === 0).length).toBe(9);
  });

  it("calcLinePoints_1", () => {
    const fields: Fields = [
      ["O", "O", "O", ""],
      ["X", "X", "X", ""],
      ["", "", "", ""],
      ["", "", "", ""],
    ];
    const oPointMap = player.makePointMap(4, 4);
    const xPointMap = player.makePointMap(4, 4);

    player.clacLinePoints(fields, oPointMap, "O");
    player.clacLinePoints(fields, xPointMap, "X");

    expect(oPointMap[0][3]).toEqual(12);
    expect(xPointMap[1][3]).toEqual(12);
  });
});
