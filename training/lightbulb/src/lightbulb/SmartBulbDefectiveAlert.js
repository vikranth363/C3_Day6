var log = C3.logger("SmartBulbDefectiveAlert");

function process(input){
	var data = input.bulbDefect.data(),
		dates = input.bulbDefect.dates();
	for(var i =0;i< data.length;i++)
		{
		if (data.at(i) == 1)
			{
			return SmartBulbEvent.make({
				smartBulb: input.source,
				eventCode: "Defective",
				start: dates.at(i),
				end: dates.at(i+1)
			});
			}
		}
}