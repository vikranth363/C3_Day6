/*
* Copyright 2009-2018 C3 IoT, Inc. All Rights Reserved.
* This material, including without limitation any software, is the confidential trade secret
* and proprietary information of C3 IoT and its licensors. Reproduction, use and/or distribution
* of this material in any form is strictly prohibited except as set forth in a written
* license agreement with C3 IoT and/or its authorized distributors.
* This product may be covered by one or more U.S. patents or pending patent applications.
~*/

/*
 * Finds the average temperature of all {@link SmartBulb}s in this building.
 */
function averageSmartBulbTemperature(datetime) {
  datetime = datetime || DateTime.now();

  // Find out how many light bulbs are in this building
  var numberOfBulbs = SmartBulb.fetch({
        filter: Filter.eq("currentFixture.apartment.building.id", this.id)
      }).count,
      measurementSeriesIds,
      measurements,
      temperatures,
      sum;

  // Get all the measurementSeries ids for the bulbs in this building
  measurementSeriesIds = SmartBulb.fetch({
    filter: Filter.eq("currentFixture.apartment.building.id", this.id),
    include: "bulbMeasurements"
  }).at("objs.bulbMeasurements.id");

  if (measurementSeriesIds.length) {
    // Get the measurements for the bulbs in this building
    measurements = SmartBulbMeasurement.fetch({
      filter: Filter.intersects("parent.id", measurementSeriesIds).and.le("start", datetime).and.gt("end", datetime)
    });

    // Retrieve and sum the measured temperatures
    temperatures = measurements.at("objs.temperature");
    sum = _.reduce(temperatures, function(result, num){ return result + num }, 0);

    // Divided the sum of the temperatures by the number of lightbulbs to yield an average value
    return (sum / numberOfBulbs);
  } else {
    return 0
  }
}
