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
      },
      null,
      2
    )
  )
}
