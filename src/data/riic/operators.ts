export const invalidOperators = [
    "char_1001_amiya2", // Amiya guard
    "char_1037_amiya3"  // Amiya medic
];

export const karlanTradeOperators = [
    "char_173_slchan", // Cliffheart
    "char_172_svrash", // Silverash
    "char_174_slbell", // Pramanix
    "char_206_gnosis", // Gnosis
    "char_199_yak",    // Matterhorn
    "char_198_blackd", // Courier
    "char_4013_kjera", // Kjera
    "char_422_aurora", // Aurora
    "char_4116_blkkgt" // Degenbrecher
];

export const a1Operators = [
    "char_123_fang",   // Fang
    "char_124_kroos",  // Kroos
    "char_122_beagle", // Beagle
    "char_120_hibisc", // Hibiscus
    "char_121_lava"    // Lava
];

export const bswOperators = [
    "char_235_jesica",  // Jessica
    "char_240_wyvern",  // Vanilla
    "char_4105_almond", // Almond
    "char_107_liskam",  // Liskarm
    "char_106_franka"   // Franka
];

export const lateranoOperators = [
    "char_302_glaze",   // Ambriel
    "char_332_archet",  // Archetto
    "char_271_spikes",  // Arene
    "char_4188_confes", // Confess-47
    "char_4036_forcer", // Enforcer
    "char_279_excu",    // Executor
    "char_1032_excu2",  // Executor alter
    "char_300_phenxi",  // Fiammetta
    "char_498_inside",  // Insider
    "char_4193_lemuen", // Lemuen
    "char_213_mostma",  // Mostima
    "char_192_falco",   // Plume
    "char_4194_rmixer", // Sankta Miksaparato
    "char_4015_spuria", // Spuria
    "char_245_cello",   // Virtuosa
];

export const vermeilBubbleTeamCandidates = [
    "char_336_folivo",  // Scene
    "char_485_pallas",  // Pallas
    "char_2013_cerber", // Ceobe
    "char_1032_excu2",  // Executor alter
    "char_328_cammou",  // Click
    "char_1042_phatm2", // Tragodia
    "char_4198_christ", // Miss Christine
    "char_4138_narant", // Narantuya
    "char_4155_talr",   // Figurino
    "char_4171_wulfen", // Wulfenite
    "char_464_cement",  // Cement
    "char_378_asbest",  // Asbestos
    "char_452_bstalk",  // Beanstalk
    "char_500_noirc",   // Noir Corne
    "char_150_snakek",  // Cuora
    "char_163_hpsts",   // Vulcan
    "char_369_bena"     // Bena
];

// Candidates for Jaye without Gnosis in CC
export const jayeCandidates = [
    "char_102_texas",  // Texas
    "char_140_whitew", // Lappland
    "char_172_svrash", // Silverash
    "char_4163_rosesa",// Rose Salt
    "char_325_bison",  // Bison
    "char_173_slchan", // Cliffheart
];

/**
 * Excludes operators that are only viable candidates thanks to Vermeil/Bubble, like Bena/Bubble/Click
 * Evaluation should be done on general + gold OR general + Exp operators for FAC, to limit how many
 * checks are being done.
 * Note that operators that solely have special effects will NOT be added below, as they are already
 * part of special squad evaluation, meaning all the ops listed have at least 1 helpful effect outside
 * of their dedicated squad (if applicable).
 * Workshop and training room are ignored.
 */

/*********************************
 * ---------- FACTORY ---------- *
 *********************************/
export const facGoldOperators = [
    "char_4138_narant", // Narantuya
    "char_1039_thorn2", // Thorns alter
    "char_4178_alanna", // Alanna
    "char_4105_almond", // Almond
    "char_446_aroma",   // Aroma
    "char_4106_bryota", // Bryophyta
    "char_4081_warmy",  // Warmy
    "char_237_gravel",  // Gravel
    "char_141_nights",  // Haze
    "char_385_finlpp",  // Purestream
    "char_284_spot",    // Spot
];

