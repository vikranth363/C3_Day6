var log = C3.logger("SmartBulbLongLifeAlert");
var DURATION_THRESHOLD = 400

function process(input) {
    var data = input.bulbLife.data(), 
    dates = input.bulbLife.dates(), 
    startDate = input.source.startDate, 
    endDate = dates[dates.length - 1],
    durationOnMetricResult, durationOn;

    duration = SmartBulb.evalMetric({id: input.source.id, 
                                        expression: 'DurationOnInHours',
                                        start: startDate,
                                        end: endDate,
                                        interval: 'DAY'});

    durationOn = durationMetricResult[durationMetricResult.length - 1];
    if (durationOn > DURATION_THRESHOLD) {
        return SmartBulbEvent.make({
            smartBulb: input.source,
            eventCode: 'LONGLIFE',
            start: date.at(i),
            end: date.at(i+1)
        });
    }
}