const emojis = [
  { id: "1059348824776245320", name: "yoshi" },
  { id: "1059348825929695353", name: "young_link" },
  { id: "1059348826768547841", name: "zelda" },
  { id: "1059348855398879242", name: "roy" },
  { id: "1059348856493584504", name: "samus" },
  { id: "1059348857366003793", name: "sheik" },
  { id: "1059348883270008883", name: "peach" },
  { id: "1059348884373110884", name: "pichu" },
  { id: "1059348887506260069", name: "pikachu" },
  { id: "1059353644320956416", name: "mewtwo" },
  { id: "1059353645285638204", name: "mr_game_and_watch" },
  { id: "1059353646300672040", name: "ness" },
  { id: "1059353675170062356", name: "luigi" },
  { id: "1059353676449329223", name: "mario" },
  { id: "1059353677799903242", name: "marth" },
  { id: "1059353711094276238", name: "jiggs" },
  { id: "1059353712381919275", name: "kirby" },
  { id: "1059353713514385520", name: "link" },
  { id: "1059353740479574036", name: "fox" },
  { id: "1059353741595254844", name: "ganondorf" },
  { id: "1059353742866128976", name: "ice_climbers" },
  { id: "1059353779885064272", name: "bowser" },
  { id: "1059353781206261780", name: "donkey_kong" },
  { id: "1059353782393253898", name: "drmario" },
  { id: "1059353783311814656", name: "falco" },
  { id: "1059354906361872446", name: "falcon" },
  { id: "1059632773515718676", name: "BronzeI" },
  { id: "1059632775025676478", name: "BronzeII" },
  { id: "1059632776355270747", name: "BronzeIII" },
  { id: "1059632779110916126", name: "DiamondI" },
  { id: "1059632780885119016", name: "DiamondII" },
  { id: "1059632782680268831", name: "DiamondIII" },
  { id: "1059632821825720480", name: "GoldI" },
  { id: "1059632823671205978", name: "GoldII" },
  { id: "1059632825369899129", name: "GoldIII" },
  { id: "1059632858920124507", name: "PlatinumI" },
  { id: "1059632860438478880", name: "PlatinumII" },
  { id: "1059632862535618580", name: "PlatinumIII" },
  { id: "1059632864175595530", name: "SilverI" },
  { id: "1059632865287094273", name: "SilverII" },
  { id: "1059632867006758943", name: "SilverIII" },
];

function uniqueId(id, name) {
  return `<:${name}:${id}>`;
}

const globalEmojis = emojis.map(({ id, name }) => [name, uniqueId(id, name)]);
const lookupByName = Object.fromEntries(globalEmojis);

console.log(JSON.stringify(lookupByName));

export function getEmojiIdForName(name) {
  const result = lookupByName[name];
  if (!result) console.log("Couldn't find emoji for name: " + name);
  return result;
}
