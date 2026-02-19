-- Seed script: Insert ~155+ books into the books table
-- Excludes: Derviš i smrt, Mali princ, Na Drini ćuprija, Priče iz davnine,
--           Vlak u snijegu, Ježeva kućica, Bajke bosanskog lonca, Hasanaginica,
--           Priča o sretnim medvjedima, Prokleta avlija, Tvrđava

INSERT INTO books (title, author, description, cover_image, content, age_group, genre, reading_difficulty, page_count, isbn, publisher, publication_year, language, recommended_for_grades)
VALUES
('1984', 'George Orwell', 'Dystopijski roman koji prikazuje totalitarno društvo u kojem Veliki Brat nadgleda svaki aspekt života. Winston Smith pokušava pronaći istinu i slobodu u svijetu laži i kontrole.', 'https://placehold.co/400x600/FF861C/white?text=1984', '', 'A', 'beletristika', 'tesko', 328, '9780451524935', 'Buybook', 1949, 'bosanski', '{"9","10","11","12"}'),

('20.000 milja pod morem', 'Jules Verne', 'Kapetan Nemo vodi profesora Aronnasa i njegove saputnike na nezaboravno putovanje podmornicom Nautilus kroz dubine okeana. Klasična avantura puna naučnih otkrića i podmorskih čuda.', 'https://placehold.co/400x600/FF861C/white?text=20.000+milja+pod+morem', '', 'D', 'avantura_fantasy', 'srednje', 320, '9789958301056', 'Školska knjiga', 1870, 'bosanski', '{"6","7","8"}'),

('Afrička djetinjstva', 'Grupa autora', 'Zbirka priča o odrastanju u Africi koja čitaocima otkriva raznolikost kultura i iskustava mladih ljudi na afričkom kontinentu. Topla i poučna knjiga o djetinjstvu u različitim afričkim zemljama.', 'https://placehold.co/400x600/FF861C/white?text=Afri%C4%8Dka+djetinjstva', '', 'D', 'realisticni_roman', 'srednje', 180, NULL, 'Školska knjiga', 2005, 'bosanski', '{"5","6","7"}'),

('Apsolutno istinit dnevnik jednog Indijanca s pola radnog vremena', 'Sherman Alexie', 'Humorističan i dirljiv roman o mladom Indijancu Junioru koji napušta rezervat da bi pohađao školu u obližnjem gradu. Priča o identitetu, prijateljstvu i hrabrosti da budeš drugačiji.', 'https://placehold.co/400x600/FF861C/white?text=Apsolutno+istinit+dnevnik', '', 'O', 'realisticni_roman', 'srednje', 230, '9780316013680', 'Algoritam', 2007, 'bosanski', '{"8","9","10"}'),

('Artemis Fowl', 'Eoin Colfer', 'Dvanaestogodišnji kriminalni genije Artemis Fowl otkriva podzemni svijet vila i planira otmicu kako bi obnovio porodično bogatstvo. Uzbudljiva mješavina fantazije, tehnologije i humora.', 'https://placehold.co/400x600/FF861C/white?text=Artemis+Fowl', '', 'D', 'avantura_fantasy', 'srednje', 280, '9780141321318', 'Algoritam', 2001, 'bosanski', '{"5","6","7","8"}'),

('Besmrtnici', 'Alyson Noel', 'Ever Bloom nakon tragične nesreće dobiva natprirodne sposobnosti i upoznaje tajanstvenog Damena Augusta. Romantična priča o besmrtnosti, ljubavi i sudbini isprepletena s elementima fantazije.', 'https://placehold.co/400x600/FF861C/white?text=Besmrtnici', '', 'O', 'avantura_fantasy', 'srednje', 320, '9780312532758', 'Znanje', 2009, 'bosanski', '{"8","9","10"}'),

('Bijeli jelen', 'Vladimir Nazor', 'Poetična priča o bijelom jelenu koji simbolizira slobodu i ljepotu hrvatske prirode. Nazorovo djelo prepuno je mitskih motiva i ljubavi prema domovini i njenim legendama.', 'https://placehold.co/400x600/FF861C/white?text=Bijeli+jelen', '', 'D', 'lektira', 'srednje', 80, NULL, 'Školska knjiga', 1927, 'bosanski', '{"5","6","7"}'),

('Bijeli očnjak', 'Jack London', 'Priča o divljem vuku-psu koji odrasta u surovoj divljini Yukona i postepeno se prilagođava životu s ljudima. Snažan roman o borbi za opstanak, lojalnosti i snazi prirode.', 'https://placehold.co/400x600/FF861C/white?text=Bijeli+o%C4%8Dnjak', '', 'D', 'avantura_fantasy', 'srednje', 256, '9789533131245', 'Školska knjiga', 1906, 'bosanski', '{"6","7","8"}'),

('Bilješke jedne gimnazijalke', 'Nadežda Milenković', 'Dnevnički zapisi jedne tinejdžerke koja se suočava s izazovima odrastanja, školskim obavezama i prvim ljubavnim iskustvima. Autentičan prikaz života mladih u bivšoj Jugoslaviji.', 'https://placehold.co/400x600/FF861C/white?text=Bilje%C5%A1ke+jedne+gimnazijalke', '', 'O', 'realisticni_roman', 'srednje', 200, NULL, 'Veselin Masleša', 1980, 'bosanski', '{"8","9","10"}'),

('Blizanke', 'Erich Kästner', 'Dvije djevojčice koje ne znaju jedna za drugu slučajno se sretnu u ljetnom kampu i otkriju da su blizanke razdvojene po rođenju. Zabavna i topla priča o porodici, lukavstvu i ljubavi.', 'https://placehold.co/400x600/FF861C/white?text=Blizanke', '', 'D', 'realisticni_roman', 'lako', 176, '9789533046112', 'Školska knjiga', 1949, 'bosanski', '{"4","5","6"}'),

('Bosonogi i nebo', 'Branislav Crnčević', 'Poetična priča o dječaku koji sanja o zvijezdama i nebu dok odrasta u skromnim uslovima. Roman ispunjen dječjom maštom i čežnjom za ljepšim životom.', 'https://placehold.co/400x600/FF861C/white?text=Bosonogi+i+nebo', '', 'D', 'lektira', 'srednje', 120, NULL, 'Školska knjiga', 1956, 'bosanski', '{"4","5","6"}'),

('Božićna priča', 'Charles Dickens', 'Škrti Ebenezer Scrooge dobiva posjetu triju duhova na Badnju noć koji mu pokazuju prošlost, sadašnjost i budućnost. Klasična priča o transformaciji, darežljivosti i istinskom značenju Božića.', 'https://placehold.co/400x600/FF861C/white?text=Bo%C5%BEi%C4%87na+pri%C4%8Da', '', 'D', 'bajke_basne', 'lako', 96, '9789533131252', 'Školska knjiga', 1843, 'bosanski', '{"4","5","6","7"}'),

('Braća Lavlje Srce', 'Astrid Lindgren', 'Dirljiva priča o dva brata, Jonatanu i Sukvisu, koji se nakon smrti nalaze u zemlji Nangijali gdje ih čekaju nove avanture. Priča o hrabrosti, bratskoj ljubavi i borbi protiv zla.', 'https://placehold.co/400x600/FF861C/white?text=Bra%C4%87a+Lavlje+Srce', '', 'D', 'avantura_fantasy', 'srednje', 180, '9789533131269', 'Školska knjiga', 1973, 'bosanski', '{"4","5","6","7"}'),

('Bratstvo crnog bodeža', 'J. R. Ward', 'Mračni paranormalni roman o grupi vampirskih ratnika koji štite svoju vrstu od neprijatelja. Ispunjen akcijom, romantikom i nadprirodnim elementima u modernom urbanom okruženju.', 'https://placehold.co/400x600/FF861C/white?text=Bratstvo+crnog+bode%C5%BEa', '', 'A', 'avantura_fantasy', 'srednje', 416, '9780451216953', 'Algoritam', 2005, 'bosanski', '{"11","12"}'),

('Britt-Marie je bila ovdje', 'Fredrik Backman', 'Britt-Marie, žena u šezdesetim, napušta muža i pronalazi novi smisao života u malom gradu gdje postaje trenerica dječjeg fudbalskog tima. Topla i humoristična priča o drugoj šansi.', 'https://placehold.co/400x600/FF861C/white?text=Britt-Marie+je+bila+ovdje', '', 'A', 'beletristika', 'srednje', 324, '9781501142536', 'Buybook', 2016, 'bosanski', '{"10","11","12"}'),

('Bum i Tras', 'Antoine Bello', 'Zabavna i maštovita priča o dva neobična lika koji doživljavaju niz komičnih nezgoda i pustolovina. Knjiga puna humora i iznenađujućih obrata idealna za mlade čitaoce.', 'https://placehold.co/400x600/FF861C/white?text=Bum+i+Tras', '', 'M', 'avantura_fantasy', 'lako', 128, NULL, 'Školska knjiga', 2005, 'bosanski', '{"2","3","4"}'),

('Carevo novo odijelo', 'H. C. Andersen', 'Klasična bajka o taštom caru kojeg dva prevaranta uvjere da nose nevidljivo odijelo vidljivo samo pametnima. Duhovita priča o lažnom ponosu i hrabrosti da se kaže istina.', 'https://placehold.co/400x600/FF861C/white?text=Carevo+novo+odijelo', '', 'M', 'bajke_basne', 'lako', 32, NULL, 'Školska knjiga', 1837, 'bosanski', '{"1","2","3","4"}'),

('Charlie i tvornica čokolade', 'Roald Dahl', 'Siromašni dječak Charlie Bucket osvaja zlatnu kartu za obilazak čarobne tvornice čokolade ekscentričnog Willyja Wonke. Maštovita avantura puna čokolade, iznenađenja i životnih lekcija.', 'https://placehold.co/400x600/FF861C/white?text=Charlie+i+tvornica+%C4%8Dokolade', '', 'M', 'avantura_fantasy', 'lako', 176, '9780142410318', 'Školska knjiga', 1964, 'bosanski', '{"3","4","5","6"}'),

('Čovjek po imenu Ove', 'Fredrik Backman', 'Mrzovoljni Ove, usamljeni starac koji želi napustiti ovaj svijet, pronalazi novi smisao zahvaljujući susjedima koji uporno ulaze u njegov život. Dirljiva i humoristična priča o prijateljstvu i zajednici.', 'https://placehold.co/400x600/FF861C/white?text=%C4%8Covjek+po+imenu+Ove', '', 'A', 'beletristika', 'srednje', 337, '9781476738024', 'Buybook', 2012, 'bosanski', '{"10","11","12"}'),

('Crni ljepotan', 'Anna Sewell', 'Autobiografija konja Crnog ljepotana koji priča svoju životnu priču - od sretnog djetinjstva na farmi do teških dana u londonskim ulicama. Klasična priča o dobroti prema životinjama i pravdi.', 'https://placehold.co/400x600/FF861C/white?text=Crni+ljepotan', '', 'D', 'realisticni_roman', 'lako', 224, '9780141321035', 'Školska knjiga', 1877, 'bosanski', '{"4","5","6","7"}'),

