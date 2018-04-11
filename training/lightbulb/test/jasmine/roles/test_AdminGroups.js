/*
 * Copyright 2009-2017 C3 IoT (http://www.c3iot.com).  All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret
 * and proprietary information of C3 IoT and its licensors.  Reproduction, use and distribution
 * of this material in any form is strictly prohibited except as set forth in a written
 * license agreement with C3 IoT and/or its authorized distributors.
 */
var filename = "test_AdminGroups";
describe(filename, function () {
  var ctx;
  // Set-up the TestApi Context (This allows types to be created and removed to leave the environment
  // unchanged before and after the test is executed.
  it("setup context", function () {
    ctx = TestApi.createContext(filename);
  });

  // populate the context with the relevant entities to properly test.
  it("setup", function () {
    if (Building.fetchCount({filter: "id == 'bld1'"}) != 1) {
      TestApi.createEntity(ctx, 'Building', {id: 'bld1'});
    }
    if (Building.fetchCount({filter: "id == 'bld2'"}) != 1) {
      TestApi.createEntity(ctx, 'Building', {id: 'bld2'});
    }
    var apartment1 = TestApi.createEntity(ctx, 'Apartment', {
      building: {id: 'bld1'}
    });
    var apartment2 = TestApi.createEntity(ctx, 'Apartment', {
      building: {id: 'bld2'}
    });
    var fxtr1 = TestApi.createEntity(ctx, "Fixture", {apartment: apartment1});
    var fxtr2 = TestApi.createEntity(ctx, "Fixture", {apartment: apartment2});
    var smartBulb1 = TestApi.createEntity(ctx, 'SmartBulb');
    var smartBulb2 = TestApi.createEntity(ctx, 'SmartBulb');
    TestApi.createEntity(ctx, 'LightBulbToFixtureRelation', {from: smartBulb1, to: fxtr1 });
    TestApi.createEntity(ctx, 'LightBulbToFixtureRelation', {from: smartBulb2, to: fxtr2 });
    var measurementSeries = TestApi.createEntity(ctx, 'SmartBulbMeasurementSeries', {smartBulb: smartBulb1 });
    TestApi.createEntity(ctx, 'SmartBulbMeasurement', {
      parent: measurementSeries,
      start: DateTime.now().plusHours(-1),
      end: DateTime.now()
    });
  });


  it("members of Building1AnalystGroup should only have access to Building.id == bld1", function() {
    // impersonate the user group and make sure that only Building 1 can be seen.
    TestApi.impersonate(ctx, 'Building1AnalystGroup');
    var buildings = Building.fetch();
    expect(buildings.count).toBe(1);
    var smartBulbs = SmartBulb.evaluate({group: "currentFixture.apartment.building.id", projection: "currentFixture.apartment.building.id"});
    expect(smartBulbs.tuples.size()).toBe(1);
  });

  it("members of Building1AnalystGroup should not be able to fetch SmartBulbMeasurement", function() {
    var error;
    var shouldBreak = function() {
      try {
        SmartBulbMeasurement.fetch();
      } catch(e) {
        error = e.error
      }
    }
    shouldBreak();
    expect(error).toBe("ActionError");
  });

  it("unimpersonate", function () {
    TestApi.unimpersonate(ctx);
  });

  it("members of GeneralAnalystGroup should have access to all objects.", function() {
    TestApi.impersonate(ctx, 'GeneralAnalystGroup');
    var buildings = Building.fetch();
    expect(buildings.count).not.toBe(1);
    var smartBulbs = SmartBulb.evaluate({group: "currentFixture.apartment.building.id", projection: "currentFixture.apartment.building.id"});
    expect(smartBulbs.tuples.size()).not.toBe(1);
  });

  it("members of GeneralAnalystGroup should be able to fetch SmartBulbMeasurement", function() {
    expect(SmartBulbMeasurement.fetch().count).toBe(1);
  });

  it("unimpersonate", function () {
    TestApi.unimpersonate(ctx);
  });

  it("members of BuildingFetchOnlyGroup should only have fetch access on building", function() {
    TestApi.impersonate(ctx, 'BuildingFetchOnlyGroup');
    var allowed = {
      "Building": ["fetch"],
    };
    var denied = {
      "Building": ["evaluate"],
      "SmartBulb": ["fetch"]
    }
    TestApi.expectAllowed(ctx, allowed);
    TestApi.expectDenied(ctx, denied);
    TestApi.unimpersonate(ctx);
  });

  it("teardown", function () {
    TestApi.teardown(ctx);
  });
});
