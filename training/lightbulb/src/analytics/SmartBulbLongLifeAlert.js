var log = C3.logger("SmartBulbLongLifeAlert");

var DURATION_THRESHOLD = 400;

function process(input) {
  var data = input.bulbLife.data(),
      dates = input.bulbLife.dates();
  for (var i = 0; i < data.length; i++) {
    // If the duration is greater than the threshold then we need to update the source object
    if (data.at(i) > DURATION_THRESHOLD) {
      return SmartBulbEvent.make({
        smartBulb: input.source,
        eventCode: "LONGLIFE",
        eventType: "Health",
        start: dates.at(i),
        end: dates.at(i+1)
      });
    }
  }
}
