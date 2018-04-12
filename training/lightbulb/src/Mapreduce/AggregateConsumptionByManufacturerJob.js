var log=C3.logger("lightbulb.AggPowerConsum");
/*
 * Process a set of light bulbs and return the aggregate Power for a given manufacturer
 */
function map(batch,objs,job) {
	
	 // For a batch of Lightbulbs, calculate the aggregate power for a manufacturer and
	  // return a map with the key the manufacturer and the value the aggregate power.
	var intermediaryGroup ={};
	var rows = [];
	var manufacturers=objs.pluck("manufacturer").unique();
	
	//Iterate over each manufacturer, aggregating metric results for all related light bulbs
	manufacturers.each(function(manufacturer){
		var metricResults = SmartBulb.rollupMetrics({
		filter: Filter.eq('manufacturer.id', manufacturer.id),
		start:job.startDate,
		end:job.endDate,
		interval:job.interval,
		rollupFunc: "SUM",
		expressions: ["AveragePower"]
		});
		var data = metricResults.AveragePower.data();
		var dates = metricResults.AveragePower.dates();
		for(var i=0;i<data.size();i++)
		{
			var key = manufacturer + "--" + dates[i].toString();
			intermediaryGroup[key]=data[i];
		}})
	
	return intermediaryGroup;
}
/*
 * Persists the aggregate power of lightbulbs for a manufacturer for a given time range
 */
function reduce(key,objs,job){
	
	var manufacturer=key.split("--")[0];
	var date = key.split("--")[1];
	var total =_.reduce(objs,function(a,b){return a+b},0);
	var mfg=Manufacturer.get(manufacturer);
	var pwrCons=AggregateConsumptionByManufacturer.make({
		parent: mfg,
	    start: date,
	    aggregateConsumption: total
	});
  pwrCons.create();	
	
}
	
	
