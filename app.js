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
  try{
    const moviesList = await db.all(queryForGettingMovies)
    res.send(moviesList.map(movie => ({movieName: movie.movie_name})))
  }catch(error){
    console.log(error)
    res.status(500).send({message: 'Error retrieving list of movie name'})
  }
})

// Creating a new movie in movie table API
app.use(express.json())

app.post('/movies/', async (req, res) => {
  const movieDetail = req.body
  const {directorId, movieName, leadActor} = movieDetail
  const addMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`
  try{
    await db.run(addMovieQuery)
    res.send('Movie Successfully Added')
  }catch(error){
    console.log(error)
    res.status(500).send({message: 'Error in creating new movie'})
  }
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
    res.status(500).send({message: 'Error retrieving movie'})
  }
})


// Updates the details of a movie in the movie table based on the movie ID API
app.put('/movies/:movieId/', async (req,res) => {
  const {movieId} = req.params
  const movieDetailForUpdate = req.body
  const {directorId, movieName, leadActor} = movieDetailForUpdate
  const UpdateMovieDetailQuery = `UPDATE movie SET director_id=${directorId}, movie_name='${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId};`
  try{
    await db.run(UpdateMovieDetailQuery)
    res.send('Movie Details Updated')
  }catch(error){
    console.log(error)
    res.status(500).send({message: 'Error in updating movie details'})
  }
})


// Deletes a movie from the movie table based on the movie ID API
app.delete('/movies/:movieId/', async (req,res) => {
  const {movieId} = req.params
  const queryForDeletingMovie = `DELETE FROM movie WHERE movie_id = ${movieId};`
  try{
    await db.run(queryForDeletingMovie)
    res.send('Movie Removed')
  }
  catch(error){
    console.log(error)
    res.send("Error in deleting movie")
  }
})


// Returns a list of all directors in the director table API
app.get('/directors/', async (req,res) => {
  const gettingDirectorsQuery = `SELECT * FROM director;`
  try{
    const directors = await db.all(gettingDirectorsQuery)
    res.send(directors.map((director) => ({directorId:director.director_id,directorName:director.director_name})))
  }catch(error){
    console.log(error)
    res.send("Error in getting directors list")
  }
})


// Returns a list of all movie names directed by a specific director API
app.get('/directors/:directorId/movies/', async (req,res) => {
  const {directorId} = req.params
  const queryGettingMoviesNameByDirectorId = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`
  try{
    const moviesName = await db.all(queryGettingMoviesNameByDirectorId)
    const movieNames = moviesName.map(movie => ({ movieName: movie.movie_name }));
    res.send(movieNames);
  }catch(error){
    console.log(error)
    res.send("Error in getting movies names list")
  }
})


module.exports = app

