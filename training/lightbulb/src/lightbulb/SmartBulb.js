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
  
  if ( defectDatum.objs[0].end ){
    defectTime = defectDatum.objs[0].end;
  }else{
    defectTime = 50;
  }

  lifespan = defectTime - startTime;
  conversionFactor = 1000*60*60*24*365;
  lifeSpanInYears = lifespan / conversionFactor;
  return lifeSpanInYears;
}


/*
 * Returns the shortest lifespan of a smart bulb .
 */
function shortLifeSpanBulb(){

  var shortLife = 0;
  var idShortestLife;
  var bulbs = SmartBulb.fetch();

  for (let index = 0; index < bulbs.objs.length; index++) {
      var lifeSpanInYears = this.lifeSpanInYears(bulbs.objs[index].id);

    if (lifeSpanInYears < shortLife || shortLife == 0){
        console.log("inside if")
        shortLife = lifeSpanInYears;
        idShortestLife = bulbs.objs[index].id
        console.log(shortLife, idShortestLife)
    }
  }
  return idShortestLife;
}

/*
 * Returns the longest lifespan of a smart bulb .
 */
function longLifeSpanBulb(){

  var longLife = 0;
  var idLongestLife;
  var bulbs = SmartBulb.fetch();

  for (let index = 0; index < bulbs.objs.length; index++) {
      var lifeSpanInYears = this.lifeSpanInYears(bulbs.objs[index].id);

    if (lifeSpanInYears > longLife || longLife == 0){
        longLife = lifeSpanInYears;
        idLongestLife = bulbs.objs[index].id
        console.log(longLife, idLongestLife)
    }
  }
  return idLongestLife;
}