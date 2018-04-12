var map = function(batch, objs) {
    var manufacturerPower= {};
    objs.eachRef( function(o) {
        var c = manufacturerPower[o.manufacturer.id];
        manufacturerPower[o.manufacturer.id] = c ? c+o.powerUOM.value : o.powerUOM.value;
    })
    return manufacturerPower;
}

var reduce = function(outKey, interValues) {
    
    interValues.each( function(power) { 
        AggregateConsumptionByManufacturerschema.create({
            parent: { id: outKey},
            start: new Date(),
            aggregateConsumption: power
        })
    } )
    return [count];
}