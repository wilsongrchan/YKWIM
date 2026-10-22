// YKWIM game rules. Authoritative: runs in the host's browser (and in node for tests).
// Clients send intents via handle(); every peer gets its own filtered view() so hidden info
// (the keyword, the clues) only reaches the people allowed to see it.
(function (root) {
  // Word bank. Single words are separated by spaces. Celebrities, characters, historical figures, brands and sayings use | between entries (they contain
  // spaces) and only appear in the top level. Which level a plain word belongs to is worked out from its length (see TIERS).
  const BANK_EN = {
    Animals: 'zebra dolphin penguin kangaroo giraffe octopus eagle rabbit spider elephant monkey parrot tiger panda koala otter camel horse sheep goose swan frog crab shark whale lion bear wolf fox deer crocodile chimpanzee hippopotamus flamingo porcupine butterfly grasshopper scorpion hedgehog squirrel cheetah leopard peacock pelican gorilla jaguar turtle lizard donkey beaver walrus ostrich seagull dragonfly caterpillar',
    Food: 'pizza cheese waffle noodle cookie pumpkin lemon honey yogurt ketchup apple orange banana cherry grape mango peach melon bread butter pasta salad soup sushi burger pancake sandwich spaghetti chocolate strawberry watermelon blueberry cucumber mushroom broccoli cinnamon pineapple avocado croissant lasagna pretzel popcorn cupcake pepper tomato potato carrot coconut raspberry marshmallow hamburger',
    'Places & buildings': 'island jungle desert glacier volcano library harbor castle forest valley lighthouse mountain beach canyon bridge museum airport stadium hospital cathedral playground waterfall skyscraper restaurant supermarket aquarium observatory village garden farm cave tunnel palace temple pyramid',
    Cities: 'paris london tokyo taipei rome berlin madrid dubai cairo seoul lima oslo vienna prague dublin lisbon athens moscow sydney boston miami seattle chicago toronto beijing bangkok istanbul mumbai shanghai florence venice kyoto osaka honolulu barcelona amsterdam singapore stockholm vancouver melbourne edinburgh copenhagen manila hanoi nairobi marrakech jerusalem budapest brussels',
    Objects: 'umbrella mirror candle scissors compass wallet helmet camera clock ladder kettle blanket pencil bottle basket hammer needle button pillow guitar telescope microscope typewriter calculator suitcase flashlight toothbrush screwdriver wheelbarrow thermometer notebook backpack bicycle balloon lantern trumpet keyboard envelope television refrigerator',
    Nature: 'ocean river rainbow thunder eclipse iceberg feather marble shadow cactus lightning blizzard tornado avalanche earthquake hurricane sunrise sunset meadow thunderstorm volcano pebble coral glacier',
    Fantasy: 'dragon wizard unicorn vampire pirate robot snowman rocket mermaid goblin phoenix werewolf spaceship dinosaur astronaut superhero treasure scarecrow giant fairy ghost castle zombie',
    Jobs: 'doctor teacher farmer pilot painter chef nurse dentist firefighter astronaut carpenter plumber electrician photographer journalist librarian detective scientist veterinarian baker waiter singer driver lawyer mechanic engineer',
    'Sports & activities': 'soccer tennis hockey cricket boxing karate rugby golf swimming basketball volleyball badminton gymnastics snowboarding marathon archery surfing skiing cycling bowling fencing wrestling',
    Celebrities: 'taylor swift|ed sheeran|billie eilish|ariana grande|justin bieber|lady gaga|bruno mars|elvis presley|michael jackson|madonna|rihanna|harry styles|dua lipa|katy perry|shakira|adele|beyonce|drake|tom hanks|leonardo dicaprio|brad pitt|angelina jolie|johnny depp|will smith|meryl streep|keanu reeves|scarlett johansson|dwayne johnson|jennifer lawrence|emma watson|tom cruise|morgan freeman|denzel washington|zendaya|margot robbie|ryan reynolds|chris hemsworth|jackie chan|bruce lee|marilyn monroe|lionel messi|cristiano ronaldo|michael jordan|lebron james|serena williams|usain bolt',
    Characters: 'sherlock holmes|mickey mouse|harry potter|santa claus|winnie the pooh|peter pan|captain hook|robin hood|snow white|spider man|super mario|pikachu|cinderella|batman|sleeping beauty|alice in wonderland|king arthur|darth vader|donald duck|bugs bunny|sonic the hedgehog|wonder woman',
    'Historical figures': 'cleopatra|napoleon|albert einstein|leonardo da vinci|william shakespeare|abraham lincoln|marie curie|isaac newton|julius caesar|christopher columbus|queen victoria|martin luther king|mahatma gandhi|joan of arc|alexander the great|neil armstrong',
    'Brands & companies': 'starbucks|trader joes|amazon|nike|google|netflix|disney|mcdonalds|coca cola|pepsi|ikea|costco|walmart|target|tesla|spotify|youtube|instagram|lego|adidas|samsung|toyota|ferrari|nintendo|playstation|uber|airbnb|whole foods|burger king|kfc|subway|dominos|pizza hut|taco bell|chipotle|dunkin|sephora|zara|uniqlo|lululemon|patagonia|the north face|microsoft|facebook|paypal|ubereats|ebay|tiktok|snapchat|visa|red bull|nutella|oreo|kitkat|lays|doritos|heinz|nestle|colgate|sony|nokia|ford|honda|boeing|ryanair|marriott|hilton',
    Sayings: 'ice cream@Food|hot dog@Food|birthday party@Sports & activities|swimming pool@Places & buildings|peanut butter@Food|traffic light@Objects|rainy day@Nature|board game@Sports & activities|fire truck@Objects|polar bear@Animals|movie theater@Places & buildings|bubble bath@Sports & activities|scary movie@Sports & activities|road trip@Sports & activities|pillow fight@Sports & activities|piece of cake|break the ice|under the weather|once in a blue moon|cold shoulder|home sweet home|fish out of water|bucket list|cat nap@Sports & activities|sleeping bag@Objects|water slide@Objects|roller coaster@Objects|chocolate cake@Food|pizza party@Sports & activities|snow angel@Sports & activities|treasure map@Objects|hot air balloon@Objects|time machine@Objects|magic carpet@Objects|best friends|full moon@Nature|day off@Sports & activities|big apple@Places & buildings|funny bone|sweet tooth|piggy bank@Objects|san francisco@Cities|new york@Cities|los angeles@Cities|las vegas@Cities|hong kong@Cities|rio de janeiro@Cities|mexico city@Cities|buenos aires@Cities|cape town@Cities|san diego@Cities|new orleans@Cities|kuala lumpur@Cities|tel aviv@Cities|abu dhabi@Cities'
  };
  // The same fifteen categories in Spanish and French: the room's keyword language picks which bank the words come from.
  const BANK_ES = {
    "Animals": "perro gato caballo vaca oveja cabra cerdo conejo ratón león tigre oso lobo zorro jirafa cebra elefante mono gorila panda koala canguro delfín ballena tiburón pulpo medusa tortuga cocodrilo serpiente lagarto rana sapo águila búho loro pingüino flamenco pavo gallina pato cisne paloma gaviota murciélago hormiga abeja mariposa araña escarabajo mosquito libélula caracol cangrejo langosta foca morsa nutria castor ardilla erizo camello burro hipopótamo rinoceronte leopardo guepardo puma lince ciervo alce jabalí avestruz colibrí hámster gorrión ruiseñor tucán pelícano mapache zorrillo armadillo orangután chimpancé bisonte",
    "Food": "pizza queso pan leche huevo arroz pasta sopa ensalada manzana naranja plátano fresa uva piña sandía melón limón cereza pera durazno mango aguacate tomate patata zanahoria cebolla ajo pimiento lechuga pepino champiñón brócoli maíz frijol lenteja garbanzo chocolate helado galleta pastel tarta mantequilla yogur miel azúcar sal aceite vinagre mermelada hamburguesa sándwich tortilla taco empanada paella churro croqueta jamón salchicha pollo carne pescado atún gamba calamar espagueti lasaña palomitas cacahuete almendra nuez coco kiwi albaricoque ciruela arándano frambuesa espinaca calabaza berenjena",
    "Places & buildings": "isla selva desierto glaciar volcán biblioteca puerto castillo bosque valle faro montaña playa cañón puente museo aeropuerto estadio hospital catedral parque cascada rascacielos restaurante supermercado acuario observatorio pueblo jardín granja cueva túnel palacio templo pirámide escuela iglesia mercado estación farmacia panadería cárcel teatro cine hotel banco plaza universidad aeropuerto cementerio zoológico pantano oasis laguna acantilado península archipiélago",
    "Cities": "parís londres tokio taipéi roma berlín madrid dubái cairo seúl lima oslo viena praga dublín lisboa atenas moscú sídney boston miami seattle chicago toronto pekín bangkok estambul bombay shanghái florencia venecia kioto osaka honolulu barcelona ámsterdam singapur estocolmo vancouver melbourne edimburgo copenhague manila hanói nairobi marrakech jerusalén budapest bruselas sevilla valencia bogotá quito caracas santiago granada toledo córdoba bilbao zaragoza cancún medellín montevideo asunción",
    "Objects": "paraguas espejo vela tijeras brújula cartera casco cámara reloj escalera tetera manta lápiz botella cesta martillo aguja botón almohada guitarra telescopio microscopio calculadora maleta linterna cepillo destornillador carretilla termómetro cuaderno mochila bicicleta globo trompeta teclado sobre televisión nevera lámpara silla mesa cama sofá ventana puerta llave moneda anillo collar corona bolso zapato calcetín camiseta pantalón sombrero guante bufanda sartén cuchillo tenedor cuchara plato vaso taza aspiradora secador ordenador teléfono impresora cargador auriculares",
    "Nature": "océano río arcoíris trueno eclipse iceberg pluma mármol sombra cactus relámpago ventisca tornado avalancha terremoto huracán amanecer atardecer pradera tormenta guijarro coral glaciar luna sol estrella nube lluvia nieve viento niebla rocío arena montaña cometa meteorito galaxia aurora tsunami manantial géiser dunas",
    "Fantasy": "dragón mago unicornio vampiro pirata robot muñeco cohete sirena duende fénix licántropo nave dinosaurio astronauta superhéroe tesoro espantapájaros gigante hada fantasma castillo zombi bruja ogro elfo troll genio centauro esfinge quimera extraterrestre alienígena momia calavera",
    "Jobs": "médico maestro granjero piloto pintor cocinero enfermera dentista bombero astronauta carpintero fontanero electricista fotógrafo periodista bibliotecario detective científico veterinario panadero camarero cantante conductor abogado mecánico ingeniero arquitecto cartero policía soldado juez peluquero actor bailarín escritor profesor jardinero pescador marinero payaso mago músico",
    "Sports & activities": "fútbol tenis hockey críquet boxeo karate rugby golf natación baloncesto voleibol bádminton gimnasia snowboard maratón esquí surf ciclismo bolos esgrima lucha béisbol atletismo yoga baile senderismo pesca patinaje buceo escalada remo vela balonmano waterpolo triatlón",
    "Celebrities": "shakira|rosalía|bad bunny|enrique iglesias|penélope cruz|antonio banderas|salma hayek|javier bardem|lionel messi|rafael nadal|michael jackson|madonna|beyoncé|taylor swift|ed sheeran|lady gaga|brad pitt|tom hanks|will smith|leonardo dicaprio|jackie chan|bruce lee|marilyn monroe|charles chaplin|cristiano ronaldo|michael jordan|serena williams|usain bolt|diego maradona|pelé|julio iglesias|alejandro sanz|ricky martin|maluma|jennifer lópez|gael garcía bernal|sofía vergara|carlos alcaraz|pau gasol|fernando alonso|paco de lucía|gloria estefan|celia cruz|gabriel garcía márquez",
    "Characters": "sherlock holmes|mickey mouse|harry potter|papá noel|winnie the pooh|peter pan|capitán garfio|robin hood|blancanieves|spider man|super mario|pikachu|cenicienta|batman|la bella durmiente|alicia en el país de las maravillas|rey arturo|darth vader|pato donald|bugs bunny|sonic|mujer maravilla|don quijote|sancho panza|el zorro|el chavo|mafalda|astérix|dora la exploradora|bob esponja|el principito|pinocho|caperucita roja|aladdín|shrek|mulán|rapunzel|frozen|simba|superman|hulk|homer simpson",
    "Historical figures": "cleopatra|napoleón|albert einstein|leonardo da vinci|william shakespeare|abraham lincoln|marie curie|isaac newton|julio césar|cristóbal colón|reina victoria|martin luther king|mahatma gandhi|juana de arco|alejandro magno|neil armstrong|simón bolívar|miguel de cervantes|pablo picasso|salvador dalí|isabel la católica|hernán cortés|che guevara|benito juárez|frida kahlo|diego rivera|francisco goya|velázquez|nelson mandela|madre teresa|galileo galilei|charles darwin|mozart|beethoven",
    "Brands & companies": "starbucks|zara|mercadona|amazon|nike|google|netflix|disney|coca cola|pepsi|ikea|costco|walmart|tesla|spotify|youtube|instagram|lego|adidas|samsung|toyota|ferrari|nintendo|playstation|uber|airbnb|burger king|kfc|subway|dominos|pizza hut|telepizza|mcdonalds|iberia|movistar|santander|bbva|seat|desigual|mango|bershka|nutella|oreo|kitkat|doritos|heinz|nestlé|colgate|sony|nokia|ford|honda|boeing|ryanair|marriott|hilton|el corte inglés|cemex|bimbo|oxxo|rappi|mercado libre|inditex|repsol|telefónica|renfe|vueling|havaianas|cola cao",
    "Sayings": "estar en las nubes|ser pan comido|meter la pata|tomar el pelo|costar un ojo de la cara|hablar por los codos|estar como una cabra|no tener pelos en la lengua|dormir como un lirón|ponerse las pilas|a mal tiempo buena cara|más vale tarde que nunca|quien ríe último ríe mejor|ojo por ojo|luna de miel|cuento de hadas|montaña rusa@Objects|globo aerostático@Objects|máquina del tiempo@Objects|alfombra mágica@Objects|mapa del tesoro@Objects|saco de dormir@Objects|tobogán de agua@Objects|hucha@Objects|oso polar@Animals|pastel de chocolate@Food|perro caliente@Food|mantequilla de maní@Food|luna llena@Nature|piscina@Places & buildings|ciudad de méxico@Cities|buenos aires@Cities|nueva york@Cities|los ángeles@Cities|san francisco@Cities|río de janeiro@Cities|ciudad del cabo@Cities|hong kong@Cities|las vegas@Cities|nueva orleans@Cities|kuala lumpur@Cities|abu dabi@Cities|tel aviv@Cities|san juan@Cities|santo domingo@Cities|punta cana@Cities|puerto vallarta@Cities|castillo de arena@Places & buildings|fuegos artificiales@Objects|cámara lenta|noche buena|año nuevo|día libre@Sports & activities|fiesta de cumpleaños@Sports & activities|viaje por carretera@Sports & activities|batalla de almohadas@Sports & activities"
  };
  const BANK_FR = {
    "Animals": "chien chat cheval vache mouton chèvre cochon lapin souris lion tigre ours loup renard girafe zèbre éléphant singe gorille panda koala kangourou dauphin baleine requin pieuvre méduse tortue crocodile serpent lézard grenouille crapaud aigle hibou perroquet pingouin flamant dinde poule canard cygne pigeon mouette fourmi abeille papillon araignée scarabée moustique libellule escargot crabe homard phoque morse loutre castor écureuil hérisson chameau âne hippopotame rhinocéros léopard guépard puma lynx cerf élan sanglier autruche colibri hamster moineau rossignol toucan pélican ornithorynque chimpanzé bison",
    "Food": "pizza fromage pain lait riz pâtes soupe salade pomme orange banane fraise raisin ananas pastèque melon citron cerise poire pêche mangue avocat tomate carotte oignon ail poivron laitue concombre champignon brocoli maïs haricot lentille chocolat glace biscuit gâteau tarte beurre yaourt miel sucre sel huile vinaigre confiture hamburger sandwich crêpe croissant baguette fondue raclette quiche cassoulet ratatouille jambon saucisse poulet viande poisson thon crevette calamar spaghetti lasagnes cacahuète amande noix noisette kiwi abricot prune myrtille framboise épinards courgette aubergine citrouille",
    "Places & buildings": "île jungle désert glacier volcan bibliothèque port château forêt vallée phare montagne plage canyon pont musée aéroport stade hôpital cathédrale parc cascade restaurant supermarché aquarium observatoire village jardin ferme grotte tunnel palais temple pyramide école église marché gare pharmacie boulangerie prison théâtre cinéma hôtel banque place université cimetière marais oasis lagune falaise archipel",
    "Cities": "paris londres tokyo taipei rome berlin madrid dubaï séoul lima oslo vienne prague dublin lisbonne athènes moscou sydney boston miami seattle chicago toronto pékin bangkok istanbul bombay shanghai florence venise kyoto osaka honolulu barcelone amsterdam singapour stockholm vancouver melbourne édimbourg copenhague manille hanoï nairobi marrakech jérusalem budapest bruxelles lyon marseille bordeaux toulouse nice lille nantes strasbourg genève montréal québec avignon rennes grenoble dijon cannes biarritz casablanca tunis alger dakar abidjan",
    "Objects": "parapluie miroir bougie ciseaux boussole portefeuille casque appareil horloge échelle bouilloire couverture crayon bouteille panier marteau aiguille bouton oreiller guitare télescope microscope calculatrice valise lampe brosse tournevis brouette thermomètre cahier sac vélo ballon lanterne trompette clavier enveloppe télévision frigo table chaise lit canapé fenêtre porte clé pièce bague collier couronne chapeau gant écharpe chaussure chaussette pantalon poêle couteau fourchette cuillère assiette verre tasse aspirateur sèche ordinateur téléphone imprimante chargeur écouteurs",
    "Nature": "océan rivière tonnerre éclipse iceberg plume marbre ombre cactus éclair blizzard tornade avalanche séisme ouragan aube crépuscule prairie tempête galet corail glacier lune soleil étoile nuage pluie neige vent brouillard rosée sable comète météorite galaxie aurore tsunami source geyser dunes",
    "Fantasy": "dragon magicien licorne vampire pirate robot bonhomme fusée sirène lutin phénix sorcière vaisseau dinosaure astronaute superhéros trésor épouvantail géant fée fantôme château zombie sorcier ogre elfe troll génie centaure sphinx chimère extraterrestre momie squelette",
    "Jobs": "médecin instituteur fermier pilote peintre cuisinier infirmière dentiste pompier astronaute menuisier plombier électricien photographe journaliste bibliothécaire détective scientifique vétérinaire boulanger serveur chanteur chauffeur avocat mécanicien ingénieur architecte facteur policier soldat juge coiffeur acteur danseur écrivain professeur jardinier pêcheur marin clown musicien",
    "Sports & activities": "football tennis hockey cricket boxe karaté rugby golf natation basket volley badminton gymnastique snowboard marathon ski surf cyclisme bowling escrime lutte baseball athlétisme yoga danse randonnée pêche patinage plongée escalade aviron voile handball triathlon",
    "Celebrities": "johnny hallyday|édith piaf|charles aznavour|jean reno|marion cotillard|omar sy|zinedine zidane|kylian mbappé|michael jackson|madonna|beyoncé|taylor swift|ed sheeran|lady gaga|brad pitt|tom hanks|will smith|leonardo dicaprio|jackie chan|bruce lee|marilyn monroe|charlie chaplin|cristiano ronaldo|michael jordan|serena williams|usain bolt|gérard depardieu|catherine deneuve|louis de funès|jean dujardin|céline dion|stromae|angèle|coluche|thierry henry|tony parker|brigitte bardot|alain delon|audrey tautou|vincent cassel|léa seydoux|jamel debbouze|dany boon|gad elmaleh|mylène farmer|daft punk",
    "Characters": "sherlock holmes|mickey mouse|harry potter|père noël|winnie|peter pan|capitaine crochet|robin des bois|blanche neige|spider man|super mario|pikachu|cendrillon|batman|la belle au bois dormant|alice au pays des merveilles|roi arthur|dark vador|donald duck|bugs bunny|sonic|wonder woman|don quichotte|lucky luke|titeuf|babar|le chat botté|le petit chaperon rouge|bob léponge|shrek|mulan|aladdin|raiponce|la reine des neiges|astérix|obélix|tintin|le petit prince|pinocchio|superman|hulk|homer simpson",
    "Historical figures": "cléopâtre|napoléon|albert einstein|léonard de vinci|william shakespeare|abraham lincoln|marie curie|isaac newton|jules césar|christophe colomb|reine victoria|martin luther king|mahatma gandhi|jeanne d arc|alexandre le grand|neil armstrong|louis xiv|charles de gaulle|victor hugo|molière|louis pasteur|marie antoinette|pablo picasso|claude monet|vincent van gogh|nelson mandela|mère teresa|galilée|charles darwin|mozart|beethoven|simone veil|coco chanel|jacques cousteau",
    "Brands & companies": "starbucks|carrefour|decathlon|auchan|leclerc|renault|peugeot|citroën|michelin|danone|lacoste|chanel|dior|louis vuitton|hermès|sncf|air france|orange|société générale|bnp paribas|amazon|nike|google|netflix|disney|coca cola|pepsi|ikea|tesla|spotify|youtube|instagram|lego|adidas|samsung|toyota|ferrari|nintendo|playstation|uber|airbnb|burger king|kfc|subway|dominos|mcdonalds|quick|nutella|oreo|kitkat|doritos|heinz|nestlé|colgate|sony|nokia|ford|honda|boeing|ryanair|marriott|hilton|bic|evian|tefal|moulinex|nespresso|yves rocher|sephora|fnac|darty|leroy merlin",
    "Sayings": "avoir le cafard|poser un lapin|tomber dans les pommes|coûter les yeux de la tête|mettre les pieds dans le plat|il pleut des cordes|avoir la tête dans les nuages|dormir comme un loir|mieux vaut tard que jamais|lune de miel|conte de fées|prendre le taureau par les cornes|avoir un chat dans la gorge|montagnes russes@Objects|montgolfière@Objects|machine à remonter le temps@Objects|tapis volant@Objects|carte au trésor@Objects|sac de couchage@Objects|toboggan aquatique@Objects|tirelire@Objects|ours polaire@Animals|gâteau au chocolat@Food|hot dog@Food|beurre de cacahuète@Food|pleine lune@Nature|piscine@Places & buildings|new york@Cities|los angeles@Cities|san francisco@Cities|rio de janeiro@Cities|buenos aires@Cities|le cap@Cities|hong kong@Cities|las vegas@Cities|la nouvelle orléans@Cities|kuala lumpur@Cities|abou dhabi@Cities|tel aviv@Cities|saint tropez@Cities|château de sable@Places & buildings|ralenti|joyeux noël|nouvel an|jour de congé@Sports & activities|voyage en voiture@Sports & activities|bataille de polochons@Sports & activities"
  };
  const PHRASE_CATS = ['Celebrities', 'Characters', 'Historical figures', 'Brands & companies', 'Sayings'];   // these lists contain spaces and only appear at the top level (an entry can carry its own category: hot dog@Food)
  const BANKS = { en: BANK_EN, es: BANK_ES, fr: BANK_FR };
  const LANGS = Object.keys(BANKS);
  const buildWords = BANK => Object.entries(BANK).flatMap(([cat, list]) =>
    (PHRASE_CATS.includes(cat) ? list.split('|').map(x => { const [word, own] = x.split('@'); return { cat: own || cat, word, top: true }; }) : list.split(' ').map(word => ({ cat, word, top: false })))).filter((e, i, all) => all.findIndex(x => x.word === e.word) === i);   // a word listed under two categories counts once
  const WORDS = Object.fromEntries(LANGS.map(l => [l, buildWords(BANKS[l])]));
  const ALL_WORDS = WORDS.en;
  // Levels: the words get longer, ending with names and phrases. Plain words qualify for a level by their number of letters.
  const TIERS = [
    { name: '4–6 letters', min: 4, max: 6 },
    { name: '5–7 letters', min: 5, max: 7 },
    { name: '6–8 letters', min: 6, max: 8 },
    { name: '9–12 letters', min: 9, max: 12 },
    { name: 'Names, brands & phrases', phrases: true }
  ];
  const CATEGORIES = [...Object.keys(BANK_EN).filter(c => c !== 'Sayings'), ...new Set(ALL_WORDS.map(e => e.cat))].filter((c, i, a) => a.indexOf(c) === i);   // every category a word can carry, in a stable order
  const tierWords = (level, cats = CATEGORIES, lang = 'en') => {
    const t = TIERS[level - 1];
    return (WORDS[lang] || WORDS.en).filter(e => cats.includes(e.cat) && (t.phrases ? e.top
      : !e.top && norm(e.word).length >= t.min && norm(e.word).length <= t.max));   // a plain word's level goes by its letters, accents not counted
  };
  const SYMBOL_COST = 5;             // every symbol costs a flat 5, and doesn't move the letter price up
  const DEFAULT_SETTINGS = { lang: 'en', teams: 'two', banCount: 2, teamSize: 3, mode: 'score', target: 800, words: 8, bank: 200, categories: CATEGORIES, reward: 100, writeSecs: 30, penalty: 5, firstBonus: 20, speedSecs: 15, lastChance: 15, sequential: false };
  // One-team mode: a fixed number of words, then a grade from the final score. Cutoffs are points gained per 5 words over the
  // starting bank (they scale with the number of words and the bank). Worked out for a 1 + 2 team where a solved word pays ~128
  // (reward plus bonuses), letters cost 5, 8, 13, 21... per clue-giver, and a word the team doesn't get costs nothing (letters refunded):
  // a solved word nets about 128 less 26-60 of clue cost (2+2, 2+3 or 2+4 letters), 52 for 3+3. YKWIM is 4-5 words right at that cost (~85 a word),
  // KWIM about 4 right at 3+3 or 2+4 letters (~70), then 3 right for WIM and 2 right for IM: 5 words are 325 / 260 / 190 / 110.
  const RATING_CUTS = [110, 190, 260, 325];   // points gained per 5 words: an average of 22 / 38 / 52 / 65 a word
  // The five grades are YKWIM > KWIM > WIM > IM > M, each with its own little quote, from confident down to a shrug.
  const RATINGS = [[RATING_CUTS[3], 'YKWIM', 'You know what I mean!'], [RATING_CUTS[2], 'KWIM', 'Kinda wild, I\'m mind-reading!'],
    [RATING_CUTS[1], 'WIM', 'Wait, I meant…'], [RATING_CUTS[0], 'IM', 'Interesting misunderstandings…'], [-Infinity, 'M', 'Muddled…']];
  // Points gained that a grade needs over this many words: the per-5-words cutoff scaled up, to a round number (so 8 words reads 415, not 416)
  const gradeNeed = (cut, words) => Math.round(cut * words / 25) * 5;
  function rating(score, bank, words) {
    const gained = score - bank, r = RATINGS.find(x => x[0] === -Infinity || gained > gradeNeed(x[0], words));
    return { label: r[1], quote: r[2], rank: RATINGS.length - 1 - RATINGS.indexOf(r), score, words };   // rank 4 = best, 0 = worst
  }
  const LEVEL_EVERY = 2;              // the word level goes up every this many words (not a setting: it just happens)
  const LONG_WORD_MIN = 6;            // letters (spaces don't count) a word needs before it pays the long-word bonus
  const longWordBonus = (base, level) => Math.round(base * 0.25 * (level - 1) / 5) * 5;   // longer words pay a bonus on top of the reward: +25% of it per level
  const priceOf = i => { let a = 5, b = 8; for (; i > 0; i--) [a, b] = [b, a + b]; return a; };   // a clue-giver's letters cost 5, 8, 13, 21, 34... (Fibonacci); i = 0 is the first one that clue-giver types
  const LATE_GIVER_MS = 10000;        // pass-and-play: extra writing time for Clue-giver 2 and 3, who haven't been able to study the keyword while Clue-giver 1 wrote
  const PASS_MS = 20000;              // how long the other team's Clue-giver 1 has to answer a request to pass a word
  const FEEDBACK_MS = 4000;          // pass-and-play: how long the guesser's result screen shows before the device is passed on
  const GRACE_MS = 1500;             // host waits this long past a writing deadline for the client's auto-submit
  // A team is some clue-givers (1, 2 or 3) who write one after another, then a guesser: team sizes 2, 3 and 4.
  const rolesFor = size => [...Array(size - 1)].map((_, i) => 'giver' + (i + 1)).concat('guesser');
  const STAGE_ROLE = { giver1: 'giver1', giver2: 'giver2', giver3: 'giver3', guess: 'guesser' };
  const isWriting = stage => /^giver\d$/.test(stage);

  const SYMBOLS = '.,?!@#$%&*+-=/()~^:;\'_';   // allowed in clues at a flat cost each
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  // A clue is capital letters plus free symbols; anything else is dropped.
  const cleanClue = raw => [...String(raw).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()]
    .filter(c => /[A-Z]/.test(c) || SYMBOLS.includes(c)).join('').slice(0, 30);
  // Hangman-style clues are out: with every symbol read as "any letter", a clue that lines up with the start or the end
  // of the keyword (e.g. *A**ER for LADDER) tells the guesser exactly where letters sit.
  function isPatternClue(text, word) {
    const c = [...text], w = [...word.toUpperCase()];
    if (!c.some(ch => SYMBOLS.includes(ch)) || !c.some(ch => /[A-Z]/.test(ch)) || c.length > w.length) return false;
    const fits = off => c.every((ch, i) => SYMBOLS.includes(ch) || ch === w[off + i]);
    return fits(0) || fits(w.length - c.length);
  }
  // Codes count as pattern clues too: a Caesar shift of the keyword (any shift, 4+ letters of it) or its Morse code (dots and dashes).
  const MORSE = { a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..' };
  const UNMORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
  function isCodedClue(text, word) {
    const answer = norm(word), letters = norm(text);
    if (letters.length >= 4) for (let k = 1; k < 26; k++) {
      const shifted = [...answer].map(c => String.fromCharCode((c.charCodeAt(0) - 97 + k) % 26 + 97)).join('');
      if (shifted.includes(letters) || letters.includes(shifted)) return true;
    }
    if (!letters && /^[.\-/]{3,}$/.test(text)) {
      if (text.includes('/')) {   // letters set apart by slashes: decode them
        const said = text.split('/').filter(Boolean).map(g => UNMORSE[g] || '?').join('');
        return said.length >= 2 && !said.includes('?') && answer.includes(said);
      }
      const dots = [...answer].map(c => MORSE[c]).join(''), c = text.replace(/\//g, '');
      return c.length >= 4 && (dots.startsWith(c) || dots.endsWith(c));   // run together, it can only be matched from either end of the word
    }
    return false;
  }
  const letterCount = s => (String(s).match(/[A-Za-z]/g) || []).length;
  const costOf = (n, used) => { let c = 0; for (let i = 0; i < n; i++) c += priceOf(used + i); return c; };
  const clueCost = (text, used) => { const n = letterCount(text); return costOf(n, used) + (text.length - n) * SYMBOL_COST; };

  function createGame(opts = {}) {
    const now = opts.now || Date.now;
    const setT = opts.setTimeout || setTimeout, clearT = opts.clearTimeout || clearTimeout;
    const onChange = opts.onChange || (() => {});
    const hostId = opts.hostId || 'host';

    const G = {
      seatNames: [[], []],                    // custom names for seats one device holds several of: seatNames[team][seat]
      phase: 'lobby',                         // lobby | round | roundEnd | over
      settings: { ...DEFAULT_SETTINGS, lang: LANGS.includes(opts.lang) ? opts.lang : 'en' },   // the language of the keywords, chosen by the host; each player's screen is in their own language
      players: {},                            // id -> { name, token, connected }
      seats: [[null, null, null], [null, null, null]],
      names: ['Team 1', 'Team 2'],
      scores: [0, 0], round: 0, used: new Set(), level: 1, longBonus: 0, card: null, teams: [null, null], firstCorrect: null, gaveUp: null, winner: null,
      solo: false, history: [], record: [],   // record: every finished word with who wrote what, for the game-over review
         // one-team mode: how each word went, for the graph at the end
      pass: null, passUsed: [false, false], passNote: null   // a request to pass the word: { from, to, expires, timer }; each team may ask once per word
    };
    const change = () => onChange();

    // ---------- helpers ----------
    const teamOf = id => G.seats.findIndex(t => t.includes(id));
    // Teams of 3: giver 1, giver 2 and the guesser are three different seats. Teams of 2: one clue-giver (one clue) and a guesser.
    // Either way the seats rotate every round.
    const seatIdx = (t, role) => (G.round + rolesFor(G.settings.teamSize).indexOf(role)) % G.settings.teamSize;
    const holder = (t, role) => G.seats[t][seatIdx(t, role)];
    // A device normally sits on one team. In pass-and-play it holds both; then the team whose turn it is is "its" team.
    const actTeam = id => {
      const ts = [0, 1].filter(t => G.seats[t].includes(id));
      if (ts.length < 2) return ts.length ? ts[0] : -1;
      const live = G.teams[0] ? ts.find(t => !['done', 'waiting'].includes(G.teams[t].stage)) : undefined;   // no teams yet in the lobby
      return live === undefined ? ts[0] : live;
    };
    const rolesOf = (id, t = actTeam(id)) => t < 0 ? [] : rolesFor(G.settings.teamSize).filter(r => holder(t, r) === id);
    // Letters and wrong guesses cost real points, straight out of the team's score. A team can only spend what it has, so the score never goes below zero.
    // Clue costs are tracked apart (clueSpent): a team that doesn't get the word gets them back (see finishTeam).
    const spend = (t, amount, clue) => { G.scores[t] -= amount; G.teams[t].spent += amount; if (clue) G.teams[t].clueSpent += amount; };
    function seatName(t, seatIdx) {
      const id = G.seats[t][seatIdx]; if (!id || !G.players[id]) return `Seat ${seatIdx + 1}`;
      if (G.seatNames[t][seatIdx]) return G.seatNames[t][seatIdx];
      const mine = G.seats[t].map((s, i) => s === id ? i : -1).filter(i => i >= 0);
      return mine.length > 1 ? `${G.players[id].name} (${mine.indexOf(seatIdx) + 1})` : G.players[id].name;
    }
    const roleName = (t, role) => seatName(t, seatIdx(t, role));
    const banned = () => { const n = norm(G.card.word); return n.length >= 4 ? [...new Set([...n].filter(c => !'aeiou'.includes(c)).slice(0, G.settings.banCount))] : []; };

    // ---------- players & lobby ----------
    function addPlayer(id, name, token) {
      name = String(name || '').trim().slice(0, 14) || 'Player';
      const old = Object.keys(G.players).find(k => k !== id && token && G.players[k].token === token);
      if (old) { // returning player: take over their old seats
        delete G.players[old];
        G.seats = G.seats.map(t => t.map(s => s === old ? id : s));
      }
      G.players[id] = { name, token, connected: true };
      change();
    }
    function disconnect(id) {
      if (!G.players[id]) return;
      if (G.phase === 'lobby') { G.seats = G.seats.map(t => t.map(s => s === id ? null : s)); delete G.players[id]; }
      else G.players[id].connected = false;
      change();
    }
    // a seat that changes hands loses its custom name
    function vacate(id, exceptTeam) {
      G.seats.forEach((t, i) => { if (i !== exceptTeam) t.forEach((s, j) => { if (s === id) G.seatNames[i][j] = null; }); });
      G.seats = G.seats.map((t, i) => i === exceptTeam ? t : t.map(s => s === id ? null : s));
    }

    // ---------- round flow ----------
    function newTeamState() {
      return { stage: 'giver1', deadline: null, timer: null, clues: [], spent: 0, clueSpent: 0, used: 0, log: [], result: null, earned: 0, breakdown: null, guessDeadline: null, guessStart: null, awaitReady: false };
    }
    function arm(t, ms, fn) { const T = G.teams[t]; clearT(T.timer); T.timer = setT(fn, ms); }

    function startRound() {
      // the word level rises as the game goes on; longer words earn a long-word bonus
      const s = G.settings;
      const want = Math.min(TIERS.length, 1 + Math.floor(G.round / LEVEL_EVERY));
      // if the ticked categories have no words at that level, use the nearest level that does (lower first)
      const order = [want, ...Array.from({ length: want - 1 }, (_, i) => want - 1 - i), ...Array.from({ length: TIERS.length - want }, (_, i) => want + 1 + i)];
      G.level = order.find(l => tierWords(l, s.categories, s.lang).length) || want;
      const pool = tierWords(G.level, s.categories, s.lang);
      let fresh = pool.filter(e => !G.used.has(e.word));
      if (!fresh.length) { pool.forEach(e => G.used.delete(e.word)); fresh = pool; }   // seen them all: start that level's list over
      G.card = fresh[Math.floor(Math.random() * fresh.length)]; G.used.add(G.card.word);
      G.longBonus = norm(G.card.word).length >= LONG_WORD_MIN ? longWordBonus(s.reward, G.level) : 0;   // only a long word pays it, whatever level it was drawn from
      G.firstCorrect = null; G.gaveUp = null; G.phase = 'round';
      if (G.pass) { clearT(G.pass.timer); G.pass = null; }
      G.teams = [newTeamState(), newTeamState()];
      if (G.solo) { G.teams[1].stage = 'done'; G.teams[1].result = 'none'; beginWriting(0, 'giver1'); }   // no second team: it's out of the way
      else if (G.settings.sequential) { // pass-and-play: teams take turns, alternating who goes first
        const first = G.round % 2;
        G.teams[1 - first].stage = 'waiting';
        beginWriting(first, 'giver1');
      } else [0, 1].forEach(t => beginWriting(t, 'giver1'));
    }
    function beginWriting(t, stage, extraMs = 0) {   // extraMs: breathing room before the clock starts (the pass-and-play feedback screen)
      const T = G.teams[t], ms = G.settings.writeSecs * 1000 + (G.settings.sequential && +stage.slice(5) >= 2 ? LATE_GIVER_MS : 0);   // pass-and-play: a later clue-giver only sees the keyword when their turn starts, so they get longer
      T.stage = stage; T.used = 0; T.deadline = now() + extraMs + ms;
      arm(t, extraMs + ms + GRACE_MS, () => { if (T.stage === stage) submitClue(t, '', true); }); // client's own auto-submit normally wins
    }
    function submitClue(t, raw, auto) {
      const T = G.teams[t];
      let text = cleanClue(raw);
      const ban = banned(), answer = norm(G.card.word);
      if (!auto) {
        if (norm(text).includes(answer)) return { error: "You can't type the keyword itself!" };
        if (isPatternClue(text, answer)) return { error: "No pattern clues: symbols can't mark where the letters go." };
        if (isCodedClue(text, answer)) return { error: 'No pattern clues: codes are out.' };
        const bad = [...ban].filter(c => text.toLowerCase().includes(c));
        if (bad.length) return { error: 'Banned letters: {0}', args: [bad.join(', ').toUpperCase()] };
      } else {
        text = [...text].filter(c => !ban.includes(c.toLowerCase())).join('');
        if (norm(text).includes(answer) || isPatternClue(text, answer) || isCodedClue(text, answer)) text = '';
      }
      if (auto) while (text && clueCost(text, T.used) > G.scores[t]) text = text.slice(0, -1);   // out of time: keep what the team can afford
      else if (clueCost(text, T.used) > G.scores[t]) return { error: "You can't afford that clue." };
      spend(t, clueCost(text, T.used), true); T.used += letterCount(text); T.clues.push(text);
      clearT(T.timer); T.deadline = null;
      if (G.pass && G.pass.from === t) { clearT(G.pass.timer); G.pass = null; }   // they decided to write after all
      const k = +T.stage.slice(5);   // which clue-giver just finished
      if (k < G.settings.teamSize - 1) beginWriting(t, 'giver' + (k + 1)); else enterGuess(t);
      change();
      return {};
    }
    // The guesser always gets an "I'm ready" screen before the clues appear, and the quick-guess clock (and any
    // last-chance timer) only starts once they tap it. On a shared device it's the "pass the device" screen.
    // The one exception: a guesser on their own phone isn't held back once the other team has already got it,
    // otherwise they could stall the round by never tapping.
    const sharedGuesser = t => { const id = holder(t, 'guesser'); return G.seats[t].filter(s => s === id).length > 1; };
    function enterGuess(t) {
      const T = G.teams[t]; T.stage = 'guess';
      const otherDone = G.firstCorrect !== null || G.gaveUp !== null;   // the other team got it or gave up: this one is on the last-chance clock
      T.awaitReady = sharedGuesser(t) || !otherDone; T.guessStart = T.awaitReady ? null : now();
      if (!T.awaitReady && otherDone) startFinal(t);
    }
    function startFinal(t) {
      // last chance: once one team guesses it, the other has settings.lastChance seconds
      const T = G.teams[t], ms = G.settings.lastChance * 1000; T.guessDeadline = now() + ms;
      arm(t, ms, () => { if (T.stage === 'guess') { finishTeam(t, 'timeout', 0); change(); } });
    }
    function finishTeam(t, result, earned) {
      const T = G.teams[t]; clearT(T.timer);
      if (result !== 'correct') { G.scores[t] += T.clueSpent; T.spent -= T.clueSpent; T.clueSpent = 0; }   // didn't get it: the letters are paid back
      T.stage = 'done'; T.result = result; T.earned = earned; T.deadline = T.guessDeadline = null;
      const o = G.teams[1 - t];
      if (G.settings.sequential && o.stage === 'waiting') beginWriting(1 - t, 'giver1', FEEDBACK_MS);   // the next team's clock waits out the guesser's feedback screen
      if (G.teams[0].stage === 'done' && G.teams[1].stage === 'done') endRound();
    }
    function endRound() {
      // First to guess is only a bonus when it was a race: if the other team never got it, the reward itself is difference enough.
      // In pass-and-play the teams don't race, so the faster guesser (less time from seeing the clues to the right answer) counts as first.
      const [x, y] = G.teams;
      const f = G.settings.sequential ? (x.result === 'correct' && y.result === 'correct' && x.guessMs !== y.guessMs ? (x.guessMs < y.guessMs ? 0 : 1) : null) : G.firstCorrect;
      if (f !== null && G.teams[1 - f].result === 'correct') {
        const T = G.teams[f]; T.breakdown.first = G.settings.firstBonus; T.earned += G.settings.firstBonus;
      }
      [0, 1].forEach(t => G.scores[t] += G.teams[t].earned);
      G.record.push({ n: G.round, word: G.card.word, cat: G.card.cat, levelName: TIERS[G.level - 1].name, teams: [0, 1].map(t => {
        const T = G.teams[t];
        return { result: T.result, earned: T.earned, spent: T.spent, breakdown: T.breakdown, clues: T.clues.slice(), log: T.log.slice(), people: rolesFor(G.settings.teamSize).map(r => ({ role: r, name: roleName(t, r) })) };
      }) });
      const [a, b] = G.scores, s = G.settings;
      // "score" mode: first to the target. "words" mode: after a fixed number of words. A tie plays on (sudden death).
      const finished = s.mode === 'words' ? G.round + 1 >= s.words : (a >= s.target || b >= s.target);
      if (G.solo) G.history.push({ n: G.round, word: G.card.word, result: G.teams[0].result, net: G.teams[0].earned - G.teams[0].spent, total: G.scores[0] });
      if (G.solo) { if (finished) { G.phase = 'over'; G.winner = 0; } else G.phase = 'roundEnd'; }
      else if (finished && a !== b) { G.phase = 'over'; G.winner = a > b ? 0 : 1; }
      else G.phase = 'roundEnd';
    }
    function guess(t, raw) {
      const T = G.teams[t], text = norm(raw).toUpperCase().slice(0, 24);
      if (!text) return {};
      const want = norm(G.card.word).length;
      if (text.length !== want) return { error: 'It has {0} letters.', args: [want] };   // the wrong number of letters isn't a guess: no penalty, nothing sent
      if (text.toLowerCase() === norm(G.card.word)) {
        T.log.push({ text, ok: true });
        // A correct guess pays the reward plus the first-to-guess and quick-guess bonuses (letters were already paid for).
        // (no live first-to-guess race or last-chance limit in pass-and-play: the teams don't play at the same time; endRound compares their times instead)
        const s = G.settings, first = G.firstCorrect === null && !s.sequential;
        // Quick bonus counts down: speedSecs points at the start, 1 fewer for every full second since the clues appeared.
        const quick = Math.max(0, s.speedSecs - Math.floor((now() - T.guessStart) / 1000));
        // The first-to-guess bonus isn't paid yet: it only counts if the other team gets the word too (see endRound).
        T.guessMs = now() - T.guessStart;
        T.breakdown = { base: s.reward, longWord: G.longBonus, first: 0, speed: quick, spent: T.spent };
        finishTeam(t, 'correct', T.breakdown.base + T.breakdown.longWord + T.breakdown.speed);
        if (first) {
          G.firstCorrect = t;
          const o = 1 - t, O = G.teams[o];
          if (O.stage === 'guess' && O.awaitReady && !sharedGuesser(o)) { O.awaitReady = false; O.guessStart = now(); }   // late team on their own phone: clock starts now
          if (O.stage === 'guess' && !O.awaitReady) startFinal(o);
        }
      } else {
        const cost = Math.min(G.settings.penalty, G.scores[t]);   // can't pay more than the team has
        spend(t, cost); T.log.push({ text, ok: false, cost });
      }
      change();
      return {};
    }

    // ---------- passing a word ----------
    // Clue-giver 1 can ask to pass a word they don't know. The other team's Clue-giver 1 says yes or no. On yes, both teams get a
    // fresh word (same word number, letters already spent are refunded). Each team may ask once per word.
    let noteId = 0;
    const note = (type, from) => { G.passNote = { id: ++noteId, type, from }; };
    function declinePass(type) {
      if (!G.pass) return {};
      clearT(G.pass.timer); const from = G.pass.from; G.pass = null; note(type, from); change(); return {};
    }
    function acceptPass() {
      if (!G.pass) return {};
      clearT(G.pass.timer); const from = G.pass.from; G.pass = null;
      return swapWord(from);
    }
    function swapWord(from) {
      G.teams.forEach(T => T && clearT(T.timer));
      G.scores[0] += G.teams[0].spent; G.scores[1] += G.teams[1].spent;   // like a host skip: nobody pays for a word that was thrown out
      note('accepted', from); startRound(); change(); return {};
    }

    // ---------- intents ----------
    function handle(id, m) {
      if (!G.players[id]) return { error: 'Not in this room.' };
      const isHost = id === hostId;
      switch (m.type) {
        case 'sit': {
          if (G.phase !== 'lobby') return { error: 'Game already started.' };
          const { team, seat } = m;
          if (team === 1 && G.settings.teams === 'one') return {};
          if (![0, 1].includes(team) || !(Number.isInteger(seat) && seat >= 0 && seat < G.settings.teamSize)) return {};
          const cur = G.seats[team][seat]; if (cur && cur !== id) return { error: 'Seat taken.' };
          vacate(id, team); G.seats[team][seat] = id; G.seatNames[team][seat] = null; G.settings.sequential = false; change(); return {};
        }
        case 'sitAll': { // one device plays a whole team
          if (G.phase !== 'lobby') return { error: 'Game already started.' };
          const { team } = m; if (![0, 1].includes(team) || (team === 1 && G.settings.teams === 'one')) return {};
          if (G.seats[team].some(s => s && s !== id)) return { error: 'Some seats on that team are taken.' };
          vacate(id, team); G.seats[team] = Array(G.settings.teamSize).fill(id); G.seatNames[team] = []; G.settings.sequential = false; change(); return {};
        }
        case 'stand': if (G.phase === 'lobby') { vacate(id, -1); G.settings.sequential = false; change(); } return {};
        case 'passAndPlay': { // everyone shares the host's device; teams take turns
          if (!isHost || G.phase !== 'lobby' || G.settings.teams === 'one') return {};
          G.seats = [0, 1].map(() => Array(G.settings.teamSize).fill(id)); G.seatNames = [[], []]; G.settings.sequential = true; change(); return {};
        }
        case 'settings': {
          if (!isHost || G.phase !== 'lobby') return {};
          const s = G.settings, n = Number(m.value);
          if (m.key === 'toggleCategory' && CATEGORIES.includes(m.value)) {
            const on = s.categories.includes(m.value), next = on ? s.categories.filter(c => c !== m.value) : CATEGORIES.filter(c => c === m.value || s.categories.includes(c));
            if (!next.length) return { error: 'Keep at least one category.' };
            s.categories = next;   // replaced, never edited in place, so the shared default list stays intact
          }
          else if (m.key === 'teams' && ['two', 'one'].includes(m.value)) {
            s.teams = m.value;
            if (m.value === 'one' && s.teamSize === 2) { s.teamSize = 3; G.seats = G.seats.map(t => Array.from({ length: 3 }, (_, i) => t[i] || null)); }
            if (m.value === 'one') { s.mode = 'words'; s.words = 2 * s.teamSize; if (s.sequential) { s.sequential = false; G.seats = [0, 1].map(() => Array(s.teamSize).fill(null)); } G.seats[1] = Array(s.teamSize).fill(null); }
            else { s.mode = 'score'; s.words = 8; }
          }
          else if (m.key === 'mode' && ['score', 'words'].includes(m.value) && s.teams === 'two') s.mode = m.value;
          else if (m.key === 'lang' && LANGS.includes(m.value)) s.lang = m.value;
          else if (m.key === 'banCount' && [1, 2, 3].includes(n)) s.banCount = n;
          else if (m.key === 'lastChance' && [10, 15, 20].includes(n)) s.lastChance = n;
          else if (m.key === 'teamSize' && [2, 3, 4].includes(n) && !(n === 2 && s.teams === 'one')) {   // playing without an opponent needs at least 2 clue-givers
            if (s.teams === 'one' && s.words === 2 * s.teamSize) s.words = 2 * n;   // co-op: two words per player, until the host picks another number
            s.teamSize = n; // seats beyond the new size are dropped
            G.seats = G.seats.map(t => Array.from({ length: n }, (_, i) => t[i] || null));
          }
          else if (m.key === 'target' && n >= 50 && n <= 2000) s.target = n;
          else if (m.key === 'words' && n >= 1 && n <= 50) s.words = n;
          else if (m.key === 'reward' && n >= 40 && n <= 400) s.reward = n;
          else if (m.key === 'bank' && n >= 0 && n <= 600) s.bank = n;
          else if (m.key === 'writeSecs' && n >= 10 && n <= 120) s.writeSecs = n;
          else if (m.key === 'penalty' && n >= 0 && n <= 20) s.penalty = n;
          else if (m.key === 'firstBonus' && n >= 0 && n <= 100) s.firstBonus = n;
          else if (m.key === 'speedSecs' && n >= 0 && n <= 30) s.speedSecs = n;
          change(); return {};
        }
        case 'resetSettings': { // back to the defaults (pass-and-play stays on if it was chosen)
          if (!isHost || G.phase !== 'lobby') return {};
          const keep = G.settings.sequential;
          G.settings = { ...DEFAULT_SETTINGS, lang: G.settings.lang, sequential: keep };
          G.seats = G.seats.map(t => Array.from({ length: G.settings.teamSize }, (_, i) => t[i] || null));
          change(); return {};
        }
        case 'seatName': { // whoever holds several seats of a team on one device can name each of them
          if (G.phase !== 'lobby' || ![0, 1].includes(m.team) || G.seats[m.team][m.seat] !== id) return {};
          G.seatNames[m.team][m.seat] = String(m.name || '').trim().slice(0, 14) || null; change(); return {};
        }
        case 'teamName': {
          if (G.phase !== 'lobby' || ![0, 1].includes(m.team) || !(isHost || G.seats[m.team].every(s => s === id))) return {};
          G.names[m.team] = String(m.name || '').trim().slice(0, 16) || `Team ${m.team + 1}`; change(); return {};
        }
        case 'start': {
          if (!isHost || G.phase !== 'lobby') return {};
          G.solo = G.settings.teams === 'one';
          if ((G.solo ? [G.seats[0]] : G.seats).some(t => t.some(s => !s))) return { error: 'Fill every seat first.' };
          G.scores = [G.settings.bank, G.settings.bank]; G.round = 0; G.used = new Set(); G.winner = null; G.passUsed = [false, false]; G.passNote = null; G.history = []; G.record = []; startRound(); change(); return {};
        }
        case 'next': {
          if (!isHost || G.phase !== 'roundEnd') return {};
          G.round++; G.passUsed = [false, false]; startRound(); change(); return {};
        }
        case 'toLobby': {
          if (!isHost || !['over', 'roundEnd', 'round'].includes(G.phase)) return {};
          (G.teams || []).forEach(T => T && clearT(T.timer));
          G.phase = 'lobby'; G.card = null; change(); return {};
        }
        case 'skip': { // host ends a stuck word
          if (!isHost || G.phase !== 'round') return {};
          [0, 1].forEach(t => { if (G.teams[t].stage !== 'done') { G.scores[t] += G.teams[t].spent; G.teams[t].spent = G.teams[t].clueSpent = 0; finishTeam(t, 'skipped', 0); } });   // a skipped word refunds what was spent on it
          change(); return {};
        }
        case 'clue': {
          if (G.phase !== 'round') return {};
          const t = actTeam(id); if (t < 0) return {};
          const T = G.teams[t];
          if (!isWriting(T.stage) || !rolesOf(id).includes(STAGE_ROLE[T.stage])) return {};
          return submitClue(t, m.text, !!m.auto);
        }
        case 'guess': {
          if (G.phase !== 'round') return {};
          const t = actTeam(id); if (t < 0 || G.teams[t].stage !== 'guess' || !rolesOf(id).includes('guesser')) return {};
          if (G.teams[t].awaitReady) return {};   // still on the "pass the device" screen
          return guess(t, m.text);
        }
        case 'guessReady': { // the guesser tapped "I'm ready": the clocks start now
          if (G.phase !== 'round') return {};
          const t = actTeam(id), T = t < 0 ? null : G.teams[t];
          if (!T || T.stage !== 'guess' || !T.awaitReady || !rolesOf(id).includes('guesser')) return {};
          T.awaitReady = false; T.guessStart = now();
          if (G.firstCorrect !== null || G.gaveUp !== null) startFinal(t);
          change(); return {};
        }
        case 'proposePass': {
          if (G.phase !== 'round' || G.settings.sequential) return {};
          const t = actTeam(id); if (t < 0) return {};
          if (G.teams[t].stage !== 'giver1' || !rolesOf(id).includes('giver1')) return {};
          if (G.solo) {   // nobody else to ask: the team just decides to pass (once per word)
            if (G.passUsed[t]) return { error: 'You already passed this word.' };
            G.passUsed[t] = true; return swapWord(t);
          }
          const o = 1 - t, to = holder(o, 'giver1');
          if (G.teams[o].stage === 'done') return { error: '{0} is already done with this word.', args: [G.names[o]] };
          if (G.pass && G.pass.from === o) return acceptPass();   // both teams want to pass: done
          if (G.passUsed[t]) return { error: 'You already asked to pass this word.' };
          if (G.pass) return {};
          if (!to || !G.players[to] || !G.players[to].connected) return { error: "{0}'s Clue-giver 1 isn't connected.", args: [G.names[o]] };
          G.passUsed[t] = true;
          G.pass = { from: t, to, expires: now() + PASS_MS, timer: setT(() => { if (G.pass && G.phase === 'round') declinePass('expired'); }, PASS_MS) };
          change(); return {};
        }
        case 'answerPass': {
          if (G.phase !== 'round' || !G.pass || G.pass.to !== id) return {};
          return m.yes ? acceptPass() : declinePass('declined');
        }
        case 'giveup': {
          if (G.phase !== 'round') return {};
          const t = actTeam(id); if (t < 0 || G.teams[t].stage !== 'guess' || !rolesOf(id).includes('guesser')) return {};
          finishTeam(t, 'gaveup', 0);   // final: the team is done with this word
          const o = 1 - t, O = G.teams[o];
          if (!G.solo && !G.settings.sequential && G.firstCorrect === null && G.gaveUp === null) {   // giving up starts the other team's last-chance timer, like a correct guess does
            G.gaveUp = t;
            if (O.stage === 'guess' && O.awaitReady && !sharedGuesser(o)) { O.awaitReady = false; O.guessStart = now(); }
            if (O.stage === 'guess' && !O.awaitReady) startFinal(o);
          }
          change(); return {};
        }
      }
      return {};
    }

    // ---------- per-peer view ----------
    function view(id) {
      const reveal = G.phase === 'roundEnd' || G.phase === 'over';
      const v = {
        phase: G.phase, me: id, isHost: id === hostId, hostId, settings: G.settings, names: G.names, scores: G.scores,
        winner: G.winner, ratings: !G.solo && G.phase === 'over' ? [0, 1].map(t => rating(G.scores[t], G.settings.bank, Math.max(1, G.record.length))) : null,   // VS: every team gets a grade too, over the words actually played
        history: G.solo && G.phase === 'over' ? G.history : null, record: G.phase === 'over' ? G.record : null, rating: G.solo && G.phase === 'over' ? rating(G.scores[0], G.settings.bank, G.settings.words) : null, costs: { symbol: SYMBOL_COST },
        players: Object.entries(G.players).map(([pid, p]) => ({ id: pid, name: p.name, connected: p.connected })),
        seats: G.seats.map((t, ti) => t.map((s, si) => s ? { id: s, name: seatName(ti, si) } : null)),
        myTeam: actTeam(id) < 0 ? null : actTeam(id),
        sharedDevice: actTeam(id) >= 0 && G.seats[actTeam(id)].filter(s => s === id).length > 1   // one device, several people
      };
      if (G.phase === 'lobby' || !G.card) return v;

      const mt = v.myTeam, roles = rolesOf(id);
      v.myRoles = roles; v.round = {
        n: G.round, cat: G.card.cat, level: G.level, levelName: TIERS[G.level - 1].name, reward: G.settings.reward, longBonus: G.longBonus, blanks: [...G.card.word].map(ch => /\p{L}/u.test(ch) ? 1 : 0),
        teams: [0, 1].map(t => {
          const T = G.teams[t], mine = t === mt;
          const rem = T.deadline ? T.deadline - now() : T.guessDeadline ? T.guessDeadline - now() : null;
          const tv = { stage: T.stage, result: T.result, earned: T.earned, breakdown: T.breakdown, remaining: rem === null ? null : Math.max(0, rem) };
          if (mine || reveal) tv.clues = (T.stage === 'guess' || T.stage === 'done' || reveal) ? T.clues : null;
          if (mine || reveal) { tv.log = T.log.slice(); tv.spent = T.spent; tv.clueSpent = T.clueSpent; }
          if (mine) {
            tv.used = T.used;
            tv.awaitReady = T.awaitReady;
            if (T.stage === 'guess') tv.speedLeft = T.awaitReady ? G.settings.speedSecs * 1000 : Math.max(0, T.guessStart + G.settings.speedSecs * 1000 - now());
          }
          return tv;
        }),
        roleNames: mt === null ? null : Object.fromEntries(rolesFor(G.settings.teamSize).map(r => [r, roleName(mt, r)]))
      };
      if (G.phase === 'round') {
        const p = G.pass, t = mt, o = mt === null ? null : 1 - mt;
        v.round.pass = mt === null ? null : {
          can: !G.settings.sequential && roles.includes('giver1') && G.teams[t].stage === 'giver1' && (G.solo || G.teams[o].stage !== 'done') && (!G.passUsed[t] || (!!p && p.from === o)) && (!p || p.from === o),
          asking: !!p && p.from === t,
          toAnswer: p && p.to === id ? { by: seatName(p.from, seatIdx(p.from, 'giver1')), team: p.from } : null
        };
      }
      v.round.passNote = G.passNote;
      v.round.firstTeam = G.firstCorrect;   // who guessed first (their bonus waits to see if the other team gets it too)
      const isGiver = roles.some(r => r.startsWith('giver'));
      if (reveal || (G.phase === 'round' && isGiver)) { v.round.word = G.card.word; }
      if (G.phase === 'round' && isGiver) v.round.banned = banned().map(c => c.toUpperCase());
      const wk = mt !== null && G.phase === 'round' ? +(G.teams[mt].stage.match(/^giver(\d)$/) || [0, 0])[1] : 0;   // the clue-giver now writing
      if (wk >= 2 && roles.includes('giver' + wk)) {
        // A later clue-giver sees what each earlier one used, but not the order: each letter once (A-Z) and each symbol once,
        // plus how many of each were typed in all.
        v.round.prev = G.teams[mt].clues.map((clue, i) => {
          const chars = [...clue], letters = chars.filter(c => /[A-Z]/.test(c)), symbols = chars.filter(c => SYMBOLS.includes(c));
          return { n: i + 1, letters: [...new Set(letters)].sort().join(' '), symbols: [...new Set(symbols)].sort((a, b) => SYMBOLS.indexOf(a) - SYMBOLS.indexOf(b)).join(' '), letterCount: letters.length, symbolCount: symbols.length };
        });
        const p0 = v.round.prev[0];
        v.round.usedLetters = p0.letters; v.round.usedSymbols = p0.symbols; v.round.usedLetterCount = p0.letterCount; v.round.usedSymbolCount = p0.symbolCount;   // Clue 1's, kept for older callers
      }
      return v;
    }

    return { addPlayer, disconnect, handle, view, state: G };
  }

  const api = { isCodedClue, LANGS, WORDS, rating, gradeNeed, RATINGS, RATING_CUTS, CATEGORIES, TIERS, tierWords, createGame, norm, costOf, priceOf, SYMBOLS, SYMBOL_COST };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.YKWIM = api;
})(typeof window !== 'undefined' ? window : globalThis);
