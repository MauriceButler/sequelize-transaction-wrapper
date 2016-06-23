var test = require('tape');
var wrapper = require('../');

function createFakeSequelize(t, expectedFunction){
    var transaction = {
        commit: function () {
            return {
                then: () => t.fail('Should not commit transaction'),
            };
        },
        rollback: function () {
            return {
                then: () => t.fail('Should not rollback transaction'),
            };
        },
    };

    transaction[expectedFunction] = function () {
        return {
            then: function (success) {
                t.pass('Correctly ' + expectedFunction + ' transaction');
                success();
            },
        };
    };

    return {
        transaction: function () {
            return {
                then: (success) => success(transaction),
            };
        },
    };
}

test('transaction is committed on success', function (t) {
    t.plan(3);

    function success(transaction, a, b, callback) {
        callback(null, a + b);
    }

    wrapper(
        createFakeSequelize(t, 'commit'),
        success
    )(123, 456, function (error, result) {
        t.notOk(error, 'no error');
        t.equal(result, 579, 'correct result');
    });
});

test('transaction is rolled back on error', function (t) {
    t.plan(3);

    function fail(transaction, a, b, callback) {
        callback('BOOM!!!');
    }

    wrapper(
        createFakeSequelize(t, 'rollback'),
        fail
    )(123, 456, function (error, result) {
        t.equal(error, 'BOOM!!!', 'correct error');
        t.notOk(result, 'no result');
    });
});
