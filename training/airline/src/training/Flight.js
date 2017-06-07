/*
 * Copyright 2009-2016 C3, Inc. dba C3 IoT (www.c3iot.com). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret
 * and proprietary information of C3 IoT and its licensors. Reproduction, use and distribution
 * of this material in any form is strictly prohibited except as set forth in a written
 * license agreement with C3 IoT and/or its authorized distributors.
 * This product may be covered by one or more U.S. patents or pending patent applications.
 */

/*exported departureAirports, averageDelay, aircraftWithLeastDelay */

/**
 * List of airports from which flights departed
 */
function departureAirports() {
  var hubResult = Flight.evaluate({
    projection: "unique(route.departureHub.id)"
  });
  return hubResult.at("tuples.cells.str");
}

/**
 * Average delay at airport
 */
function averageDelay(airport) {
  var departureDelays = Flight.evaluate({
    projection: "route.departureHub.id, toMillis(actualDepartureTime)-toMillis(scheduledDepartureTime)",
    filter: Filter.eq("route.departureHub.id", airport.id)
  });

  var delays = departureDelays.at("tuples.cells.number");

  return delays.reduce(function(a, b) {
    return a + b;
    }, 0
  ) / delays.length;
}

/**
 * Aircraft model with least average delay
 */
function aircraftWithLeastDelay() {

  var aircraftAverageDelay = {};

  var departureDelays = Flight.evaluate({
    projection: "aircraft.model, actualDepartureTime, scheduledDepartureTime"
  });

  var delays = departureDelays.at("tuples");

  delays = _.groupBy(delays, function(f) {
    return f.cells[0].str;
  });

  // Average delay per aircraft model
  _.each(delays, function(departures, model) {
    aircraftAverageDelay[model] = departures.reduce(
      function(a, b) {
        return a + (b.cells[1].date - b.cells[2].date);
      }, 0) / departures.length;
  });

  return _.sortBy(_.pairs(aircraftAverageDelay), '1')[0][0];
}
