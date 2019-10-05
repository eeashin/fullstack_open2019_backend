require('dotenv').config()
const express = require("express");
const Person = require('./models/person')
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const cors = require("cors");
app.use(cors());
const morgan = require("morgan");
app.use(express.static("build"));

morgan.token("data", function(req) {
  if (req.method === "DELETE") {
    return JSON.stringify(req.params);
  } else if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return;
});

app.use(morgan(":method :url :status :response-time ms :data"));



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
  Person.find({}).then(persons =>{
    res.json(persons.map(person => person.toJSON()))
  })
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
  response.status(204).end();
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map(n => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons", (request, response) => {
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
      .indexOf(body.name.toLowerCase()) > -1 ===true)
      {
    return response.status(400).json({
      error: "Name must be unique"
    });
  } else {
    const person = new Person({
      name: body.name,
      number: body.number,
      id: generateId()
    });

   person.save().then(savedPerson => {
     response.json(savedPerson.toJSON())
   })
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
