var log = C3.logger("SmartBulbOverheatAlert");
var TEMP_THRESHOLD = 75;

function process(input){
	var data = input.bulbOverheat.data(),
		dates = input.bulbOverheat.dates();
	for(var i =0;i< data.length;i++)
		{
		if (data.at(i) > TEMP_THRESHOLD)
			{
			return SmartBulbEvent.make({
				smartBulb: input.source,
				eventCode: "OVERHEAT",
				start: dates.at(i),
				end: dates.at(i+1)
			});
			}
		}
}