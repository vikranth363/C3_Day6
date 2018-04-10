var log = C3.logger("SmartBulbLongLifeAlert");

function process(input){

    var data = input.bulbDefective.data(),
        dates = input.bulbDefective.dates();

    for (var i = 0; i < data.length; i++) {

        if (data.at(i)) {
            return SmartBulbEvent.make({
                smartBulb: input.source,
                eventCode: "DEFECTIVE",
                start: date.at(i),
                end: date.at(i+1)
            });
        }
    }
}