('Crvenkapica', 'Braća Grimm', 'Poznata bajka o djevojčici u crvenoj kapici koja nosi hranu bolesnoj baki kroz šumu i susreće lukavog vuka. Poučna priča o opreznosti i poslušnosti koja se prenosi generacijama.', 'https://placehold.co/400x600/FF861C/white?text=Crvenkapica', '', 'M', 'bajke_basne', 'lako', 32, NULL, 'Sarajevo Publishing', 1812, 'bosanski', '{"1","2","3"}'),

('Čudesna sudbina Caspara Lullabyja', 'Zoran Živković', 'Fantastična priča o Casparu čiji se život isprepliće s nadnaravnim događajima i neočekivanim susretima. Živkovićev jedinstven stil kombinuje misteriju, fantaziju i filozofske teme.', 'https://placehold.co/400x600/FF861C/white?text=%C4%8Cudesna+sudbina+Caspara', '', 'A', 'beletristika', 'tesko', 200, NULL, 'Laguna', 2000, 'bosanski', '{"10","11","12"}'),

('Čudesne zvijeri', 'J. K. Rowling', 'Vodič kroz magični svijet fantastičnih bića iz univerzuma Harryja Pottera. Knjiga opisuje razne magične životinje, njihova staništa i ponašanja u zabavnom enciklopedijskom formatu.', 'https://placehold.co/400x600/FF861C/white?text=%C4%8Cudesne+zvijeri', '', 'D', 'avantura_fantasy', 'lako', 128, '9781408708989', 'Algoritam', 2001, 'bosanski', '{"4","5","6","7"}'),

('Čudesni nož', 'Philip Pullman', 'Drugi dio trilogije "Njegova tamna tvar" u kojem Will Parry pronalazi nož koji može rezati prolaze između svjetova. Uzbudljiva fantastična avantura prepuna filozofskih pitanja.', 'https://placehold.co/400x600/FF861C/white?text=%C4%8Cudesni+no%C5%BE', '', 'O', 'avantura_fantasy', 'srednje', 326, '9780440418337', 'Algoritam', 1997, 'bosanski', '{"7","8","9","10"}'),

('Čudnovate zgode šegrta Hlapića', 'Ivana Brlić-Mažuranić', 'Mali postolarski šegrt Hlapić bježi od okrutnog majstora Mrkonje i kreće na putovanje puno avantura. Na putu susreće djevojčicu Gitu i uči o hrabrosti, dobroti i pravdi.', 'https://placehold.co/400x600/FF861C/white?text=%C4%8Cudnovate+zgode+%C5%A1egrta+Hlapi%C4%87a', '', 'M', 'lektira', 'lako', 128, '9789531762410', 'Školska knjiga', 1913, 'bosanski', '{"3","4","5"}'),

('Čudo', 'R. J. Palacio', 'Auggie Pullman je dječak s deformitetom lica koji prvi put kreće u školu. Dirljiva i inspirativna priča o prihvatanju, prijateljstvu i snazi dobrote koja mijenja živote.', 'https://placehold.co/400x600/FF861C/white?text=%C4%8Cudo', '', 'D', 'realisticni_roman', 'lako', 310, '9780375869020', 'Buybook', 2012, 'bosanski', '{"5","6","7","8"}'),

('Demian', 'Hermann Hesse', 'Roman o odrastanju mladog Emila Sinclaira koji uz pomoć tajanstvenog Maxa Demiana istražuje svijet morala, identiteta i samosvijesti. Duboko filozofsko djelo o potrazi za sopstvenim ja.', 'https://placehold.co/400x600/FF861C/white?text=Demian', '', 'A', 'beletristika', 'tesko', 176, '9780060931919', 'Buybook', 1919, 'bosanski', '{"10","11","12"}'),

('Divergent', 'Veronica Roth', 'U distopijskom Chicagu društvo je podijeljeno na pet frakcija. Šesnaestogodišnja Tris otkriva da je divergentna i da ne pripada nijednoj grupi, što je čini metom sistema.', 'https://placehold.co/400x600/FF861C/white?text=Divergent', '', 'O', 'avantura_fantasy', 'srednje', 487, '9780062024039', 'Algoritam', 2011, 'bosanski', '{"8","9","10"}'),

('Dječak na vrhu planine', 'John Boyne', 'Pierrot, dječak koji ostaje bez roditelja, odlazi živjeti kod tetke u veliku kuću na vrhu planine - Hitlerovo Orlovsko gnijezdo. Potresna priča o tome kako moć i ideologija mogu promijeniti čovjeka.', 'https://placehold.co/400x600/FF861C/white?text=Dje%C4%8Dak+na+vrhu+planine', '', 'D', 'realisticni_roman', 'srednje', 216, '9781627790840', 'Buybook', 2015, 'bosanski', '{"6","7","8","9"}'),

('Dječak u prugastoj pidžami', 'John Boyne', 'Devetogodišnji Bruno, sin nacističkog časnika, seli se blizu koncentracionog logora i sprijatelji se s dječakom s druge strane ograde. Potresna priča o nevinosti, prijateljstvu i užasima rata.', 'https://placehold.co/400x600/FF861C/white?text=Dje%C4%8Dak+u+prugastoj+pid%C5%BEami', '', 'D', 'realisticni_roman', 'srednje', 216, '9780385751063', 'Buybook', 2006, 'bosanski', '{"6","7","8","9"}'),

('Djevojčica iz Afganistana', 'Deborah Ellis', 'Jedanaestogodišnja Parvana živi pod talibanskom vlašću u Kabulu gdje djevojčice ne smiju ići u školu. Prerušava se u dječaka kako bi prehranila porodicu. Hrabra priča o otporu i preživljavanju.', 'https://placehold.co/400x600/FF861C/white?text=Djevoj%C4%8Dica+iz+Afganistana', '', 'D', 'realisticni_roman', 'srednje', 176, '9780888995810', 'Buybook', 2000, 'bosanski', '{"5","6","7","8"}'),

('Djevojčica s ibrikom', 'Branko Ćopić', 'Toplom i nježna priča o djevojčici iz bosanskog sela koja s ibrikom vode prolazi kroz razne pustolovine. Ćopićev karakteristični humor i ljubav prema djeci čine ovu priču posebnom.', 'https://placehold.co/400x600/FF861C/white?text=Djevoj%C4%8Dica+s+ibrikom', '', 'M', 'lektira', 'lako', 64, NULL, 'Veselin Masleša', 1960, 'bosanski', '{"2","3","4"}'),

('Dnevnik Ane Frank', 'Ana Frank', 'Istiniti dnevnik židovske djevojčice Ane Frank koja se s porodicom skrivala od nacista u Amsterdamu tokom Drugog svjetskog rata. Potresno svjedočanstvo o nadi, hrabrosti i ljudskom duhu.', 'https://placehold.co/400x600/FF861C/white?text=Dnevnik+Ane+Frank', '', 'D', 'realisticni_roman', 'srednje', 283, '9780141315195', 'Buybook', 1947, 'bosanski', '{"7","8","9"}'),

('Dnevnik Nikki', 'Rachel Renée Russell', 'Nikki Maxwell započinje novu školu i bilježi sve svoje zgode i nezgode u dnevnik. Zabavna i ilustrovana serija o prijateljstvu, školi i tipičnim problemima tinejdžerskog života.', 'https://placehold.co/400x600/FF861C/white?text=Dnevnik+Nikki', '', 'M', 'realisticni_roman', 'lako', 282, '9781416980063', 'Algoritam', 2009, 'bosanski', '{"4","5","6"}'),

('Dnevnik šonjavca', 'Jeff Kinney', 'Greg Heffley započinje srednju školu i bilježi svoje svakodnevne nevolje u dnevnik. Izuzetno smiješna knjiga s ilustracijama koja savršeno opisuje izazove odrastanja.', 'https://placehold.co/400x600/FF861C/white?text=Dnevnik+%C5%A1onjavca', '', 'M', 'realisticni_roman', 'lako', 217, '9780141324906', 'Algoritam', 2007, 'bosanski', '{"3","4","5","6"}'),

('Doktor Dolittle', 'Hugh Lofting', 'Doktor John Dolittle nauči govoriti jezike životinja i posveti se liječenju životinja umjesto ljudi. Čarobna priča o dobroti, avanturi i posebnoj vezi između čovjeka i životinja.', 'https://placehold.co/400x600/FF861C/white?text=Doktor+Dolittle', '', 'M', 'avantura_fantasy', 'lako', 176, '9780440400028', 'Školska knjiga', 1920, 'bosanski', '{"3","4","5"}'),

('Drakula', 'Bram Stoker', 'Klasični gotski horor roman o grofu Drakuli, vampiru iz Transilvanije, i grupi ljudi koji se udružuju da ga zaustave. Uzbudljiva priča o borbi dobra i zla koja je definirala žanr vampirske literature.', 'https://placehold.co/400x600/FF861C/white?text=Drakula', '', 'A', 'beletristika', 'tesko', 418, '9780141439846', 'Buybook', 1897, 'bosanski', '{"10","11","12"}'),

('Družba Pere Kvržice', 'Mato Lovrak', 'Grupa seoske djece, predvođena hrabrim Perom Kvržicom, udružuje se da bi popravila staru vodenici i dokazala svoju vrijednost. Klasična priča o dječjem drugarstvu, upornosti i zajedništvu.', 'https://placehold.co/400x600/FF861C/white?text=Dru%C5%BEba+Pere+Kvr%C5%BEice', '', 'D', 'lektira', 'lako', 136, '9789531762427', 'Školska knjiga', 1933, 'bosanski', '{"4","5","6"}'),

('Duh u močvari', 'Ante Gardaš', 'Grupa djece istražuje tajanstvenu močvaru blizu svog sela i nailazi na čudne pojave koje izazivaju strah i uzbuđenje. Napeta avanturistička priča prepuna misterije i dječje hrabrosti.', 'https://placehold.co/400x600/FF861C/white?text=Duh+u+mo%C4%8Dvari', '', 'D', 'avantura_fantasy', 'lako', 140, NULL, 'Školska knjiga', 1981, 'bosanski', '{"4","5","6","7"}'),

('Eleanor i Park', 'Rainbow Rowell', 'Priča o prvoj ljubavi između Eleanor i Parka, dvoje tinejdžera iz različitih svjetova koji se zbliže dijeleći stripove i muziku u školskom autobusu. Nježan i emotivan roman o prihvatanju i ljubavi.', 'https://placehold.co/400x600/FF861C/white?text=Eleanor+i+Park', '', 'O', 'realisticni_roman', 'srednje', 325, '9781250012579', 'Buybook', 2013, 'bosanski', '{"8","9","10"}'),

('Emil i detektivi', 'Erich Kästner', 'Dječak Emil putuje vozom u Berlin i biva pokraden. S grupom berlinske djece organizira akciju hvatanja lopova. Klasična dječja avantura puna humora, drugarstva i dječje snalažljivosti.', 'https://placehold.co/400x600/FF861C/white?text=Emil+i+detektivi', '', 'D', 'avantura_fantasy', 'lako', 160, '9789533131276', 'Školska knjiga', 1929, 'bosanski', '{"4","5","6"}'),

('Eragon', 'Christopher Paolini', 'Petnaestogodišnji farm dječak Eragon pronalazi tajanstveni plavi kamen koji se ispostavi kao zmajevo jaje. Epska fantastična avantura o zmajevima, magiji i borbi protiv zloga kralja.', 'https://placehold.co/400x600/FF861C/white?text=Eragon', '', 'O', 'avantura_fantasy', 'srednje', 503, '9780375826689', 'Algoritam', 2003, 'bosanski', '{"7","8","9","10"}'),

