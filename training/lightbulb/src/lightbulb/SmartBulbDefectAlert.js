var log = C3.logger("SmartBulbDefectAlert");

function process(input) {
    var data = input.defect.data(),
        dates = input.defect.dates();
        
    for(var i =0; i<data.length; i++)
    {
        if(data.at(i)==0)
        {
            return SmartBulbEvent.make({
                smartBulb: input.source,
                eventCode: "BROKEN",
                start: dates.at(i),
                end: dates.at(i)
            });

            
        }
    }
}