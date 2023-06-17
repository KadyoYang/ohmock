import { Position2D, PlayerDescription, FieldStatus } from "./om.common.dto";

/** 오목 플레이어 인터페이스 */
export interface OmPlayer {
  /** 플레이어 소개정보를 반환한다 */
  getDescription(): PlayerDescription;

  /** 오목판 정보를 받고 다음 수의 좌표값을 반환한다 */
  dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D>;
}