('Fahrenheit 451', 'Ray Bradbury', 'U distopijskom društvu vatrogasci ne gase vatru nego pale knjige. Guy Montag počinje preispitivati svoj posao i otkriva moć pisane riječi. Snažan roman o cenzuri i slobodi misli.', 'https://placehold.co/400x600/FF861C/white?text=Fahrenheit+451', '', 'A', 'beletristika', 'tesko', 194, '9781451673319', 'Buybook', 1953, 'bosanski', '{"9","10","11","12"}'),

('Frankenstein', 'Mary Shelley', 'Doktor Viktor Frankenstein stvara živo biće od dijelova mrtvih tijela, ali ga napušta kad ugleda svoju kreaciju. Klasični roman o ambiciji, odgovornosti i posledicama igranja s prirodom.', 'https://placehold.co/400x600/FF861C/white?text=Frankenstein', '', 'A', 'beletristika', 'tesko', 280, '9780141439471', 'Buybook', 1818, 'bosanski', '{"10","11","12"}'),

('Gonič zmajeva', 'Khaled Hosseini', 'Priča o prijateljstvu između Amira i Hasana u Kabulu prije sovjetske invazije, te Amirovom pokušaju iskupljenja nakon izdaje prijatelja. Potresna saga o krivici, otkupljenju i snazi ljudskog duha.', 'https://placehold.co/400x600/FF861C/white?text=Goni%C4%8D+zmajeva', '', 'A', 'beletristika', 'tesko', 371, '9781594631931', 'Buybook', 2003, 'bosanski', '{"10","11","12"}'),

('Gospodar muha', 'William Golding', 'Grupa dječaka nasukanih na pustom otoku pokušava organizirati društvo, ali postepeno skliznu u divljaštvo i nasilje. Alegorijski roman o ljudskoj prirodi, moći i civilizaciji.', 'https://placehold.co/400x600/FF861C/white?text=Gospodar+muha', '', 'A', 'beletristika', 'tesko', 224, '9780399501487', 'Buybook', 1954, 'bosanski', '{"9","10","11","12"}'),

('Gospodar prstenova', 'J. R. R. Tolkien', 'Hobit Frodo Baggins kreće na epsko putovanje da uništi Prsten Moći i spasi Srednju zemlju od mračnog gospodara Saurona. Najpoznatija fantastična saga svih vremena o hrabrosti, prijateljstvu i žrtvi.', 'https://placehold.co/400x600/FF861C/white?text=Gospodar+prstenova', '', 'O', 'avantura_fantasy', 'tesko', 1178, '9780618640157', 'Algoritam', 1954, 'bosanski', '{"8","9","10","11"}'),

('Gregov dnevnik', 'Jeff Kinney', 'Greg Heffley nastavlja bilježiti svoje nevolje i smiješne situacije iz svakodnevnog života. Zabavna knjiga s ilustracijama koja će nasmijati svakog mladog čitaoca.', 'https://placehold.co/400x600/FF861C/white?text=Gregov+dnevnik', '', 'M', 'realisticni_roman', 'lako', 217, '9780141324920', 'Algoritam', 2008, 'bosanski', '{"3","4","5","6"}'),

('Grimizna kraljica', 'Victoria Aveyard', 'Mare Barrow živi u svijetu podijeljenom na Crvene i Srebrne. Kad otkrije da ima moć nad munjama, ulazi u opasan svijet dvorskih intriga. Uzbudljiva distopijska fantazija o moći i pobuni.', 'https://placehold.co/400x600/FF861C/white?text=Grimizna+kraljica', '', 'O', 'avantura_fantasy', 'srednje', 383, '9780062310637', 'Algoritam', 2015, 'bosanski', '{"8","9","10"}'),

('Grimizni dvorac', 'Orhan Pamuk', 'Roman nobelovca Pamuká koji istražuje odnos Istoka i Zapada kroz priču smještenu u osmansko carstvo. Složeno i višeslojno djelo prepuno historije, filozofije i turske kulturne baštine.', 'https://placehold.co/400x600/FF861C/white?text=Grimizni+dvorac', '', 'A', 'beletristika', 'tesko', 432, NULL, 'Buybook', 2008, 'bosanski', '{"11","12"}'),

('Grozni Grga', 'Francesca Simon', 'Grga je najgrozniji dječak na svijetu koji stalno pravi nestašluke i izluđuje svoju okolinu. Izuzetno smiješna knjiga koja će nasmijati i djecu i odrasle.', 'https://placehold.co/400x600/FF861C/white?text=Grozni+Grga', '', 'M', 'realisticni_roman', 'lako', 112, '9781858813615', 'Algoritam', 1994, 'bosanski', '{"2","3","4"}'),

('Grozni Grga i prokleto prokleto prvenstvo', 'Francesca Simon', 'Grga se upušta u nove nestašluke pokušavajući osvojiti prvenstvo za najgroznije dijete. Nastavak popularne serije pun humora i zabavnih situacija iz dječjeg života.', 'https://placehold.co/400x600/FF861C/white?text=Grozni+Grga+i+prvenstvo', '', 'M', 'realisticni_roman', 'lako', 112, NULL, 'Algoritam', 2005, 'bosanski', '{"2","3","4"}'),

('Gulliverova putovanja', 'Jonathan Swift', 'Brodski liječnik Lemuel Gulliver putuje u fantastične zemlje patuljaka, divova i drugih čudnih bića. Klasična satirična priča koja kroz avanture kritikuje ljudsko društvo i politiku.', 'https://placehold.co/400x600/FF861C/white?text=Gulliverova+putovanja', '', 'D', 'lektira', 'srednje', 320, '9780141439495', 'Školska knjiga', 1726, 'bosanski', '{"6","7","8","9"}'),

('Hajduci', 'Branislav Nušić', 'Humoristična priča o grupi dječaka koji odluče postati hajduci i doživljavaju niz komičnih situacija. Nušićev prepoznatljiv humor i satiričan pogled na dječje maštanje čine ovo djelo neprolaznim.', 'https://placehold.co/400x600/FF861C/white?text=Hajduci', '', 'D', 'lektira', 'lako', 128, NULL, 'Školska knjiga', 1933, 'bosanski', '{"4","5","6","7"}'),

('Harry Potter', 'J. K. Rowling', 'Jedanaestogodišnji Harry Potter otkriva da je čarobnjak i odlazi na Hogwarts, školu vještičarenja i čarobnjaštva. Početak magične sage o prijateljstvu, hrabrosti i borbi protiv zla.', 'https://placehold.co/400x600/FF861C/white?text=Harry+Potter', '', 'D', 'avantura_fantasy', 'srednje', 309, '9780747532743', 'Algoritam', 1997, 'bosanski', '{"4","5","6","7","8"}'),

('Heidi', 'Johanna Spyri', 'Mala Heidi živi sa djedom u švicarskim Alpama gdje uživa u slobodi i prirodi. Kad je pošalju u grad, čezne za planinama. Topla priča o ljubavi prema prirodi, porodici i dobroti.', 'https://placehold.co/400x600/FF861C/white?text=Heidi', '', 'M', 'realisticni_roman', 'lako', 288, '9780140623888', 'Školska knjiga', 1881, 'bosanski', '{"3","4","5","6"}'),

('Hiljadu čudesnih sunaca', 'Khaled Hosseini', 'Priča o dvije žene u Afganistanu čiji se životi isprepliću tokom decenija rata i represije. Potresna saga o ženskoj hrabrosti, preživljavanju i neugasivoj nadi u najgorim vremenima.', 'https://placehold.co/400x600/FF861C/white?text=Hiljadu+%C4%8Dudesnih+sunaca', '', 'A', 'beletristika', 'tesko', 372, '9781594489501', 'Buybook', 2007, 'bosanski', '{"10","11","12"}'),

('Hobit', 'J. R. R. Tolkien', 'Hobbit Bilbo Baggins kreće na neočekivano putovanje s družinom patuljaka i čarobnjakom Gandalfom da povrate blago od zmaja Smauga. Klasična fantastična avantura koja je začetak Tolkienove sage.', 'https://placehold.co/400x600/FF861C/white?text=Hobit', '', 'D', 'avantura_fantasy', 'srednje', 310, '9780547928227', 'Algoritam', 1937, 'bosanski', '{"5","6","7","8"}'),

('Igra anđela', 'Carlos Ruiz Zafón', 'Mladi pisac David Martín prima misterioznu narudžbu od tajanstvenog nakladnika u Barceloni 1920-ih. Atmosferičan gotski triler prepun misterije, strasti i tajni starog grada.', 'https://placehold.co/400x600/FF861C/white?text=Igra+an%C4%91ela', '', 'A', 'beletristika', 'tesko', 531, '9780143119456', 'Buybook', 2008, 'bosanski', '{"10","11","12"}'),

('Igre gladi', 'Suzanne Collins', 'U distopijskom Panemu, šesnaestogodišnja Katniss Everdeen volontira za smrtonosne Igre gladi kako bi spasila svoju sestru. Uzbudljiv roman o preživljavanju, pobuni i žrtvi.', 'https://placehold.co/400x600/FF861C/white?text=Igre+gladi', '', 'O', 'avantura_fantasy', 'srednje', 374, '9780439023481', 'Algoritam', 2008, 'bosanski', '{"7","8","9","10"}'),

('Izabrane pripovijetke', 'Ćamil Sijarić', 'Zbirka najpoznatijih pripovijedaka Ćamila Sijarića koji majstorski oslikava život ljudi u Bosni. Snažni likovi i poetičan jezik čine ove priče nezaboravnim svjedočanstvom bosanskog duha.', 'https://placehold.co/400x600/FF861C/white?text=Izabrane+pripovijetke', '', 'O', 'lektira', 'tesko', 240, NULL, 'Veselin Masleša', 1970, 'bosanski', '{"8","9","10"}'),

('Jantarni dalekozor', 'Philip Pullman', 'Treći dio trilogije "Njegova tamna tvar" u kojem Lyra i Will moraju putovati u svijet mrtvih da završe svoju misiju. Epski završetak fantastične sage pune filozofije i avanture.', 'https://placehold.co/400x600/FF861C/white?text=Jantarni+dalekozor', '', 'O', 'avantura_fantasy', 'srednje', 518, '9780440418566', 'Algoritam', 2000, 'bosanski', '{"7","8","9","10"}'),

('Jazavac pred sudom', 'Petar Kočić', 'Satirična priča o seljaku Davidu Štrpcu koji tuži jazavca pred austro-ugarskim sudom. Kočićevo remek-djelo humoristički i kritički prikazuje nepravdu i apsurdnost kolonijalnog sistema.', 'https://placehold.co/400x600/FF861C/white?text=Jazavac+pred+sudom', '', 'D', 'lektira', 'srednje', 48, NULL, 'Veselin Masleša', 1904, 'bosanski', '{"6","7","8","9"}'),

('Kako izdresirati zmaja', 'Cressida Cowell', 'Štrkljavi viking Štucko mora uhvatiti i izdresirati zmaja kao dio obreda odrastanja u svom plemenu. Smiješna i uzbudljiva priča o hrabrosti, prijateljstvu s zmajevima i prihvatanju različitosti.', 'https://placehold.co/400x600/FF861C/white?text=Kako+izdresirati+zmaja', '', 'D', 'avantura_fantasy', 'lako', 214, '9780340999073', 'Algoritam', 2003, 'bosanski', '{"4","5","6","7"}'),

