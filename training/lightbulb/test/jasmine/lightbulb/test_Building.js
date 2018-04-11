/*
 * Copyright 2009-2017 C3, Inc. dba C3 IoT (www.c3iot.com). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret
 * and proprietary information of C3 IoT and its licensors. Reproduction, use and distribution
 * of this material in any form is strictly prohibited except as set forth in a written
 * license agreement with C3 IoT and/or its authorized distributors.
 * This product may be covered by one or more U.S. patents or pending patent applications.
 */

var filename = "test_Building";

describe(filename, function() {
  beforeAll(function(){
    // Create a test context
    this.context = TestApi.createContext(filename);
    // Create a startdate for all the measurements to be taken
    // Important note. We take Today => Strip away time => move to beginning of the month => move 2 hours into the past.
    // Essentially we are taking the current month's first day at midnight and going 2 hours backwards
    this.start = DateTime.now().clearTime().moveToFirstDayOfMonth().plusHours(-2);
    // Create the Building objects
    this.buildingObjects = _.map(_.range(2), function(index){
      return {
        id: "Building" + index
      };
    });
    this.buildingObjects = TestApi.createBatchEntity(this.context, "Building", this.buildingObjects);
    // Create the Apartment objects
    this.apartmentObjects = [
      {
        building: {id: this.buildingObjects[0]}
      },
      {
        building: {id: this.buildingObjects[0]}
      },
      {
        building: {id: this.buildingObjects[1]},
      }
    ];
    this.apartmentObjects = TestApi.createBatchEntity(this.context, "Apartment", this.apartmentObjects);
    // Create the Fixture objects
    this.fixtureObjects = _.map(_.range(3), function(id){
      return {
        id: "Fixture" + id,
        apartment: {id: this.apartmentObjects[id]}
      };
    }, this);
    TestApi.createBatchEntity(this.context, "Fixture", this.fixtureObjects);
    // Create the SmartBulb objects
    this.smartBulbObjects = _.map(_.range(3), function(id){
      return {
        id: "SmartBulb" + id
      };
    });
    TestApi.createBatchEntity(this.context, "SmartBulb", this.smartBulbObjects);
    // Create the LightBulbToFixtureRelation objects
    this.lightBulbToFixtureRelationObjects = _.map(_.range(3), function(index){
      return {
        to: {id: this.fixtureObjects[index].id},
        from: {id: this.smartBulbObjects[index].id},
        start: this.start
      };
    }, this);
    TestApi.createBatchEntity(this.context, "LightBulbToFixtureRelation", this.lightBulbToFixtureRelationObjects);
    // Create the SmartBulbMeasurementSeries objects
    this.smartBulbMeasurementSeriesObjects = _.map(_.range(3), function(index){
      return {
        smartBulb: {id: this.smartBulbObjects[index].id},
        interval: "HOUR",
        treatment: "rate"
      };
    }, this);
    this.smartBulbMeasurementSeriesObjects = TestApi.createBatchEntity(this.context, "SmartBulbMeasurementSeries", this.smartBulbMeasurementSeriesObjects);
    // Create the SmartBulbMeasurement objects
    this.smartBulbMeasurementObjects = [
      {
        temperature: 150,
        parent: {id: this.smartBulbMeasurementSeriesObjects[0]},
        start: this.start,
        end: this.start.plusHours(1)
      },
      {
        temperature: 160,
        parent: {id: this.smartBulbMeasurementSeriesObjects[0]},
        start: this.start.plusHours(1),
        end: this.start.plusHours(2)
      },
      {
        temperature: 170,
        parent: {id: this.smartBulbMeasurementSeriesObjects[1]},
        start: this.start,
        end: this.start.plusHours(1)
      },
      {
        temperature: 180,
        parent: {id: this.smartBulbMeasurementSeriesObjects[1]},
        start: this.start.plusHours(1),
        end: this.start.plusHours(2)
      },
      {
        temperature: 190,
        parent: {id: this.smartBulbMeasurementSeriesObjects[2]},
        start: this.start,
        end: this.start.plusHours(1)
      },
      {
        temperature: 200,
        parent: {id: this.smartBulbMeasurementSeriesObjects[2]},
        start: this.start.plusHours(1),
        end: this.start.plusHours(2)
      }
    ];
    TestApi.createBatchEntity(this.context, "SmartBulbMeasurement", this.smartBulbMeasurementObjects);
    TestApi.waitForSetup(this.context, null, 1, 120);
  });

  afterAll(function(){
    TestApi.teardown(this.context);
  });

  it('should create 2 Building', function() {
    expect(Building.fetch().count).toBe(2);
  });

  it('should create 3 Apartment', function() {
    expect(Apartment.fetch().count).toBe(3);
  });

  it('should create 3 Fixtures', function() {
    expect(Fixture.fetch().count).toBe(3);
  });

  it('should create 3 SmartBulbs', function() {
    expect(SmartBulb.fetch().count).toBe(3);
  });

  it('should create 3 LightBulbToFixtureRelation', function() {
    expect(LightBulbToFixtureRelation.fetch().count).toBe(3);
  });

  it('should create 3 SmartBulbMeasurementSeries', function() {
    expect(SmartBulbMeasurementSeries.fetch().count).toBe(3);
  });

  it('should create 6 smartBulbMeasurementObjects', function() {
    expect(SmartBulbMeasurement.fetch().count).toBe(6);
  });

  it("should get average temperature for Building0 at start", function(){
    this.building = Building.get("Building0");
    this.averageTemp = this.building.averageSmartBulbTemperature(this.start);
    expect(this.averageTemp).toBe(160)
  });

  it("should get average temperature for Building0 at 1 hour past the first measurements", function(){
    this.building = Building.get("Building0");
    this.averageTemp = this.building.averageSmartBulbTemperature(this.start.plusHours(1));
    expect(this.averageTemp).toBe(170)
  });

  it("should get average temperature for Building1 at start", function(){
    this.building = Building.get("Building1");
    this.averageTemp = this.building.averageSmartBulbTemperature(this.start);
    expect(this.averageTemp).toBe(190)
  });

  it("should get average temperature for Building1 at 1 hour past the first measurements", function(){
    this.building = Building.get("Building1");
    this.averageTemp = this.building.averageSmartBulbTemperature(this.start.plusHours(1));
    expect(this.averageTemp).toBe(200)
  });
});
