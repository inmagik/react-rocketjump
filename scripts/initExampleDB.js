const fs = require('fs')

const DB_PATH = './example/db.json'

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(
      {
        todos: [
          {
            id: 1,
            done: true,
            count: 0,
            title: 'Learn React',
          },
          {
            id: 2,
            done: true,
            count: 0,
            title: 'Prepare dinner',
          },
          {
            id: 3,
            done: false,
            count: 0,
            title: 'Learn RocketJump',
          },
        ],
        users: [
          {
            id: 1,
            name: 'GioVa'
          },
          {
            id: 2,
            name: 'Skaff0'
          },
          {
            id: 3,
            name: 'ALB1312'
          },
          {
            id: 4,
            name: 'Mr0_TH3_B0ss'
          },
        ],
      },
      null,
      2
    )
  )
}
