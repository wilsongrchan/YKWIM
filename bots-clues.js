// Association clues the bots use: for each keyword, short things a person might type to point at it (most telling first).
// One token per clue, no spaces (clues are letters and symbols only). Shared by clue-givers (to write) and guessers (to read).
(function (root) {
  const RAW = `
zebra: stripes savanna africa bw horse safari mane
dolphin: flipper ocean smart sea porpoise swim blowhole
penguin: antarctic tux ice waddle cold arctic flightless
kangaroo: pouch australia hop joey outback jump roo
giraffe: neck tall spots savanna africa leaves long
octopus: tentacles eight ink sea squid arms
eagle: bald talons fly bird usa hawk soar
rabbit: bunny carrot hop easter ears hare fluffy
spider: web eight legs bite arachnid tarantula silk
elephant: trunk tusks big ivory grey huge ears
monkey: banana ape tree swing chimp climb zoo
parrot: talk pirate colorful macaw bird beak feathers
tiger: stripes orange cat jungle roar stripy
panda: bamboo bear china bw cute
koala: eucalyptus australia bear sleepy tree
otter: river swim sea fish paws cute
camel: hump desert dromedary sand caravan
horse: ride gallop saddle mane pony stable
sheep: wool lamb baa flock mutton farm
goose: honk bird duck gander farm geese
swan: lake graceful white bird ugly duck
frog: ribbit pond toad tadpole green hop
crab: claws beach sea pinch shell sideways
shark: fin jaws ocean teeth fish bite
whale: blue sea huge blowhole ocean orca
lion: king mane roar pride savanna cat
bear: grizzly honey fur teddy hibernate cave
wolf: howl pack moon dog wild
fox: sly red cunning orange tail
deer: antlers bambi doe stag forest
crocodile: snap reptile river alligator teeth swamp
chimpanzee: ape monkey primate banana jungle
hippopotamus: hippo river africa big mud fat
flamingo: pink bird leg lake tall
porcupine: quills spikes prickly rodent needles
butterfly: wings caterpillar flutter monarch insect colorful
grasshopper: hop green insect grass chirp
scorpion: sting tail desert pincers arachnid
hedgehog: spikes sonic prickly small ball
squirrel: nuts acorn tree bushy tail
cheetah: fast spots cat africa speed
leopard: spots cat jungle panther spotted
peacock: feathers tail colorful bird fan
pelican: beak bird pouch fish bill
gorilla: ape kong strong jungle silverback
jaguar: spots cat car jungle panther
turtle: shell slow sea tortoise
lizard: reptile gecko tail scales iguana
donkey: hee ass mule shrek eeyore
beaver: dam tree teeth lodge busy
walrus: tusks arctic seal whiskers tusk
ostrich: bird big egg fastest runs
seagull: beach bird sea chips squawk
dragonfly: wings insect pond mosquito fly
caterpillar: butterfly worm hungry leaf cocoon
pizza: cheese slice italy pepperoni dough pie
cheese: cow mouse dairy mozzarella cheddar holes
waffle: syrup breakfast iron batter grid
noodle: ramen soup pasta asian slurp
cookie: biscuit sweet chip oven milk
pumpkin: halloween orange pie lantern patch
lemon: sour yellow juice lime tart
honey: bee sweet bear sticky hive
yogurt: dairy cup probiotic greek spoon fruit cultured
ketchup: tomato red fries bottle heinz
apple: fruit red pie tree iphone
orange: citrus juice fruit peel tangerine
banana: yellow peel monkey fruit split
cherry: red pit fruit pie stem
grape: wine vine fruit raisin bunch
mango: tropical fruit yellow india sweet
peach: fruit fuzzy georgia pit
melon: fruit sweet watermelon cantaloupe honeydew rind
bread: loaf toast bake slice sourdough
butter: spread toast dairy churn margarine knife
pasta: italy noodles spaghetti penne macaroni carbonara
salad: lettuce healthy greens bowl caesar
soup: bowl broth spoon hot noodle
sushi: japan rice fish roll wasabi
burger: bun beef fries patty cheese
pancake: syrup flat breakfast flip stack
sandwich: bread lunch ham slice club
spaghetti: italy noodles pasta sauce meatballs
chocolate: cocoa sweet candy bar wonka
strawberry: red berry fruit seeds shortcake jam cream
watermelon: seeds summer green fruit slice
blueberry: muffin berry fruit pie jam purple
cucumber: pickle green salad cool slices
mushroom: fungus forest toadstool shiitake pizza
broccoli: green tree veggie florets vegetable healthy
cinnamon: spice roll sweet bun stick
pineapple: tropical spikes fruit hawaii pizza
avocado: guacamole green toast pit guac
croissant: french pastry butter crescent flaky paris
lasagna: italy layers garfield cheese italian
pretzel: knot salty bavaria twisted mustard bavarian
popcorn: movie butter kernel kernels buttered cinema
cupcake: frosting muffin sweet sprinkles bakery
pepper: spicy black salt grinder shaker
tomato: red sauce ketchup salsa fruit vine
potato: fries chips spud mashed russet
carrot: orange rabbit veggie bugs crunchy
coconut: palm tropical milk shell
raspberry: red berry fruit tart jam
marshmallow: campfire smore fluffy sticky toasted
hamburger: bun beef fries patty mcdonalds
island: beach palm isolated tropical castaway sand surrounded
jungle: trees vines tarzan wild rainforest amazon monkeys
desert: sand dry camel hot sahara dunes cactus
glacier: ice cold slow melting frozen arctic alaska
volcano: lava erupt mountain hot magma ash pompeii
library: books quiet shelves reading librarian borrow shush
harbor: boats port ships docks sailors bay marina
castle: king medieval moat tower knights drawbridge fortress
forest: trees woods hiking deer camping leaves wilderness
valley: between hills low river canyon lowland
lighthouse: beacon coast light ships rocks tower keeper
mountain: peak high climb everest alps summit hiking
beach: sand sea waves sunbathing seashells vacation towel
canyon: grand deep gorge arizona cliffs river
bridge: cross river golden span arch over
museum: art exhibit history artifacts gallery curator dinosaurs
airport: planes terminal flight luggage runway departures gate
stadium: sports crowd arena fans seats football
hospital: doctor nurse sick emergency ambulance patient surgery
cathedral: church gothic notredame bells stainedglass spire
playground: swings slide kids seesaw recess sandbox
waterfall: cascade falls niagara cliff mist plunge
skyscraper: tall city building tower floors nyc elevator
restaurant: menu eat waiter dinner chef reservation tip
supermarket: groceries aisle shop cart cashier checkout
aquarium: fish tank glass sharks jellyfish sealife
observatory: stars telescope space astronomy dome planets
village: small rural town cottages countryside hamlet
garden: flowers plants roses weeds backyard vegetables
farm: barn cow tractor animals crops hay fields
cave: bats dark stalactite underground bear cavern echo
tunnel: underground dark tube train subway digging
palace: king queen royal buckingham grand crown versailles
temple: worship monk sacred shrine ancient buddhist
pyramid: egypt pharaoh giza triangle tomb mummy
umbrella: rain wet drizzle shade handle storm mary
mirror: reflection glass snowwhite vain bathroom image
candle: wax flame wick birthday melt light cake
scissors: cut snip paper rock blades haircut
compass: north direction navigation needle magnetic lost
wallet: money cash cards pocket leather purse
helmet: head protect bike football safety knight
camera: photo picture lens flash selfie snap
clock: time tick hands alarm hour minute
ladder: climb rungs steps painter firefighter
kettle: tea boil whistle hot steam
blanket: warm bed cozy linus wool quilt
pencil: write eraser lead draw graphite school
bottle: water glass cork baby drink message
basket: picnic weave laundry easter eggs hoop
hammer: nail tool thor bang carpenter gavel
needle: thread sew haystack sharp pin injection
button: shirt press push belly sewing coat
pillow: sleep bed soft fight feather head
guitar: strings strum rock acoustic electric frets
telescope: stars space zoom galileo planets lens
microscope: tiny cells science lens bacteria lab
typewriter: keys ink paper old writer ribbon
calculator: math numbers add digits sum
suitcase: travel luggage trip pack airport
flashlight: torch beam battery dark camping
toothbrush: teeth brush dentist paste minty brushing
screwdriver: screw tool phillips twist cocktail
wheelbarrow: garden dirt cart barrow push
thermometer: temperature fever degrees mercury reading
notebook: paper writing school pages journal laptop
backpack: school bag hiking straps books
bicycle: pedal wheels ride tour helmet cycle
balloon: air helium party float pop birthday
lantern: light lamp camping chinese paper
trumpet: brass jazz horn louis blow
keyboard: keys piano typing computer qwerty
envelope: letter mail stamp seal post
television: tv screen remote shows channel
refrigerator: fridge cold food freezer kitchen
ocean: sea waves deep blue pacific atlantic
river: flow stream water nile bank
rainbow: colors arc rain unicorn pot gold
thunder: storm loud boom rumble lightning
eclipse: moon sun shadow solar total
iceberg: titanic ice tip floating arctic
feather: bird light quill tickle plume
marble: glass statue game stone floor
shadow: dark sun peterpan silhouette puppet
cactus: desert prickly spikes arizona thorn
lightning: bolt storm flash zap thunder
blizzard: snow storm cold whiteout winter
tornado: wind twister funnel kansas oz
avalanche: snow mountain slide skiing buried
earthquake: shake tremor richter fault quake
hurricane: storm wind katrina cyclone eye
sunrise: morning dawn east early
sunset: evening dusk west orange
meadow: grass flowers field wild lark
thunderstorm: rain lightning loud boom
pebble: stone small beach rock skip
coral: reef sea colorful fish bleach
dragon: fire wings scales smaug knight
wizard: magic wand merlin potter spell
unicorn: horn horse rainbow mythical sparkle
vampire: blood fangs dracula bat garlic
pirate: ship parrot treasure eyepatch arr
robot: machine metal android ai bot
snowman: carrot frosty winter frozen hat
rocket: space launch nasa fire
mermaid: tail sea ariel fish siren
goblin: green ugly gold small orc troll mean hobbit sneaky
phoenix: fire ashes rebirth bird rises
werewolf: moon howl wolf fullmoon
spaceship: alien ufo galaxy starship rocket
dinosaur: extinct trex fossil jurassic bones
astronaut: space nasa moon spacesuit orbit
superhero: cape powers mask marvel saves
treasure: gold map chest pirate x
scarecrow: field crows straw oz
giant: big huge tall jack beanstalk
fairy: wings tinker dust tale godmother
ghost: boo spooky transparent haunt halloween scary casper
zombie: undead brains walking dead walker
doctor: medicine hospital stethoscope nurse md
teacher: school class chalk students ruler
farmer: crops barn tractor harvest overalls
pilot: plane fly cockpit captain wings
painter: art brush canvas picasso palette
chef: cook kitchen restaurant gordon knife
nurse: hospital care doctor stethoscope scrubs
dentist: teeth drill floss cavity braces
firefighter: hose truck flames ladder pole
carpenter: wood hammer nails saw plank
plumber: pipes mario toilet leak wrench
electrician: wires current power volts shock
photographer: camera pictures lens flash
journalist: news reporter story press
librarian: books quiet shelves shush stamp
detective: clues sherlock mystery magnifier
scientist: lab experiment research beaker einstein
veterinarian: animals pets vet dogs
baker: bread cake oven flour dough
waiter: restaurant tip menu server
singer: song voice microphone tune
driver: car wheel taxi uber license
lawyer: court law suit attorney sue
mechanic: car engine repair garage wrench
engineer: build design bridges math
soccer: goal ball kick football messi
tennis: racket court net serve wimbledon
hockey: puck ice stick goal nhl
cricket: bat wicket england chirp ashes
boxing: gloves ring punch knockout
karate: kick belt chop dojo blackbelt
rugby: tackle scrum oval allblacks
golf: club hole tee birdie fairway
swimming: pool laps water freestyle stroke
basketball: hoop dunk nba court
volleyball: net spike beach serve
badminton: shuttlecock racket birdie smash
gymnastics: flips beam vault floor
snowboarding: snow slopes board halfpipe burton
marathon: run race 26 26miles running
archery: arrow bow target robin
surfing: wave board ocean surfboard hang
skiing: snow slopes alps poles
cycling: bike pedal tour spokes
bowling: pins strike alley gutter
fencing: sword duel foil epee touch
wrestling: pin ring wwe mat
taylor swift: swifties eras pop country folklore
ed sheeran: ginger guitar shape singer thinking perfect lego redhead
billie eilish: bad billie whisper singer ocean eyes green hair goth
ariana grande: ponytail pop thankunext singer sweetener positions cat
justin bieber: baby canada canadian singer beliebers sorry purpose
lady gaga: poker face monster bornthisway singer
bruno mars: uptown singer hawaii marry grenade
elvis presley: king graceland hips thekingofrock rock vegas jumpsuit memphis
michael jackson: moonwalk thriller glove pop neverland king
madonna: material queen virgin singer pop
rihanna: umbrella fenty diamonds singer barbados work
harry styles: onedirection watermelon singer fine line adore
dua lipa: levitating singer albania new rules
katy perry: roar firework singer california gurls teenage dream
shakira: hips colombia waka dancer whenever
adele: hello rolling singer 25 skyfall
beyonce: queen bee queenbee singer lemonade destinys
drake: toronto hotline rapper aubrey champagne
tom hanks: forrest cast actor castaway wilson woody
leonardo dicaprio: titanic actor revenant oscar jack
brad pitt: fightclub actor jolie seven
angelina jolie: tomb lara actress maleficent brangelina
johnny depp: pirate jack pirates sparrow actor
will smith: fresh freshprince actor rapper bel air hitch slap
meryl streep: oscars actress prada devil
keanu reeves: matrix neo actor wick bill ted
scarlett johansson: widow actress avengers lucy
dwayne johnson: rock therock actor wrestler moana wwe
jennifer lawrence: katniss actress hunger games
emma watson: hermione actress harry potter
tom cruise: mission actor top gun couch
morgan freeman: voice narrator actor shawshank god
denzel washington: oscar actor training day
zendaya: euphoria actress spiderman mj
margot robbie: barbie actress suicide squad
ryan reynolds: deadpool actor mint mobile
chris hemsworth: thor actor avenger hammer
jackie chan: kungfu rush actor hour
bruce lee: kungfu dragon karate martial actor
marilyn monroe: blonde actress kennedy
lionel messi: argentina goat soccer barcelona
cristiano ronaldo: siu soccer portugal madrid
michael jordan: bulls basketball air
lebron james: king lakers basketball cavs
serena williams: tennis grandslam venus
usain bolt: fastest sprinter runner sprint jamaica olympics
sherlock holmes: detective deduction watson baker street pipe
mickey mouse: disney ears minnie walt
harry potter: wizard hogwarts scar owl magic broom lightning
santa claus: christmas reindeer sleigh northpole elf
winnie the pooh: honey bear hundred acre
peter pan: neverland boy fly tinkerbell
captain hook: pirate crocodile pan smee
robin hood: arrows sherwood archer thief merry men
snow white: apple dwarfs princess seven
spider man: web peter hero parker
super mario: plumber luigi mushroom nintendo bros kart
pikachu: pokemon yellow pokeball
cinderella: slipper pumpkin ball glass
batman: gotham joker bat robin bruce
sleeping beauty: spindle prince aurora
alice in wonderland: rabbit hatter tea carroll party
king arthur: sword camelot excalibur round table
darth vader: sith helmet skywalker
donald duck: disney quack daisy
bugs bunny: carrot doc whats up
sonic the hedgehog: sega fast blue game rings
wonder woman: amazon lasso hero diana
cleopatra: egypt asp queen nile
napoleon: france waterloo elba
albert einstein: genius relativity physics emc2
leonardo da vinci: monalisa painter last supper
william shakespeare: hamlet playwright romeo
abraham lincoln: hat president gettysburg
marie curie: radium scientist nobel
isaac newton: apple gravity laws
julius caesar: rome etu roman emperor ides salad
christopher columbus: 1492 sailed explorer ships america
queen victoria: england empire british widow
martin luther king: dream speech civil rights
mahatma gandhi: india peace peaceful salt march
joan of arc: france maid french burned
alexander the great: macedon greek conqueror persia
neil armstrong: moon astronaut apollo
ice cream: cone scoop cold dessert sundae
hot dog: bun frank mustard sausage baseball ketchup
birthday party: cake balloons candles gifts
swimming pool: dive water lifeguard
peanut butter: jelly spread
traffic light: red green stoplight yellow
rainy day: wet umbrella puddle cloudy gloomy drizzle
board game: dice monopoly chess family cards
fire truck: siren red engine ladder
polar bear: arctic ice white cold seal
movie theater: popcorn cinema film tickets
bubble bath: soap tub foam
scary movie: horror film
road trip: car drive map
pillow fight: feathers slumber
piece of cake: easy simple
break the ice: awkward icebreaker intro
under the weather: sick ill cold
once in a blue moon: rare rarely seldom never
cold shoulder: ignore snub rude
home sweet home: house cozy welcome
fish out of water: lost awkward uncomfortable odd
bucket list: before wishes die
cat nap: sleep snooze nap
sleeping bag: camping tent camp zip zipper
water slide: park splash wet
roller coaster: ride thrill rides amusement loop
chocolate cake: dessert choco layers
pizza party: slice pizza friends
snow angel: winter snowy arms
treasure map: x pirate marks
hot air balloon: basket fly sky float
time machine: delorean wells future past hg
magic carpet: aladdin flying genie
best friends: bff buddies pals
full moon: night lunar werewolf
day off: rest holiday weekend
big apple: nyc city ny
funny bone: elbow ouch humerus tingle crazy
sweet tooth: candy sugar dessert
piggy bank: coins savings pig
`;
  const CUES = {};
  RAW.trim().split('\n').forEach(line => { const [w, rest] = line.split(': '); CUES[w] = rest.trim().split(/\s+/).map(c => c.toUpperCase()); });
  if (typeof module !== 'undefined' && module.exports) module.exports = CUES; else root.YKWIM_CUES = CUES;
})(typeof window !== 'undefined' ? window : globalThis);
