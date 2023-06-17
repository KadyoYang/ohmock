import { FieldStatus, PlayerDescription, Position2D } from "./om.common.dto";

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

// 이걸 구현하는 클래스? 네임이 다양할텐데 어떻게 그것을 om.core에서 받아와서 처리하느냐가 관건
// 또는 함수를 입력받고 그걸 동작?
// export default 로 하라고 하고 파일은 다운받으면 될것같기도 하다

// 또는 기왕의 Next니까 런타임에 선수 입장받고
// 그 그 그 격겜에서 도전자 받는거같이
// 이걸로 가자 파일 받아서 하는건 에바야

// class 그대로 받아서 instantiate 이거는 방법이 어떻게 있을지 모르겠다
// 또는 함수만 받는다? ㅎㅎ 에이
// 받을거면 클래스를 받자

// 프로필사진?? 그거 닉네임 해싱홰서 그냥 올려버려
// 그런데 ts 컴파일을 해야하지않나
// 컴파일된 것을 올려야하니까
// 흠 복잡하구만 하지만 가능할것같아
