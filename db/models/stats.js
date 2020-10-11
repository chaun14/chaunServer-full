module.exports = (sequelize, Sequelize) => {
    const stats = sequelize.define("stats", {

        date: {
            type: Sequelize.DATEONLY(),
            allowNull: false,
        },
        count: {
            type: Sequelize.BIGINT(),
            allowNull: false,
            defaultValue: 0
        },


    }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin'
    });

    return stats;
};