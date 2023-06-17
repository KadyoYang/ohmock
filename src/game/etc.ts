import { checkWinningCondition } from "./om.core";

const a = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];
// console.log(a.length);
// console.log(a.flat().length / a.length);
// console.log(a);

const b = [
  ["", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""],
];

// console.log(b.length);
// console.log(b.flat().length / b.length);

const c = [
  ["O", "", "", "", ""],
  ["", "O", "", "", ""],
  ["", "", "O", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
];

// console.log(c.length);
// console.log(c.flat().length / c.length);

// console.log(
//   checkWinningCondition(
//     [
//       ["O", "", "", "", ""],
//       ["", "O", "", "", ""],
//       ["", "", "O", "", ""],
//       ["", "", "", "", ""],
//       ["", "", "", "", ""],
//     ] as any,
//     { x: 0, y: 0 }
//   )
// );

// console.log(
//   checkWinningCondition(
//     [
//       ["O", "", "", "", ""],
//       ["", "O", "", "", ""],
//       ["", "", "O", "", ""],
//       ["", "", "", "O", ""],
//       ["", "", "", "", ""],
//     ] as any,
//     { x: 0, y: 0 }
//   )
// );

console.log(
  checkWinningCondition(
    [
      ["O", "O", "", "", ""],
      ["", "O", "", "", ""],
      ["", "O", "O", "", ""],
      ["", "O", "", "O", ""],
      ["", "O", "", "", "O"],
    ] as any,
    { x: 1, y: 4 }
  )
);

console.log(
  checkWinningCondition(
    [
      ["O", "O", "", "", ""],
      ["", "O", "", "", ""],
      ["", "O", "O", "", ""],
      ["", "O", "", "O", ""],
      ["", "O", "", "", "O"],
    ] as any,
    { x: 1, y: 4 }
  )
);
