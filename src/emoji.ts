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
  { id: "1059353645285638204", name: "game_and_watch" },
  { id: "1059353646300672040", name: "ness" },
  { id: "1059353675170062356", name: "luigi" },
  { id: "1059353676449329223", name: "mario" },
  { id: "1059353677799903242", name: "marth" },
  { id: "1059353711094276238", name: "jigglypuff" },
  { id: "1059353712381919275", name: "kirby" },
  { id: "1059353713514385520", name: "link" },
  { id: "1059353740479574036", name: "fox" },
  { id: "1059353741595254844", name: "ganondorf" },
  { id: "1059353742866128976", name: "ice_climbers" },
  { id: "1059353779885064272", name: "bowser" },
  { id: "1059353781206261780", name: "donkey_kong" },
  { id: "1059353782393253898", name: "dr_mario" },
  { id: "1059353783311814656", name: "falco" },
  { id: "1059354906361872446", name: "captain_falcon" },
  { id: "1059647074477551616", name: "SilverI" },
  { id: "1059647076197224479", name: "SilverII" },
  { id: "1059647078470533160", name: "SilverIII" },
  { id: "1059647103321788436", name: "PlatinumI" },
  { id: "1059647104584273950", name: "PlatinumII" },
  { id: "1059647106018726059", name: "PlatinumIII" },
  { id: "1059647214835740692", name: "MasterI" },
  { id: "1084274532665262160", name: "MasterII" },
  { id: "1059647262785028107", name: "GoldI" },
  { id: "1059647264718589993", name: "GoldII" },
  { id: "1059647266266300527", name: "GoldIII" },
  { id: "1059647294967926844", name: "DiamondI" },
  { id: "1059647296368803850", name: "DiamondII" },
  { id: "1059647297681625188", name: "DiamondIII" },
  { id: "1059647330149740626", name: "BronzeI" },
  { id: "1059647332498542682", name: "BronzeII" },
  { id: "1059647333916233778", name: "BronzeIII" },
  { id: "1078545170133417985", name: "Grandmaster" },
  { id: "1133094737222582533", name: "None" },
];

function uniqueId(id: string, name: string) {
  return `<:${name}:${id}>`;
}

const globalEmojis = emojis.map(({ id, name }) => [name, uniqueId(id, name)]);
const lookupByName = Object.fromEntries(globalEmojis) as {
  [key: string]: string;
};

export function getEmojiIdForName(name: string) {
  const result = lookupByName[name];
  if (!result) console.log("Couldn't find emoji for name: " + name);
  return result;
}
