const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

// Creating a server
const app = express()

// Creating database path
const dbPath = path.join(__dirname, 'moviesData.db')

// Creating a function for initializing db and server
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(
        'Server Running at http://localhost:3000/',
      )
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// Creating getting list of movies from movie table API
app.get('/movies/', async (req, res) => {
  const queryForGettingMovies = `SELECT movie_name FROM movie;`
  const moviesList = await db.all(queryForGettingMovies)
  res.send(moviesList.map(movie => ({movieName: movie.movie_name})))
})

// Creating a new movie in movie table API
app.use(express.json())

app.post('/movies/', async (req, res) => {
  const mocieDetail = req.body
  const {directorId, movieName, leadActor} = mocieDetail
  const addMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`
  await db.run(addMovieQuery)
  res.send('Movie Successfully Added')
})

// Getting a movie using movide id API
app.get('/movies/:movieId/', async (req, res) => {
  const {movieId} = req.params
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`
  try {
    const movie = await db.get(getMovieQuery)
    const movieobj = movie => {
      return {
        movieId: movie.movie_id,
        directorId: movie.director_id,
        movieName: movie.movie_name,
        leadActor: movie.lead_actor,
      }
    }
    res.send(movieobj(movie))
  } catch (error) {
    console.log(error)
    res.status(500).send({message: 'Error retrieving movie'}) // Corrected message
  }
})
