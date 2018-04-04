/*
 * Copyright 2009-2016 C3, Inc. dba C3 IoT (www.c3iot.com). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret
 * and proprietary information of C3 IoT and its licensors. Reproduction, use and distribution
 * of this material in any form is strictly prohibited except as set forth in a written
 * license agreement with C3 IoT and/or its authorized distributors.
 * This product may be covered by one or more U.S. patents or pending patent applications.
 */
/* API Test Example */
var filename = "test_flightDelay";

describe(filename, function() {
  var route = [];
  var SEC = 1000;
  var MINUTE = 60 * SEC;

  beforeAll(function() {

    var aircrafts = [{
      id: "test_aircraft1",
      model: "A380",
      hub: {
        id: "test_airport1"
      }
    }, {
      id: "test_aircraft2",
      model: "B747",
      hub: {
        id: "test_airport2"
      }
    }, {
      id: "test_aircraft3",
      model: "B777",
      hub: {
        id: "test_airport3"
      }
    }];

    Aircraft.upsertBatch(aircrafts);

    route = Route.upsertBatch([{
      id: "test_route1",
      departureHub: {
        id: "test_airport1"
      },
      arrivalHub: {
        id: "test_airport3"
      }
    }, {
      id: "test_route2",
      departureHub: {
        id: "test_airport1"
      },
      arrivalHub: {
        id: "test_airport2"
      }
    }, {
      id: "test_route3",
      departureHub: {
        id: "test_airport4"
      },
      arrivalHub: {
        id: "test_airport5"
      }
    }, {
      id: "test_route4",
      departureHub: {
        id: "test_airport6"
      },
      arrivalHub: {
        id: "test_airport7"
      }
    }]);


    var test_airport1_to_test_airport3_with_24_min_delay = {
      id: "test_flight1",
      actualDepartureTime: "2016-01-02T07:08:00.000Z",
      scheduledDepartureTime: "2016-01-02T06:44:00.000Z",
      route: {
        id: "test_route1"
      },
      aircraft: {
        id: "test_aircraft1"
      }
    };

    var test_airport1_to_test_airport2_with_4_min_delay = {
      id: "test_flight2",
      actualDepartureTime: "2016-01-02T22:44:00.000Z",
      scheduledDepartureTime: "2016-01-02T22:40:00.000Z",
      route: {
        id: "test_route2"
      },
      aircraft: {
        id: "test_aircraft1"
      }
    };

    var test_airport4_to_test_airport5_5_min_early = {
      id: "test_flight3",
      actualDepartureTime: "2016-01-02T07:25:00.000Z",
      scheduledDepartureTime: "2016-01-02T07:30:00.000Z",
      route: {
        id: "test_route3"
      },
      aircraft: {
        id: "test_aircraft2"
      }
    };

    var test_airport6_to_test_airport7_with_44_min_delay = {
      id: "test_flight4",
      actualDepartureTime: "2016-01-02T07:34:00.000Z",
      scheduledDepartureTime: "2016-01-02T06:50:00.000Z",
      route: {
        id: "test_route4"
      },
      aircraft: {
        id: "test_aircraft3"
      }
    };

    Flight.upsertBatch([
        test_airport1_to_test_airport3_with_24_min_delay,
        test_airport1_to_test_airport2_with_4_min_delay,
        test_airport4_to_test_airport5_5_min_early ,
        test_airport6_to_test_airport7_with_44_min_delay
    ]);
  });

  it("should return three unique departure hubs set up by test for all flights", function() {
    expect(Flight.departureAirports()).toContain("test_airport1", "test_airport4", "test_airport6");
  });

  it("should not include the unknown airport FOO", function() {
    expect(Flight.departureAirports()).not.toContain("FOO");
  });

  it("should yield an average 5 minute early departure from test_airport4", function() {
    expect(Flight.averageDelay(Airport.fromString('test_airport4'))).toEqual(-5 * MINUTE);
  });

  it("should yield an average delay of 14 min departing from test_airport1", function() {
    expect(Flight.averageDelay(Airport.fromString('test_airport1'))).toEqual(14 * MINUTE);
  });

  it("should not return an average delay for unknown airport FOO", function() {
    expect(Flight.averageDelay(Airport.fromString('FOO'))).toBeNaN();
  });

  it("should indicate that the Boeing B747 is delayed the least", function() {
    expect(Flight.aircraftWithLeastDelay()).toEqual("B747");
  });

  afterAll(function() {
    Flight.removeAll("startsWith(id, 'test_')");
    Route.removeAll("startsWith(id, 'test_')");
    Aircraft.removeAll("startsWith(id, 'test_')");
  });
});