export const facExpOperators = [
    "char_1502_crosly", // Crownslayer
    "char_1032_excu2",  // Executor alter
    "char_485_pallas",  // Pallas
    "char_1042_phatm2", // Phantom alter
    "char_241_panda",   // FEater
    "char_194_leto",    // Leto
    "char_4198_christ", // Miss Christine
    "char_159_peacok",  // Conviction
    "char_193_frostl",  // Frostleaf
    "char_118_yuki",    // Shirayuki
    "char_290_vigna",   // Vigna
    "char_286_cast3",   // Castle-3
];

// Automation is evaluated separately
export const facGeneralistOperators = [
    "char_2013_cerber", // Ceobe
    "char_4048_doroth", // Dorothy
    "char_430_fartth",  // Fartooth
    "char_4141_marcil", // Marcille
    "char_437_mizuki",  // Mizuki
    "char_1031_slent2", // Silence alter
    "char_378_asbest",  // Asbestos
    "char_431_ashlok",  // Ashlock
    "char_135_halo",    // Astgenne
    "char_464_cement",  // Cement
    "char_1036_fang2",  // Fang alter
    "char_4155_talr",   // Figurino
    "char_4126_fuze",   // Fuze
    "char_4066_highmo", // Highmore
    "char_242_otter",   // Mayer
    "char_4054_malist", // Minimalist
    "char_128_plosis",  // Ptilopsis
    "char_336_folivo",  // Scene
    "char_108_silent",  // Silence
    "char_243_waaifu",  // Waai Fu
    "char_496_wildmn",  // Wild Mane
    "char_4171_wulfen", // Wulfenite
    "char_452_bstalk",  // Beanstalk
    "char_4041_chnut",  // Chestnut
    "char_150_snakek",  // Cuora
    "char_235_jesica",  // Jessica
    "char_126_shotst",  // Meteor
    "char_181_flower",  // Perfumer
    "char_4063_quartz", // Quartz
    "char_484_robrta",  // Roberta
    "char_4062_totter", // Totter
    "char_122_beagle",  // Beagle
    "char_209_ardign",  // Cardigan
    "char_123_fang",    // Fang
    "char_124_kroos",   // Kroos
    "char_281_popka",   // Popukar
    "char_210_stward",  // Steward
    "char_240_wyvern",  // Vanilla
    "char_500_noirc",   // Noir Corne
    "char_502_nblade",  // Yato
];

/**************************************
 * ---------- TRADING POST ---------- *
 **************************************/
export const tpOperators = [
    "char_332_archet",  // Archetto
    "char_4116_blkkgt", // Degenbrecher
    "char_103_angel",   // Exusiai
    "char_1041_angel2", // Exusiai alter
    "char_4088_hodrer", // Hoederer
    "char_1034_jesca2", // Jessica alter
    "char_4193_lemuen", // Lemuen
    "char_172_svrash",  // Silverash
    "char_1033_swire2", // Swire alter
    "char_427_vigil",   // Vigil
    "char_1019_siege2", // Siege alter
    "char_365_aprl",    // April
    "char_325_bison",   // Bison
    "char_4144_chilc",  // Chilchuck
    "char_173_slchan",  // Cliffheart
    "char_201_moeshd",  // Croissant
    "char_493_firwhl",  // Firewhistle
    "char_4045_heidi",  // Heidi
    "char_4147_mitm",   // Mitm
    "char_154_morgan",  // Morgan
    "char_4163_rosesa", // Rose Salt
    "char_4140_lasher", // Sand Reckoner
    "char_383_snsant",  // Snowsant
    "char_101_sora",    // Sora
    "char_4137_udflow", // Underflow
    "char_302_glaze",   // Ambriel
    "char_198_blackd",  // Courier
    "char_150_snakek",  // Cuora
    "char_110_deepcl",  // Deepcolor
    "char_109_fmout",   // Gitano
    "char_196_sunbr",   // Gummy
    "char_141_nights",  // Haze
    "char_272_strong",  // Jaye
    "char_289_gyuki",   // Matoimaru
    "char_199_yak",     // Matterhorn
    "char_185_frncat",  // Mousse
    "char_4063_quartz", // Quartz
    "char_211_adnach",  // Adnachiel
    "char_282_catap",   // Catapult
    "char_123_fang",    // Fang
    "char_208_melan",   // Melantha
    "char_283_midn",    // Midnight
    "char_278_orchid",  // Orchid
    "char_192_falco",   // Plume
    "char_240_wyvern",  // Vanilla
    "char_500_noirc",   // Noir Corne
    "char_502_nblade",  // Yato
];

