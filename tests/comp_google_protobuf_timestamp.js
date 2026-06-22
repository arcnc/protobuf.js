var tape = require("tape");

var protobuf = require("..");

var root = protobuf.Root.fromJSON({})
    .addJSON(protobuf.common["google/protobuf/timestamp.proto"].nested)
    .resolveAll();

var Timestamp = root.lookupType("protobuf.Timestamp");
var Long = protobuf.util.Long;

tape.test("google.protobuf.Timestamp", function(test) {
    var timestamp = Timestamp.fromObject({
        seconds: 5,
        nanos: 1000000
    });

    test.ok(timestamp instanceof Timestamp.ctor, "should convert to Timestamp in fromObject");
    test.same(timestamp, Timestamp.create({ seconds: new Long(5), nanos: 1000000 }), "fromObject should work with raw object representation");
    test.same(Timestamp.toObject(timestamp, { json: true }), "1970-01-01T00:00:05.001Z", "should serialize as RFC 3339 when json conversion is requested");
    test.same(Timestamp.toObject(Timestamp.fromObject("1970-01-01T00:00:05.001Z"), { json: true }), "1970-01-01T00:00:05.001Z", "should parse RFC 3339 strings");
    test.same(Timestamp.toObject(timestamp), { seconds: new Long(5), nanos: 1000000 }, "should preserve default object conversion");

    test.end();
});
