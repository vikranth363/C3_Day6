var log = C3.logger("SmartBulbOverheatAlert");

var TEMP = 75;

function process(input)
{
    var data=input.temperature.data(),
        dates=input.temperature.dates(),
        smartBulb={}; //input.source
    for(var i=0;i<data.length;i++)
    {
        var smartBulbId = input.source.id,
        timestamp = dates.at(i);

        if(data.at(i)<TEMP)
        {
            //smartBulb.smartBulbOverheatStatus = {timestamp:timestamp, value:0}
          smartBulb = SmartBulb.make({id:smartBulbId,smartBulbOverheatStatus:{timestamp:timestamp,value:0}});
        }
        else
        {
            smartBulb = SmartBulb.make({id:smartBulbId,smartBulbOverheatStatus:{timestamp:timestamp,value:1}})
        }
    }
    // return just smartBulb Object
    return smartBulb;
}