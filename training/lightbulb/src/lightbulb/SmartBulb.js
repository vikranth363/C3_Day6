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


function shortestLifeSpanBulb(){
	var allBulbs = SmartBulb.fetch({include:"id"});
	var shortest = 10000;
	var shortestBulb = '';
	for (var i=0;i< allBulbs.objs.length;i++){
		var life = lifeSpanInYears(allBulbs.objs[i].id);
		if(life<shortest){
		shortest=life;
		shortestBulb = allBulbs.objs[i].id;
		}
		}
	return shortestBulb;
}

function averageLifeSpan(bulbId)
{
	var allBulbs = SmartBulb.fetch({include:"id"});
	var sum =0;
	var average;
	for (var j=0;j< allBulbs.objs.length;j++){
		var lifeSpn = lifeSpanInYears(allBulbs.objs[j].id);
		sum = sum + lifeSpn;
	}
	average = (sum / allBulbs.objs.length) ;
	
	return average;
}

function longestLifeSpanBulb(){
	var allBulbs = SmartBulb.fetch({include:"id"});
	var longest = 0;
	var longestBulb = '';
	for (var i=0;i< allBulbs.objs.length;i++){
		var life = lifeSpanInYears(allBulbs.objs[i].id);
		if(life>longest){
		longest=life;
		longestBulb = allBulbs.objs[i].id;
		}
		}
	return longestBulb;
}