('Kameni spavač', 'Mak Dizdar', 'Zbirka poezije inspirisana srednjovjekovnim bosanskim stećcima i natpisima na njima. Dizdarova poezija duboko istražuje bosanski identitet, historiju i duhovnost kroz snažne metafore i simbole.', 'https://placehold.co/400x600/FF861C/white?text=Kameni+spava%C4%8D', '', 'A', 'poezija', 'tesko', 160, NULL, 'Veselin Masleša', 1966, 'bosanski', '{"9","10","11","12"}'),

('Kapetan Gaćeša', 'Dav Pilkey', 'Dva nestašna dječaka hypnotiziraju svog škrtog direktora škole i pretvaraju ga u superheroja Kapetana Gaćešu. Izuzetno smiješna i ilustrovana knjiga koja će oduševiti mlade čitaoce.', 'https://placehold.co/400x600/FF861C/white?text=Kapetan+Ga%C4%87e%C5%A1a', '', 'M', 'avantura_fantasy', 'lako', 144, '9780439014571', 'Algoritam', 1997, 'bosanski', '{"2","3","4","5"}'),

('Kći čuvara uspomena', 'Kim Edwards', 'Doktor na porodu donosi odluku koja će zauvijek promijeniti živote dviju porodica. Emotivan roman o tajnama, gubitku i posljedicama jednog trenutka koji odjekuje kroz decenije.', 'https://placehold.co/400x600/FF861C/white?text=K%C4%87i+%C4%8Duvara+uspomena', '', 'A', 'beletristika', 'srednje', 401, '9780143037149', 'Buybook', 2005, 'bosanski', '{"10","11","12"}'),

('Kišni gubavac', 'Alija Dubočanin', 'Poetična priča iz bosanskog djetinjstva ispunjena nostalgijom i ljubavlju prema zavičaju. Dubočanin majstorski oslikava život i običaje bosanskog sela kroz oči djeteta.', 'https://placehold.co/400x600/FF861C/white?text=Ki%C5%A1ni+gubavac', '', 'D', 'lektira', 'srednje', 120, NULL, 'Veselin Masleša', 1985, 'bosanski', '{"5","6","7"}'),

('Knjiga o groblju', 'Neil Gaiman', 'Dječak Bod odrasta na groblju, odgojen od duhova nakon što mu je porodica ubijena. Mračna i čarobna priča o odrastanju, prijateljstvu i hrabrosti na granici između svijeta živih i mrtvih.', 'https://placehold.co/400x600/FF861C/white?text=Knjiga+o+groblju', '', 'D', 'avantura_fantasy', 'srednje', 312, '9780060530945', 'Algoritam', 2008, 'bosanski', '{"6","7","8"}'),

('Koko u Parizu', 'Ivan Kušan', 'Dječak Koko putuje u Pariz i upušta se u uzbudljive avanture u gradu svjetlosti. Zabavna i dinamična priča o dječjoj znatiželji, snalažljivosti i prijateljstvu u stranom gradu.', 'https://placehold.co/400x600/FF861C/white?text=Koko+u+Parizu', '', 'D', 'avantura_fantasy', 'lako', 160, NULL, 'Školska knjiga', 1978, 'bosanski', '{"4","5","6","7"}'),

('Koralina', 'Neil Gaiman', 'Mala Koralina otkriva tajna vrata u svom novom stanu koja vode u paralelni svijet s "drugom majkom". Jeziva i očaravajuća priča o hrabrosti i snazi prave ljubavi.', 'https://placehold.co/400x600/FF861C/white?text=Koralina', '', 'D', 'avantura_fantasy', 'srednje', 162, '9780380977789', 'Algoritam', 2002, 'bosanski', '{"4","5","6","7"}'),

('Kradljivica knjiga', 'Markus Zusak', 'U nacističkoj Njemačkoj, djevojčica Liesel krade knjige i dijeli ih sa susjedima tokom bombardiranja. Priča ispričana iz perspektive Smrti o moći riječi, ljubavi i ljudskoj dobroti u najgorem vremenu.', 'https://placehold.co/400x600/FF861C/white?text=Kradljivica+knjiga', '', 'O', 'realisticni_roman', 'srednje', 552, '9780375842207', 'Buybook', 2005, 'bosanski', '{"8","9","10"}'),

('Kraljica iz dvorišta', 'Bisera Alikadić', 'Topla priča o djetinjstvu u bosanskom dvorištu gdje se prepliću igra, prijateljstvo i prve životne lekcije. Alikadić nježno oslikava svijet odrastanja u bosanskohercegovačkom okruženju.', 'https://placehold.co/400x600/FF861C/white?text=Kraljica+iz+dvori%C5%A1ta', '', 'M', 'lektira', 'lako', 96, NULL, 'Connectum', 2000, 'bosanski', '{"3","4","5"}'),

('Krive su zvijezde', 'John Green', 'Šesnaestogodišnja Hazel, oboljela od raka, upoznaje duhovitog Augusta na grupi podrške. Potresna ljubavna priča o životu, smrti i svemu između koja je ganula milione čitalaca širom svijeta.', 'https://placehold.co/400x600/FF861C/white?text=Krive+su+zvijezde', '', 'O', 'realisticni_roman', 'srednje', 313, '9780525478812', 'Buybook', 2012, 'bosanski', '{"8","9","10"}'),

('Kronike iz Narnije', 'C. S. Lewis', 'Četvero djece prolazi kroz čarobni ormar u magičnu zemlju Narniju gdje vlada vječna zima. Klasična fantastična saga o hrabrosti, vjeri i borbi dobra protiv zla.', 'https://placehold.co/400x600/FF861C/white?text=Kronike+iz+Narnije', '', 'D', 'avantura_fantasy', 'srednje', 767, '9780064471190', 'Algoritam', 1950, 'bosanski', '{"4","5","6","7","8"}'),

('Kroz pustinju i prašumu', 'Henryk Sienkiewicz', 'Dvoje djece, Staš i Nel, bivaju oteti i moraju preživjeti opasno putovanje kroz afričku pustinju i prašumu. Klasična avanturistička priča o hrabrosti, prijateljstvu i snalažljivosti.', 'https://placehold.co/400x600/FF861C/white?text=Kroz+pustinju+i+pra%C5%A1umu', '', 'D', 'avantura_fantasy', 'srednje', 380, '9789533131283', 'Školska knjiga', 1912, 'bosanski', '{"6","7","8"}'),

('Kula', 'Zija Dizdarević', 'Priča smještena u bosanski kontekst koja istražuje teme identiteta, povijesti i ljudskih odnosa. Dizdarevićevo djelo oslikava složenost bosanskog društva kroz živopisne likove i situacije.', 'https://placehold.co/400x600/FF861C/white?text=Kula', '', 'O', 'lektira', 'srednje', 180, NULL, 'Veselin Masleša', 1970, 'bosanski', '{"8","9","10"}'),

('Labirint: Nemoguće bjekstvo', 'James Dashner', 'Thomas se budi u ogromnom labirintu bez sjećanja na prošlost, okružen grupom dječaka koji pokušavaju pronaći izlaz. Napeta distopijska avantura puna misterija i iznenađenja.', 'https://placehold.co/400x600/FF861C/white?text=Labirint', '', 'O', 'avantura_fantasy', 'srednje', 375, '9780385737944', 'Algoritam', 2009, 'bosanski', '{"7","8","9","10"}'),

('Lassie se vraća kući', 'Eric Knight', 'Pas Lassie je prodan bogatom čovjeku, ali njezina ljubav prema dječaku Joeu tjera je na nevjerojatno putovanje kroz Englesku da se vrati kući. Dirljiva priča o lojalnosti i ljubavi između djeteta i psa.', 'https://placehold.co/400x600/FF861C/white?text=Lassie+se+vra%C4%87a+ku%C4%87i', '', 'D', 'realisticni_roman', 'lako', 256, '9780440446545', 'Školska knjiga', 1940, 'bosanski', '{"4","5","6"}'),

('Ljeto kad sam postala lijepa', 'Jenny Han', 'Belly svako ljeto provodi na plaži s porodicama Fisher i Conklin. Ovog ljeta sve se mijenja jer se i ona mijenja. Romantična priča o odrastanju, prvoj ljubavi i ljetu koje sve mijenja.', 'https://placehold.co/400x600/FF861C/white?text=Ljeto+kad+sam+postala+lijepa', '', 'O', 'realisticni_roman', 'lako', 276, '9781416968238', 'Algoritam', 2009, 'bosanski', '{"8","9","10"}'),

('Loši momci', 'Aaron Blabey', 'Vuk, zmija, piranja i ajkula odluče postati dobri momci i dokazati svijetu da nisu zločesti. Izuzetno smiješna ilustrovana knjiga koja će nasmijati čitaoce svih uzrasta.', 'https://placehold.co/400x600/FF861C/white?text=Lo%C5%A1i+momci', '', 'M', 'avantura_fantasy', 'lako', 140, '9781338087482', 'Algoritam', 2015, 'bosanski', '{"2","3","4","5"}'),

('Lovac na zmajeve', 'Khaled Hosseini', 'Amir i Hassan, dva dječaka iz Kabula, dijele djetinjstvo ali ih klasne razlike razdvajaju. Kada Amir izda Hasana, počinje putovanje krivice i otkupljenja koje traje decenijama.', 'https://placehold.co/400x600/FF861C/white?text=Lovac+na+zmajeve', '', 'A', 'beletristika', 'tesko', 371, '9781594631931', 'Buybook', 2003, 'bosanski', '{"10","11","12"}'),

('Lovac u žitu', 'J. D. Salinger', 'Šesnaestogodišnji Holden Caulfield luta New Yorkom nakon što je izbačen iz škole, preispitujući lažnost odraslog svijeta. Kultni roman o pobuni mladosti, otuđenosti i traženju autentičnosti.', 'https://placehold.co/400x600/FF861C/white?text=Lovac+u+%C5%BEitu', '', 'A', 'beletristika', 'srednje', 214, '9780316769488', 'Buybook', 1951, 'bosanski', '{"9","10","11","12"}'),

('Mačak u čizmama', 'Charles Perrault', 'Lukavi mačak pomaže svom siromašnom gospodaru da postane bogat i oženi princezu koristeći svoju mudrost i domišljatost. Klasična bajka o snalažljivosti i vjernosti.', 'https://placehold.co/400x600/FF861C/white?text=Ma%C4%8Dak+u+%C4%8Dizmama', '', 'M', 'bajke_basne', 'lako', 32, NULL, 'Sarajevo Publishing', 1697, 'bosanski', '{"1","2","3"}'),

('Magareće godine', 'Branko Ćopić', 'Humoristična priča o životu u bosanskom selu prepuna toplih likova i komičnih situacija. Ćopić s ljubavlju i humorom opisuje djetinjstvo i ljude iz svog kraja.', 'https://placehold.co/400x600/FF861C/white?text=Magare%C4%87e+godine', '', 'D', 'lektira', 'lako', 200, NULL, 'Veselin Masleša', 1960, 'bosanski', '{"5","6","7"}'),

