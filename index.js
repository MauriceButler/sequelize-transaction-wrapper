function transactionCallback(transaction, callback) {
    return function (...args) {
        var done = () => callback.apply(null, args);

        if (args[0]) {
            return transaction.rollback().then(done, done);
        }

        transaction.commit().then(done, done);
    };
}

module.exports = function (sequelize, fn) {
    return function transactionWrapper(...args) {
        var callback = args.pop();

        sequelize.transaction().then(
            function (transaction) {
                args.push(transactionCallback(transaction, callback));
                args.unshift(transaction);
                fn.apply(null, args);
            },
            callback
        );
    };
};
