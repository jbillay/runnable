/**
 * Created by jeremy on 07/02/15.
 */
'use strict';

var supertest = require('supertest'),
    models = require('../models'),
    assert = require('chai').assert,
    app = require('../../server.js'),
    async = require('async'),
    q = require('q'),
    sinon = require('sinon'),
    request = require('request'),
    superagent = require('superagent');

var loadData = function (fix) {
    var deferred = q.defer();
    models[fix.model].create(fix.data)
        .complete(function (err, result) {
            if (err) {
                console.log(err);
            }
            deferred.resolve(result);
        });
    return deferred.promise;
};

function mockRuns() {
    var html_full_page = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta name="revisit-after" content="7days"/> <meta name="ROBOTS" content="INDEX, FOLLOW, ALL"/> <meta name="Identifier-url" content="http://www.i-tra.org/"/> <meta http-equiv="Content-Language" content="fr"/> <title>Indice de performance - ITRA</title> <meta name="title" lang="fr" content="Indice de performance - ITRA"/> <meta name="description" lang="fr" content="International Trail Running Association"/> <meta name="keywords" lang="fr" content="trail,international,association, trail, course, à pied, run, running, jogging"/> <link rel="icon" type="image/png" href="/itra16.png"/><!--[if IE]> <link rel="shortcut icon" type="image/x-icon" href="/itra16.ico"/><![endif]--><link rel="stylesheet" type="text/css" media="screen" href="/css/jquery/jquery-ui-1.8.19.custom.css"/><link rel="stylesheet" type="text/css" href="/st.css"/><script type="text/javascript" src="/js/jquery.js"></script><script type="text/javascript" src="/js/jquery-ui.js"></script><script type="text/javascript" src="/js/jquery.cycle.js"></script><script type="text/javascript" src="/js/pub.js"></script><script type="text/javascript" src="/js/httpReq.js"></script><script type="text/javascript">function dispSsM(o){var c=$(o).parent("li").find("ul:first");if(!c.is(":visible")){c.parent("li").parent("ul").find("li ul:visible").slideToggle();}c.slideToggle();}$(function(){$("body").click(function(e){if($(e.target).closest("#mainMenu").length > 0) return;$("#mainMenu li ul:visible").slideToggle();});}); </script></head><body><a href="aspi.php?p=26410" style="display:block;position:absolute;top:0;left:0;width:1px;height:1px;"><img src="/images/pix.gif" width="1" height="1" border="0"></a> <div id="general"> <div id="bande"></div><div id="tetiere"><div id="imgs"><img src="/incphotos/fond/ITRA-©-Ultra-Marin-2013.png"/><img src="/incphotos/fond/ITRA-©-BRU.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-Tor-des-Géants.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-Thierry-MARSILHAC---ASO.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-The-North-Face®-Ultra-Trail-du-Mont-Blanc®---Pascal-Tournaire.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-Trans-Alps-Run.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-Marathon-des-Sables.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-EcoTrail-de-Paris.png" style="display:none"/></div><div id="menusec"><ul> <li><a href="/page/276/Contact.html" >Contact</a></li><li id="lg"> <a href="?langue_affich=_en" return false;">EN</a> | <a class="selected">FR</a> </li></ul></div><div id="carre"><a href="/"><img id="logo" src="/images/logo.png" border="0"/></a><ul id="mainMenu"> <li><a href="#" onclick="dispSsM(this); return false">ASSEMBLEE GENERALE 2015</a><ul><li><a href="/page/312/Organisation.html" >Organisation</a></li><li><a href="/page/313/Liste_des_adherents.html" >Liste des adhérents</a></li></ul></li><li><a href="#" onclick="dispSsM(this); return false">Presentation</a><ul><li><a href="/page/257/Presentation_et_objectifs.html" >Présentation et objectifs</a></li><li><a href="/page/283/Organisation.html" >Organisation</a></li></ul></li><li><a href="#" onclick="dispSsM(this); return false">Missions</a><ul><li><a href="/page/258/Charte_ethique.html" >Charte ethique</a></li><li><a href="/page/259/Definition_du_trail.html" >Definition du trail</a></li><li><a href="/page/260/Gestion_des_athletes_de_haut_niveau.html" >Gestion des athletes de haut niveau</a></li><li><a href="/page/261/Politique_sante_et_antidopage.html" >Politique sante et antidopage</a></li><li><a href="/page/291/Securite.html" >Securite</a></li><li><a href="/page/292/Evaluation_des_trails.html" >Evaluation des trails</a></li></ul></li><li><a href="#" onclick="dispSsM(this); return false">Soyez acteur</a><ul><li><a href="/page/264/Coureurs.html" >Coureurs</a></li><li><a href="/page/265/Coureurs_elite.html" >Coureurs elite</a></li><li><a href="/page/266/Organisateurs.html" >Organisateurs</a></li><li><a href="/page/284/Associations.html" >Associations</a></li><li><a href="/page/268/Marques.html" >Marques</a></li></ul></li><li class="selected"><a href="#" onclick="dispSsM(this); return false">Classements</a><ul><li class="selected"><a href="/page/278/Indice_de_performance.html" >Indice de performance</a></li><li><a href="/page/269/FAQ_Indice_de_performance.html" >FAQ Indice de performance</a></li></ul></li><li><a href="#" onclick="dispSsM(this); return false">Courses</a><ul><li><a href="/page/308/Liste_par_continent.html" >Liste par continent</a></li><li><a href="/page/290/Calendrier.html" >Calendrier</a></li></ul></li><li><a href="#" onclick="dispSsM(this); return false">Presse</a><ul><li><a href="/page/279/Communiques_de_presse.html" >Communiqués de presse</a></li><li><a href="/page/310/Dossier_de_presse.html" >Dossier de presse</a></li></ul></li></ul></div></div><div id="ariane">Classements > Indice de performance</div><div id="member"></div><div id="content"><h1>Indice de performance</h1><a name="tab"></a><form name="fcoureur" method="get" action="#tab"><fieldset><legend>Rechercher un coureur</legend><div><label>Nom : </label><input type="text" name="nom" value="COURET"/> <input type="submit" value="Chercher..."/></div></fieldset></form><a name="tab"></a><div id="palm" class="popin"></div><div id="result" class="popin"></div><h1>Richard COURET (Homme / France)</h1><table style="width:700px"><thead><tr><th>Catégorie de trail</th><th>Cote ( / 1000)</th><th>Meilleure cote Homme</th></tr></thead><tbody><tr class="odd"><td><b>GENERAL</b></td><td ><b>546</b></td><td>939</td></tr><tr><td><b>Trail Ultra XL ( >=100 km)</b></td><td >-</td><td>911</td></tr><tr class="odd"><td><b>Trail Ultra L (70 to 99 km)</b></td><td >-</td><td>925</td></tr><tr><td><b>Trail Ultra M (42 to 69 km)</b></td><td ><b>496</b></td><td>925</td></tr><tr class="odd"><td><b>Trail (<42km)</b></td><td ><b>546</b></td><td>929</td></tr></tbody></table><br/><div id="lienPalm" onclick="palmares();"><a href="#" onclick="return false">Palmarès complet du coureur</a></div><h1 style="text-transform:none">Courses prises en compte dans le calcul de l index</h1> <table class="palmares" style="width:100%"><tr><td colspan="8"><h2 style="margin:10px 0 2px 0">GENERAL</h2></td></tr><tr><th>Course</th><th>Pays</th><th>Annee</th><th>Distance</th><th>Clt.</th><th>Clt. Homme</th><th>Temps</th><th>Cote</th></tr><tr class="odd"><td>TEMPLIERS - MARATHON DES CAUSSES</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">143</td><td align="right">131 </td><td>04:31:10</td><td align="right">565</td></tr><tr><td>TRAIL DES HAUTS FORTS 43K</td><td>France</td><td>2014</td><td align="right">43km</td><td align="right">76</td><td align="right">65 </td><td>06:47:23</td><td align="right">514</td></tr><tr class="odd"><td>INTEGRALE DES CAUSSES</td><td>France</td><td>2014</td><td align="right">62km</td><td align="right">95</td><td align="right">87 </td><td>09:47:39</td><td align="right">504</td></tr><tr><td>ARAVISTRAIL - 52km</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">114</td><td align="right">100 </td><td>06:13:43</td><td align="right">493</td></tr><tr class="odd"><td>TRAIL DU GALIBIER</td><td>France</td><td>2013</td><td align="right">45km</td><td align="right">85</td><td align="right">77 </td><td>08:11:24</td><td align="right">490</td></tr><tr><td colspan="8"><h2 style="margin:10px 0 2px 0">Trail Ultra M (42 to 69 km)</h2></td></tr><tr><th>Course</th><th>Pays</th><th>Annee</th><th>Distance</th><th>Clt.</th><th>Clt. Homme</th><th>Temps</th><th>Cote</th></tr><tr class="odd"><td>TRAIL DES HAUTS FORTS 43K</td><td>France</td><td>2014</td><td align="right">43km</td><td align="right">76</td><td align="right">65 </td><td>06:47:23</td><td align="right">514</td></tr><tr><td>INTEGRALE DES CAUSSES</td><td>France</td><td>2014</td><td align="right">62km</td><td align="right">95</td><td align="right">87 </td><td>09:47:39</td><td align="right">504</td></tr><tr class="odd"><td>TRAIL DU GALIBIER</td><td>France</td><td>2013</td><td align="right">45km</td><td align="right">85</td><td align="right">77 </td><td>08:11:24</td><td align="right">490</td></tr><tr><td>TRAIL DE LA VALLEE DES LACS - TRAIL LONG</td><td>France</td><td>2014</td><td align="right">55km</td><td align="right">120</td><td align="right">112 </td><td>08:22:04</td><td align="right">485</td></tr><tr><td colspan="8"><h2 style="margin:10px 0 2px 0">Trail (<42km)</h2></td></tr><tr><th>Course</th><th>Pays</th><th>Annee</th><th>Distance</th><th>Clt.</th><th>Clt. Homme</th><th>Temps</th><th>Cote</th></tr><tr class="odd"><td>TEMPLIERS - MARATHON DES CAUSSES</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">143</td><td align="right">131 </td><td>04:31:10</td><td align="right">565</td></tr><tr><td>ARAVISTRAIL - 52km</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">114</td><td align="right">100 </td><td>06:13:43</td><td align="right">493</td></tr><tr class="odd"><td>ALTISPEED</td><td>France</td><td>2012</td><td align="right">30km</td><td align="right">157</td><td align="right">136 </td><td>06:20:25</td><td align="right">424</td></tr></table></div><div id="bottom"><div style="float:right;"><a style="padding:0 5px 0 5px" href="https://www.twitter.com/ITRA_trail" target="_blank" title="Find ITRA on Twitter"><img src="/images/tweet.gif"/></a><a style="padding:0 5px 0 5px" href="https://www.facebook.com/InternationalTrailRunningAssociation" target="_blank" title="Find ITRA on Facebook"><img src="/images/facebk.gif"/></a></div>Powered by <a href="http://livetrail.net" target="_blank" >LiveTrail&trade;</a><a href="http://livetrail.net" target="_blank" ><img src="/images/livetrail.png" style="vertical-align:middle"/></a></div></div></body></html>';

    sinon
        .stub(request, 'get')
        .yields(null, null, html_full_page);
}

