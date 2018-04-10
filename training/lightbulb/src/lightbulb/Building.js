function averageTemperature(buildingId){

    // Get all apartments of the building.
    var allApartments = Apartment.fetch({filter: "building=='"+buildingId+"'"});
    
    // Sum all temperature.
    var sum = 0;

    // Count all smartbulb.
    var count = 0;

    if (allApartments.objs.length != 0) {

        allApartments.objs.each(function(apartment){
            
            // Get fixtures
            var fixtures = Fixture.fetch({filter: "apartment=='"+apartment.id+"'"});

            if(fixtures.objs.length != 0){

                fixtures.objs.each(function(fixture){

                    // Get smartbulb
                    var smartbulb = Smartbulb.fetch({filter: "currentFixture=='"+fixture.id+"'"});

                    if(smartbulb.objs.length != 0){
                        sum += smartbulb.temperatureUOM;
                        count ++;
                    }

                });

            }
            
        })

        // Return the average
        return sum/count;

    } else {
        return 0;
    }
}