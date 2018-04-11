var log = C3.logger("DefectiveBulbAlert");

//var DURATION_THRESHOLD = 10500;

function process(input) {
  var data = input.defective.data(),
      dates = input.defective.dates();
  for(var i = 0; i < data.length; i++) {
    if(data.at(i) == 1) {
      return SmartBulbEvent.make({
        smartBulb: input.source,
        eventCode: "DEFECTIVE",
        start: dates.at(i),
        end: dates.at(i+1)
      });
    }
  }
}
