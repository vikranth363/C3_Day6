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
* Returns the shortest lifespan
*/
function shortestLifeSpanBulb(){
  var lifespan, bulbs, idx, i;
  bulbs = SmartBulb.fetch();
  idx=-1;
  for (i=0; i < bulbs.count; i++){  
  if (idx==-1 && SmartBulb.lifeSpanInYears(bulbs.objs[i].id)!=null){
    lifespan=SmartBulb.lifeSpanInYears(bulbs.objs[i].id);
  } else if (idx!=-1) {
      if (SmartBulb.lifeSpanInYears(bulbs.objs[i].id)!=null && lifespan>SmartBulb.lifeSpanInYears(bulbs.objs[i].id)){
          idx=i;
          lifespan=SmartBulb.lifeSpanInYears(bulbs.objs[i].id);
      }
  }
  }
  if (idx!=-1){
  return bulbs.objs[idx].id;
  }
}

function averageLifeSpan(){
  var lifespans = 0, bulbs, i;
  bulbs=SmartBulb.fetch();
  c=0;
  for (i=0; i < bulbs.count; i++){
    if (bulbs.objs[i].wattage!=null && bulbs.objs[i].bulbType!=null){
      lifespans+=SmartBulb.lifeSpanInYears(bulbs.objs[i].id);
      c+=1;
    }
  }
  return lifespans/c;
}