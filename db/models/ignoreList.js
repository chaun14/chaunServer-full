module.exports = (sequelize, Sequelize) => {
    const ignoreList = sequelize.define("ignoreList", {

        path: {
            type: Sequelize.TEXT(),
            allowNull: false,
        },


    }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin'
    });

    return ignoreList;
};