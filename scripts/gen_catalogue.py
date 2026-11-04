"""Génère src/data/catalogue.json pour Sewing Companion.

Chaque entrée : (id, nom, marque, epoque, periode, type, public, difficulte(1-5),
heures_min, heures_max, tissu_min_m, tissu_max_m, tissus_conseilles, description,
url, gratuit, source_metrage)

Métrages exprimés en mètres pour un tissu de 140-150 cm de laize.
source_metrage : "editeur" = repris de la fiche de l'éditeur, sinon "estimation".
Les temps sont toujours des estimations (couture machine, toile non comprise).
"""
import json, sys

RH = "https://reconstructinghistory.com/collections/medieval-patterns"
TV = "https://www.trulyvictorian.net"
LM = "https://www.laughingmoonmercantile.com"
SS = "https://www.sensibility.com"
AD = "https://www.americanduchess.com"
TT = "https://www.tudortailor.com"
BS = "https://www.blacksnailpatterns.com"
SC = "https://scrooppatterns.com"
FW = "https://www.folkwear.com/collections/all"
WH = "https://www.wearinghistory.clothing"
DS = "https://www.decadesofstyle.com"
PM = "https://peppermintmag.com/sewing-school/"
MOOD = "https://www.moodfabrics.com/blog/category/free-sewing-patterns"
CC = "https://closetcorepatterns.com"
GL = "https://grainlinestudio.com"
TB = "https://www.tillyandthebuttons.com"
TRB = "https://truebias.com"
HC = "https://helensclosetpatterns.com"
MN = "https://megannielsen.com"
FP = "https://fridaypatterncompany.com"
MM = "https://merchantandmills.com"
FM = "https://www.fibremood.com"
DD = "https://www.deer-and-doe.com"
MF = "https://www.maison-fauve.com/en/collections/patrons-de-couture"
IK = "https://ikatee.fr/en/collections/dresses-skirts-sewing-patterns"
SCA = "https://tissuandco.ch/en/brand/64-atelier-sc%C3%A4mmit"
JPR = "https://www.jpryan.com"
LS = "https://larkinandsmith.com"
KK = "https://www.kannikskorner.com"
SIMP = "https://simplicity.com"
PP = "https://www.amazondrygoods.com/products/women-of-medieval-romanesque-period.html"

E = "estimation"; ED = "editeur"

