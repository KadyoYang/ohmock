export interface PlayerDescription {
  nickname: string;
  tactics: string;
}

/**
 * 2차원 배열
 * array[y][x]
 *
 * [[0][0] [0][1] [0][2] [0][3]]
 *
 * [[1][0] [1][1] [1][2] [1][3]]
 *
 * [[2][0] [2][1] [2][2] [2][3]]
 *
 * [[3][0] [3][1] [3][2] [3][3]]
 */
export type Fields = string[][];

export interface Position2D {
  x: number;
  y: number;
}

export interface FieldStatus {
  fields: Fields;
  lastStonePosition?: Position2D;
}

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
