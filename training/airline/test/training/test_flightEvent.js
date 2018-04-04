/*
 * Copyright 2009-2017 C3, Inc. dba C3 IoT (www.c3iot.com). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret
 * and proprietary information of C3 IoT and its licensors. Reproduction, use and distribution
 * of this material in any form is strictly prohibited except as set forth in a written
 * license agreement with C3 IoT and/or its authorized distributors.
 * This product may be covered by one or more U.S. patents or pending patent applications.
 */

var filename = "test_FlightEvent";

describe(filename, function() {
  it("Setup", function() {
    // Add a test flight
    Flight.upsertBatch([
      {id: "testf1", scheduledDepartureTime: "2016-01-02T05:45:00.000Z", actualDepartureTime: "2016-01-02T05:55:00.000Z"},
      {id: "testf2", scheduledDepartureTime: "2016-01-02T06:45:00.000Z", actualDepartureTime: "2016-01-02T06:55:00.000Z"},
      {id: "testf3", scheduledDepartureTime: "2016-01-02T07:45:00.000Z", actualDepartureTime: "2016-01-02T07:55:00.000Z"}
    ]);

    // Add the flight measurements to the flight measurement series
    FlightEvent.upsertBatch([
      // Avg altitude for fms1 should be 25000
      {id: "testfe1", flight: "testf1", start: "2016-01-02T09:28:00.000Z", end: "2016-01-02T09:29:00.000Z", eventCode: "BM", eventType: "Bathroom Malfunction"},
      {id: "testfe2", flight: "testf1", start: "2016-01-02T09:40:00.000Z", end: "2016-01-02T09:45:00.000Z", eventCode: "BM", eventType: "Bathroom Malfunction"},
      {id: "testfe3", flight: "testf2", start: "2016-01-02T09:31:00.000Z", end: "2016-01-02T09:41:00.000Z", eventCode: "TL", eventType: "Turbulence-Light"},
      {id: "testfe4", flight: "testf3", start: "2016-01-02T09:31:00.000Z", end: "2016-01-02T09:41:00.000Z", eventCode: "TL", eventType: "Turbulence-Light"}
    ]);
  });

  // do the actual testing
  it("should get the flight event counts for BM", function() {
    var result = Flight.evalMetric({
      id: "testf1",
      expression: "FlightEventTypeBathroomMalfunction",
      start: "2016-01-02T08:00:00.000Z",
      end: "2016-01-02T12:00:00.000Z",
      interval: "HOUR"
    });
    expect(result.data()).toEqual([0, 2, 0, 0]);
  });
  it("should get the flight event counts for TL", function() {
    var result = Flight.evalMetric({
      id: "testf1",
      expression: "FlightEventTypeLightTurbulence",
      start: "2016-01-02T08:00:00.000Z",
      end: "2016-01-02T12:00:00.000Z",
      interval: "HOUR"
    });
    expect(result.data()).toEqual([0, 0, 0, 0]);

    result = Flight.evalMetric({
      id: "testf2",
      expression: "FlightEventTypeLightTurbulence",
      start: "2016-01-02T08:00:00.000Z",
      end: "2016-01-02T12:00:00.000Z",
      interval: "HOUR"
    });
    expect(result.data()).toEqual([0, 1, 0, 0]);
  });

  it("Teardown", function() {
    FlightEvent.removeAll("startsWith(id, 'testfe')");
    Flight.removeAll("startsWith(id, 'testf')");
  });
});