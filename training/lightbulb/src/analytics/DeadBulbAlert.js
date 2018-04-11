var log = C3.logger("DeadBulbAlert");

function process(input) {
    var data = input.bulbDead.data(),
        dates = input.bulbDead.dates();
    for (var i=0; i<data.length; i++){
        if (data.at(i)==1){
            return SmartBulbEvent.make({
                smartBulb: input.source,
                eventCode: "DEADBULB",
                start: dates.at(i),
                end: dates.at(i+1)
            });
        }
    }
}