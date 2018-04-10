var log = C3.logger("SmartBulbLongLIfeAlert");

var DURATION_THRESHOLD = 10500;

function process(input) {
  var data = input.bulbLife.data();
  var dates = input.bulbLife.dates();
  for (var i = 0; i < data.length; i++) {
    if (data.at(i) > DURATION_THRESHOLD) {
      return SmartBulbEvent.make({
        smartBulb: input.source,
        eventCode: "LONGLIFE",
        start: dates.at(i),
        end: dates.at(i+i)
      });
    }
  }
}