var UserPublicProfilePage = (function () {
    'use strict';
    function UserPublicProfilePage() {
        this.userPicture = element(by.id('user_avatar'));
        this.userName = element(by.id('user_name'));
        this.userAddress = element(by.id('user_address'));
        this.userHistory = element(by.id('user_history'));
        this.userOrg = element(by.id('journey_org'));
        this.userPart = element(by.id('journey_part'));
        this.userRate = element(by.id('driver_rate'));
        this.userComments = element.all(by.repeater('comment in driverComments'));
        this.userRunsPart = element.all(by.repeater('runPlanned in userPublicInfo.Participates'));
    }

    UserPublicProfilePage.prototype.visitPage = function (userId) {
        browser.get('/user-' + userId);
    };

    UserPublicProfilePage.prototype.getTitle = function () {
        return browser.getTitle();
    };

    return UserPublicProfilePage;
})();

module.exports = UserPublicProfilePage;