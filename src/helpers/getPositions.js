const getPositions = (size) => {
  return [
    [ // red
      {x: -(size.y * .25) - 40, y: -(size.y * .16)},
      {x: -(size.y * .25) - 40, y: size.y * .16},

      {x: -(size.x * .45), y: size.y * .0},
      
      {x: -(size.x * .32), y: size.y * .08},
      {x: -(size.x * .32), y: -(size.y * .08)},
    ],

    [ // blue
      {x: (size.y * .25) + 40, y: -(size.y * .16)},
      {x: (size.y * .25) + 40, y: size.y * .16},

      {x: (size.x * .45), y: size.y * .0},

      {x: (size.x * .32), y: size.y * .08},
      {x: (size.x * .32), y: -(size.y * .08)},
    ]
  ];
}

export default getPositions;