function mockItraCode() {
    var html = '<tbody><tr class="odd"><td><a href="?id=340083&nom=COURET#tab">Andre COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr><td><a href="?id=78273&nom=COURET#tab">Jacques-Andre COURET</a></td><td>Homme</td><td>France</td><td>1965</td></tr><tr class="odd"><td><a href="?id=267249&nom=COURET#tab">Jaques Andre COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr><td><a href="?id=437314&nom=COURET#tab">Nicolas COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr class="odd"><td><a href="?id=84500&nom=COURET#tab">Richard COURET</a></td><td>Homme</td><td>France</td><td>1980</td></tr><tr><td><a href="?id=489223&nom=DUCOURET#tab">Fabien DUCOURET</a></td><td>Homme</td><td>France</td><td>1978</td></tr><tr class="odd"><td><a href="?id=475698&nom=PICOURET#tab">Apollo PICOURET</a></td><td>Homme</td><td>France</td><td>1985</td></tr>				</tbody>';

    sinon
        .stub(request, 'get')
        .yields(null, null, html);
}

function restoreRequest() {
    request.get.restore();
}

function loginUser(agent) {
    return function(done) {
        function onResponse(err, res) {
            return done();
        }

        agent
            .post('http://localhost:9615/login')
            .send({ email: 'jbillay@gmail.com', password: 'noofs' })
            .end(onResponse);

    };
}

