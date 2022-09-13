jest.mock("./index");
const { createRace } = require("./index");

// tutorial url: https://www.youtube.com/watch?v=4Fl5GH4eYZ8
test("should verify the data returned by the createRace method", async () => {
  const race = await createRace(player_id, track_id);
  const { Cars, ID, PlayerID, Results, Track } = race;
  expect(Cars.length).toBe(5);
  expect(ID).toBe(1);
  expect(PlayerID).toBe(1);
  expect(Results.status).toBe("unstarted");
  expect(Results.positions.length).toBe(5);
  expect(Track.id).toBe(1);
  expect(Track.name).toBe("Track 1");
});
