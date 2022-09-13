// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
  hasStarted: false,
};

// store the map for track id and track name
const track_id_map = {};

// store the map for race id and race name
const race_id_map = {};

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  onPageLoad();
  setupClickHandlers();
});

// Get track and Racer information after the page is loaded
async function onPageLoad() {
  try {
    getTracks().then((tracks) => {
      const html = renderTrackCards(tracks);
      renderAt("#tracks", html);
    });

    getRacers().then((racers) => {
      const html = renderRacerCars(racers);
      renderAt("#racers", html);
    });
  } catch (error) {
    console.log("Problem getting tracks and racers ::", error.message);
    console.error(error);
  }
}

// Set up the click actions for all the buttons
function setupClickHandlers() {
  document.addEventListener(
    "click",
    function (event) {
      const { target } = event;
      const selectedTrack = target.closest(".card.track");
      const selectedRacer = target.closest(".card.podracer");

      // Race track form field
      if (target.closest(".card.track")) {
        handleSelectTrack(selectedTrack);
      }

      // Podracer form field
      else if (target.closest(".card.podracer")) {
        handleSelectPodRacer(selectedRacer);
      }

      // Submit create race form
      else if (target.closest("#submit-create-race")) {
        event.preventDefault();

        // check if both selections are picked
        if (!store.track_id || !store.player_id) {
          alert("Plese select both Racer and Track.");
          return;
        }

        // start race
        handleCreateRace();
      }

      // Handle acceleration click
      else if (target.closest("#gas-peddle")) {
        handleAccelerate();
      }
    },
    false
  );
}

// Give some wait time for the page to be fully loaded
async function delay(ms) {
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
  // render starting UI
  renderAt("#race", renderRaceStartView(track_id_map["track_id"]));

  // Get player_id and track_id from the store
  const { player_id, track_id } = store;

  // invoke the API call to create the race, then save the result
  const race = await createRace(player_id, track_id);

  // For the API to work properly, the race id should be race id - 1
  store["race_id"] = race.ID - 1;

  // The race has been created, now start the countdown
  // call the async function runCountdown
  await runCountdown();

  // call the async function startRace
  startRace(store["race_id"]);

  // call the async function runRace
  runRace(store["race_id"]);
}

// Control the race in progress
function runRace(raceID) {
  // enable the acceleration button
  store.hasStarted = true;

  return new Promise((resolve) => {
    const raceInterval = setInterval(() => {
      getRace(raceID)
        .then((res) => {
          if (res.status === "in-progress") {
            renderAt("#leaderBoard", raceProgress(res.positions));
          } else if (res.status === "finished") {
            clearInterval(raceInterval);
            renderAt("#race", resultsView(res.positions));
            resolve(res);
          }
        })
        .catch((err) => {
          console.log(`Error found at runRace request: ${err}`);
        });
    }, 500);
  });
}

// Count down the number before the race starts
async function runCountdown() {
  try {
    // wait for the DOM to load
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        document.getElementById("big-numbers").innerHTML = --timer;
        if (!timer) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  } catch (error) {
    console.log(error);
  }
}

// Configure the race selection options
function handleSelectPodRacer(target) {
  // remove class selected from all racer options
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");
  store.player_id = parseInt(target.id);
}

// Configure the track selection options
function handleSelectTrack(target) {
  // remove class selected from all track options
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");
  store.track_id = parseInt(target.id);
}

function handleAccelerate() {
  if (store.hasStarted) {
    accelerate(store.race_id);
  }
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove
// Render the racer cars to the page
function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`;
  }

  const results = racers.map(renderRacerCard).join("");

  return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

// Format each racer option
function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;

  return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>Top Speed: ${top_speed}</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling: ${handling}</p>
		</li>
	`;
}

// Render the track to the page
function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`;
  }

  const results = tracks.map(renderTrackCard).join("");

  return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

// Format each track option
function renderTrackCard(track) {
  const { id, name } = track;

  return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`;
}

// Render count down
function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

// Render the starting page of the race
function renderRaceStartView(track) {
  return `
		<header id="header-background">
			<h1>Race: ${track}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

// Render the results page
function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header id="header-background">
			<h1>Race Results</h1>
		</header>
		<main id="two-columns">
			<section>
				${raceProgress(positions)}
				<a href="/race">Start a new race</a>
			</section>
		</main>
	`;
}

// Render the race in progress
function raceProgress(positions) {
  let userPlayer = positions.find((e) => e.id === store.player_id);
  userPlayer.driver_name += " (you)";

  positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  let count = 1;

  const results = positions
    .map((p) => {
      return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`;
    })
    .join("");

  return `
		<h3>Leaderboard</h3>
		<section id="leaderBoard">
			${results}
		</section>
	`;
}

// Render function to render part of the page with customized HTML
function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

const SERVER = "http://localhost:8000";

function defaultFetchOpts() {
  return {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SERVER,
    },
  };
}

// GET request to `${SERVER}/api/tracks`
function getTracks() {
  return fetch(`${SERVER}/api/tracks`)
    .then((res) => res.json())
    .then((tracks) => {
      tracks.map((track) => {
        track_id_map[track.id] = track.name;
      });
      return tracks;
    })
    .catch((err) => {
      console.log(`Error found at getTracks request: ${err}`);
    });
}

// GET request to `${SERVER}/api/cars`
function getRacers() {
  return fetch(`${SERVER}/api/cars`)
    .then((res) => res.json())
    .then((races) => {
      races.map((race) => {
        race_id_map[race.id] = race.driver_name;
      });
      return races;
    })
    .catch((err) => {
      console.log(`Error found at getRacers request: ${err}`);
    });
}

// Create the race
function createRace(player_id, track_id) {
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };
  return fetch(`${SERVER}/api/races`, {
    method: "POST",
    ...defaultFetchOpts(),
    dataType: "jsonp",
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((err) => console.log("Problem with createRace request::", err));
}

// Get a race
function getRace(id) {
  return fetch(`${SERVER}/api/races/${id}`).then((res) => res.json());
}

// Start a race
function startRace(id) {
  return fetch(`${SERVER}/api/races/${id}/start`, {
    method: "POST",
    ...defaultFetchOpts(),
  })
    .then((res) => res)
    .catch((err) => console.log("Problem with getRace request::", err));
}

// Accelerate the player's car in the race
function accelerate(id) {
  fetch(`${SERVER}/api/races/${id}/accelerate`, {
    method: "POST",
    ...defaultFetchOpts(),
    mode: "cors",
  }).catch((err) => console.log("Problem with accelerate request::", err));
}