('Mali knez', 'Mato Lovrak', 'Priča o dječaku koji se ističe među vršnjacima svojom hrabrošću i dobrotom. Lovrak ponovo majstorski opisuje dječji svijet, drugarstvo i avanture u seoskom okruženju.', 'https://placehold.co/400x600/FF861C/white?text=Mali+knez', '', 'D', 'lektira', 'lako', 128, NULL, 'Školska knjiga', 1935, 'bosanski', '{"4","5","6"}'),

('Malo drvo', 'Forrest Carter', 'Dječak odgajan od bake i djeda iz naroda Cherokee uči o prirodi, tradiciji i životnim vrijednostima. Nježna i mudra priča o odrastanju u harmoniji s prirodom i drevnom mudrošću.', 'https://placehold.co/400x600/FF861C/white?text=Malo+drvo', '', 'D', 'realisticni_roman', 'srednje', 216, '9780826328090', 'Buybook', 1976, 'bosanski', '{"5","6","7","8"}'),

('Marina', 'Carlos Ruiz Zafón', 'Petnaestogodišnji Oscar otkriva napuštenu vilu u Barceloni i upoznaje tajanstvenu Marinu. Zajedno otkrivaju mračnu priču o opsesiji, ljubavi i smrti koja se krije u srcu grada.', 'https://placehold.co/400x600/FF861C/white?text=Marina', '', 'O', 'avantura_fantasy', 'srednje', 320, '9780316044714', 'Buybook', 1999, 'bosanski', '{"8","9","10"}'),

('Matilda', 'Roald Dahl', 'Genijalna mala Matilda voli čitati, ali njeni roditelji to ne cijene. Uz pomoć učiteljice gospođice Honey i svojih telekinetičkih moći, Matilda se suprotstavlja zloj direktorici.', 'https://placehold.co/400x600/FF861C/white?text=Matilda', '', 'M', 'avantura_fantasy', 'lako', 240, '9780142410370', 'Algoritam', 1988, 'bosanski', '{"3","4","5","6"}'),

('Medin rođendan', 'Zehra Hubijar', 'Topla priča o malom Medi koji proslavlja svoj rođendan i uči o prijateljstvu, dijeljenju i radosti davanja. Knjiga namijenjena najmlađim čitaocima ispunjena ljubavlju i životnim lekcijama.', 'https://placehold.co/400x600/FF861C/white?text=Medin+ro%C4%91endan', '', 'M', 'bajke_basne', 'lako', 48, NULL, 'Connectum', 2000, 'bosanski', '{"1","2","3"}'),

('Metamorfoza', 'Franz Kafka', 'Gregor Samsa se jednog jutra budi pretvoren u ogromnog insekta. Kafkina alegorijska novela o otuđenosti, porodičnim odnosima i apsurdnosti ljudske egzistencije.', 'https://placehold.co/400x600/FF861C/white?text=Metamorfoza', '', 'A', 'beletristika', 'tesko', 96, '9780141023458', 'Buybook', 1915, 'bosanski', '{"9","10","11","12"}'),

('Mi djeca s kolodvora Zoo', 'Christiane F.', 'Istinita priča o tinejdžerki Christiane iz Berlina koja klizi u svijet droge i prostitucije. Potresno svjedočanstvo o mladosti izgubljenoj u ovisnosti koje je šokiralo Europu.', 'https://placehold.co/400x600/FF861C/white?text=Mi+djeca+s+kolodvora+Zoo', '', 'O', 'realisticni_roman', 'tesko', 336, '9780552552585', 'Buybook', 1978, 'bosanski', '{"9","10","11"}'),

('Miševi i ljudi', 'John Steinbeck', 'Dva radnika, snažni ali ograničeni Lenny i brižni George, sanjaju o vlastitoj farmi u doba Velike depresije. Kratka ali snažna priča o prijateljstvu, snovima i nemilosrdnosti sudbine.', 'https://placehold.co/400x600/FF861C/white?text=Mi%C5%A1evi+i+ljudi', '', 'A', 'beletristika', 'srednje', 112, '9780140186420', 'Buybook', 1937, 'bosanski', '{"9","10","11","12"}'),

('Moja baka vam se ispričava', 'Fredrik Backman', 'Sedmogodišnja Elsa i njena ekscentrična baka dijele posebnu vezu punu bajki i pustolovina. Nakon bakine smrti, Elsa otkriva da su bakine priče bile stvarnije nego što je mislila.', 'https://placehold.co/400x600/FF861C/white?text=Moja+baka+vam+se+ispri%C4%8Dava', '', 'D', 'realisticni_roman', 'srednje', 372, '9781501115066', 'Buybook', 2013, 'bosanski', '{"6","7","8","9"}'),

('Moji su roditelji vanzemaljci', 'Grupa autora', 'Zabavna zbirka priča u kojima djeca otkrivaju da njihovi roditelji imaju čudne navike - možda su čak i vanzemaljci! Humoristična knjiga koja će nasmijati mlade čitaoce.', 'https://placehold.co/400x600/FF861C/white?text=Moji+su+roditelji+vanzemaljci', '', 'M', 'avantura_fantasy', 'lako', 128, NULL, 'Školska knjiga', 2005, 'bosanski', '{"3","4","5"}'),

('Most u magli', 'Alija Dubočanin', 'Poetična priča o životu uz bosansku rijeku i most koji povezuje ljude i njihove sudbine. Dubočanin kroz maglu i rijeku stvara atmosferu nostalgije i ljepote bosanskog kraja.', 'https://placehold.co/400x600/FF861C/white?text=Most+u+magli', '', 'D', 'lektira', 'srednje', 140, NULL, 'Veselin Masleša', 1988, 'bosanski', '{"5","6","7","8"}'),

('Most za Terabitiju', 'Katherine Paterson', 'Jess i Leslie stvaraju imaginarno kraljevstvo Terabitiju u šumi, ali tragedija prekida njihovo prijateljstvo. Dirljiva priča o snazi mašte, prijateljstvu i suočavanju s gubitkom.', 'https://placehold.co/400x600/FF861C/white?text=Most+za+Terabitiju', '', 'D', 'realisticni_roman', 'srednje', 163, '9780064401845', 'Školska knjiga', 1977, 'bosanski', '{"5","6","7"}'),

('Nikadgrad', 'Jessica Townsend', 'Morrigan Crow, djevojčica osuđena na smrt, dobiva šansu za novi život u čarobnom Nikadgradu. Fantastična avantura puna magije, misterije i nezaboravnih likova.', 'https://placehold.co/400x600/FF861C/white?text=Nikadgrad', '', 'D', 'avantura_fantasy', 'srednje', 384, '9780316508896', 'Algoritam', 2017, 'bosanski', '{"5","6","7","8"}'),

('Oliver Twist', 'Charles Dickens', 'Siročić Oliver Twist bježi iz sirotišta i završava u bandi džeparoša u viktorijanskom Londonu. Klasična priča o borbi za dostojanstvo i potrazi za porodicom u surovom svijetu.', 'https://placehold.co/400x600/FF861C/white?text=Oliver+Twist', '', 'D', 'lektira', 'srednje', 430, '9780141439747', 'Školska knjiga', 1838, 'bosanski', '{"6","7","8","9"}'),

('Orlovi rano lete', 'Branko Ćopić', 'Dječaci iz bosanskog sela odrastaju u teškim ratnim vremenima, ali njihov duh i hrabrost ne mogu biti slomljeni. Ćopićeva topla priča o djetinjstvu, drugarstvu i otporu u Drugom svjetskom ratu.', 'https://placehold.co/400x600/FF861C/white?text=Orlovi+rano+lete', '', 'D', 'lektira', 'srednje', 200, NULL, 'Veselin Masleša', 1957, 'bosanski', '{"5","6","7","8"}'),

('Ostrvo s blagom', 'Robert Louis Stevenson', 'Mladi Jim Hawkins pronalazi mapu blaga i kreće na opasno putovanje brodom gdje se susreće s piratom Long Johnom Silverom. Klasična avanturistička priča o piratima, blagu i hrabrosti.', 'https://placehold.co/400x600/FF861C/white?text=Ostrvo+s+blagom', '', 'D', 'avantura_fantasy', 'srednje', 272, '9780141321004', 'Školska knjiga', 1883, 'bosanski', '{"5","6","7","8"}'),

('Pad kuće Usher', 'Edgar Allan Poe', 'Pripovjedač posjećuje mračnu kuću Usherovih i svjedoči užasnim događajima koji prate propadanje porodice. Poeova klasična gotska priča o strahu, ludilu i neminovnom raspadu.', 'https://placehold.co/400x600/FF861C/white?text=Pad+ku%C4%87e+Usher', '', 'A', 'beletristika', 'tesko', 48, NULL, 'Buybook', 1839, 'bosanski', '{"9","10","11","12"}'),

('Papirni gradovi', 'John Green', 'Quentin je fasciniran svojom susjedom Margo koja jedne noći nestane ostavljajući tragove. Priča o potrazi, prijateljstvu i shvatanju da ljudi nisu uvijek onakvi kakvima ih zamišljamo.', 'https://placehold.co/400x600/FF861C/white?text=Papirni+gradovi', '', 'O', 'realisticni_roman', 'srednje', 305, '9780525555803', 'Buybook', 2008, 'bosanski', '{"8","9","10"}'),

('Pas čovjek', 'Dav Pilkey', 'Policajac i njegov pas spajaju se u jednog junaka - Psa čovjeka koji brani grad od zločinaca. Izuzetno smiješna i ilustrovana serija koja kombinuje humor sa akcijom.', 'https://placehold.co/400x600/FF861C/white?text=Pas+%C4%8Dovjek', '', 'M', 'avantura_fantasy', 'lako', 240, '9781338741032', 'Algoritam', 2016, 'bosanski', '{"2","3","4","5"}'),

('Patuljak vam priča', 'Ahmet Hromadžić', 'Zbirka čarobnih priča za djecu u kojima patuljak pripovijeda o avanturama u bosanskim šumama i planinama. Hromadžićeve priče su pune mašte, ljubavi prema prirodi i bosanskom folkloru.', 'https://placehold.co/400x600/FF861C/white?text=Patuljak+vam+pri%C4%8Da', '', 'M', 'bajke_basne', 'lako', 96, NULL, 'Veselin Masleša', 1960, 'bosanski', '{"2","3","4","5"}'),

('Pepeljuga', 'Charles Perrault', 'Siromašna djevojka Pepeljuga uz pomoć dobre vile odlazi na bal gdje osvaja srce princa. Najpoznatija bajka svih vremena o dobroti koja pobjeđuje zlobu i snovima koji se ostvaruju.', 'https://placehold.co/400x600/FF861C/white?text=Pepeljuga', '', 'M', 'bajke_basne', 'lako', 32, NULL, 'Sarajevo Publishing', 1697, 'bosanski', '{"1","2","3"}'),

('Percy Jackson', 'Rick Riordan', 'Dvanaestogodišnji Percy otkriva da je sin grčkog boga Posejdona i kreće na opasno putovanje da spriječi rat među bogovima. Uzbudljiva mješavina grčke mitologije i moderne avanture.', 'https://placehold.co/400x600/FF861C/white?text=Percy+Jackson', '', 'D', 'avantura_fantasy', 'srednje', 375, '9780786838653', 'Algoritam', 2005, 'bosanski', '{"5","6","7","8"}'),

