/*
 * Copyright 2009-2017 C3, Inc. dba C3 IoT (www.c3iot.com). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret
 * and proprietary information of C3 IoT and its licensors. Reproduction, use and distribution
 * of this material in any form is strictly prohibited except as set forth in a written
 * license agreement with C3 IoT and/or its authorized distributors.
 * This product may be covered by one or more U.S. patents or pending patent applications.
 */

var filename = "test_SmartBulb";

describe(filename, function() {
  beforeAll(function(){
    this.context = TestApi.createContext(filename);
    // Create a startdate for all the measurements to be taken
    // Important note. We take Today => Strip away time => move to beginning of the month => move 5 days into the past.
    this.start = DateTime.now().clearTime().moveToFirstDayOfMonth().plusDays(-3);
    this.end = this.start.plusDays(3);
    this.smartBulbObjects = _.map(_.range(3), function(id){
      return {
        id: "SmartBulb" + id,
        startDate: this.start
      }
    }, this);
    // Start with the bulb being OFF
    this.statusSet = [0,1,0];
    this.smartBulbStatusSetObjects = _.map(_.range(3), function(index){
      return {
        parent: { id: "SmartBulb0"},
        timestamp: this.start.plusDays(index),
        value: this.statusSet[index]
      }
    }, this);
    // Start with the bulb being ON
    this.statusSet = [1,0,1];
    this.smartBulbStatusSetObjects.push(_.map(_.range(3), function(index){
      return {
        parent: { id: "SmartBulb1"},
        timestamp: this.start.plusDays(index),
        value: this.statusSet[index]
      }
    }, this));
    // Start with the bulb being OFF
    this.statusSet = [0,1,0];
    this.smartBulbStatusSetObjects.push(_.map(_.range(3), function(index){
      return {
        parent: { id: "SmartBulb2"},
        timestamp: this.start.plusDays(index),
        value: this.statusSet[index]
      }
    }, this));
    this.smartBulbStatusSetObjects = _.flatten(this.smartBulbStatusSetObjects);
    TestApi.createBatchEntity(this.context, "SmartBulb", this.smartBulbObjects);
    TestApi.createBatchEntity(this.context, "SmartBulbStatusSet", this.smartBulbStatusSetObjects);

    // Create the SmartBulbMeasurementSeries objects
    this.smartBulbMeasurementSeriesObjects = _.map(_.range(3), function(index){
      return {
        smartBulb: {id: this.smartBulbObjects[index].id},
        interval: "DAY",
        treatment: "rate"
      };
    }, this);
    this.smartBulbMeasurementSeriesObjects = TestApi.createBatchEntity(this.context, "SmartBulbMeasurementSeries", this.smartBulbMeasurementSeriesObjects);
    // Create the SmartBulbMeasurement objects
    // These are the times in which they should fail.  Lumens 0 and from above
    // status == 1
    this.smartBulbMeasurementObjects = [
      {
        lumens: 0,
        parent: {id: this.smartBulbMeasurementSeriesObjects[0]},
        start: this.start.plusDays(1),
        end: this.start.plusDays(2)
      },
      {
        lumens: 0,
        parent: {id: this.smartBulbMeasurementSeriesObjects[1]},
        start: this.start.plusDays(2),
        end: this.start.plusDays(3)
      }
    ];
    TestApi.createBatchEntity(this.context, "SmartBulbMeasurement", this.smartBulbMeasurementObjects);
  });

  afterAll(function(){
    TestApi.teardown(this.context);
  });

  describe("::totalLightBulbsOn", function () {
    it("should count total light bulbs on now", function(){
      expect(SmartBulb.totalLightBulbsOn()).toBe(1);
    });

    it("should count total light bulbs on 1 day after start", function(){
      expect(SmartBulb.totalLightBulbsOn(this.start.plusDays(1).plusMinutes(1))).toBe(2);
    });
  });

  describe("::lifeSpan", function () {
    it("should see that SmartBulb0 failed 2 days into its life", function(){
      this.expectedValue = (this.end.plusDays(-2) - this.start);
      //Within a 1 second window
      expect(SmartBulb.get("SmartBulb0").lifeSpan().value).toBeGreaterThan(this.expectedValue - 1000);
      expect(SmartBulb.get("SmartBulb0").lifeSpan().value).toBeLessThan(this.expectedValue + 1000);
    });

    it("should see that SmartBulb1 failed 2 days into its life ago", function(){
      this.expectedValue = (this.end.plusDays(-1) - this.start);
      //Within a 1 second window
      expect(SmartBulb.get("SmartBulb1").lifeSpan().value).toBeGreaterThan(this.expectedValue - 1000);
      expect(SmartBulb.get("SmartBulb1").lifeSpan().value).toBeLessThan(this.expectedValue + 1000);
    });

    it("should see that SmartBulb2 has not failed so life is now minus startDate", function(){
      this.expectedValue = (DateTime.now() - this.start);
      //Within a 1 second window
      expect(SmartBulb.get("SmartBulb2").lifeSpan().value).toBeGreaterThan(this.expectedValue - 1000);
      expect(SmartBulb.get("SmartBulb2").lifeSpan().value).toBeLessThan(this.expectedValue + 1000);
    });
  });

  describe("::shortestLifeSpanBulb", function () {
    it("should return SmartBulb0", function(){
      expect(SmartBulb.shortestLifeSpanBulb()).toEqual("SmartBulb0");
    });
  });
});
