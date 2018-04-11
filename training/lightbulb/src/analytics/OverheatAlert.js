var log = C3.logger("DeadBulbAlert");

var THRESHOLD = 95;

function process(input) {
    var data = input.overheat.data(),
        dates = input.overheat.dates();
    for (var i=0; i<data.length; i++){
        if (data.at(i)>THRESHOLD){
            return OverheatStatusSet.make({
                parent: input.source,
                value: 1,
                timestamp: dates.at(i)
            });
        }
    }
}