('Pet prijatelja', 'Enid Blyton', 'Julian, Dick, Anne, George i pas Timmy doživljavaju uzbudljive avanture i rješavaju misterije tokom školskih praznika. Klasična dječja serija o prijateljstvu, hrabrosti i pustolovima.', 'https://placehold.co/400x600/FF861C/white?text=Pet+prijatelja', '', 'D', 'avantura_fantasy', 'lako', 190, '9780340681060', 'Školska knjiga', 1942, 'bosanski', '{"4","5","6","7"}'),

('Pinokio', 'Carlo Collodi', 'Drvena lutka Pinokio oživljava i kreće u avanture, ali svaki put kad laže nos mu naraste. Klasična bajka o poslušnosti, iskrenosti i želji da postaneš pravi dječak.', 'https://placehold.co/400x600/FF861C/white?text=Pinokio', '', 'M', 'bajke_basne', 'lako', 192, '9780140621075', 'Školska knjiga', 1883, 'bosanski', '{"2","3","4","5"}'),

('Pipi Duga Čarapa', 'Astrid Lindgren', 'Najjača djevojčica na svijetu živi sama u vili Vilekuli sa konjem i majmunom. Pipi je slobodna, duhovita i puna iznenađenja u ovoj klasičnoj priči koja inspirira generacije djece.', 'https://placehold.co/400x600/FF861C/white?text=Pipi+Duga+%C4%8Carapa', '', 'M', 'avantura_fantasy', 'lako', 160, '9780142402498', 'Školska knjiga', 1945, 'bosanski', '{"2","3","4","5"}'),

('Pjesme', 'Nasiha Kapidžić-Hadžić', 'Zbirka poezije za djecu bosanskohercegovačke pjesnikinje koja na nježan i topao način govori o djetinjstvu, prirodi i ljubavi. Stihovi puni muzikalnosti i dječje radosti.', 'https://placehold.co/400x600/FF861C/white?text=Pjesme', '', 'M', 'poezija', 'lako', 80, NULL, 'Veselin Masleša', 1975, 'bosanski', '{"2","3","4","5"}'),

('Plavi vjetar', 'Ivica Vanja Rorić', 'Poetična priča o djetinjstvu i odrastanju ispunjena maštom i čežnjom za slobodom. Rorić stvara čaroban svijet u kojem se stvarnost i mašta prepliću kroz oči mladog protagoniste.', 'https://placehold.co/400x600/FF861C/white?text=Plavi+vjetar', '', 'D', 'lektira', 'lako', 120, NULL, 'Školska knjiga', 1960, 'bosanski', '{"4","5","6"}'),

('Pollyanna', 'Eleanor H. Porter', 'Siročica Pollyanna donosi radost u mali grad svojom igrom traženja razloga za radost u svakoj situaciji. Klasična priča o optimizmu, dobroti i transformativnoj moći pozitivnog stava.', 'https://placehold.co/400x600/FF861C/white?text=Pollyanna', '', 'D', 'realisticni_roman', 'lako', 270, '9780140366815', 'Školska knjiga', 1913, 'bosanski', '{"4","5","6","7"}'),

('Priče iz 1001 noći', 'Narodna književnost', 'Šeherezada priča sultanu priče hiljadu i jednu noć da bi spasila svoj život. Zbirka čarobnih priča o Aladinu, Ali Babi i Sindbadu Moreplovcu iz arapske tradicije.', 'https://placehold.co/400x600/FF861C/white?text=Pri%C4%8De+iz+1001+no%C4%87i', '', 'D', 'bajke_basne', 'srednje', 350, NULL, 'Sarajevo Publishing', 1704, 'bosanski', '{"5","6","7","8"}'),

('Priče za laku noć za mlade buntovnice', 'Elena Favilli i Francesca Cavallo', 'Zbirka stotinu priča o izvanrednim ženama od antičkih kraljica do modernih astronautkinja. Inspirativna knjiga koja ohrabruje djevojčice da sanjaju veliko i ne odustaju.', 'https://placehold.co/400x600/FF861C/white?text=Pri%C4%8De+za+laku+no%C4%87', '', 'D', 'zanimljiva_nauka', 'lako', 212, '9780997895810', 'Buybook', 2016, 'bosanski', '{"4","5","6","7","8"}'),

('Pripovijetke', 'Isak Samokovlija', 'Zbirka pripovijedaka koje oslikavaju život sefardskih Jevreja i drugih naroda u Bosni. Samokovlija s toplinom i realizmom prikazuje sudbine malih ljudi na margini društva.', 'https://placehold.co/400x600/FF861C/white?text=Pripovijetke', '', 'O', 'lektira', 'tesko', 240, NULL, 'Veselin Masleša', 1936, 'bosanski', '{"8","9","10"}'),

('Proces', 'Franz Kafka', 'Josef K. biva uhapšen i optužen bez objašnjenja zašto. Kafkin apsurdistički roman o suočavanju pojedinca s neshvatljivom i svemoćnom birokracijom koja upravlja ljudskim sudbinama.', 'https://placehold.co/400x600/FF861C/white?text=Proces', '', 'A', 'beletristika', 'tesko', 255, '9780141182902', 'Buybook', 1925, 'bosanski', '{"10","11","12"}'),

('Prosjak Luka', 'August Šenoa', 'Priča o siromašnom dječaku Luki koji se bori za preživljavanje u Zagrebu 19. vijeka. Šenoino djelo je realistični prikaz socijalnih nepravdi i dječje patnje u gradskom okruženju.', 'https://placehold.co/400x600/FF861C/white?text=Prosjak+Luka', '', 'D', 'lektira', 'srednje', 96, NULL, 'Školska knjiga', 1879, 'bosanski', '{"5","6","7","8"}'),

('Pustolovine Huckleberryja Finna', 'Mark Twain', 'Huck Finn bježi od oca alkoholičara i s odbjeglim robom Jimom plovi niz rijeku Mississippi. Klasična američka avantura o slobodi, prijateljstvu i moralnom odrastanju.', 'https://placehold.co/400x600/FF861C/white?text=Pustolovine+Huckleberryja+Finna', '', 'D', 'lektira', 'srednje', 366, '9780142437179', 'Školska knjiga', 1884, 'bosanski', '{"6","7","8","9"}'),

('Put oko svijeta u 80 dana', 'Jules Verne', 'Engleski džentlmen Phileas Fogg kladi se da može obići svijet za osamdeset dana. Uzbudljiva avantura kroz egzotične zemlje puna neizvjesnosti, humora i iznenađenja.', 'https://placehold.co/400x600/FF861C/white?text=Put+oko+svijeta+u+80+dana', '', 'D', 'avantura_fantasy', 'srednje', 278, '9780141441382', 'Školska knjiga', 1873, 'bosanski', '{"5","6","7","8"}'),

('Put u središte Zemlje', 'Jules Verne', 'Profesor Lidenbrock i njegov nećak kreću na nevjerovatno putovanje kroz vulkanski krater do centra Zemlje. Klasična naučnofantastična avantura puna otkrića i opasnosti.', 'https://placehold.co/400x600/FF861C/white?text=Put+u+sredi%C5%A1te+Zemlje', '', 'D', 'avantura_fantasy', 'srednje', 288, '9780141441948', 'Školska knjiga', 1864, 'bosanski', '{"5","6","7","8"}'),

('Robinzon Kruso', 'Daniel Defoe', 'Brodolomac Robinzon Kruso provodi dvadeset osam godina na pustom otoku, preživljavajući zahvaljujući svojoj snalažljivosti i upornosti. Klasična avantura o čovjeku nasuprot prirodi.', 'https://placehold.co/400x600/FF861C/white?text=Robinzon+Kruso', '', 'D', 'lektira', 'srednje', 320, '9780141439822', 'Školska knjiga', 1719, 'bosanski', '{"6","7","8"}'),

('Romeo i Julija', 'William Shakespeare', 'Dva mlada ljubavnika iz zavađenih porodica Montague i Capulet žrtvuju sve za svoju ljubav. Najpoznatija ljubavna tragedija u historiji književnosti o snazi ljubavi i besmislenosti mržnje.', 'https://placehold.co/400x600/FF861C/white?text=Romeo+i+Julija', '', 'O', 'lektira', 'tesko', 140, '9780141396477', 'Školska knjiga', 1597, 'bosanski', '{"8","9","10","11"}'),

('Ružno pače', 'H. C. Andersen', 'Malo pače koje svi smatraju ružnim odrasta u prekrasnog labuda. Poučna bajka o prihvatanju sebe i drugih, o tome da prava ljepota dolazi iznutra i da je svako biće vrijedno ljubavi.', 'https://placehold.co/400x600/FF861C/white?text=Ru%C5%BEno+pa%C4%8De', '', 'M', 'bajke_basne', 'lako', 32, NULL, 'Sarajevo Publishing', 1843, 'bosanski', '{"1","2","3"}'),

('Saga o čuvarima', 'Kathryn Lasky', 'Mlada sova Soren kreće na putovanje da pronađe legendarne Čuvare Ga''Hoolea. Epska fantastična avantura iz perspektive sova o hrabrosti, prijateljstvu i borbi protiv tiranije.', 'https://placehold.co/400x600/FF861C/white?text=Saga+o+%C4%8Duvarima', '', 'D', 'avantura_fantasy', 'srednje', 262, '9780439405577', 'Algoritam', 2003, 'bosanski', '{"4","5","6","7"}'),

('Šest vrana', 'Leigh Bardugo', 'Šest kriminalaca prihvata nemoguću misiju u zamjenu za ogromno bogatstvo. Uzbudljivi fantastični roman prepun prevaranata, magije i nepredvidivih obrata u mračnom svijetu inspirisanom Holandijom.', 'https://placehold.co/400x600/FF861C/white?text=%C5%A0est+vrana', '', 'O', 'avantura_fantasy', 'srednje', 462, '9781627792127', 'Algoritam', 2015, 'bosanski', '{"8","9","10"}'),

('Sidarta', 'Hermann Hesse', 'Mladi Sidarta napušta udoban život u potrazi za duhovnim prosvjetljenjem u drevnoj Indiji. Filozofski roman o traženju smisla života, mudrosti i unutarnjeg mira.', 'https://placehold.co/400x600/FF861C/white?text=Sidarta', '', 'A', 'beletristika', 'tesko', 152, '9780553208849', 'Buybook', 1922, 'bosanski', '{"10","11","12"}'),

('Sjaj u očima', 'Nicholas Sparks', 'Romantična priča o ljubavi koja prevazilazi sve prepreke i osvjetljava najdublje kutke ljudskog srca. Sparksov emotivni roman o snazi istinske ljubavi i žrtvi koje ona zahtijeva.', 'https://placehold.co/400x600/FF861C/white?text=Sjaj+u+o%C4%8Dima', '', 'A', 'beletristika', 'srednje', 352, NULL, 'Algoritam', 2004, 'bosanski', '{"10","11","12"}'),

('Sjena vjetra', 'Carlos Ruiz Zafón', 'Mladi Daniel pronalazi zaboravljenu knjigu na Groblju zaboravljenih knjiga i kreće u potragu za tajanstvenim autorom. Magičan roman o ljubavi prema knjigama, misteriji i Barceloni.', 'https://placehold.co/400x600/FF861C/white?text=Sjena+vjetra', '', 'A', 'beletristika', 'srednje', 487, '9780143034902', 'Buybook', 2001, 'bosanski', '{"9","10","11","12"}'),

