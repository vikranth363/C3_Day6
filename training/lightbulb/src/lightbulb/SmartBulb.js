/*
* Copyright 2009-2018 C3 IoT, Inc. All Rights Reserved.
* This material, including without limitation any software, is the confidential trade secret
* and proprietary information of C3 IoT and its licensors. Reproduction, use and/or distribution
* of this material in any form is strictly prohibited except as set forth in a written
* license agreement with C3 IoT and/or its authorized distributors.
* This product may be covered by one or more U.S. patents or pending patent applications.
~*/


/*
 * Returns the lifespan of a smart bulb in years.
 */
function lifeSpanInYears(bulbId){
  var bulb, startTime, defectFilter, defectDatum, defectTime, lifespan, conversionFactor, lifeSpanInYears;
  bulb = SmartBulb.get({id:bulbId});
  startTime = bulb.startDate;
  defectFilter = "status == 1 && lumens == 0 && parent.id == '" + 'SBMS_serialNo_' + bulb.id + "'";
  defectDatum = SmartBulbMeasurement.fetch({filter:defectFilter});
  conversionFactor = 1000*60*60*24*365;
  if (defectDatum.objs.length == 0) {
    defectTime = 50 * conversionFactor;
  } else {

    if (defectDatum.objs[0].end) {
      defectTime = defectDatum.objs[0].end;
    } else {
      defectTime = 50 * conversionFactor;
    }
    
  }

  lifespan = defectTime - startTime;
  lifeSpanInYears = lifespan / conversionFactor;
  return lifeSpanInYears;
}

function shortestLifeSpanBulb() {

  // Get all smartbulbs.
  var allSmartBulbs = SmartBulb.fetch();

  if(allSmartBulbs.objs.length == 0) {
     return -1;
  }

  // Initialize the shortest lifespan.
  var id = allSmartBulbs.objs[0].id;

  var shortestLiveSpanBulb = SmartBulb.lifeSpanInYears(id);
  
  // Intialize the id of the bulb with the shortest lifespan.
  var result = id;

  // foreach smartbulb ...
  allSmartBulbs.objs.each(function(smartbulb) {

    // ... get the lifespan of the current smartbulb ...
    var liveSpanBulb = SmartBulb.lifeSpanInYears(smartbulb.id);
    
    // ... compare and ...
    if (liveSpanBulb < shortestLiveSpanBulb) {

      // ... shortest livespan ...
      shortestLiveSpanBulb = liveSpanBulb;

      // ... set id of the new shortest livespan.
      result = smartbulb.id;
    }
    
  });

  return result;

}