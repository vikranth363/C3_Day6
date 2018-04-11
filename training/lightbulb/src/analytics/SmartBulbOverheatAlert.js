var log = C3.logger("SmartBulbOverheatAlert");

var TEMP_THRESHOLD = 95;

function process(input) {
  var data = input.temperature.data(),
      dates = input.temperature.dates(),
      smartBulb = input.source;
  // If the temperature is greater or less than the threshold, we need to upsert the appropriate temperature status.
  for (var i = 0; i < data.length; i++) {
	var smartBulbId = input.source.id,
	    timestamp = dates.at(i);
    if (data.at(i) > TEMP_THRESHOLD) {
      smartBulb.bulbOverheatStatus = {timestamp: timestamp, value: 1};
    } else {
      smartBulb.bulbOverheatStatus = {timestamp: timestamp, value: 0};    
    }
  }
  // return just the SmartBulb Object, and let the platform optimize the merging of batches of SmartBulbs.
  return smartBulb;
}