('Sjenka i kost', 'Leigh Bardugo', 'Siročica Alina otkriva da posjeduje rijetku moć koja bi mogla spasiti njenu zemlju od Sjene - prostranstva tame punog čudovišta. Fantastični roman inspirisan ruskom kulturom o moći i žrtvi.', 'https://placehold.co/400x600/FF861C/white?text=Sjenka+i+kost', '', 'O', 'avantura_fantasy', 'srednje', 358, '9780805094596', 'Algoritam', 2012, 'bosanski', '{"8","9","10"}'),

('Sjeverna svjetlost (Zlatni kompas)', 'Philip Pullman', 'Jedanaestogodišnja Lyra kreće na opasno putovanje na daleki Sjever da spasi otetu djecu i otkrije tajnu misteriozne čestice Prašine. Epska fantastična avantura i prvi dio trilogije "Njegova tamna tvar".', 'https://placehold.co/400x600/FF861C/white?text=Sjeverna+svjetlost', '', 'D', 'avantura_fantasy', 'srednje', 399, '9780440418320', 'Algoritam', 1995, 'bosanski', '{"6","7","8","9"}'),

('Škola dobru i zlu', 'Soman Chainani', 'Dvije prijateljice Sophie i Agatha bivaju otete u Školu za dobro i zlo, ali na pogrešnim stranama. Maštovita priča o prijateljstvu koja preispituje koncepte dobra i zla u bajkama.', 'https://placehold.co/400x600/FF861C/white?text=%C5%A0kola+dobru+i+zlu', '', 'D', 'avantura_fantasy', 'srednje', 488, '9780062104892', 'Algoritam', 2013, 'bosanski', '{"5","6","7","8"}'),

('Slika Doriana Graya', 'Oscar Wilde', 'Mladi Dorian Gray želi vječnu mladost i ljepotu, pa umjesto njega stari njegov portret dok on živi životom razuzdanog hedonizma. Wildeov klasični roman o moralu, ljepoti i cijeni grešnog života.', 'https://placehold.co/400x600/FF861C/white?text=Slika+Doriana+Graya', '', 'A', 'beletristika', 'tesko', 254, '9780141439570', 'Buybook', 1890, 'bosanski', '{"9","10","11","12"}'),

('Smaragdni grad', 'L. Frank Baum', 'Mala Dorothy i njen pas Toto dolaze u čarobnu zemlju Oz i kreću Žutom cestom od cigle prema Smaragdnom gradu. Klasična bajka o prijateljstvu, hrabrosti i moći želja.', 'https://placehold.co/400x600/FF861C/white?text=Smaragdni+grad', '', 'M', 'bajke_basne', 'lako', 240, '9780141321028', 'Školska knjiga', 1900, 'bosanski', '{"3","4","5","6"}'),

('Smogovci', 'Hrvoje Hitrec', 'Grupa zagrebačke djece poznata kao Smogovci doživljava razne avanture u svom kvartu. Popularna priča o dječjem prijateljstvu, nestašlucima i odrastanju u gradskom okruženju.', 'https://placehold.co/400x600/FF861C/white?text=Smogovci', '', 'D', 'realisticni_roman', 'lako', 176, NULL, 'Školska knjiga', 1976, 'bosanski', '{"4","5","6","7"}'),

('Snjeguljica', 'Braća Grimm', 'Lijepa princeza Snjeguljica bježi od zle maćehe i pronalazi utočište kod sedam patuljaka u šumi. Klasična bajka o ljepoti, zavisti i ljubavi koja pobjeđuje sve zlo.', 'https://placehold.co/400x600/FF861C/white?text=Snjeguljica', '', 'M', 'bajke_basne', 'lako', 32, NULL, 'Sarajevo Publishing', 1812, 'bosanski', '{"1","2","3"}'),

('Srce od tinte', 'Cornelia Funke', 'Meggie otkriva da njen otac Mo može oživjeti likove iz knjiga čitajući naglas. Fantastična avantura o magiji knjiga, moći priča i opasnostima kada fikcija postane stvarnost.', 'https://placehold.co/400x600/FF861C/white?text=Srce+od+tinte', '', 'D', 'avantura_fantasy', 'srednje', 534, '9780439709101', 'Algoritam', 2003, 'bosanski', '{"5","6","7","8"}'),

('Srebrna česma', 'Šimo Ešić', 'Priča o životu u bosanskom selu uz srebrnu česmu koja je centar zajednice. Ešić poetično oslikava ljepotu bosanskog krajolika, tradicije i ljudskih odnosa u ruralnom okruženju.', 'https://placehold.co/400x600/FF861C/white?text=Srebrna+%C4%8Desma', '', 'D', 'lektira', 'srednje', 140, NULL, 'Veselin Masleša', 1980, 'bosanski', '{"5","6","7","8"}'),

('Sretni princ', 'Oscar Wilde', 'Kip Sretnog princa i mala lastavica zajedno pomažu siromašnima u gradu. Dirljiva bajka o nesebičnoj ljubavi, žrtvi i istinskoj ljepoti koja se mjeri dobrim djelima.', 'https://placehold.co/400x600/FF861C/white?text=Sretni+princ', '', 'M', 'bajke_basne', 'lako', 48, NULL, 'Školska knjiga', 1888, 'bosanski', '{"3","4","5","6"}'),

('Starac i more', 'Ernest Hemingway', 'Stari ribar Santiago odlazi daleko u more i hvata ogromnu ribu u epskoj borbi koja traje danima. Hemingwayeva kratka ali duboka priča o čovjekovoj borbi, ponižavanju i nepobijedivom duhu.', 'https://placehold.co/400x600/FF861C/white?text=Starac+i+more', '', 'A', 'beletristika', 'srednje', 127, '9780684801223', 'Buybook', 1952, 'bosanski', '{"9","10","11","12"}'),

('Stepski vuk', 'Hermann Hesse', 'Harry Haller, intelektualac na rubu očaja, otkriva magično pozorište koje mu pokazuje put ka samospoznaji. Hesseov roman o dualnosti ljudske prirode, otuđenosti i potrazi za cjelovitošću.', 'https://placehold.co/400x600/FF861C/white?text=Stepski+vuk', '', 'A', 'beletristika', 'tesko', 248, '9780312278496', 'Buybook', 1927, 'bosanski', '{"11","12"}'),

('Sto godina samoće', 'Gabriel García Márquez', 'Saga o porodici Buendía u izmišljenom gradu Macondu koja prati sedam generacija kroz sto godina ljubavi, rata i čuda. Vrhunsko djelo magičnog realizma i jedan od najznačajnijih romana 20. vijeka.', 'https://placehold.co/400x600/FF861C/white?text=Sto+godina+samo%C4%87e', '', 'A', 'beletristika', 'tesko', 417, '9780060883287', 'Buybook', 1967, 'bosanski', '{"11","12"}'),

('Strah u Ulici lipa', 'Milivoj Matošec', 'Djeca iz Ulice lipa suočavaju se s misterioznim događajima koji izazivaju strah u njihovom kvartu. Napeta dječja avantura puna misterije, hrabrosti i dječjeg detektivskog duha.', 'https://placehold.co/400x600/FF861C/white?text=Strah+u+Ulici+lipa', '', 'D', 'avantura_fantasy', 'lako', 160, NULL, 'Školska knjiga', 1958, 'bosanski', '{"4","5","6","7"}'),

('Stranac', 'Albert Camus', 'Meursault, ravnodušan prema svijetu oko sebe, počini ubojstvo na plaži i biva osuđen više zbog svojeg stava nego zločina. Camusov egzistencijalistički roman o apsurdnosti ljudskog postojanja.', 'https://placehold.co/400x600/FF861C/white?text=Stranac', '', 'A', 'beletristika', 'tesko', 123, '9780679720201', 'Buybook', 1942, 'bosanski', '{"10","11","12"}'),

('Sumnjivo lice', 'Branislav Nušić', 'Satirična komedija o malom čovjeku koji biva pogrešno optužen da je sumnjivo lice i špijon. Nušićev humor razotkriva birokratsku apsurdnost, korupciju i strah od vlasti.', 'https://placehold.co/400x600/FF861C/white?text=Sumnjivo+lice', '', 'O', 'lektira', 'srednje', 128, NULL, 'Školska knjiga', 1887, 'bosanski', '{"8","9","10"}'),

('Sumrak saga', 'Stephenie Meyer', 'Bella Swan se seli u mali grad i zaljubljuje u Edwarda Cullena, vampira koji se bori da joj ne naudi. Romantična fantazija o zabranjenoj ljubavi između smrtnice i besmrtnog bića.', 'https://placehold.co/400x600/FF861C/white?text=Sumrak+saga', '', 'O', 'avantura_fantasy', 'srednje', 498, '9780316160179', 'Algoritam', 2005, 'bosanski', '{"7","8","9","10"}'),

('Sunčani kristali', 'Advan Hozić', 'Priča o bosanskom djetinjstvu ispunjena suncem, igrom i ljepotom odrastanja u okrilju prirode. Hozić nježno opisuje svakodnevne radosti i tuge dječjeg života u bosanskom kraju.', 'https://placehold.co/400x600/FF861C/white?text=Sun%C4%8Dani+kristali', '', 'D', 'lektira', 'lako', 120, NULL, 'Veselin Masleša', 1975, 'bosanski', '{"4","5","6"}'),

('Sve, baš sve', 'Nicola Yoon', 'Osamnaestogodišnja Madeline nije napuštala kuću cijeli život zbog rijetke bolesti. Kad upozna susjednog dječaka Ollyja, počinje preispitivati sve što zna o svom životu i slobodi.', 'https://placehold.co/400x600/FF861C/white?text=Sve%2C+ba%C5%A1+sve', '', 'O', 'realisticni_roman', 'lako', 306, '9780553496642', 'Buybook', 2015, 'bosanski', '{"8","9","10"}'),

('Svijet po Bobu', 'James Bowen', 'Istinita priča o uličnom svirču Jamesu i mačku po imenu Bob koji mu mijenja život. Dirljiv roman o prijateljstvu između čovjeka i životinje, drugoj šansi i moći ljubavi.', 'https://placehold.co/400x600/FF861C/white?text=Svijet+po+Bobu', '', 'D', 'realisticni_roman', 'lako', 280, '9781250048677', 'Buybook', 2013, 'bosanski', '{"5","6","7","8"}'),

('Tajna mračnog podruma', 'Enid Blyton', 'Grupa djece otkriva tajnu u mračnom podrumu starog zdanja i upušta se u uzbudljivu istragu. Klasična dječja misterija puna napetosti, zagonetki i dječje hrabrosti.', 'https://placehold.co/400x600/FF861C/white?text=Tajna+mra%C4%8Dnog+podruma', '', 'D', 'avantura_fantasy', 'lako', 160, NULL, 'Školska knjiga', 1950, 'bosanski', '{"4","5","6","7"}'),

('Tajni dnevnik Adriana Molea', 'Sue Townsend', 'Tinejdžer Adrian Mole bilježi svoje svakodnevne nevolje, ljubavne jade i obiteljske probleme u dnevnik. Izuzetno smiješan roman o odrastanju koji je postao kultna knjiga generacija čitalaca.', 'https://placehold.co/400x600/FF861C/white?text=Tajni+dnevnik+Adriana+Molea', '', 'O', 'realisticni_roman', 'lako', 272, '9780060533991', 'Algoritam', 1982, 'bosanski', '{"7","8","9"}'),

