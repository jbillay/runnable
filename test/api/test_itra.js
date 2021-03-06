/**
 * Created by jeremy on 30/11/14.
 */

'use strict';

var assert = require('chai').assert;
var request = require('request');
var sinon = require('sinon');
var Itra = require('../../server/objects/itra.js');
var proxyquire = require('proxyquire');

describe('Test of Itra object', function () {
    describe('Test getCode', function () {
        var html = '<tbody><tr class="odd"><td><a href="?id=340083&nom=COURET#tab">Andre COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr><td><a href="?id=78273&nom=COURET#tab">Jacques-Andre COURET</a></td><td>Homme</td><td>France</td><td>1965</td></tr><tr class="odd"><td><a href="?id=267249&nom=COURET#tab">Jaques Andre COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr><td><a href="?id=437314&nom=COURET#tab">Nicolas COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr class="odd"><td><a href="?id=84500&nom=COURET#tab">Richard COURET</a></td><td>Homme</td><td>France</td><td>1980</td></tr><tr><td><a href="?id=489223&nom=DUCOURET#tab">Fabien DUCOURET</a></td><td>Homme</td><td>France</td><td>1978</td></tr><tr class="odd"><td><a href="?id=475698&nom=PICOURET#tab">Apollo PICOURET</a></td><td>Homme</td><td>France</td><td>1985</td></tr>				</tbody>';

        before(function(done){
            process.env.NODE_ENV = 'test';
            sinon
                .stub(request, 'get')
                .yields(null, null, html);
            return done();
        });

        after(function(done){
            request.get.restore();
            return done();
        });

        it('Get user code from itra fake data', function (done) {
            var itra = new Itra('Richard', 'Couret', null);
            itra.getCode(function (err, result) {
                if(err) return done(err);
                assert.equal(result, '?id=84500&nom=COURET#tab');
                return done();
            });
        });

        it('Get not existing user code from itra fake data', function (done) {
            var itra = new Itra('Jeremy', 'Billay', null);
            itra.getCode(function (err, result) {
                if(err) return done(err);
                assert.isNull(result);
                return done();
            });
        });

        it('Get itra information is not working', function (done) {
            var stubRequest = { get: function (url, callback) { return callback('Mock to fail', null, null); } };
            var Itra = proxyquire('../../server/objects/itra', {'request': stubRequest});
            var itra = new Itra('Jeremy', 'Billay', null);
            itra.getCode(function (err, result) {
                if (err) {
                    assert.equal(err, 'Mock to fail');
                    assert.isNull(result);
                    return done();
                }
                return done('should not work');
            });
        });
    });

    describe('Test getRuns', function () {
        var html_full_page = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta name="revisit-after" content="7days"/> <meta name="ROBOTS" content="INDEX, FOLLOW, ALL"/> <meta name="Identifier-url" content="http://www.i-tra.org/"/> <meta http-equiv="Content-Language" content="fr"/> <title>Indice de performance - ITRA</title> <meta name="title" lang="fr" content="Indice de performance - ITRA"/> <meta name="description" lang="fr" content="International Trail Running Association"/> <meta name="keywords" lang="fr" content="trail,international,association, trail, course, à pied, run, running, jogging"/> <link rel="icon" type="image/png" href="/itra16.png"/><!--[if IE]> <link rel="shortcut icon" type="image/x-icon" href="/itra16.ico"/><![endif]--><link rel="stylesheet" type="text/css" media="screen" href="/css/jquery/jquery-ui-1.8.19.custom.css"/><link rel="stylesheet" type="text/css" href="/st.css"/><script type="text/javascript" src="/js/jquery.js"></script><script type="text/javascript" src="/js/jquery-ui.js"></script><script type="text/javascript" src="/js/jquery.cycle.js"></script><script type="text/javascript" src="/js/pub.js"></script><script type="text/javascript" src="/js/httpReq.js"></script><script type="text/javascript">function dispSsM(o){var c=$(o).parent("li").find("ul:first");if(!c.is(":visible")){c.parent("li").parent("ul").find("li ul:visible").slideToggle();}c.slideToggle();}$(function(){$("body").click(function(e){if($(e.target).closest("#mainMenu").length > 0) return;$("#mainMenu li ul:visible").slideToggle();});}); </script></head><body><a href="aspi.php?p=26410" style="display:block;position:absolute;top:0;left:0;width:1px;height:1px;"><img src="/images/pix.gif" width="1" height="1" border="0"></a> <div id="general"> <div id="bande"></div><div id="tetiere"><div id="imgs"><img src="/incphotos/fond/ITRA-©-Ultra-Marin-2013.png"/><img src="/incphotos/fond/ITRA-©-BRU.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-Tor-des-Géants.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-Thierry-MARSILHAC---ASO.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-The-North-Face®-Ultra-Trail-du-Mont-Blanc®---Pascal-Tournaire.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-Trans-Alps-Run.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-Marathon-des-Sables.png" style="display:none"/><img src="/incphotos/fond/ITRA-©-EcoTrail-de-Paris.png" style="display:none"/></div><div id="menusec"><ul> <li><a href="/page/276/Contact.html" >Contact</a></li><li id="lg"> <a href="?langue_affich=_en" return false;">EN</a> | <a class="selected">FR</a> </li></ul></div><div id="carre"><a href="/"><img id="logo" src="/images/logo.png" border="0"/></a><ul id="mainMenu"> <li><a href="#" onclick="dispSsM(this); return false">ASSEMBLEE GENERALE 2015</a><ul><li><a href="/page/312/Organisation.html" >Organisation</a></li><li><a href="/page/313/Liste_des_adherents.html" >Liste des adhérents</a></li></ul></li><li><a href="#" onclick="dispSsM(this); return false">Presentation</a><ul><li><a href="/page/257/Presentation_et_objectifs.html" >Présentation et objectifs</a></li><li><a href="/page/283/Organisation.html" >Organisation</a></li></ul></li><li><a href="#" onclick="dispSsM(this); return false">Missions</a><ul><li><a href="/page/258/Charte_ethique.html" >Charte ethique</a></li><li><a href="/page/259/Definition_du_trail.html" >Definition du trail</a></li><li><a href="/page/260/Gestion_des_athletes_de_haut_niveau.html" >Gestion des athletes de haut niveau</a></li><li><a href="/page/261/Politique_sante_et_antidopage.html" >Politique sante et antidopage</a></li><li><a href="/page/291/Securite.html" >Securite</a></li><li><a href="/page/292/Evaluation_des_trails.html" >Evaluation des trails</a></li></ul></li><li><a href="#" onclick="dispSsM(this); return false">Soyez acteur</a><ul><li><a href="/page/264/Coureurs.html" >Coureurs</a></li><li><a href="/page/265/Coureurs_elite.html" >Coureurs elite</a></li><li><a href="/page/266/Organisateurs.html" >Organisateurs</a></li><li><a href="/page/284/Associations.html" >Associations</a></li><li><a href="/page/268/Marques.html" >Marques</a></li></ul></li><li class="selected"><a href="#" onclick="dispSsM(this); return false">Classements</a><ul><li class="selected"><a href="/page/278/Indice_de_performance.html" >Indice de performance</a></li><li><a href="/page/269/FAQ_Indice_de_performance.html" >FAQ Indice de performance</a></li></ul></li><li><a href="#" onclick="dispSsM(this); return false">Courses</a><ul><li><a href="/page/308/Liste_par_continent.html" >Liste par continent</a></li><li><a href="/page/290/Calendrier.html" >Calendrier</a></li></ul></li><li><a href="#" onclick="dispSsM(this); return false">Presse</a><ul><li><a href="/page/279/Communiques_de_presse.html" >Communiqués de presse</a></li><li><a href="/page/310/Dossier_de_presse.html" >Dossier de presse</a></li></ul></li></ul></div></div><div id="ariane">Classements > Indice de performance</div><div id="member"></div><div id="content"><h1>Indice de performance</h1><a name="tab"></a><form name="fcoureur" method="get" action="#tab"><fieldset><legend>Rechercher un coureur</legend><div><label>Nom : </label><input type="text" name="nom" value="COURET"/> <input type="submit" value="Chercher..."/></div></fieldset></form><a name="tab"></a><div id="palm" class="popin"></div><div id="result" class="popin"></div><h1>Richard COURET (Homme / France)</h1><table style="width:700px"><thead><tr><th>Catégorie de trail</th><th>Cote ( / 1000)</th><th>Meilleure cote Homme</th></tr></thead><tbody><tr class="odd"><td><b>GENERAL</b></td><td ><b>546</b></td><td>939</td></tr><tr><td><b>Trail Ultra XL ( >=100 km)</b></td><td >-</td><td>911</td></tr><tr class="odd"><td><b>Trail Ultra L (70 to 99 km)</b></td><td >-</td><td>925</td></tr><tr><td><b>Trail Ultra M (42 to 69 km)</b></td><td ><b>496</b></td><td>925</td></tr><tr class="odd"><td><b>Trail (<42km)</b></td><td ><b>546</b></td><td>929</td></tr></tbody></table><br/><div id="lienPalm" onclick="palmares();"><a href="#" onclick="return false">Palmarès complet du coureur</a></div><h1 style="text-transform:none">Courses prises en compte dans le calcul de l index</h1> <table class="palmares" style="width:100%"><tr><td colspan="8"><h2 style="margin:10px 0 2px 0">GENERAL</h2></td></tr><tr><th>Course</th><th>Pays</th><th>Annee</th><th>Distance</th><th>Clt.</th><th>Clt. Homme</th><th>Temps</th><th>Cote</th></tr><tr class="odd"><td>TEMPLIERS - MARATHON DES CAUSSES</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">143</td><td align="right">131 </td><td>04:31:10</td><td align="right">565</td></tr><tr><td>TRAIL DES HAUTS FORTS 43K</td><td>France</td><td>2014</td><td align="right">43km</td><td align="right">76</td><td align="right">65 </td><td>06:47:23</td><td align="right">514</td></tr><tr class="odd"><td>INTEGRALE DES CAUSSES</td><td>France</td><td>2014</td><td align="right">62km</td><td align="right">95</td><td align="right">87 </td><td>09:47:39</td><td align="right">504</td></tr><tr><td>ARAVISTRAIL - 52km</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">114</td><td align="right">100 </td><td>06:13:43</td><td align="right">493</td></tr><tr class="odd"><td>TRAIL DU GALIBIER</td><td>France</td><td>2013</td><td align="right">45km</td><td align="right">85</td><td align="right">77 </td><td>08:11:24</td><td align="right">490</td></tr><tr><td colspan="8"><h2 style="margin:10px 0 2px 0">Trail Ultra M (42 to 69 km)</h2></td></tr><tr><th>Course</th><th>Pays</th><th>Annee</th><th>Distance</th><th>Clt.</th><th>Clt. Homme</th><th>Temps</th><th>Cote</th></tr><tr class="odd"><td>TRAIL DES HAUTS FORTS 43K</td><td>France</td><td>2014</td><td align="right">43km</td><td align="right">76</td><td align="right">65 </td><td>06:47:23</td><td align="right">514</td></tr><tr><td>INTEGRALE DES CAUSSES</td><td>France</td><td>2014</td><td align="right">62km</td><td align="right">95</td><td align="right">87 </td><td>09:47:39</td><td align="right">504</td></tr><tr class="odd"><td>TRAIL DU GALIBIER</td><td>France</td><td>2013</td><td align="right">45km</td><td align="right">85</td><td align="right">77 </td><td>08:11:24</td><td align="right">490</td></tr><tr><td>TRAIL DE LA VALLEE DES LACS - TRAIL LONG</td><td>France</td><td>2014</td><td align="right">55km</td><td align="right">120</td><td align="right">112 </td><td>08:22:04</td><td align="right">485</td></tr><tr><td colspan="8"><h2 style="margin:10px 0 2px 0">Trail (<42km)</h2></td></tr><tr><th>Course</th><th>Pays</th><th>Annee</th><th>Distance</th><th>Clt.</th><th>Clt. Homme</th><th>Temps</th><th>Cote</th></tr><tr class="odd"><td>TEMPLIERS - MARATHON DES CAUSSES</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">143</td><td align="right">131 </td><td>04:31:10</td><td align="right">565</td></tr><tr><td>ARAVISTRAIL - 52km</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">114</td><td align="right">100 </td><td>06:13:43</td><td align="right">493</td></tr><tr class="odd"><td>ALTISPEED</td><td>France</td><td>2012</td><td align="right">30km</td><td align="right">157</td><td align="right">136 </td><td>06:20:25</td><td align="right">424</td></tr></table></div><div id="bottom"><div style="float:right;"><a style="padding:0 5px 0 5px" href="https://www.twitter.com/ITRA_trail" target="_blank" title="Find ITRA on Twitter"><img src="/images/tweet.gif"/></a><a style="padding:0 5px 0 5px" href="https://www.facebook.com/InternationalTrailRunningAssociation" target="_blank" title="Find ITRA on Facebook"><img src="/images/facebk.gif"/></a></div>Powered by <a href="http://livetrail.net" target="_blank" >LiveTrail&trade;</a><a href="http://livetrail.net" target="_blank" ><img src="/images/livetrail.png" style="vertical-align:middle"/></a></div></div></body></html>';

        before(function(done){
            sinon
                .stub(request, 'get')
                .yields(null, null, html_full_page);
            return done();
        });

        after(function(done){
            request.get.restore();
            return done();
        });

        it('Get user runs from itra fake data', function (done) {
            var itra = new Itra('Richard', 'Couret', '?id=84500&nom=COURET#tab');
            itra.getRuns(function (err, result) {
                if(err) return done(err);
                assert.equal(result, '<tr><td colspan="8"><h2 style="margin:10px 0 2px 0">GENERAL</h2></td></tr><tr><th>Course</th><th>Pays</th><th>Annee</th><th>Distance</th><th>Clt.</th><th>Clt. Homme</th><th>Temps</th><th>Cote</th></tr><tr class="odd"><td>TEMPLIERS - MARATHON DES CAUSSES</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">143</td><td align="right">131 </td><td>04:31:10</td><td align="right">565</td></tr><tr><td>TRAIL DES HAUTS FORTS 43K</td><td>France</td><td>2014</td><td align="right">43km</td><td align="right">76</td><td align="right">65 </td><td>06:47:23</td><td align="right">514</td></tr><tr class="odd"><td>INTEGRALE DES CAUSSES</td><td>France</td><td>2014</td><td align="right">62km</td><td align="right">95</td><td align="right">87 </td><td>09:47:39</td><td align="right">504</td></tr><tr><td>ARAVISTRAIL - 52km</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">114</td><td align="right">100 </td><td>06:13:43</td><td align="right">493</td></tr><tr class="odd"><td>TRAIL DU GALIBIER</td><td>France</td><td>2013</td><td align="right">45km</td><td align="right">85</td><td align="right">77 </td><td>08:11:24</td><td align="right">490</td></tr><tr><td colspan="8"><h2 style="margin:10px 0 2px 0">Trail Ultra M (42 to 69 km)</h2></td></tr><tr><th>Course</th><th>Pays</th><th>Annee</th><th>Distance</th><th>Clt.</th><th>Clt. Homme</th><th>Temps</th><th>Cote</th></tr><tr class="odd"><td>TRAIL DES HAUTS FORTS 43K</td><td>France</td><td>2014</td><td align="right">43km</td><td align="right">76</td><td align="right">65 </td><td>06:47:23</td><td align="right">514</td></tr><tr><td>INTEGRALE DES CAUSSES</td><td>France</td><td>2014</td><td align="right">62km</td><td align="right">95</td><td align="right">87 </td><td>09:47:39</td><td align="right">504</td></tr><tr class="odd"><td>TRAIL DU GALIBIER</td><td>France</td><td>2013</td><td align="right">45km</td><td align="right">85</td><td align="right">77 </td><td>08:11:24</td><td align="right">490</td></tr><tr><td>TRAIL DE LA VALLEE DES LACS - TRAIL LONG</td><td>France</td><td>2014</td><td align="right">55km</td><td align="right">120</td><td align="right">112 </td><td>08:22:04</td><td align="right">485</td></tr><tr><td colspan="8"><h2 style="margin:10px 0 2px 0">Trail (<42km)< h2=\"\"></42km)<></h2></td></tr><tr><th>Course</th><th>Pays</th><th>Annee</th><th>Distance</th><th>Clt.</th><th>Clt. Homme</th><th>Temps</th><th>Cote</th></tr><tr class="odd"><td>TEMPLIERS - MARATHON DES CAUSSES</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">143</td><td align="right">131 </td><td>04:31:10</td><td align="right">565</td></tr><tr><td>ARAVISTRAIL - 52km</td><td>France</td><td>2013</td><td align="right">37km</td><td align="right">114</td><td align="right">100 </td><td>06:13:43</td><td align="right">493</td></tr><tr class="odd"><td>ALTISPEED</td><td>France</td><td>2012</td><td align="right">30km</td><td align="right">157</td><td align="right">136 </td><td>06:20:25</td><td align="right">424</td></tr>');
                return done();
            });
        });

        it('Get itra run information is not working', function (done) {
            var stubRequest = { get: function (url, callback) { return callback('Mock to fail', null, null); } };
            var Itra = proxyquire('../../server/objects/itra', {'request': stubRequest});
            var itra = new Itra('Richard', 'Couret', '?id=84500&nom=COURET#tab');
            itra.getRuns(function (err, result) {
                if (err) {
                    assert.equal(err, 'Mock to fail');
                    assert.isNull(result);
                    return done();
                }
                return done('should not work');
            });
        });
    });
});
