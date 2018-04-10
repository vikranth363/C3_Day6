var log = C3.logger("SmartBulbOverheatAlert");

var TEMP_THRESHOLD = 95;

function process(input) {
  var data = input.temperature.data(),
      dates = input.temperature.dates();
  var smartBulb = {};
  for (var i = 0; i < data.length; i++) {
    var smartBulbId = input.source.id, 
        timestamp = dates.at(i);
    if (data.at(i) < TEMP_THRESHOLD) {
      smartBulb = SmartBulbEvent.make({
        id: smartBulbId,
        bulbTemperatureStatus: {
          timestamp: timestamp,
          value: 0
        }
      });
    } else {
      smartBulb = SmartBulbEvent.make({
        id: smartBulbId,
        bulbTemperatureStatus: {
          timestamp: timestamp,
          value: 1
        }
      });
    }
  }
  return smartBulb;
}