('Tajni vrt', 'Frances Hodgson Burnett', 'Razmazena Mary Lennox dolazi u Yorkshire i otkriva zaključani vrt koji niko nije posjetio godinama. Čarobna priča o iscjeljujućoj moći prirode, prijateljstva i ljubavi.', 'https://placehold.co/400x600/FF861C/white?text=Tajni+vrt', '', 'D', 'realisticni_roman', 'lako', 288, '9780141321066', 'Školska knjiga', 1911, 'bosanski', '{"4","5","6","7"}'),

('Tiha rijeka djetinjstva', 'Alija Dubočanin', 'Nostalgična priča o djetinjstvu uz bosansku rijeku, gdje se svakodnevni život pretače u poetske slike. Dubočanin s ljubavlju oslikava bezbrižnost djetinjstva i ljepotu rodnog kraja.', 'https://placehold.co/400x600/FF861C/white?text=Tiha+rijeka+djetinjstva', '', 'D', 'lektira', 'srednje', 130, NULL, 'Veselin Masleša', 1990, 'bosanski', '{"5","6","7"}'),

('Tom Sojer', 'Mark Twain', 'Nestašni Tom Sojer živi s tetkom Polly u malom gradiću na obali Mississippija i upušta se u nezaboravne avanture s prijateljem Huckleberryjem Finnom. Klasična priča o djetinjstvu, prijateljstvu i slobodi.', 'https://placehold.co/400x600/FF861C/white?text=Tom+Sojer', '', 'D', 'lektira', 'srednje', 274, '9780141321103', 'Školska knjiga', 1876, 'bosanski', '{"5","6","7","8"}'),

('Ubiti pticu rugalicu', 'Harper Lee', 'Mlada Scout Finch promatra kako njen otac, advokat Atticus, brani crnca optuženog za zločin u rasistički nastrojenom američkom Jugu. Snažan roman o pravdi, predrasudama i moralnoj hrabrosti.', 'https://placehold.co/400x600/FF861C/white?text=Ubiti+pticu+rugalicu', '', 'A', 'beletristika', 'srednje', 281, '9780061120084', 'Buybook', 1960, 'bosanski', '{"9","10","11","12"}'),

('Umorstva u ulici Morgue', 'Edgar Allan Poe', 'Detektiv Auguste Dupin istražuje stravično ubojstvo u zaključanom stanu u pariškoj ulici Morgue. Poeova priča koja je utemeljila žanr detektivske priče puna je misterije i logičke dedukcije.', 'https://placehold.co/400x600/FF861C/white?text=Umorstva+u+ulici+Morgue', '', 'A', 'beletristika', 'tesko', 48, NULL, 'Buybook', 1841, 'bosanski', '{"9","10","11","12"}'),

('Uzbuna na Zelenom Vrhu', 'Ivan Kušan', 'Dječaci sa Zelenog Vrha otkrivaju lopova koji krade po njihovom kvartu i odlučuju ga sami uhvatiti. Napeta i zabavna dječja detektivska priča o drugarstvu i dječjoj hrabrosti.', 'https://placehold.co/400x600/FF861C/white?text=Uzbuna+na+Zelenom+Vrhu', '', 'D', 'lektira', 'lako', 160, NULL, 'Školska knjiga', 1956, 'bosanski', '{"4","5","6","7"}'),

('Veliki dobroćudni džin', 'Roald Dahl', 'Mala Sophie biva oteta od strane VDD-a, jedinog dobrog diva u zemlji divova. Zajedno smišljaju plan da zaustave ostale divove koji jedu djecu. Maštovita i smiješna priča o prijateljstvu.', 'https://placehold.co/400x600/FF861C/white?text=Veliki+dobro%C4%87udni+d%C5%BEin', '', 'M', 'avantura_fantasy', 'lako', 208, '9780142410387', 'Algoritam', 1982, 'bosanski', '{"3","4","5","6"}'),

('Veliki Gatsby', 'F. Scott Fitzgerald', 'Tajanstveni milioner Jay Gatsby organizira raskošne zabave u nadi da će ponovo osvojiti ljubav svog života, Daisy Buchanan. Klasični američki roman o Američkom snu, bogatstvu i iluziji ljubavi.', 'https://placehold.co/400x600/FF861C/white?text=Veliki+Gatsby', '', 'A', 'beletristika', 'tesko', 180, '9780743273565', 'Buybook', 1925, 'bosanski', '{"10","11","12"}'),

('Vjetar u vrbama', 'Kenneth Grahame', 'Krtica, Vodena voluharica, Jazavac i šašavi Gospodin Žaba doživljavaju avanture uz obalu rijeke. Čarobna priča o prijateljstvu, prirodi i radostima jednostavnog života.', 'https://placehold.co/400x600/FF861C/white?text=Vjetar+u+vrbama', '', 'M', 'bajke_basne', 'lako', 224, '9780141321127', 'Školska knjiga', 1908, 'bosanski', '{"3","4","5","6"}'),

('Vodič kroz galaksiju za autostopere', 'Douglas Adams', 'Arthur Dent bježi sa Zemlje trenutak prije njenog uništenja i kreće na lude avanture kroz galaksiju. Kultna naučnofantastična komedija puna apsurdnog humora i filozofskih pitanja.', 'https://placehold.co/400x600/FF861C/white?text=Vodi%C4%8D+kroz+galaksiju', '', 'O', 'avantura_fantasy', 'srednje', 224, '9780345391803', 'Algoritam', 1979, 'bosanski', '{"8","9","10","11"}'),

('Vrli novi svijet', 'Aldous Huxley', 'U budućnosti ljudi se proizvode u laboratorijama i kontrolišu drogom sreće. Bernard Marx počinje preispitivati savršeno uređeno društvo. Vizionarski roman o cijeni utopije i slobode volje.', 'https://placehold.co/400x600/FF861C/white?text=Vrli+novi+svijet', '', 'A', 'beletristika', 'tesko', 288, '9780060850524', 'Buybook', 1932, 'bosanski', '{"10","11","12"}'),

('Warrior Cats (Ratnički mačci)', 'Erin Hunter', 'Kućni mačak Rusty odlazi u šumu i pridružuje se klanu divljih mačaka, prihvatajući ime Vatrena Šapa. Epska fantastična saga o hrabrosti, lojalnosti i borbi za opstanak među mačjim ratnicima.', 'https://placehold.co/400x600/FF861C/white?text=Ratni%C4%8Dki+ma%C4%8Dci', '', 'D', 'avantura_fantasy', 'srednje', 272, '9780062366962', 'Algoritam', 2003, 'bosanski', '{"4","5","6","7"}'),

('Zaboravljeni sin', 'Miro Gavran', 'Priča o dječaku koji se osjeća zapostavljenim u vlastitoj porodici i traži načine da privuče pažnju i ljubav. Gavran vješto oslikava dječji unutarnji svijet i potrebu za razumijevanjem.', 'https://placehold.co/400x600/FF861C/white?text=Zaboravljeni+sin', '', 'D', 'realisticni_roman', 'lako', 128, NULL, 'Školska knjiga', 1996, 'bosanski', '{"4","5","6","7"}'),

('Zabranjena vrata', 'Zlatko Krilić', 'Dječja detektivska priča u kojoj grupa djece otkriva tajnu iza zabranjenih vrata u starom zdanju. Napeta avantura prepuna misterije, hrabrosti i dječje znatiželje.', 'https://placehold.co/400x600/FF861C/white?text=Zabranjena+vrata', '', 'D', 'avantura_fantasy', 'lako', 120, NULL, 'Školska knjiga', 1986, 'bosanski', '{"4","5","6"}'),

('Zelena šuma', 'Ahmet Hromadžić', 'Čarobne priče iz bosanske zelene šume ispunjene životinjama, vilama i tajnama prirode. Hromadžić stvara magičan svijet u kojem djeca uče o poštovanju prirode i životnih vrijednosti.', 'https://placehold.co/400x600/FF861C/white?text=Zelena+%C5%A1uma', '', 'M', 'bajke_basne', 'lako', 96, NULL, 'Veselin Masleša', 1955, 'bosanski', '{"2","3","4","5"}'),

('Životinjska farma', 'George Orwell', 'Životinje na farmi zbacuju okrutnog farmera i uspostavljaju vlastitu vlast, ali svinje postepeno preuzimaju kontrolu. Satirična alegorija o revoluciji, moći i korupciji koja odzvanja kroz decenije.', 'https://placehold.co/400x600/FF861C/white?text=%C5%BDivotinjska+farma', '', 'A', 'beletristika', 'srednje', 112, '9780451526342', 'Buybook', 1945, 'bosanski', '{"9","10","11","12"}'),

('Zlatarovo zlato', 'August Šenoa', 'Ljubavna priča o zlatarjevoj kćeri Dori i plemiću Pavlu u srednjovjekovnom Zagrebu, na pozadini sukoba građana i plemstva. Šenoin najpoznatiji roman je temelj moderne hrvatske književnosti.', 'https://placehold.co/400x600/FF861C/white?text=Zlatarovo+zlato', '', 'O', 'lektira', 'tesko', 380, NULL, 'Školska knjiga', 1871, 'bosanski', '{"8","9","10"}'),

('Zločinci', 'Aaron Blabey', 'Nastavak avantura Loših momaca koji sada moraju spasiti svijet od pravih zločinaca. Ilustrovana knjiga puna humora, akcije i poruke da i najgori momci mogu postati heroji.', 'https://placehold.co/400x600/FF861C/white?text=Zlo%C4%8Dinci', '', 'M', 'avantura_fantasy', 'lako', 140, NULL, 'Algoritam', 2016, 'bosanski', '{"2","3","4","5"}'),

('Znam zašto ptica u kavezu pjeva', 'Maya Angelou', 'Autobiografski roman o odrastanju Maye Angelou kao crnkinje na američkom Jugu suočene s rasizmom i traumom. Snažna priča o otporu, identitetu i snazi ljudskog duha koja nadilazi okolnosti.', 'https://placehold.co/400x600/FF861C/white?text=Znam+za%C5%A1to+ptica+pjeva', '', 'A', 'beletristika', 'tesko', 289, '9780345514400', 'Buybook', 1969, 'bosanski', '{"10","11","12"}'),

('Zov divljine', 'Jack London', 'Pas Buck biva ukraden iz udobnog doma i odveden na Aljasku gdje mora preživjeti u surovoj divljini. Snažna priča o instinktu, preživljavanju i zovu divlje prirode.', 'https://placehold.co/400x600/FF861C/white?text=Zov+divljine', '', 'D', 'avantura_fantasy', 'srednje', 128, '9780141321059', 'Školska knjiga', 1903, 'bosanski', '{"6","7","8"}'),

('Zvjezdana prašina', 'Neil Gaiman', 'Mladi Tristan prelazi zid između našeg svijeta i čarobne zemlje da bi pronašao palu zvijezdu za djevojku koju voli. Čarobna priča o ljubavi, avanturi i magiji koja podsjeća na klasične bajke.', 'https://placehold.co/400x600/FF861C/white?text=Zvjezdana+pra%C5%A1ina', '', 'O', 'avantura_fantasy', 'srednje', 248, '9780061142024', 'Algoritam', 1999, 'bosanski', '{"7","8","9","10"}');
