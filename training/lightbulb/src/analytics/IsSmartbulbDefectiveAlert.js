var log = C3.logger("IsSmartBulbDefectiveAlert");

function process(input) {
  var data  = input.isDefective.data(),
      dates = input.isDefective.dates();
  for (var i = 0; i < data.length; i++) {
    if (data.at(i) == 1) {
      return SmartBulbEvent.make({
        smartBulb: input.source,
        eventCode: "DEFECTIVE",
        start: dates.at(i),
        end: dates.at(i+1)
      });
    }
  }
}