describe('Test of user API', function () {

    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        this.timeout(6000);
        models.sequelize.sync({force: true})
            .then(function () {
                async.waterfall([
                    function (callback) {
                        var fixtures = require('./fixtures/users.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/options.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/runs.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/journeys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/joins.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/invoices.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/discussions.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/participates.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/validationJourneys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    }
                ], function (err, result) {
                    done();
                });
            });
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test API user over !');
    });

    describe('GET /api/user/public/info/:id', function () {
        it('should return code 200', function (done) {
            supertest(app)
                .get('/api/user/public/info/1')
                .expect(200, done);
        });
        it('should return public info on user 1', function (done) {
            supertest(app)
                .get('/api/user/public/info/1')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.firstname, 'Jeremy');
                    assert.equal(res.body.lastname, 'Billay');
                    assert.equal(res.body.address, 'Saint Germain en laye');
                    assert.equal(res.body.phone, '0689876547');
                    assert.equal(res.body.email, 'jbillay@gmail.com');
                    assert.equal(res.body.isActive, 1);
                    assert.equal(res.body.role, 'admin');
                    done();
                });
        });
    });

    describe('GET /api/user/public/driver/:id', function () {
        it('should return code 200', function (done) {
            supertest(app)
                .get('/api/user/public/driver/2')
                .expect(200, done);
        });
        it('should return public driver info on user 2', function (done) {
            supertest(app)
                .get('/api/user/public/driver/2')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    assert.equal(res.body[0].rate_driver, 3);
                    assert.equal(res.body[0].rate_service, 5);
                    assert.equal(res.body[0].UserId, 1);
                    done();
                });
        });
    });

    describe('POST /api/user', function () {

        mockItraCode();

        it('should return code 200', function (done) {
            var user = {
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'test.creation@user.fr',
                password : 'test',
                password_confirmation : 'test'
            };
            supertest(app)
                .post('/api/user')
                .send(user)
                .expect(200, done);
        });
        it('should return a new user', function (done) {
            var user = {
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'test.creation@user.fr',
                password : 'test',
                password_confirmation : 'test'
            };
            supertest(app)
                .post('/api/user')
                .send(user)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(JSON.parse(res.body).msg, 'accountCreated');
                    done();
                });
        });

        it('should return an error for different password', function (done) {
            var user = {
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'test.creation@user.fr',
                password : 'test',
                password_confirmation : 'test1'
            };
            supertest(app)
                .post('/api/user')
                .send(user)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(JSON.parse(res.body).msg, 'wrongPassword');
                    done();
                });
        });

        it('should return an error for existing user', function (done) {
            var user = {
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'jbillay@gmail.com',
                password : 'test',
                password_confirmation : 'test'
            };
            supertest(app)
                .post('/api/user')
                .send(user)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(JSON.parse(res.body).msg, 'existingAccount');
                    done();
                });
        });

        restoreRequest();
    });

    describe('GET /login', function () {
        it('should return code 200', function (done) {
            supertest(app)
                .post('/login')
                .send({ email: 'jbillay@gmail.com', password: 'noofs' })
                .expect(200, done);
        });

        it('Should get user information after login', function (done) {
            supertest(app)
                .post('/login')
                .send({ email: 'jbillay@gmail.com', password: 'noofs' })
                .end(function (err, res) {
                    assert.equal(res.body.id, 1);
                    assert.equal(res.body.firstname, 'Jeremy');
                    assert.equal(res.body.lastname, 'Billay');
                    assert.equal(res.body.address, 'Saint Germain en laye');
                    assert.equal(res.body.phone, '0689876547');
                    assert.equal(res.body.email, 'jbillay@gmail.com');
                    assert.equal(res.body.role, 'admin');
                    done();
                });
        });

        it('Should not be logging due to wrong email', function (done) {
            supertest(app)
                .post('/login')
                .send({ email: 'jbillay@gmail.fr', password: 'noofs' })
                .end(function (err, res) {
                    var obj = {};
                    assert.deepEqual(res.body, obj);
                    done();
                });
        });

        it('Should not be logging due to wrong password', function (done) {
            supertest(app)
                .post('/login')
                .send({ email: 'jbillay@gmail.com', password: 'test' })
                .end(function (err, res) {
                    var obj = {};
                    assert.deepEqual(res.body, obj);
                    done();
                });
        });
    });

    describe('GET /api/user/me', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should get user information', function(done) {
            agent
                .get('http://localhost:9615/api/user/me')
                .end(function(err, res) {
                    assert.equal(res.body.id, 1);
                    assert.equal(res.body.firstname, 'Jeremy');
                    assert.equal(res.body.lastname, 'Billay');
                    assert.equal(res.body.address, 'Saint Germain en laye');
                    assert.equal(res.body.phone, '0689876547');
                    assert.equal(res.body.email, 'jbillay@gmail.com');
                    assert.equal(res.body.role, 'admin');
                    return done();
                });
        });
    });

    describe('GET /api/user/journeys', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should get user journeys', function(done) {
            agent
                .get('http://localhost:9615/api/user/journeys')
                .end(function (err, res) {
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('GET /api/user/joins', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should get user joins', function(done) {
            agent
                .get('http://localhost:9615/api/user/joins')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('GET /api/user/password/update', function () {
        var agent = superagent.agent();

        it('Should not update the user password as not logging', function(done) {
            var anon = superagent.agent();
            anon
                .post('http://localhost:9615/api/user/password/update')
                .send({ passwords: {old: 'noofs', new: 'test', newConfirm: 'test'}})
                .end(function (err, res) {
                    assert.equal(res.body.msg, 'notAuthenticated');
                    done();
                });
        });

        before(loginUser(agent));

        it('Should update the user password', function(done) {
            agent
                .post('http://localhost:9615/api/user/password/update')
                .send({ passwords: {old: 'noofs', new: 'test', newConfirm: 'test'}})
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'passwordUpdated');
                    done();
                });
        });

        it('Should not update the user password due to wrong old password', function(done) {
            agent
                .post('http://localhost:9615/api/user/password/update')
                .send({ passwords: {old: 'kjdhkqshdk', new: 'test', newConfirm: 'test'}})
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'passwordWrong');
                    done();
                });
        });

        it('Should not update the user password due to different new passwords', function(done) {
            agent
                .post('http://localhost:9615/api/user/password/update')
                .send({ passwords: {old: 'noofs', new: 'test', newConfirm: 'test1'}})
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'passwordDifferent');
                    done();
                });
        });
    });

    describe('GET /api/admin/users', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should get list of users', function(done) {
            agent
                .get('http://localhost:9615/api/admin/users')
                .end(function (err, res) {
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('GET /api/admin/user/active', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should define user 2 as active', function(done) {
            agent
                .post('http://localhost:9615/api/admin/user/active')
                .send({id: '2'})
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'userToggleActive');
                    supertest(app)
                        .get('/api/user/public/info/2')
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            assert.equal(res.body.isActive, 1);
                        });
                    return done();
                });
        });
    });

    describe('GET /api/user/runs', function () {
        var agent = superagent.agent();

        before(loginUser(agent));
        mockRuns();

        it('should return user run from web', function (done) {
            agent
                .get('http://localhost:9615/api/user/runs')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.isNotNull(res.body);
                    done();
                });
        });

        restoreRequest();
    });

    describe('GET /api/user/invite', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should send email to friends of user 1', function (done) {
            agent
                .post('http://localhost:9615/api/user/invite')
                .send({emails: 'jbillay@gmail.com, richard.couret@free.fr', message: 'should send email to friends'})
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(JSON.parse(res.body).msg, 'Invitation(s) envoyée(s)');
                    return done();
                });
        });
    });

    describe('GET /api/user/password/reset', function () {
        it('should return code 302', function (done) {
            supertest(app)
                .post('/api/user/password/reset')
                .send({ email: 'jbillay@gmail.com'})
                .expect(302, done);
        });

        it('Should reset user password', function (done) {
            var agent = superagent.agent();

            supertest(app)
                .post('/api/user/password/reset')
                .send({ email: 'jbillay@gmail.com'})
                .end(function (err, res) {
                    assert.equal(res.header.location, '/');
                    agent
                        .post('http://localhost:9615/login')
                        .send({ email: 'jbillay@gmail.com', password: 'noofs' })
                        .end(function (err, res) {
                            assert.isNull(err);
                            assert.equal(res.statusCode, 401);
                            done();
                        });
                });
        });
    });

    describe('GET /api/user/public/info/:id', function () {
        it('should active the user 2', function (done) {
            supertest(app)
                .get('/api/user/public/info/2')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.notOk(res.body.isActive);
                    var hash = new Date(res.body.createdAt).getTime().toString();
                    supertest(app)
                        .get('/api/user/active/2/' + hash)
                        .end(function (err, res) {
                            assert.isNull(err);
                            assert.equal(res.header.location, '/');
                            done();
                        });
                });
        });
    });

    describe('POST /api/admin/user/remove', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should delete the user 2', function (done) {
            var user = {
                id: 2
            };
            agent
                .post('http://localhost:9615/api/admin/user/remove')
                .send(user)
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(JSON.parse(res.body).msg, 'userDeleted');
                    return done();
                });
        });
    });
    
    describe('PUT /api/user', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should update user information', function (done) {
            var user = {
                firstname : 'Jeremy',
                lastname : 'Billay',
                address : 'Chantilly',
                phone: '0987654321',
                email : 'jbillay@gmail.com'
            };
            agent
                .put('http://localhost:9615/api/user')
                .send(user)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(JSON.parse(res.body).msg, 'accountUpdated');
                    agent
                        .get('http://localhost:9615/api/user/me')
                        .end(function(err, res) {
                            assert.equal(res.body.id, 1);
                            assert.equal(res.body.firstname, 'Jeremy');
                            assert.equal(res.body.lastname, 'Billay');
                            assert.equal(res.body.address, 'Chantilly');
                            assert.equal(res.body.phone, '0987654321');
                            assert.equal(res.body.email, 'jbillay@gmail.com');
                            assert.equal(res.body.role, 'admin');
                            return done();
                        });
                });
        });
    });

    describe('GET /api/user/remove/picture', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should remove picture of users profil', function(done) {
            agent
                .get('http://localhost:9615/api/user/remove/picture')
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'userPictureRemoved');
                    return done();
                });
        });
    });
});

