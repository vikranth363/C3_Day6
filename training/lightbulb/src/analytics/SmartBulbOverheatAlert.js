var log = C3.logger("SmartBulbOverheatAlert");

function process(input) {
	var data = input.temperature.data(), dates = input.temperature.dates(), smartBulb = source;
	for (var i = 0; i < data.length; i++) {
		if (data.at(i) > 75) {
			return SmartBulbEvent.make({
				smartBulb : input.source,
				eventCode : "OVER_HEATED",
				start : dates.at(i),
				end : dates.at(i + 1)
			});
		}
	}
}
