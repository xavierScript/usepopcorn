import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const KEY = "ac8e8929";

let movieDetails;
let displayedMovies;

export default function App() {
  const [movies, setMovies] = useState("");
  const [query, setQuery] = useState("");

  return (
    <>
      <Navigation movies={movies} query={query} setQuery={setQuery} />
      <Main
        movies={movies}
        setMovies={setMovies}
        query={query}
        setQuery={setQuery}
      />
    </>
  );
}

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Navigation({ movies, query, setQuery }) {
  return (
    <nav className="nav-bar">
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
      />
      <p className="num-results">
        Found <strong>{movies ? movies.length : 0}</strong> results
      </p>
    </nav>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function Main({ movies, setMovies, query, setQuery }) {
  const [watched, setWatched] = useState([]);
  const [isOpen1, setIsOpen1] = useState(true);
  const [isOpen2, setIsOpen2] = useState(true);
  const [selectedId, setSelectedId] = useState({});
  const [clickedMovie, displayClickedMovie] = useState(false);
  const [userRating, setUserRating] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  function onAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title: clickedMovie.Title,
      year: clickedMovie.Year,
      poster: clickedMovie.Poster,
      imdbRating: Number(clickedMovie.ImdbRating),
      runtime: Number(clickedMovie.Runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
  }

  useEffect(
    function () {
      async function movieData() {
        try {
          const fetchData = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          );
          const result = await fetchData.json();

          movieDetails = result.Search;
          console.log(movieDetails);
          setMovies(movieDetails);
        } catch (err) {
          console.log(err);
        }
      }
      movieData();
    },
    [query, setMovies]
  );

  useEffect(
    function () {
      async function getClickedMovieDetails() {
        try {
          setIsLoading(true);
          const fetchData = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
          );
          const result = await fetchData.json();

          displayedMovies = result;
          displayClickedMovie(displayedMovies);
        } catch (err) {
          console.log(err);
        } finally {
          setIsLoading(false);
        }
      }
      getClickedMovieDetails();
    },
    [selectedId, displayClickedMovie]
  );

  return (
    <main className="main">
      <div className="box">
        <button
          className="btn-toggle"
          onClick={() => setIsOpen1((open) => !open)}
        >
          {isOpen1 ? "–" : "+"}
        </button>
        {isLoading ? (
          <Loader />
        ) : (
          isOpen1 && (
            <ul className="list list-movies">
              {movies &&
                movies?.map((movie) => (
                  <li
                    key={movie.imdbID}
                    onClick={function () {
                      setSelectedId(movie.imdbID);
                      displayClickedMovie(true);
                    }}
                  >
                    <img src={movie.Poster} alt={`${movie.Title} poster`} />
                    <h3>{movie.Title}</h3>
                    <div>
                      <p>
                        <span>🗓</span>
                        <span>{movie.Year}</span>
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          )
        )}
      </div>

      <div className="box">
        <button
          className="btn-toggle"
          onClick={() => setIsOpen2((open) => !open)}
        >
          {isOpen2 ? "–" : "+"}
        </button>
        <div className="details">
          {isLoading ? (
            <Loader />
          ) : (
            isOpen2 &&
            (clickedMovie ? (
              <>
                <header>
                  <button
                    className="btn-back"
                    onClick={function () {
                      displayClickedMovie(false);
                    }}
                  >
                    &larr;
                  </button>
                  <img
                    src={clickedMovie.Poster}
                    alt={`Poster of ${clickedMovie.Title} movie`}
                  />
                  <div className="details-overview">
                    <h2>{clickedMovie.Title}</h2>
                    <p>
                      {clickedMovie.Released} &bull; {clickedMovie.Runtime}
                    </p>
                    <p>{clickedMovie.Genre}</p>
                    <p>
                      <span>⭐️</span>
                      {clickedMovie.imdbRating} IMDb rating
                    </p>
                  </div>
                </header>

                <section>
                  <div className="rating">
                    <StarRating
                      maxRating={10}
                      size={24}
                      onSetRating={setUserRating}
                    />
                    {userRating > 0 && (
                      <button className="btn-add" onClick={handleAdd}>
                        + Add to list
                      </button>
                    )}
                  </div>

                  <p>
                    <em>{clickedMovie.Plot}</em>
                  </p>
                  <p>Starring {clickedMovie.Actors}</p>
                  <p>Directed by {clickedMovie.Director}</p>
                </section>
              </>
            ) : (
              <>
                <div className="summary">
                  <h2>Movies you watched</h2>
                  <div>
                    <p>
                      <span>#️⃣</span>
                      <span>{watched.length} movies</span>
                    </p>
                    <p>
                      <span>⭐️</span>
                      <span>{avgImdbRating}</span>
                    </p>
                    <p>
                      <span>🌟</span>
                      <span>{avgUserRating}</span>
                    </p>
                    <p>
                      <span>⏳</span>
                      <span>{avgRuntime} min</span>
                    </p>
                  </div>
                </div>

                <ul className="list">
                  {watched.map((movie) => (
                    <li key={movie.imdbID}>
                      <img src={movie.poster} alt={`${movie.title} poster`} />
                      <h3>{movie.title}</h3>
                      <div>
                        <p>
                          <span>⭐️</span>
                          <span>{movie.imdbRating}</span>
                        </p>
                        <p>
                          <span>🌟</span>
                          <span>{movie.userRating}</span>
                        </p>
                        <p>
                          <span>⏳</span>
                          <span>{movie.runtime} min</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