/*************************************
 * ---------- POWER PLANT ---------- *
 *************************************/
export const ppOperators = [
    "char_017_huang",   // Blaze
    "char_1040_blaze2", // Blaze alter
    "char_377_gdglow",  // Goldenglow
    "char_134_ifrit",   // Ifrit
    "char_1043_leizi2", // Leizi alter
    "char_249_mlyss",   // Muelsyse
    "char_326_glacus",  // Glaucus
    "char_1027_greyy2", // Greyy alter
    "char_1011_lava2",  // Lava alter
    "char_107_liskam",  // Liskarm
    "char_4079_haini",  // Lucilla
    "char_4148_philae", // Philae
    "char_4015_spuria", // Spuria
    "char_253_greyy",   // Greyy
    "char_469_indigo",  // Indigo
    "char_4004_pudd",   // Pudding
    "char_385_finlpp",  // Purestream
    "char_277_sqrrel",  // Shaw
    "char_121_lava",    // Lava
    "char_286_cast3",   // Castle-3
    "char_4188_confes", // Confess-47
    "char_4093_frston", // Friston-3
    "char_4000_jnight", // Justice Knight
    "char_285_medic2",  // Lancet-2
    "char_4136_phonor", // Phonor-0
    "char_376_therex",  // Thrm-X
];

/*****************************************
 * ---------- HUMAN RESOURCES ---------- *
 *****************************************/
export const hrOperators = [
    "char_180_amgoat", // Eyja
    "char_4087_ines",  // Ines
    "char_4080_lin",   // Lin
    "char_264_f12yin", // Mountain
    "char_4065_judge", // Penance
    "char_1031_slent2",// Silence alter
    "char_4109_baslin",// Bassline
    "char_4177_brigid",// Brigid
    "char_4110_delphn",// Delphine
    "char_498_inside", // Insider
    "char_473_mberry", // Mulberry
    "char_164_nightm", // Nightmare
    "char_145_prove",  // Provence
    "char_466_qanik",  // Qanipalaat
    "char_4151_tinman",// Tin Man
    "char_343_tknogi", // Tsukinogi
    "char_436_whispr", // Whisperain
    "char_4172_xingzh",// Xingzhu
    "char_366_acdrop", // Aciddrop
    "char_183_skgoat", // Earthspirit
    "char_355_ethan",  // Ethan
    "char_337_utage",  // Utage
    "char_278_orchid", // Orchid
    "char_503_rang",   // Rangers
];

/****************************************
 * ---------- RECEPTION ROOM ---------- *
 ****************************************/
// Only operators that change clue speed will be included, since clue bias is a scam

export const rrOperatorsSolo = [
    "char_4027_heyak",  // Ho'olheyak
    "char_297_hamoni",  // Harmonie
    "char_4016_kazema", // Kazemaru
    "char_4131_odda",   // Odda
];

export const rrOperatorsPairs = [
    ["char_4026_vulpis", "char_358_lisa"],    // Vulpisfoglia / Suzuran
    ["char_4102_threye", "char_2012_typhon"], // Valarqvin / Typhoon
];

