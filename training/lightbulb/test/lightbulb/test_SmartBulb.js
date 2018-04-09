var filename = 'test_SmartBulb';

describe(filename,function(){
    
    var ctx;

    beforeAll(function(){
        ctx = TestApi.createContext(filename);
        header = TestApi.createEntity(ctx,"TestFileTimedHeader",{
            interval: "HOUR",
            extrapolate: true
        })
    });

    afterAll(function(){
        TestApi.teardown(ctx);
    });

})