var log = C3.logger("SmartBulbOverheatAlert");
var TEMPERATURE_THRESHOLD = 20

function process(input) {
    var data = input.bulbOverheat.data(),
    dates = input.bulbOverheat.dates();

    for (var i = 0; i < data.length; i++) {
        if (data.at(i) > TEMPERATURE_THRESHOLD) {
            return SmartBulbOverheatStatus.make({
                timestamp: dates.at(i),
            });        
        }
    }
}