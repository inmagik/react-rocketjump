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
            title: 'Learn React',
          },
          {
            id: 2,
            done: true,
            title: 'Prepare dinner',
          },
          {
            id: 3,
            done: false,
            title: 'Learn RocketJump',
          },
        ],
      },
      null,
      2
    )
  )
}
