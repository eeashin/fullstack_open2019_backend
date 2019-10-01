const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())


    let persons = [
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      },
      {
        "name": "Eashin Matubber",
        "number": "+358404141200",
        "id": 5
      },
      {
        "name": "again",
        "number": "01111",
        "id": 6
      }
    ]

    app.get('/', (req, res) => {
        res.send('<h1>Hello World!</h1>')
      })

      app.get('/api/persons', (req, res) => {
        res.json(persons)
      })

      

      const port = 3001
app.listen(port)
console.log(`Server running on port ${port}`)
  
