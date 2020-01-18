"use strict";

/**
 * Wrappers for common types.
 * @type {Object.<string,IWrapper>}
 * @const
 */
var wrappers = exports;

var Message = require("./message");
var $root;

/**
 * From object converter part of an {@link IWrapper}.
 * @typedef WrapperFromObjectConverter
 * @type {function}
 * @param {Object.<string,*>} object Plain object
 * @returns {Message<{}>} Message instance
 * @this Type
 */

/**
 * To object converter part of an {@link IWrapper}.
 * @typedef WrapperToObjectConverter
 * @type {function}
 * @param {Message<{}>} message Message instance
 * @param {IConversionOptions} [options] Conversion options
 * @returns {Object.<string,*>} Plain object
 * @this Type
 */

/**
 * Common type wrapper part of {@link wrappers}.
 * @interface IWrapper
 * @property {WrapperFromObjectConverter} [fromObject] From object converter
 * @property {WrapperToObjectConverter} [toObject] To object converter
 */

// Custom wrapper for Any
wrappers[".google.protobuf.Any"] = {

    fromObject: function fromObject(object) {

        // unwrap value type if mapped
        if (object && object["@type"]) {
            var typeName = object["@type"];
            if (typeName.startsWith('type.googleapis.com/')) {
              typeName = typeName.replace('type.googleapis.com/', '.');
            }

            var type = this.lookup(typeName);
            /* istanbul ignore else */
            if (type) {
                // type_url does not accept leading "."
                var type_url = typeName.charAt(0) === "." ?
                    typeName.substr(1) : typeName;
                // type_url prefix is optional, but path seperator is required
                return this.create({
                    type_url: "/" + type_url,
                    value: type.encode(type.fromObject(object)).finish()
                });
            }
        }

        return this.fromObject(object);
    },

    toObject: function toObject(message, options) {

        // decode value if requested and unmapped
        if (options && options.json && message.type_url && message.value) {
            // Only use fully qualified type name after the last '/'
            var name = message.type_url.substring(message.type_url.lastIndexOf("/") + 1);
            var type = this.lookup(name);
            /* istanbul ignore else */
            if (type)
                message = type.decode(message.value);
        }

        // wrap value if unmapped
        if (!(message instanceof this.ctor) && message instanceof Message) {
            var object = message.$type.toObject(message, options);
            object["@type"] = "type.googleapis.com/"+message.$type.fullName.substr(1);
            return object;
        }

        return this.toObject(message, options);
    }
};

// Custom wrapper for Timestamp.
//
// Implements the JSON serialization / deserialization as specified by
// proto specification.
//
// https://github.com/protocolbuffers/protobuf/blob/5bc250b084b88b6ec98046054f5836b6b60132ef/src/google/protobuf/timestamp.proto#L101
wrappers[".google.protobuf.Timestamp"] = {
  fromObject: function fromObject(object) {
        if (typeof object !== 'string') {
            // for the static target, include the generated code.
            if ($root) {
                if (object instanceof $root.google.protobuf.Timestamp)
                    return object;
                var message = new $root.google.protobuf.Timestamp();
                if (object.seconds != null)
                    if ($util.Long)
                        (message.seconds = $util.Long.fromValue(object.seconds)).unsigned = false;
                    else if (typeof object.seconds === "string")
                        message.seconds = parseInt(object.seconds, 10);
                    else if (typeof object.seconds === "number")
                        message.seconds = object.seconds;
                    else if (typeof object.seconds === "object")
                        message.seconds = new $util.LongBits(object.seconds.low >>> 0, object.seconds.high >>> 0).toNumber();
                if (object.nanos != null)
                    message.nanos = object.nanos | 0;
                return message;
            }

            return this.fromObject(object);
        }
        //Convert ISO-8601 to epoch millis
        var dt = Date.parse(object);
        if (isNaN(dt)) {
            // not a number, default to the parent implementation.
            return this.fromObject(object);
        }

        return this.create({
            seconds: Math.floor(dt/1000),
            nanos: (dt % 1000) * 1000000
        });
    },

    toObject: function toObject(message, options) {
        // TODO: question for reviewer, how do we want to make this backwards
        // compatible in a more explicit way. it seems dangerous to assume
        // that anyone who was using .toJSON() was not relying on the old
        // behaviour.

        // decode value if requested
        if (options && options.json) {
            return new Date(message.seconds*1000 + message.nanos/1000000).toISOString();
        }

        return this.toObject(message, options);
    }
};