export const rrOperators = [
    "char_291_aglina",  // Angelina
    "char_010_chen",    // Ch'en
    "char_4027_heyak",  // Ho'olheyak
    "char_4087_ines",   // Ines
    "char_213_mostma",  // Mostima
    "char_197_poca",    // Rosa
    "char_4194_rmixer", // Sankta Miksaparato
    "char_202_demkni",  // Saria
    "char_2012_typhon", // Typhoon
    "char_427_vigil",   // Vigil
    "char_4026_vulpis", // Vulpisfoglia
    "char_274_astesi",  // Astesia
    "char_294_ayer",    // Ayerscarpe
    "char_275_breeze",  // Breeze
    "char_497_ctable",  // Cantabile
    "char_4036_forcer", // Enforcer
    "char_158_milu",    // Firewatch
    "char_106_franka",  // Franka
    "char_297_hamoni",  // Harmonie
    "char_4114_harold", // Harold
    "char_155_tiger",   // Indra
    "char_195_glassb",  // Istina
    "char_4016_kazema", // Kazemaru
    "char_4013_kjera",  // Kjera
    "char_4142_laios",  // Laios
    "char_4131_odda",   // Odda
    "char_144_red",     // Projekt Red
    "char_4017_puzzle", // Puzzle
    "char_4052_surfer", // Surfer
    "char_4102_threye", // Valarqvin
    "char_4172_xingzh", // Xingzhu
    "char_4100_caper",  // Caper
    "char_198_blackd",  // Courier
    "char_109_fmout",   // Gitano
    "char_347_jaksel",  // Jackie
    "char_235_jesica",  // Jessica
    "char_133_mm",      // May
    "char_236_rope",    // Rope
    "char_118_yuki",    // Shirayuki
    "char_337_utage",   // Utage
    "char_445_wscoot",  // Windscoot
    "char_009_12fce",   // 12F
];

/****************************************
 * ---------- CONTROL CENTER ---------- *
 ****************************************/
export const ccOperatorsFacPd = [
    "char_003_kalts",   // Kal'tsit
    "char_4179_monstr", // Mon3tr
];

export const ccOperatorsTpPd = [
    "char_002_amiya",   // Amiya
    "char_4132_ascln",  // Ascalon
    "char_4071_peper",  // Paprika
    "char_308_swire",   // Swire
];

export const ccOperatorsRrSpeed = [
    "char_4134_cetsyr", // Civilight Eterna
    "char_226_hmau",    // Lee
];

// For Mlynar synergy, he gets a special evaluation
export const ccOperatorsSmileys = [
    "char_420_flamtl",  // Flametail
    "char_4179_monstr", // Mon3tr
    "char_4098_vvana",  // Viviana
    "char_4104_coldst", // Coldshot
    "char_4023_rfalcn", // Kestrel
    "char_144_red",     // Projekt Red
    "char_149_scave",   // Scavenger
    "char_130_doberm",  // Dobermann
    "char_260_durnar",  // Dur-Nar
    "char_4195_radian", // Raidian
    "char_279_excu",    // Executor
    "char_367_swllow",  // Greythroat
    "char_304_zebra",   // Heavyrain
    "char_148_nearl",   // Nearl
    "char_261_sddrag",  // Reed
];

export const ccOperatorsAlterTeam = [

];

export const ccOperatorsDormRec = [
    "char_4146_nymph",  // Nymph
    "char_1020_reed2",  // Reed alter
    "char_4023_rfalcn", // Kestrel
];

export const ccOperatorsTrainingSpeed = [
    "char_4132_ascln",  // Ascalon
    "char_1040_blaze2", // Blaze alter
];

export const ccOperatorsHrBuff = [
    "char_479_sleach",  // Saileach
];

export const ccOperators = [
    "char_010_chen",    // Ch'en
    "char_2024_chyue",  // Chong Yue
    "char_2015_dusk",   // Dusk,
    "char_206_gnosis",  // Gnosis
    "char_4064_mlynar", // Mlynar
    "char_197_poca",    // Rosa
    "char_1035_wisdel", // Wisadel
];