/*
* Copyright 2009-2018 C3 IoT, Inc. All Rights Reserved.
* This material, including without limitation any software, is the confidential trade secret
* and proprietary information of C3 IoT and its licensors. Reproduction, use and/or distribution
* of this material in any form is strictly prohibited except as set forth in a written
* license agreement with C3 IoT and/or its authorized distributors.
* This product may be covered by one or more U.S. patents or pending patent applications.
~*/

/*
 * Returns the expected lumens of a light bulb based on wattage and bulbType
 */
function expectedLumens(wattage, bulbType) {
  if(bulbType == 'LED')
    return wattage * 84;
  if(bulbType == 'INCAN')
    return wattage * 14;
  if(bulbType == 'CFL')
    return wattage * 62;
}

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

/*
 * Returns the id of the smart bulb with the shortest life span.
 */
function shortestLifeSpanBulb(){
  var bulbId, allLightBulbs, shortLifeBulbId, randomHighYears=99999, span;
  allLightBulbs = SmartBulb.fetch({include:"id"}).objs;
  for (var i = 0; i < allLightBulbs.length; i++) {
    bulbId = allLightBulbs[i].id;
    span = SmartBulb.lifeSpanInYears(bulbId);
    if (span < randomHighYears){
    	randomHighYears = span;
      shortLifeBulbId = bulbId;
    }
  }
  return shortLifeBulbId;
}

/*
 * Returns the id of the smart bulb with the Longest life span.
 */
function longestLifeSpanBulb(){
  var bulbId, allLightBulbs, longestLifeBulbId, randomLowYears=0, span;
  allLightBulbs = SmartBulb.fetch({include:"id"}).objs;
  for (var i = 0; i < allLightBulbs.length; i++) {
    bulbId = allLightBulbs[i].id;
    span = SmartBulb.lifeSpanInYears(bulbId);
    if (span > randomLowYears){
    	randomLowYears = span;
      longestLifeBulbId = bulbId;
    }
  }
  return longestLifeBulbId;
}

/*
 * Returns all smart bulb's Average life span.
 */
function AverageLifeSpanBulb(){
  var bulbId, allLightBulbs, averageLifeSpan=0, span=0;
  allLightBulbs = SmartBulb.fetch({include:"id"}).objs;
  for (var i = 0; i < allLightBulbs.length; i++) {
    bulbId = allLightBulbs[i].id;
    span += SmartBulb.lifeSpanInYears(bulbId);
}
  return span/allLightBulbs.length;
}