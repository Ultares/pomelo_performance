var funcmap = {
    getInBox: {funcArray: ['getInBox'], rate: 300},
    autoGotAttachment: {funcArray: ['autoGotAttachment'], rate: 15},
    chapterList: {funcArray: ['chapterList'], rate: 400},
    detailInfos: {funcArray: ['detailInfos'], rate: 100},
    heroList: {funcArray: ['heroList'], rate: 400},
    getRelation: {funcArray: ['getRelation'], rate: 400},
    getRecommendList: {funcArray: ['getRecommendList'], rate: 10},
    towerInfo: {funcArray: ['towerInfo'], rate: 400},
    buyStrength: {funcArray: ['buyStrength'], rate: 15},
    queryRoleStatus: {funcArray: ['queryRoleStatus'], rate: 100},
    gacha: {funcArray: ['gacha'], rate: 200},
    getRoleInfo: {funcArray: ['getRoleInfo'], rate: 400},
    getRankList: {funcArray: ['getRankList'], rate: 400},
    chat: {funcArray: ['chat'], rate: 1},
    extras: {funcArray: ['detailInfos', 'extras'], rate: 200},
    compoundGem: {funcArray: ['detailInfos', 'compoundGem'], rate: 100},
    mission: {funcArray: ['intoLevels', 'battleResult'], rate: 250}
};
var rates = 0;

for (var k in funcmap) {
    rates += funcmap[k].funcArray.length * funcmap[k].rate

}

console.log(rates);