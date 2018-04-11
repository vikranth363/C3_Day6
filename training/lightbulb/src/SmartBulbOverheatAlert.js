var log = C3.logger("SmartBulbOverheatAlert");

var Temperature_THRESHOLD = 80;

function process(input) 
{
	var data = input.bulbHeat.data(),
	    dates = input.bulbHeat.dates();
	for(var i=0;i<data.length;i++)
		{
		 if(data.at(i)>Temperature_THRESHOLD)
			 {
			  return SmartBulbEvent.make({
				  smartBulb: input.source,
				  eventCode: "O",
				  start: dates.at(i),
				  end:dates.at(i+1)
			  });
			 }
		}
	}