/*
 * Copyright 2009-2017 C3, Inc. dba C3 IoT (www.c3iot.com). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret
 * and proprietary information of C3 IoT and its licensors. Reproduction, use and distribution
 * of this material in any form is strictly prohibited except as set forth in a written
 * license agreement with C3 IoT and/or its authorized distributors.
 * This product may be covered by one or more U.S. patents or pending patent applications.
 */

var filename = "test_AverageTemperature";

describe(filename, function() {

  // set up any necessary data before running any tests
  beforeAll(function() {

    // set up helper functions for creating consistent IDs for test objects
    this.generateSmartBulbId = function(idNum) {
      return "SmartBulb" + idNum;
    };

    this.generateSmartBulbMeasurementSeriesId = function(idNum) {
      return "SMS_" + idNum;
    };

    // set up fundamental, shared variables
    var self = this;
    this.context = TestApi.createContext(filename);
    this.numTestSmartBulbs = 3;
    this.numTestMeasurementsPerBulb = 10;
    this.measurementStartDate = DateTime.now().plusYears(-1).clearTime();
    this.measurementEndDate = this.measurementStartDate.plusHours(this.numTestMeasurementsPerBulb);

    // set up the smart bulbs to be measured
    this.smartBulbs = _.map(_.range(this.numTestSmartBulbs), function(index) {
      return { id: self.generateSmartBulbId(index) };
    });

    // set up the measurement serieses
    this.smartBulbMeasurementSerieses = _.map(this.smartBulbs, function(smartBulb) {
      return {
        id: self.generateSmartBulbMeasurementSeriesId(smartBulb.id),
        smartBulb: { id: smartBulb.id },
        interval: "HOUR",
        treatment: "rate"
      };
    });

    // set up the temp measurement values
    this.smartBulbMeasurements = {};
    _.each(this.smartBulbMeasurementSerieses, function(measurementSeries) {
      self.smartBulbMeasurements[measurementSeries.id] = _.map(_.range(self.numTestMeasurementsPerBulb), function(measurementIndex) {
        return {
          temperature: _.random(60, 130),
          parent: measurementSeries.id,
          start: self.measurementStartDate.plusHours(measurementIndex),
          end: self.measurementStartDate.plusHours(measurementIndex + 1)
        };
      });
    });

    // create the entities to test
    TestApi.createBatchEntity(this.context, "SmartBulb", this.smartBulbs);
    TestApi.createBatchEntity(this.context, "SmartBulbMeasurementSeries", this.smartBulbMeasurementSerieses);
    _.each(_.keys(self.smartBulbMeasurements), function(measurementSeriesKey) {
      TestApi.createBatchEntity(self.context, "SmartBulbMeasurement", self.smartBulbMeasurements[measurementSeriesKey]);
    });

    // wait for setup to complete
    TestApi.waitForSetup(this.context, null, 1, 120);
  });

  // make sure to tear down any objects we've created
  afterAll(function() {
    TestApi.teardown(this.context);
  });

  it("should return all measurements when evaluated over the full measurement date span", function() {
    var self = this,
        measurementSeries,
        expectedMeasurements,
        metricResults;

    // evaluate the metric over the interval we've defined and compare the results to the expected data
    _.each(self.smartBulbs, function(smartBulb, index) {
      measurementSeries = self.smartBulbMeasurementSerieses[index];
      expectedMeasurements = _.pluck(self.smartBulbMeasurements[measurementSeries.id], "temperature");
      metricResults = SmartBulb.evalMetric({
        id: smartBulb.id,
        expression: "AverageTemperature",
        start: self.measurementStartDate,
        end: self.measurementEndDate,
        interval: "HOUR"
      }).data();

      expect(metricResults).toEqual(expectedMeasurements);
    });
  });
});
