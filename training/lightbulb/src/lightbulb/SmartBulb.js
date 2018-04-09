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
  defectTime = defectDatum.objs[0].end;
  lifespan = defectTime - startTime;
  conversionFactor = 1000*60*60*24*365;
  lifeSpanInYears = lifespan / conversionFactor;
  return lifeSpanInYears;
}

function shortestLifeSpanBulb() {

  // Get all smartbulbs
  var allSmartBulbs = SmartBulb.fetch();

  if(allSmartBulbs.objs.length == 0) {
     return -1;
  }

  // Initialize the shortest lifespan
  var id = allSmartBulbs.objs[0].id;

  var shortestLiveSpanBulb = SmartBulb.lifeSpanInYears(id);
  
  var result = id;

  // foreach smartbulb ...
  allSmartBulbs.objs.each(function(smartbulb){

    // Get the lifespan of the current smartbul
    var liveSpanBulb = SmartBulb.lifeSpanInYears(smartbulb.id);

    if(liveSpanBulb){

      // Compare and set the new livespan
      if(liveSpanBulb < shortestLiveSpanBulb){
        result = smartbulb.id;
      }

    } 
    
  });

  return result;
}