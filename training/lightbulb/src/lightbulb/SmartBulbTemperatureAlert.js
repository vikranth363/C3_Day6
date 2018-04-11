var log = C3.logger("SmartBulbTemperatureAlert");

var DURATION_THRESHOLD = 80;

function process(input) {
  var data = input.temperature.data(),
      dates = input.temperature.dates();
  for(var i = 0; i < data.length; i++) {
    if(data.at(i) > DURATION_THRESHOLD) {
      return SmartBulbOverheatStatusSet.make({
        parent: input.source,
        start: dates.at(i),
        end: dates.at(i+1)
      });
    }
  }
}
