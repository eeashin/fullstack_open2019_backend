require('dotenv').config()
const express = require("express");
const Person = require('./models/person')
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
const morgan = require("morgan");
app.use(express.static("build"));
app.use(bodyParser.json());

morgan.token("data", function (req) {
  if (req.method === "DELETE") {
    return JSON.stringify(req.params);
  } else if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return;
});

app.use(morgan(":method :url :status :response-time ms :data"));

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

// const unknownEndpoint = (request, response) => {
//   response.status(404).send({ error: 'unknown endpoint' })
// }
// // handler of requests with unknown endpoint
// app.use(unknownEndpoint)

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
];

app.get("/info", (req, res) => {
  let date = new Date();
  let message = `Phonebook has info for ${persons.length} people.`;
  res.send(`${date}<br/>${message}`);
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }

    })
    .catch(error => next(error))
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map(n => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "name missing"
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: "number missing"
    });
  } else if (
    persons
      .map(person => person.name.toLowerCase())
      .indexOf(body.name.toLowerCase()) > -1 === true) {
    return response.status(400).json({
      error: "Name must be unique"
    });
  } else {
    const person = new Person({
      name: body.name,
      number: body.number,
      id: generateId()
    });

    person.save().then(savedPerson => savedPerson.toJSON())
      .then(savedAndFormattedPerson => {
        response.json(savedAndFormattedPerson)
      }).catch(error => next(error))
  }
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
