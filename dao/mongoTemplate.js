module.exports = function(mongo, collection) {
    return mongo.db('share').collection(collection);
}
