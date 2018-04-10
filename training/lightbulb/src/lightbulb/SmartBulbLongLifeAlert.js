var log = C3.logger("SmartBulbLongLifeAlert");

var DURATION_THRESHOLD = 10500;

function process(input) {
    var data = input.bulbLife.data(),
        dates = input.bulbLife.dates();
        //startDate = input.source.startDate,
        //endDate = dates[dates.length-1],
        //durationOn,durationOnMetricResult;
        //durationOnMetricResult = SmartBulb.evalMetric({id: input.source.id,expression:""
        //start:startDate, end:endDate, interval: "DAY"}).data();
       // dutationOn = durationOnMetricResult[durationOnMetricResult.length-1] 
    for(var i =0; i<data.length; i++)
    {
        if(data.at(i)>DURATION_THRESHOLD)
        {
            return SmartBulbEvent.make({
                smartBulb: input.source,
                //eventType: "Health"
                eventCode: "LONGLIFE",
                start: dates.at(i),
                end: dates.at(i+1)
            });

            
        }
    }
}