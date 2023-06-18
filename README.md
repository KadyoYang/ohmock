`This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app)`

# 환경

- node v16 (nvm use 16) (v16.20.0)
- npx 툴 존재

<br />

# 목차(구현자가 해야할 것)

1. 오목 플레이어 구현 (\*필수)
2. 오목 플레이어 유효성 테스트 (\*필수)
3. 게임 실행 (선택)

<br />
<br />
<br />

## 1\_ 오목 플레이어 구현 (`\*필수`)

```ts
// ./src/zz_our_impls/에 [원하는 파일명].ts 파일 만들기
// [원하는 파일명].ts 에 다음과 같이 클래스 정의 및 구현

import {
  FieldStatus,
  Fields,
  PlayerDescription,
  Position2D,
  OmPlayer,
} from "./interface";

export default class `[원하는 클래스 이름]` implements OmPlayer {
  getDescription(): PlayerDescription {
     // ~~ 구현
  }
  async dropTheStone(
    fieldsStatus: FieldStatus,
    yourFlag: "O" | "X"
  ): Promise<Position2D> {
    // ~~ 구현
  }
}

// 구현 후 ./src/zz_our_impls/index.ts 에 다음처럼 추가

export { default as "원하는 이름" } from "./구현파일명.player.impl";
```

<br />

## 2\_ 오목 플레이어 유효성 테스트 (`\*필수`)

```ts
// ./src/test/rulecheck.spec.ts 파일을 다음과 같이 수정

import `원하는 이름` from "../zz_our_impls/구현파일명.player.impl"

// 테스트하고자 하는 것을 위치
const dstClass = `원하는 이름`;


// 이후 npm run test
// 또는 yarn test
```

<br />

## 3\_ 게임 실행 (선택)

`npm 또는 yarn 취향껏 사용하십시오`

#### 개발 서버로 실행

```bash
npm run dev
yarn dev
```

#### 프로덕션 서버로 실행(빠름)

```bash
npm run build
yarn build
# 빌드 후 실행
npm run start
yarn start
```

#### 게임 조작

```
http://127.0.0.1:3000/ohmock 에 접속

하단에 플레이어 리스트를 클릭하면 플레이어 선택이 됩니다
플레이어 선택 취소하려면 선택된 플레이어(커다란 노란색 네모) 클릭하면 됩니다
중간에 숫자 입력하는 것은 바둑게임 진행 시간 텀입니다 default 1000ms(1sec)
게임 진행은 플레이어 두명 선택하고 Drop the stone 버튼 누르면 게임시작됩니다.

게임이 끝나면 상황판에 끝내기 글자를 클릭하면 다시 플레이어 선택으로 돌아갑니다
```
