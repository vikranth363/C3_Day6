var filename = "test_SmartBulbOverheatAlert"
describe(filename, function () {
  beforeAll(function(){
    this.context = TestApi.createContext(filename);
    // Create a startdate for all the measurements to be taken
    // Important note. We take Today => Strip away time => move to beginning of the month => move 15 days into the past.
    this.start = DateTime.now().clearTime().moveToFirstDayOfMonth().plusDays(-15);
    this.end = this.start.plusDays(15);
    this.smartBulbObjects = _.map(_.range(2), function(index){
      return {id: "SmartBulb" + index}
    });
    this.smartBulbMeasurementSeriesObjects = _.map(_.range(2), function(index){
      return {
        smartBulb: {id: "SmartBulb" + index},
        interval: "HOUR",
        treatment: "rate"
      }
    });
    this.smartBulbMeasurementSeriesObjects = TestApi.createBatchEntity(this.context, "SmartBulbMeasurementSeries", this.smartBulbMeasurementSeriesObjects);
    this.smartBulbMeasurementObjects = _.map(_.range(10), function(day){
      return {
        temperature: _.random(65, 94),
        parent: {id: this.smartBulbMeasurementSeriesObjects[0]},
        start: this.start.plusDays(day),
        end: this.start.plusDays(day + 1)
      }
    }, this);
    this.smartBulbMeasurementObjects.push(_.map(_.range(10), function(day){
      return {
        temperature: _.random(65, 94),
        parent: {id: this.smartBulbMeasurementSeriesObjects[1]},
        start: this.start.plusDays(day),
        end: this.start.plusDays(day + 1)
      }
    }, this));
    // This will be the one that sets the alert
    this.smartBulbMeasurementObjects.push({
      temperature: 100,
      parent: {id: this.smartBulbMeasurementSeriesObjects[1]},
      start: this.start.plusDays(10),
      end: this.start.plusDays(11)
    });
    this.smartBulbMeasurementObjects = _.flatten(this.smartBulbMeasurementObjects);
    TestApi.createBatchEntity(this.context, "SmartBulb", this.smartBulbObjects);
    TestApi.createBatchEntity(this.context, "SmartBulbMeasurement", this.smartBulbMeasurementObjects);
  });

  afterAll(function(){
    TestApi.teardown(this.context);
  });

  it('should have 2 SmartBulb entries', function(){
    expect(SmartBulb.fetch().count).toBe(2);
  });

  it('should have 2 SmartBulbMeasurementSeries entries', function(){
    expect(SmartBulbMeasurementSeries.fetch().count).toBe(2);
  });

  it('should have 21 SmartBulbMeasurement entries', function(){
    expect(SmartBulbMeasurement.fetch().count).toBe(21);
  });

  it ("should show that SmartBulb0 has not overheated", function() {
    // Create input
    this.sources = [MetricGroupInvalidationSpec.fromTimeRange(
      TypeId.fetch({filter:"typeName=='SmartBulb'"}).at("objs[0].id"),
      this.smartBulbObjects[0].id,
      TimeRangeWithSourceInfo.make({start: this.start, end: this.start.plusDays(20)})
    )];

    // Fire analytics
    AnalyticsContainer.fireAnalytics(this.sources, ["SmartBulbOverheatAlert"]);

    // Verify results
    this.smartBulbEvents = SmartBulbEvent.fetch({
      filter: Filter.eq("smartBulb.id", this.smartBulbObjects[0].id).and.eq("eventCode","OVERHEAT")
    }).count;

    expect(this.smartBulbEvents).toEqual(0);
  });

  it ("should show that SmartBulb1 has overheated", function() {
    // Create input
    this.sources = [MetricGroupInvalidationSpec.fromTimeRange(
      TypeId.fetch({filter:"typeName=='SmartBulb'"}).at("objs[0].id"),
      this.smartBulbObjects[1].id,
      TimeRangeWithSourceInfo.make({start: this.start, end: this.start.plusDays(20)})
    )];

    // Fire analytics
    AnalyticsContainer.fireAnalytics(this.sources, ["SmartBulbOverheatAlert"]);

    // Verify results
    this.smartBulbEvents = SmartBulbEvent.fetch({
      filter: Filter.eq("smartBulb.id", this.smartBulbObjects[1].id).and.eq("eventCode","OVERHEAT")
    }).count;

    expect(this.smartBulbEvents).toBeGreaterThan(0);
  });
});
