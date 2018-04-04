/*
 * Copyright 2009-2017 C3, Inc. dba C3 IoT (www.c3iot.com). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret
 * and proprietary information of C3 IoT and its licensors. Reproduction, use and distribution
 * of this material in any form is strictly prohibited except as set forth in a written
 * license agreement with C3 IoT and/or its authorized distributors.
 * This product may be covered by one or more U.S. patents or pending patent applications.
 */


function getTraveledLongest() {
  // Get a list of the aircrafts
  // Determine total distance traveled
  var flights = Flight.fetch({include: "id, route, aircraft"}), 
    longestDistance = 0;
  var longestAircraft;
  var aircrafts = {};

  flights.objs.each(function(flight) {
    var distance = Route.getDistance(flight.route.id);
    var aircraft = flight.aircraft;

    if (aircrafts[aircraft.id] == null) {
      aircrafts[aircraft.id] = distance;
    } else {
      aircrafts[aircraft.id] = aircrafts[aircraft.id] + distance;
    }

    if (aircrafts[aircraft.id] > longestDistance) {
      longestDistance = aircrafts[aircraft.id];
      longestAircraft = aircraft;
    }
  });

  return longestAircraft;
}