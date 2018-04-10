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
*
*/

function shortestLifeSpanBulb(){
  var bulb;
  bulb = SmartBulb.fetch();
  var min =9999999;
  var app = "";
  for (var i=0;i<bulb.count;i++)
  {
  
   if(lifeSpanInYears(bulb.objs[i].id)<min)
   {
      app=bulb.objs[i].id;
      min=lifeSpanInYears(bulb.objs[i].id);
   }
  }
  if(min==9999999) {
    return 0;
  }
  else
  {
    return app;
  }
}

/*
*
*/


function avgLifeSpanBulb(){
  var bulb;
  bulb = SmartBulb.fetch();
  
  var app = 0;
  var res = 0;
  for (var i=0;i<bulb.count;i++)
  {
  
   app+=lifeSpanInYears(bulb.objs[i].id);
  
  }
  
 res = app/bulb.count;
 return res;
}

/*
*
*/

function longLifeSpanBulb(){
  var bulb;
  bulb = SmartBulb.fetch();
  var max=0;
  var app = "";
  for (var i=0;i<bulb.count;i++)
  {
  
   if(lifeSpanInYears(bulb.objs[i].id)>max)
   {
      app=bulb.objs[i].id;
      max=lifeSpanInYears(bulb.objs[i].id);
   }
  }
  if(max==0) {
    return 0;
  }
  else
  {
    return app;
  }
}

/*
*
*/

function tempBulb(bulbId){
  var bulb, startTime, defectFilter, defectDatum, defectTime, lifespan, conversionFactor, lifeSpanInYears;
  bulb = SmartBulb.get({id:bulbId});
  
  defectFilter = " status == 1 && parent.id == '" + 'SBMS_serialNo_' + bulb.id + "'";
  defectDatum = SmartBulbMeasurement.fetch({filter:defectFilter});
  var max = new Date(-8640000000000000);
  var temp;
  for(var i = 0;i<defectDatum.count;i++)
  {
     endTime = defectDatum.objs[i].end;
     if(endTime>max)
     {
     temp=defectDatum.objs[i].temperature;
     max = endTime;
     }
  }
  return temp;
  
}

/*
*
*/

function mediumTempBuild(buildId)
{
  var apartaments, fixtures;
   apartaments = Apartment.fetch();
   var apartaments_id = [];
   for(var i=0;i<apartaments.count;i++)
   {
     if(apartaments.objs[i].building.id==buildId)
     apartaments_id.push(apartaments.objs[i].id);
   }

   var fixtures = Fixture.fetch();
   var smartBulbs = [];
   for(var j =0;j<apartaments_id.length;j++)
   {
     for(var k = 0;k<fixtures.count;k++)
     {
       if(apartaments_id[j]==fixtures.objs[k].apartment.id)
       {
         smartBulbs.push(fixtures.objs[k].currentBulb.id);
       }
     }
   }
var som =0;
for (var m=0;m<smartBulbs.length;m++)
{
  som+=tempBulb(smartBulbs[m]);
}

var fin;
fin = som/smartBulbs.length;
return fin;

}