P = [
# ---------------- MODERNE ----------------
("dd-myosotis","Robe Myosotis","Deer & Doe","moderne","","robe","femme",3,8,12,2.6,3.2,"Chambray, viscose, double gaze, batiste","Robe-chemise ample à poches dans les coutures, jupe froncée ou à volants étagés, manches à volants en option. Marque française.","https://closetcorepatterns.com/products/myosotis-dress-pattern",False,E),
("dd-melilot","Chemise Mélilot","Deer & Doe","moderne","","haut","femme",4,8,12,1.6,2.0,"Popeline, chambray, viscose, lin léger","Chemise boutonnée semi-ajustée avec pinces poitrine, sans empiècement dos. Col arrondi ou col mao.","https://closetcorepatterns.com/products/melilot-shirt-pattern",False,E),
("dd-chardon","Jupe Chardon","Deer & Doe","moderne","","jupe","femme",2,4,6,1.3,1.8,"Sergé, gabardine, toile de coton, laine légère","Jupe taille haute à plis creux qui donnent beaucoup de volume. Passants de ceinture ou bande d'ourlet.",DD,False,E),
("dd-magnolia","Robe Magnolia","Deer & Doe","moderne","","robe","femme",3,8,12,2.5,3.5,"Crêpe, viscose, soie lavée","Robe cache-cœur à jupe fluide, longueur genou ou maxi, plusieurs longueurs de manches.",DD,False,E),
("dd-eucalyptus","Combinaison / robe Eucalyptus","Deer & Doe","moderne","","combinaison","femme",2,5,8,2.0,2.8,"Viscose, crêpe, lin léger","Combinaison ou robe à bretelles fines, coupe simple et fluide.",DD,False,E),
("mf-rafale","Coupe-vent Rafale","Maison Fauve","moderne","","veste","femme",4,14,22,2.0,2.6,"Toile déperlante, popeline technique, coton ciré","Coupe-vent à capuche doublée avec petite visière et cordon de serrage. Patron français et anglais.","https://tissuandco.ch/en/patterns/4217-windbreaker-rafale-maison-fauve.html",False,E),
("mf-scala","Chemise Scala","Maison Fauve","moderne","","haut","femme",4,9,14,1.8,2.2,"Popeline, viscose, lin","Chemise d'inspiration masculine à l'italienne, détails soignés.",MF,False,E),
("mf-mimosa","Blazer Mimosa","Maison Fauve","moderne","","veste","femme",5,20,35,1.8,2.4,"Laine, lin épais, crêpe de laine + doublure","Blazer élégant et structuré, pièce phare de la collection Fauve Romance. Tailleur avec doublure.",MF,False,E),
("rdc-marcelle","Veste Marcelle","République du Chiffon","moderne","","veste","femme",3,10,16,2.2,2.8,"Lainage, drap de laine, toile épaisse","Veste oversize à manches raglan, grand col tailleur et poches plaquées. Peut se faire en manteau.","https://tissuandco.ch/en/patterns/806-marcelle-jacket-republique-du-chiffon.html",False,E),
("sca-idylle","Blouse / robe Idylle","Atelier Scämmit","moderne","","robe","femme",1,4,7,1.5,2.5,"Viscose, coton léger, double gaze","Blouse ou robe facile, idéale pour débuter.",SCA,False,E),
("sca-tempo","Veste Tempo","Atelier Scämmit","moderne","","veste","femme",3,10,16,1.8,2.4,"Lainage, velours, toile de coton","Veste/manteau mi-saison de niveau intermédiaire.",SCA,False,E),
("ik-capri","Robe Capri (enfant)","Ikatee","moderne","","robe","enfant",2,3,5,0.8,1.4,"Coton, double gaze, lin","Robe tunique type kurta pour fille. Marque française pour enfants et adultes.",IK,False,E),
("cc-ginger","Jean Ginger","Closet Core Patterns","moderne","","pantalon","femme",4,12,20,1.6,2.0,"Denim stretch 2 % élasthanne","Jean ajusté (taille haute, basse ou mi-haute) avec surpiqûres, braguette zippée et poches rivetées. Le classique du jean fait main.","https://closetcorepatterns.com/products/ginger-mid-rise-jeans-pattern",False,E),
("cc-sasha","Pantalon Sasha","Closet Core Patterns","moderne","","pantalon","femme",4,10,16,1.6,2.0,"Gabardine stretch, sergé, laine","Pantalon droit tailleur avec poches passepoilées, braguette et ceinture montée.","https://closetcorepatterns.com/products/sasha-trousers-pattern",False,E),
("cc-cielo","Haut / robe Cielo","Closet Core Patterns","moderne","","robe","femme",2,4,7,1.3,2.4,"Lin, crêpe, viscose","Silhouette épaule tombante, haut ou robe, plusieurs options de col.",CC,False,E),
("cc-kalle","Chemise / robe Kalle","Closet Core Patterns","moderne","","haut","femme",3,7,11,1.8,2.8,"Popeline, lin, chambray","Chemise boxy ou robe-chemise, patte cachée et ourlet arrondi.",CC,False,E),
("cc-jenna","Chemise Jenna","Closet Core Patterns","moderne","","haut","femme",3,7,11,1.8,2.2,"Popeline, flanelle, lin","Chemise ample, réputée facile à ajuster.",CC,False,E),
("cc-pietra","Pantalon / short Pietra","Closet Core Patterns","moderne","","pantalon","femme",2,5,8,1.5,2.2,"Lin, sergé, toile","Pantalon à jambes larges avec ceinture élastique au dos et poches devant originales.",CC,False,E),
("cc-carolyn","Pyjama Carolyn","Closet Core Patterns","moderne","","ensemble","femme",3,10,14,3.5,4.5,"Popeline, voile de coton, flanelle","Pyjama classique veste à col cranté et pantalon, avec passepoils.",CC,False,E),
("gl-archer","Chemise Archer","Grainline Studio","moderne","","haut","femme",3,8,12,2.2,2.6,"Popeline, chambray, flanelle, lin","Chemise boutonnée décontractée à manches longues et poignets, le grand classique indé.",GL,False,E),
("gl-scout","Tee-shirt Scout","Grainline Studio","moderne","","haut","femme",1,2,3,1.0,1.4,"Tissus chaîne et trame légers : lin, viscose, coton","Tee-shirt boxy en tissu chaîne et trame : souvent recommandé comme premier haut.",GL,False,E),
("gl-alder","Robe-chemise Alder","Grainline Studio","moderne","","robe","femme",3,8,12,2.2,2.8,"Chambray, lin, popeline","Robe-chemise sans manches, avec ou sans volant froncé.","https://grainlinestudio.com/collections/alder",False,E),
("tb-indigo","Robe Indigo","Tilly and the Buttons","moderne","","robe","femme",1,3,5,1.8,2.4,"Coton, lin, viscose","Robe/blouse à enfiler sans fermeture, classée débutant. Instructions très illustrées.",TB,False,E),
("tb-rosa","Robe-chemise Rosa","Tilly and the Buttons","moderne","","robe","femme",3,8,12,2.2,2.8,"Chambray, denim léger, popeline","Robe-chemise ajustée avec empiècement western et découpes princesse.",TB,False,E),
("tb-mathilde","Blouse Mathilde","Tilly and the Buttons","moderne","","haut","femme",2,5,8,1.5,2.0,"Coton léger, viscose, batiste","Blouse à plis religieuse sur l'empiècement et boutons au dos.",TB,False,E),
("trb-ogden","Caraco Ogden","True Bias","moderne","","haut","femme",1,2,4,0.8,1.2,"Viscose, soie lavée, crêpe de chine","Caraco à bretelles fines et parementure, coupe simple pour débuter.",TRB,False,E),
("trb-southport","Robe Southport","True Bias","moderne","","robe","femme",2,5,8,2.0,2.8,"Lin, coton, viscose","Robe d'été à bretelles larges, boutonnée devant, jupe froncée.",TRB,False,E),
("hc-gilbert","Chemise Gilbert","Helen's Closet","moderne","","haut","femme",2,5,8,1.6,2.0,"Viscose, lin, rayonne","Chemise à col camp, manches courtes, coupe décontractée.",HC,False,E),
("mn-darling","Robe Darling Ranges","Megan Nielsen","moderne","","robe","femme",3,7,11,2.2,3.0,"Viscose, coton léger, crêpe","Robe-chemise à encolure V boutonnée, jupe fluide.",MN,False,E),
("fp-ilford","Veste Ilford","Friday Pattern Company","moderne","","veste","femme",3,8,12,1.8,2.4,"Sergé, denim, toile, velours côtelé","Veste modulaire simple mais graphique.",FP,False,E),
("mm-ellsworth","Chemise Ellsworth","Merchant & Mills","moderne","","haut","mixte",3,7,10,1.8,2.2,"Lin, coton, flanelle","Chemise oversize boxy avec demi-patte et dos rallongé.",MM,False,E),
("pm-everyday","Robe Everyday","Peppermint × In The Folds","moderne","","robe","femme",2,4,7,2.0,2.8,"Lin, coton, viscose","Robe facile à enfiler. Patron libre de prix (« payez ce que vous voulez »).","https://peppermintmag.com/sewing-school/everyday-dress/",True,E),
("pm-pocket-skirt","Jupe Pocket Skirt","Peppermint × Paper Theory","moderne","","jupe","femme",1,3,5,1.5,2.0,"Lin, coton, sergé léger","Jupe midi froncée à grandes poches plaquées. Libre de prix.","https://peppermintmag.com/sewing-school/pocket-skirt/",True,E),
("pm-robe-jacket","Veste kimono Robe Jacket","Peppermint × Common Stitch","moderne","","veste","mixte",2,4,6,2.0,2.6,"Lin, coton matelassé, viscose","Veste-peignoir mi-saison polyvalente. Libre de prix.","https://peppermintmag.com/sewing-school/robe-jacket/",True,E),
("pm-somerset","Robe Somerset Swing","Peppermint","moderne","","robe","femme",2,4,7,2.2,3.0,"Coton, lin, viscose","Robe trapèze qui tourne. Libre de prix.",PM,True,E),
("pm-wide-leg","Pantalon Wide-Leg","Peppermint × In The Folds","moderne","","pantalon","femme",3,6,9,2.0,2.6,"Lin, sergé, crêpe","Pantalon jambes larges, la coupe tendance. Libre de prix.",PM,True,E),
("pm-playsuit","Combishort Playsuit","Peppermint × In The Folds","moderne","","combinaison","femme",2,5,8,1.8,2.4,"Lin, coton épais","Combishort d'été confortable. Libre de prix.",PM,True,E),
("pm-jersey-dress","Robe en maille Jersey Dress","Peppermint × In The Folds","moderne","","robe","femme",3,5,8,1.8,2.4,"Maille ponte, jersey épais","Robe pull à encolure V devant et dos, pinces poitrine et zip invisible. Libre de prix.",PM,True,E),
("pm-rosalie","Jupe Rosalie","Peppermint","moderne","","jupe","femme",2,3,5,1.5,2.2,"Viscose, coton, lin","Jupe tournoyante. Libre de prix.",PM,True,E),
("pm-skye","Short Skye","Peppermint","moderne","","pantalon","femme",1,2,4,1.0,1.3,"Lin, coton, sergé léger","Short taille paperbag réglable avec poches. Libre de prix.",PM,True,E),
("pm-valley","Combinaison Valley","Peppermint","moderne","","combinaison","femme",3,6,9,2.4,3.0,"Lin, viscose, coton","Combinaison à taille élastiquée et boutons devant (pratique pour l'allaitement), avec poches. Libre de prix.",PM,True,E),
("pm-loungewear","Ensemble Loungewear","Peppermint × Common Stitch","moderne","","ensemble","femme",2,4,7,2.2,3.0,"Lin, viscose, coton doux","Ensemble détente haut + pantalon. Libre de prix.",PM,True,E),
("mood-fig","Robe Fig (MDF187)","Mood Fabrics","moderne","","robe","femme",3,6,9,2.3,2.8,"Sergé de coton bio, crêpe","Robe ajustée façon tailleur avec ceinture à boucle recouverte. Gratuit.",MOOD,True,E),
("mood-vixen","Robe nuisette Vixen","Mood Fabrics","moderne","","robe","femme",2,3,5,1.6,2.2,"Satin, charmeuse, crêpe de chine","Robe nuisette (slip dress) à bretelles. Gratuit.",MOOD,True,E),
("mood-memoir","Robe Memoir (Helen Castillo)","Mood Fabrics","moderne","","robe","femme",3,6,10,2.5,3.5,"Crêpe, popeline, taffetas","Robe en plusieurs versions créée avec Helen Castillo. Gratuit.",MOOD,True,E),
("mood-parker","Corset Parker","Mood Fabrics","moderne","","haut","femme",4,8,14,0.8,1.2,"Brocart, coutil, satin + baleines","Haut corseté moderne à baleines. Gratuit.",MOOD,True,E),
("mood-dorian","Robe Dorian","Mood Fabrics","moderne","","robe","femme",2,3,5,1.8,2.2,"Maille, jersey","Robe d'inspiration athleisure en maille. Gratuit.",MOOD,True,E),
("mood-bucket","Bob (bucket hat)","Mood Fabrics","moderne","","accessoire","mixte",1,1,2,0.4,0.5,"Toile, sergé, velours côtelé","Bob réversible, projet express. Gratuit.",MOOD,True,E),
("fm-giulia","Robe Giulia","Fibre Mood","moderne","","robe","femme",2,4,7,2.0,2.8,"Viscose, coton","Robe du magazine belge Fibre Mood.",FM,False,E),
("hk-tote","Sac cabas doublé","Tutoriel générique","moderne","","accessoire","mixte",1,2,3,0.6,1.0,"Toile épaisse, canvas, coton + doublure","Le sac cabas doublé à anses : le projet le plus rapide pour se lancer ou utiliser des chutes.","https://www.google.com/search?q=tutoriel+sac+cabas+doubl%C3%A9+couture+gratuit",True,E),
# ---------------- VINTAGE ----------------
("wh-smooth-sailing","Smooth Sailing (blouse + pantalon)","Wearing History","vintage","Années 1930","ensemble","femme",3,12,18,3.0,4.0,"Gabardine, sergé, rayonne, coton","Ensemble sportswear mi-1930s : blouse, pantalon large et short. Le best-seller de la marque.",WH,False,E),
("wh-1939-wrap","Robe portefeuille 1939","Wearing History","vintage","1939","robe","femme",3,8,12,2.8,3.4,"Rayonne, crêpe, coton imprimé","Robe portefeuille restaurée d'après un patron d'époque.",WH,False,E),
("wh-victory","Robe Victory 1939","Wearing History","vintage","1939-40","robe","femme",3,8,12,2.6,3.2,"Rayonne, crêpe, coton","Robe de jour fin des années 30 / début des années 40.",WH,False,E),
("wh-1916-suit","Tailleur 1916","Wearing History","edouardien","1916","ensemble","femme",5,40,60,4.0,5.0,"Laine, sergé de laine, doublure","Tailleur veste + jupe de la Première Guerre mondiale, idéal pour une tenue 1914-18.",WH,False,E),
("ds-3007","Robe boutonnée 1930s (#3007)","Decades of Style","vintage","Années 1930","robe","femme",3,10,14,2.8,3.4,"Crêpe de rayonne, coton","Robe boutonnée classique des années 30.",DS,False,E),
("ds-3011","Jupe Stardust 1930s (#3011)","Decades of Style","vintage","Années 1930","jupe","femme",3,5,8,1.6,2.2,"Crêpe, laine légère","Jupe élégante des années 30.",DS,False,E),
("ds-4013","Robe Dorothy Lara 1940s (#4013)","Decades of Style","vintage","Années 1940","robe","femme",3,10,14,2.6,3.2,"Rayonne, crêpe, coton","Robe des années 40.",DS,False,E),
("fw-249","Robe de jour 1930s (#249)","Folkwear","vintage","Années 1930","robe","femme",3,8,12,2.8,3.6,"Rayonne, crêpe, coton","Robe de jour des années 30, grande gamme de tailles.",FW,False,E),
("fw-235","Sporty Forties (#235)","Folkwear","vintage","Années 1940","ensemble","femme",3,10,16,3.0,4.0,"Gabardine, rayonne, coton","Ensemble sportswear des années 40.",FW,False,E),
("fw-247","Robe-chemise Lindy (#247)","Folkwear","vintage","Années 1940","robe","femme",3,10,14,2.8,3.4,"Coton, rayonne","Robe-chemise façon années 40 pour danser le lindy hop.",FW,False,E),
("fw-250","Pantalon Hollywood (#250)","Folkwear","vintage","Années 1930-40","pantalon","femme",3,6,10,2.2,2.8,"Gabardine, laine, crêpe épais","Pantalon large taille haute façon starlette d'Hollywood.",FW,False,E),
("ss-1950-shirtdress","Robe-chemise 1950s","Sense & Sensibility","vintage","Années 1950","robe","femme",3,10,14,3.0,4.0,"Coton, popeline, vichy","Robe-chemise classique des années 50 à jupe ample.",SS,False,E),
("simp-circle-50s","Jupe cercle années 50","Tutoriel générique","vintage","Années 1950","jupe","femme",1,2,4,1.5,3.0,"Coton, sergé, laine légère","Jupe cercle ou demi-cercle à tracer soi-même : rapide et très « pin-up ».","https://www.google.com/search?q=tutoriel+jupe+cercle+ann%C3%A9es+50",True,E),
# ---------------- EDOUARDIEN ----------------
("fw-205","Blouse Gibson Girl (#205)","Folkwear","edouardien","1900-1910","haut","femme",3,8,14,2.0,2.6,"Batiste, linon, mousseline, soie","Blouse ample à col montant de la « Gibson Girl », avec options d'entre-deux en dentelle.","https://www.folkwear.com/products/205-gibson-girl-blouse",False,E),
("fw-203","Dessous édouardiens (#203)","Folkwear","edouardien","1900-1910","dessous","femme",2,8,14,3.0,4.5,"Batiste, linon, coton fin + dentelle","Cache-corset, jupon et pantalon de lingerie, du XS au 3XL, avec explications de broderie et dentelle.",FW,False,E),
("fw-209","Jupe de promenade (#209)","Folkwear","edouardien","1900-1910","jupe","femme",3,6,10,2.8,3.6,"Laine, tweed, lin","Jupe longue de promenade à lés.",FW,False,E),
("fw-210","Blouse Armistice (#210)","Folkwear","edouardien","1918","haut","femme",3,6,10,1.8,2.4,"Coton, lin, soie","Blouse de la fin de la Grande Guerre.",FW,False,E),
("fw-227","Robe de mariée édouardienne (#227)","Folkwear","edouardien","1900-1910","robe","femme",4,25,40,5.0,7.0,"Soie, batiste, dentelle","Robe longue de mariée de style édouardien.",FW,False,E),
("bs-edw-blouse","Blouse édouardienne","Black Snail Patterns","edouardien","1900-1910","haut","femme",3,8,12,1.8,2.4,"Batiste, coton, soie","Blouse à empiècement, deux options de manches. PDF A4 et grand format.",BS,False,E),
("bs-fan-skirt","Jupe à éventail édouardienne","Black Snail Patterns","edouardien","1900-1910","jupe","femme",3,6,10,2.8,3.6,"Laine, lin, coton épais","Jupe longue de base avec un profond pli creux au dos.",BS,False,E),
("bs-bicycle","Jupe de bicyclette édouardienne","Black Snail Patterns","edouardien","1895-1905","jupe","femme",3,6,10,2.4,3.0,"Laine, tweed, sergé","Jupe mi-mollet pour faire du vélo, beaux détails.",BS,False,E),
("bs-trousers","Pantalon & guêtres édouardiens","Black Snail Patterns","edouardien","1900-1910","pantalon","femme",3,8,12,1.8,2.4,"Tweed, laine, velours côtelé","Pantalon bouffant façon bloomers et guêtres assorties.",BS,False,E),
("sc-ettie","Jupon Ettie","Scroop Patterns","edouardien","1900-1910","dessous","femme",3,8,14,3.0,4.0,"Batiste, coton fin, dentelle d'entre-deux","Jupon à volants et entre-deux en dentelle, existe aussi en version jupe moderne.",SC,False,E),
("sc-kilbirnie","Jupe Kilbirnie","Scroop Patterns","edouardien","1910s","jupe","femme",2,4,7,2.2,3.0,"Coton, lin, laine légère","Jupe froncée d'après une jupe ancienne des années 1910. Tailles 30-56.",SC,False,E),
("sc-seatoun","Jupe Seatoun","Scroop Patterns","edouardien","1915-1918","jupe","femme",3,6,10,2.4,3.2,"Laine, lin, coton","Jupe historiquement exacte 1915-18 (version moderne : jupe Tara).",SC,False,E),
("sc-fantail","Jupe Fantail (historique)","Scroop Patterns","edouardien","1895-1910","jupe","femme",3,8,12,3.0,3.8,"Laine, soie, lin","Jupe à cinq lés avec un éventail de plis au dos.",SC,False,E),
("sc-nina","Blouse Nina","Scroop Patterns","edouardien","1910s","haut","femme",3,8,12,1.6,2.2,"Batiste, soie, coton","Blouse avec guide d'ajustement et notes sur les techniques d'époque.",SC,False,E),
("ss-titanic","Robe de thé Titanic","Sense & Sensibility","edouardien","1912","robe","femme",4,20,30,4.0,5.5,"Soie, mousseline, batiste","Robe de thé du début des années 1910, souvent utilisée pour des robes de mariée.",SS,False,E),
# ---------------- VICTORIEN ----------------
("tv-442","Corsage de bal 1860s (TV442)","Truly Victorian","victorien","1860s","haut","femme",4,15,25,1.2,1.8,"Taffetas de soie, coutil pour la doublure","Corsage de robe de bal à décolleté pour l'époque Second Empire / crinoline.",TV,False,E),
("tv-462","Corsage à basque 1883 (TV462)","Truly Victorian","victorien","1883","haut","femme",4,18,30,1.6,2.2,"Laine, soie, coutil","Corsage à queue de l'époque tournure.",TV,False,E),
("tv-490","Corsage de bal 1892 (TV490)","Truly Victorian","victorien","1892","haut","femme",4,15,25,1.2,1.8,"Satin, taffetas, velours","Corsage de bal fin de siècle.",TV,False,E),
("tv-410","Polonaise 1873 (TV410)","Truly Victorian","victorien","1873","robe","femme",4,20,35,4.5,6.0,"Coton imprimé, soie, laine légère","Polonaise drapée de la première tournure.",TV,False,E),
("tv-263","Jupe Imperial 1887 (TV263)","Truly Victorian","victorien","1887","jupe","femme",4,12,20,4.0,5.5,"Laine, soie, velours","Jupe de tournure avec plis « bournous » au dos.",TV,False,E),
("tv-261","Jupon quatre lés 1885 (TV261)","Truly Victorian","victorien","1885","jupe","femme",3,8,14,3.5,4.5,"Coton, laine, soie","Sous-jupe plate au dos (sous une surjupe) ou bouffante. Taille jusqu'à 117 cm.",TV,False,E),
("tv-368","Surjupe cascade 1887 (TV368)","Truly Victorian","victorien","1887","jupe","femme",4,12,20,3.0,4.0,"Soie, laine, taffetas","Surjupe drapée en cascade, tournure tardive 1883-1889.",TV,False,E),
("tv-460","Corsage cuirasse 1885 (TV460)","Truly Victorian","victorien","1885","haut","femme",4,18,30,1.6,2.2,"Laine, soie, coutil","Corsage cuirasse à col montant (jour) ou décolleté carré (soir).",TV,False,E),
("tv-400","Corsage de jour 1871 (TV400)","Truly Victorian","victorien","1871","haut","femme",4,15,25,1.6,2.2,"Coton, laine, soie","Corsage de jour de la première tournure.",TV,False,E),
("tv-280","Jupon de cancan (TV280)","Truly Victorian","victorien","1890s","jupe","femme",2,8,14,4.0,7.0,"Coton, volants en organza","Jupon à volants façon French cancan.",TV,False,E),
("tv-494","Chemisiers 1894 (TV494)","Truly Victorian","victorien","1894","haut","femme",3,8,12,2.0,2.6,"Coton, lin, soie","Chemisier fin de siècle à manches gigot.",TV,False,E),
("tv-299","Jupe culotte 1901 (TV299)","Truly Victorian","edouardien","1901","jupe","femme",3,8,12,2.6,3.4,"Laine, sergé, lin","Jupe-culotte boutonnée, longueur cheville ou mollet.",TV,False,E),
("tv-550","Chapeau (TV550)","Truly Victorian","victorien","1880s","accessoire","femme",3,6,10,0.4,0.6,"Velours, bougran, fil de laiton","Chapeau d'époque tournure.",TV,False,E),
("lm-100","Dessous victoriens 1840-1900 (#100)","Laughing Moon Mercantile","victorien","1840-1900","dessous","femme",3,10,20,3.5,5.0,"Batiste, linon, coton fin","Chemise, pantalon et cache-corset victoriens, tailles 6 à 40.",LM,False,E),
("lm-112","Crinolines et tournures (#112)","Laughing Moon Mercantile","victorien","1850-1890","dessous","femme",3,8,14,1.5,3.0,"Coutil, coton épais + feuillard","Six choix de crinolines et tournures avec calques de tailles.",LM,False,E),
("lm-101","Jupe de promenade victorienne (#101)","Laughing Moon Mercantile","victorien","1890s","jupe","femme",3,6,10,2.8,3.6,"Laine, tweed, lin","Jupe de promenade avec poche, trois longueurs.",LM,False,E),
("lm-150","Jupe fendue pour vélo / cheval (#150)","Laughing Moon Mercantile","victorien","1890s","jupe","femme",3,8,12,2.6,3.4,"Laine, sergé","Jupe-culotte victorienne avec panneau amovible.",LM,False,E),
("lm-140","Robe de thé à découpes princesse (#140)","Laughing Moon Mercantile","victorien","1870-1880","robe","femme",4,20,35,5.0,6.5,"Soie, laine légère, coton imprimé","Robe d'intérieur à découpes princesse des années 1870-80.",LM,False,E),
("lm-bodice-1890","Corsage « Waist » 1890s","Laughing Moon Mercantile","victorien","1890s","haut","femme",3,6,10,1.8,2.4,"Voile, coton, soie","Quatre corsages et cinq manches. L'éditeur annonce environ 6 h de couture pour la version A.","https://www.farthingalescorsetmakingsupplies.com/blogs/tips-tricks/information-for-laughing-moon-victorian-bodice",False,ED),
("lm-114","Robe romantique 1840s (#114)","Laughing Moon Mercantile","victorien","1840s","robe","femme",4,30,50,6.0,8.0,"Coton imprimé, soie, laine","Robe de l'époque romantique / début victorien.",LM,False,E),
("bs-1895-jacket","Veste 1895","Black Snail Patterns","victorien","1895","veste","femme",5,25,40,2.2,2.8,"Laine, tweed + doublure","Veste tailleur emblématique à manches gigot.",BS,False,E),
("bs-1890-vest","Gilets 1890s","Black Snail Patterns","victorien","1890s","veste","homme",4,10,16,0.8,1.2,"Laine, soie, coton + doublure","Gilets avec options de col et explications de tailleur.",BS,False,E),
("ss-romantic","Robe époque romantique","Sense & Sensibility","victorien","1830s","robe","femme",4,20,35,5.0,6.5,"Coton imprimé, soie","Robe des années 1830 à manches bouffantes.",SS,False,E),
# ---------------- RÉGENCE ----------------
("ss-elc","Elegant Lady's Closet","Sense & Sensibility","regence","1800-1820","robe","femme",3,12,20,3.0,4.0,"Mousseline de coton, batiste, soie","Robe à coulisse ou croisée, manches variées, motifs de broderie et deux réticules en bonus.","https://sensibility.com/shop/elegant-ladys-closet-epattern",False,E),
("ss-regency-gown","Regency Gown","Sense & Sensibility","regence","1810s","robe","femme",3,12,20,3.0,4.0,"Mousseline, batiste, soie","Le patron de robe Régence originel de la marque, style milieu de période.",SS,False,E),
("ss-spencer","Spencer & pelisse Régence","Sense & Sensibility","regence","1800-1820","veste","femme",4,14,24,1.2,4.0,"Laine fine, soie, velours + doublure","Veste courte (spencer) ou long manteau (pelisse).",SS,False,E),
("lm-126","Robe Régence ronde ou à traîne (#126)","Laughing Moon Mercantile","regence","1795-1820","robe","femme",3,12,20,3.0,4.5,"Mousseline, batiste, soie","Robe à devant à pont haut, version ronde ou à traîne, tailles 6 à 34.",LM,False,E),
("lm-121","Habit Régence homme (#121)","Laughing Moon Mercantile","regence","1800-1820","veste","homme",5,40,60,2.2,2.8,"Drap de laine + doublure","Habit à queue avec cinq options de col et revers.",LM,False,E),
("lm-135","Cape Georgienne / Régence (#135)","Laughing Moon Mercantile","regence","1780-1820","veste","femme",2,6,10,2.5,4.0,"Drap de laine, laine bouillie","Cape en deux longueurs et deux styles.",LM,False,E),
("lm-203","Chemisettes (#203)","Laughing Moon Mercantile","regence","1800-1840","accessoire","femme",2,3,5,0.5,0.8,"Batiste, linon","Quatre chemisettes (faux cols) à porter sous une robe décolletée.",LM,False,E),
("ad-regency","Robe Régence (Simplicity S8941)","American Duchess × Simplicity","regence","1800-1820","robe","femme",3,12,20,3.0,4.0,"Mousseline, batiste, soie","Robe et robe de dessus Régence. Patron papier Simplicity.",SIMP,False,E),
("kk-regency","Patrons Kannik's Korner 1730-1820","Kannik's Korner","regence","1730-1820","ensemble","mixte",4,20,40,3.0,5.0,"Lin, coton, laine","Patrons très documentés de vêtements de travail et de dessous 1730-1820.",KK,False,E),
# ---------------- XVIIIe ----------------
("ad-8578","Robe à la française (Simplicity 8578)","American Duchess × Simplicity","xviiie","1750-1780","robe","femme",5,60,100,7.0,9.0,"Taffetas de soie, lin pour la doublure","Robe sacque à plis Watteau avec jupon, à porter sur paniers (S8579). Instructions machine ou à la main via le livre American Duchess.","https://www.americanduchess.com/products/simplicity-pattern-8578-18th-century-robe-a-la-francaise",False,E),
("ad-8579","Paniers, chemise et corps (Simplicity 8579)","American Duchess × Simplicity","xviiie","1750-1780","dessous","femme",4,30,50,3.5,5.0,"Lin, coutil, toile + baleines","Dessous historiquement exacts : chemise, corps baleiné et paniers.",AD,False,E),
("ad-8162","Chemise, corps et faux-cul (Simplicity 8162)","American Duchess × Simplicity","xviiie","1740-1790","dessous","femme",4,30,50,3.0,4.5,"Lin léger (chemise), coutil / toile / sergé (corps)","Base pour la robe 8161 ou la robe à l'anglaise du livre American Duchess.","https://americanduchess.com/products/simplicity-pattern-8162-18th-century-underpinnings",False,E),
("ad-8161","Robe, jupon et pièce d'estomac (Simplicity 8161)","American Duchess × Simplicity","xviiie","1740-1790","robe","femme",4,30,50,6.0,8.0,"Lin, coton imprimé, soie, laine","Robe d'inspiration XVIIIe (style « Outlander ») avec jupon et pièce d'estomac.",AD,False,E),
("ad-8411","Robe de cour (Simplicity 8411)","American Duchess × Simplicity","xviiie","1760-1780","robe","femme",5,60,100,8.0,11.0,"Soie, taffetas, brocart","Robe de cour à corsage entièrement baleiné et très grands paniers.",AD,False,E),
("jpr-jacket","Caraco / jacket XVIIIe","J.P. Ryan","xviiie","1760-1790","haut","femme",4,15,25,1.5,2.0,"Lin, coton imprimé, laine","Patrons XVIIIe réputés pour l'exactitude historique.",JPR,False,E),
("ls-shirt","Chemise d'homme XVIIIe","Larkin & Smith","xviiie","1750-1800","haut","homme",3,10,20,2.5,3.0,"Lin","Chemise d'homme taillée en rectangles, coutures à la main possibles.",LS,False,E),
("hist-pocket","Poches à nouer XVIIIe","Tutoriel générique","xviiie","1700-1800","accessoire","femme",1,2,4,0.4,0.6,"Lin, coton, chutes brodées","Poches indépendantes portées sous la jupe : projet parfait pour les chutes.","https://www.google.com/search?q=18th+century+tie+on+pocket+pattern+free",True,E),
# ---------------- RENAISSANCE ----------------
("rh601","Robe & kirtle Tudor 1520-1540 (RH601)","Reconstructing History","renaissance","1520-1540","robe","femme",5,40,70,6.0,8.0,"Laine, soie, velours, lin pour la doublure","Robe noble d'Henri VIII avec kirtle de maintien, d'après The Tudor Tailor.",RH,False,E),
("rh603","Tenue de femme du peuple Tudor (RH603)","Reconstructing History","renaissance","1500-1550","ensemble","femme",3,25,40,4.1,5.0,"Laine pour le kirtle, lin léger pour chemise, coiffe, tablier","Kirtle laçé devant ou dos, chemise, coiffe, tablier et deux partlets. Kirtle : 4½ yd en 60\".","https://reconstructinghistory.com/products/rh603-early-tudor-commonwomans-outfit",False,ED),
("rh604","Tenue de noble Tudor (RH604)","Reconstructing History","renaissance","1520-1550","veste","homme",5,40,70,5.0,7.0,"Laine, velours, soie","Robe et pourpoint (jerkin) de gentilhomme Tudor.",RH,False,E),
("rh607","Robe & kirtle mi-Tudor 1550s (RH607)","Reconstructing History","renaissance","1550s","robe","femme",5,40,70,6.0,8.0,"Laine, soie, velours","Robe de dessus, kirtle de maintien et partlet à col montant, époque Édouard VI / Marie Ire.","https://reconstructinghistory.com/products/rh607-mid-tudor-1550s-ladys-gown-kirtle",False,E),
("tt-kirtle","Kirtles & jupons Tudor","The Tudor Tailor","renaissance","1500-1600","robe","femme",4,20,40,3.5,5.0,"Laine, lin pour la doublure","Jupons et kirtles avec ou sans manches, idéals pour une tenue XVIe.","https://burnleyandtrowbridge.com/products/the-tudor-tailor-womens-tudor-kirtles-and-petticoats",False,E),
("tt-henrician","Robe de dame henricienne","The Tudor Tailor","renaissance","1525-1550","robe","femme",5,50,80,6.0,8.0,"Laine, velours, soie, fourrure","Robe de dame de la cour d'Henri VIII, exclusivité Tudor Tailor.",TT,False,E),
("tt-french-kirtle","Kirtle français et avant-manches","The Tudor Tailor","renaissance","1530-1550","robe","femme",5,35,60,4.0,5.5,"Soie, damas, laine fine","Kirtle de cour et avant-manches décoratives.",TT,False,E),
("tt-elizabethan","Robe anglaise élisabéthaine ajustée","The Tudor Tailor","renaissance","1560-1590","robe","femme",5,50,80,6.0,8.0,"Laine, soie, velours","Robe ajustée élisabéthaine avec variantes.",TT,False,E),
("tt-late-eliz","Robe élisabéthaine tardive","The Tudor Tailor","renaissance","1590-1610","robe","femme",5,50,90,6.5,9.0,"Soie, brocart, velours","Robe de la fin du règne d'Élisabeth Ire avec variantes.",TT,False,E),
("tt-farthingale","Vertugadin espagnol + bourrelet","The Tudor Tailor","renaissance","1500-1600","dessous","femme",3,8,14,3.0,4.0,"Toile de lin, coton + jonc ou feuillard","Vertugadin espagnol en cloche et son bourrelet.",TT,False,E),
("tt-bodies","Corps à baleines Tudor / élisabéthain","The Tudor Tailor","renaissance","1550-1620","dessous","femme",4,20,35,1.0,1.5,"Coutil, lin épais + baleines","Corps (corset) de la Renaissance anglaise.",TT,False,E),
("tt-gable","Coiffe à pignon (gable hood)","The Tudor Tailor","renaissance","1500-1540","accessoire","femme",4,8,14,0.5,0.8,"Velours, bougran, lin","Coiffe anglaise en pignon (gable / kennel hood) et frontlet.",TT,False,E),
("ren-chemise","Chemise Renaissance","Tutoriel générique","renaissance","1500-1600","dessous","mixte",2,5,10,2.5,3.5,"Lin léger","Chemise en rectangles et goussets, base de toute tenue XVIe.","https://www.google.com/search?q=renaissance+chemise+pattern+free+rectangle",True,E),
# ---------------- MÉDIÉVAL ----------------
("rh017","Kirtle / cotte-hardie XIVe (RH017)","Reconstructing History","medieval","1340-1400","robe","femme",3,20,35,3.2,3.6,"Laine légère à drap, lin ou soie pour la doublure","Cotte-hardie ajustée à manches longues boutonnées ou lacées, avec ou sans tippets. Variantes d'Europe du Nord et italienne. 3½ yd en 60\".","https://reconstructinghistory.com/products/rh017-14th-century-womens-kirtle-or-cotehardie-or-medieval-dress",False,ED),
("rh002","Kirtle & manches XVe (RH002)","Reconstructing History","medieval","1400-1500","robe","femme",3,20,35,3.5,4.5,"Laine, lin pour la doublure","Kirtle du XVe siècle avec manches séparées.","https://reconstructinghistory.com/products/rh002-15th-century-womens-kirtle-sleeves",False,E),
("rh022","Cotte-hardie d'homme XIVe (RH022)","Reconstructing History","medieval","1340-1380","veste","homme",4,20,35,2.5,3.2,"Laine, doublure lin","Cotte-hardie masculine boutonnée.",RH,False,E),
("rh021","Pourpoint « grande assiette » XIVe (RH021)","Reconstructing History","medieval","1350-1400","veste","homme",5,30,50,2.0,2.8,"Laine, lin, coton de rembourrage","Pourpoint (jupon) masculin du XIVe à emmanchures grande assiette.",RH,False,E),
("rh003","Pourpoint & chausses XVe (RH003)","Reconstructing History","medieval","1400-1500","ensemble","homme",5,30,50,3.0,4.0,"Laine, lin","Pourpoint et chausses masculins du XVe siècle.",RH,False,E),
("rh006","Gambison bourguignon XVe (RH006)","Reconstructing History","medieval","1450-1500","veste","homme",5,30,60,3.0,5.0,"Lin, coton, laine + rembourrage","Arming coat / jaque rembourrée du XVe.",RH,False,E),
("rh313","Robe de Moy (RH313)","Reconstructing History","medieval","XIVe-XVe","robe","femme",4,25,40,4.0,5.5,"Laine","Kirtle médiéval irlandais d'après la robe retrouvée dans une tourbière de Moy.",RH,False,E),
("rh435","Choli médiéval indien & saris (RH435)","Reconstructing History","monde","Médiéval","haut","femme",2,4,8,0.9,1.4,"Coton, soie","Choli d'après l'art indien ancien et quatre drapés de sari médiévaux. 1½ yd en 45\".",RH,False,ED),
("pp-romanesque","Dame romane XIe-XIIe (chainse, cotte, bliaut)","Amazon Drygoods","medieval","1060-1150","ensemble","femme",4,30,50,8.0,10.0,"Lin (chainse), laine fine ou soie (bliaut)","Chainse, cotte et bliaut en deux longueurs avec trois manches, plus mantel, guimpe et voiles. Bliaut 1150 : 5 yd en 60\".",PP,False,ED),
("free-bliaut","Bliaut XIIe (tutoriel gratuit)","Tutoriel SCA","medieval","XIIe","robe","femme",4,20,35,4.0,5.5,"Lin, laine fine, soie","Patron de bliaut aux manches tombantes, établi d'après les sculptures romanes.","https://eg.bucknell.edu/~lwittie/sca/garb/bliaut.html",True,E),
("med-tunic","Tunique médiévale simple","Tutoriel générique","medieval","XIe-XIVe","haut","mixte",1,4,8,2.0,3.0,"Lin, laine","Tunique en T à goussets et godets, la base pour débuter en médiéval.","https://www.google.com/search?q=medieval+tunic+pattern+free+gores",True,E),
("med-cloak","Mantel / cape circulaire","Tutoriel générique","medieval","Médiéval","veste","mixte",1,3,6,3.0,4.5,"Laine bouillie, drap de laine","Cape demi-cercle ou cercle complet à fermer d'une fibule.","https://www.google.com/search?q=medieval+half+circle+cloak+tutorial",True,E),
("med-hood","Chaperon médiéval","Tutoriel générique","medieval","XIVe","accessoire","mixte",2,3,6,0.7,1.0,"Laine, doublure lin","Capuche à pèlerine et longue cornette.","https://www.google.com/search?q=medieval+hood+chaperon+pattern",True,E),
("rh020","Accessoires féminins XIVe (RH020)","Reconstructing History","medieval","XIVe","accessoire","femme",2,4,10,0.5,1.0,"Lin, laine","Coiffures et accessoires pour compléter la cotte-hardie RH017.",RH,False,E),
# ---------------- VIKING / HAUT MOYEN ÂGE ----------------
("free-apron-dress","Robe-tablier viking (hangerok)","Tutoriel SCA","viking","IXe-XIe","robe","femme",1,6,12,2.0,3.0,"Laine, lin","Robe-tablier tenue par des fibules ovales, à adapter à ses mesures : la tenue idéale pour débuter.","https://sites.google.com/westkingdom.org/baronyofrivenoak/events-and-activities/viking-apron-dress-tutorial",True,E),
("viking-underdress","Robe de dessous viking","Tutoriel générique","viking","IXe-XIe","robe","femme",2,6,12,2.5,3.5,"Lin","Sous-robe en lin à goussets, à porter sous la robe-tablier.","https://www.google.com/search?q=viking+underdress+pattern+free",True,E),
("rh010","Tunique de Kragelund (RH010)","Reconstructing History","viking","Haut Moyen Âge","haut","homme",3,10,18,2.2,3.0,"Laine","Tunique « Dark Ages » d'après la tunique archéologique de Kragelund.",RH,False,E),
("rh015","Tunique du Groenland type 2 (RH015)","Reconstructing History","medieval","XIVe","haut","mixte",3,10,18,2.5,3.5,"Laine","Tunique d'après les trouvailles d'Herjolfsnes au Groenland.",RH,False,E),
# ---------------- MONDE ----------------
("fw-113","Kimono / yukata (#113)","Folkwear","monde","Japon","robe","mixte",2,8,14,4.0,5.0,"Coton, lin, soie","Kimono informel non doublé (yukata), instructions de pliage et de nouage traditionnels.",FW,False,E),
("fw-112","Vêtements de travail japonais (#112)","Folkwear","monde","Japon","ensemble","mixte",2,8,14,3.5,4.5,"Coton, lin, indigo","Veste et pantalon de travail japonais.",FW,False,E),
("fw-122","Cheongsam de Hong Kong (#122)","Folkwear","monde","Chine, XXe","robe","femme",4,12,20,2.2,2.8,"Brocart, soie, satin","Robe chinoise ajustée à col mao et fente.",FW,False,E),
("fw-141","Hanbok coréen (#141)","Folkwear","monde","Corée","ensemble","femme",3,12,20,4.0,6.0,"Soie, organza, coton","Veste courte et jupe ample traditionnelles coréennes.",FW,False,E),
("fw-161","Pantalon de pêcheur thaï (#161)","Folkwear","monde","Thaïlande","pantalon","mixte",1,2,4,1.8,2.4,"Coton, lin, rayonne","Pantalon portefeuille très ample noué à la taille. Projet express.",FW,False,E),
("fw-152","Kilt écossais (#152)","Folkwear","monde","Écosse","jupe","homme",4,15,25,3.5,7.0,"Tartan de laine","Kilt plissé traditionnel.",FW,False,E),
("fw-157","Djellaba marocaine (#157)","Folkwear","monde","Maroc","robe","mixte",2,6,10,3.0,4.0,"Laine fine, coton, lin","Djellaba à capuche.",FW,False,E),
("fw-142","Robe du vieux Mexique (#142)","Folkwear","monde","Mexique","robe","femme",2,6,10,3.0,4.0,"Coton, lin","Robe traditionnelle mexicaine à broder.",FW,False,E),
]

KEYS = ["id","nom","marque","epoque","periode","type","public","difficulte","heuresMin","heuresMax","tissuMin","tissuMax","tissus","description","url","gratuit","sourceMetrage"]

out = []
ids = set()
for row in P:
    assert len(row) == len(KEYS), row[0]
    d = dict(zip(KEYS, row))
    assert d["id"] not in ids, d["id"]; ids.add(d["id"])
    assert 1 <= d["difficulte"] <= 5
    assert d["heuresMin"] <= d["heuresMax"] and d["tissuMin"] <= d["tissuMax"], d["id"]
    if not d["periode"]: del d["periode"]
    out.append(d)

json.dump({"version": 1, "misAJour": "2026-11-04T11:40", "patrons": out}, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
print(len(out), "patrons")
