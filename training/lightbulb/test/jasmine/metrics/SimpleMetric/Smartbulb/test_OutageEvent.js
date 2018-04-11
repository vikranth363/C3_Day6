/*
 * Copyright 2009-2017 C3, Inc. dba C3 IoT (www.c3iot.com). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret
 * and proprietary information of C3 IoT and its licensors. Reproduction, use and distribution
 * of this material in any form is strictly prohibited except as set forth in a written
 * license agreement with C3 IoT and/or its authorized distributors.
 * This product may be covered by one or more U.S. patents or pending patent applications.
 */

var filename = "test_OutageEventCount";

describe(filename, function() {

  // set up any necessary data before running any tests
  beforeAll(function() {

    // set up helper functions for creating consistent IDs for test objects
    this.generateSmartBulbId = function(idNum) {
      return "SmartBulb" + idNum;
    };

    this.generateSmartBulbEventId = function(bulbId, eventNum) {
      return "SmartBulb" + bulbId + "_EventNo" + eventNum;
    };

    // set up fundamental, shared variables
    var self = this;
    this.context = TestApi.createContext(filename);
    this.numTestSmartBulbs = 3;
    this.numTestEventsPerBulb = {};
    this.eventsStartDate = DateTime.now().plusYears(-1).clearTime();

    // set up the smart bulbs to be measured
    this.smartBulbs = _.map(_.range(this.numTestSmartBulbs), function(index) {
      return { id: self.generateSmartBulbId(index) };
    });

    // set up the outage events
    this.smartBulbEvents = {};
    _.each(this.smartBulbs, function(smartBulb) {
      self.numTestEventsPerBulb[smartBulb.id] = _.random(1, 50);
      self.smartBulbEvents[smartBulb.id] = _.map(_.range(self.numTestEventsPerBulb[smartBulb.id]), function(eventIndex) {
        return {
          start: self.eventsStartDate.plusHours(eventIndex),
          end: self.eventsStartDate.plusHours(eventIndex + 1),
          eventCode: "O",
          eventType: "Outage",
          smartBulb: { id: smartBulb.id }
        };
      });
    });
    this.eventsEndDates = {};
    _.each(_.keys(this.numTestEventsPerBulb), function(bulbId) {
      self.eventsEndDates[bulbId] = self.eventsStartDate.plusHours(self.numTestEventsPerBulb[bulbId]);
    });
    
    // create the entities to test
    TestApi.createBatchEntity(this.context, "SmartBulb", this.smartBulbs);
    _.each(_.keys(self.smartBulbEvents), function(eventKey) {
      TestApi.createBatchEntity(self.context, "SmartBulbEvent", self.smartBulbEvents[eventKey]);
    });

    // wait for setup to complete
    TestApi.waitForSetup(this.context, null, 1, 120);
  });

  // make sure to tear down any objects we've created
  afterAll(function() {
    TestApi.teardown(this.context);
  });

  it("should return the correct number of events when evaluated over the full event date span", function() {
    var self = this,
        metricResults,
        expectedEvents,
        eventsEndDate,
        numEvents;

    // evaluate the metric over the interval we've defined and compare the results to the expected data
    _.each(this.smartBulbs, function(smartBulb) {
      expectedEvents = self.smartBulbEvents[smartBulb.id];
      eventsEndDate = self.eventsEndDates[smartBulb.id];
      metricResults = SmartBulb.evalMetric({
        id: smartBulb.id,
        expression: "OutageEvent",
        start: self.eventsStartDate,
        end: eventsEndDate,
        interval: "HOUR"
      }).data();

      numEvents = _.reduce(metricResults, function(prev, value) {
        return prev + value;
      }, 0);
      expect(numEvents).toEqual(expectedEvents.length);
    });
  });
});
