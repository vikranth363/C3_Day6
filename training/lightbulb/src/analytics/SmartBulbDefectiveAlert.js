var log = C3.logger("SmartBulbDefectiveAlert");

var FAILED = 1;

function process(input) {
  var data  = input.defective.data(),
      dates = input.defective.dates();
  for (var i = 0; i < data.length; i++) {
    // If defective is 1 then we need to update the source object
    if (data.at(i) == FAILED) {
      return SmartBulbEvent.make({
        smartBulb: input.source,
        eventCode: "DEFECTIVE",
        eventType: "Health",
        start: dates.at(i),
        end: dates.at(i+1)
      });
    }
  }
}
