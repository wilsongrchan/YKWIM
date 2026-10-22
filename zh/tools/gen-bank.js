// Builds the keyword bank and the syllable inventory inside zh/game.js (between the <bank> and <syl> markers) from the plain hanzi lists below.
// Edit the lists, then run:  npm i pinyin-pro@3.27.0 opencc-js && node tools/gen-bank.js   (from the zh folder)
// Readings come from pinyin-pro; FIX overrides the ones it gets wrong or where the Taiwan reading is wanted.
const { pinyin } = require('pinyin-pro');
const OpenCC = require('opencc-js');
const toCN = OpenCC.Converter({ from: 'tw', to: 'cn' });

const SRC = {
  '動物': '熊貓 老虎 獅子 大象 猴子 兔子 烏龜 海豚 企鵝 老鷹 蜜蜂 蝴蝶 青蛙 鯊魚 蝸牛 螃蟹 孔雀 駱駝 袋鼠 刺蝟 長頸鹿 無尾熊 大猩猩 黑猩猩 穿山甲 啄木鳥 食蟻獸 梅花鹿 小白兔 蜻蜓',
  '食物': '披薩 漢堡 蛋糕 餃子 包子 麵包 壽司 布丁 薯條 西瓜 蘋果 香蕉 草莓 芒果 檸檬 湯圓 粽子 月餅 巧克力 冰淇淋 臭豆腐 小籠包 蚵仔煎 牛肉麵 滷肉飯 蛋炒飯 三明治 爆米花 棉花糖 珍珠奶茶 鴛鴦火鍋 北京烤鴨 麻婆豆腐',
  '地方': '學校 醫院 機場 公園 海灘 沙漠 森林 城堡 寺廟 市場 港口 夜市 圖書館 博物館 遊樂園 動物園 水族館 體育館 便利店 萬里長城 海市蜃樓',
  '城市與國家': '台北 香港 東京 北京 上海 紐約 倫敦 巴黎 羅馬 首爾 曼谷 澳門 日本 美國 英國 法國 韓國 泰國 印度 德國 新加坡 洛杉磯 舊金山 溫哥華 墨爾本 吉隆坡 加拿大 西班牙 義大利 澳大利亞 馬來西亞',
  '物品': '雨傘 鏡子 蠟燭 剪刀 錢包 眼鏡 手機 鑰匙 枕頭 椅子 桌子 鉛筆 書包 時鐘 氣球 吉他 帽子 筷子 牙刷 梯子 遙控器 吸塵器 洗衣機 望遠鏡 手電筒 溜滑梯 打火機 紅綠燈 行李箱 太陽眼鏡 行動電源 魔術方塊',
  '自然': '海洋 河流 彩虹 閃電 冰山 羽毛 影子 地震 颱風 月亮 太陽 星星 雪花 火山 瀑布 珊瑚 仙人掌 龍捲風 北極光 流星雨 銀河系 向日葵',
  '職業': '醫生 老師 農夫 警察 護士 廚師 律師 司機 歌手 畫家 軍人 記者 店員 消防員 太空人 攝影師 工程師 科學家 理髮師 魔術師',
  '運動與活動': '足球 籃球 網球 排球 游泳 跑步 滑雪 衝浪 拳擊 射箭 瑜伽 跳舞 露營 爬山 釣魚 唱歌 羽毛球 保齡球 高爾夫',
  '奇幻與神話': '巨龍 巫師 海盜 雪人 火箭 精靈 幽靈 殭屍 恐龍 天使 惡魔 神仙 獨角獸 吸血鬼 機器人 美人魚 外星人 孫悟空 豬八戒 牛魔王 嫦娥',
  '人物與角色': '孔子 李白 牛頓 超人 周杰倫 李小龍 鄧麗君 皮卡丘 蜘蛛人 蝙蝠俠 鋼鐵人 米老鼠 唐老鴨 愛麗絲 灰姑娘 秦始皇 孫中山 拿破崙 達文西 福爾摩斯 愛因斯坦 莎士比亞 小熊維尼 聖誕老人 海綿寶寶 白雪公主 哈利波特',
  '品牌': '星巴克 麥當勞 肯德基 優衣庫 無印良品 樂高 特斯拉 任天堂 迪士尼 奧利奧 可口可樂 百事可樂 屈臣氏 寶馬 賓士 豐田 三星 華為 小米 淘寶 蝦皮 抖音',
  '成語與俗語': '守株待兔 畫蛇添足 亡羊補牢 狐假虎威 井底之蛙 對牛彈琴 葉公好龍 掩耳盜鈴 刻舟求劍 愚公移山 一箭雙鵰 杯弓蛇影 畫龍點睛 紙上談兵 草船借箭 三顧茅廬 塞翁失馬 鶴立雞群 雞飛狗跳 虎頭蛇尾 騎虎難下 馬到成功 一帆風順 心想事成 新年快樂 恭喜發財 拍馬屁 抱佛腳 炒魷魚 吃豆腐 開夜車 走後門 白日夢 紙老虎'
};

// where the library is wrong, or the Taiwan reading is the one wanted
const FIX = { '蚵仔煎': 'e2 zai3 jian1', '行李箱': 'xing2 li3 xiang1', '大猩猩': 'da4 xing1 xing1', '鑰匙': 'yao4 shi5', '開夜車': 'kai1 ye4 che1', '塞翁失馬': 'sai4 weng1 shi1 ma3', '葉公好龍': 'ye4 gong1 hao4 long2', '鄧麗君': 'deng4 li4 jun1', '愛麗絲': 'ai4 li4 si1' };

const rd = w => (FIX[w] || pinyin(w, { type: 'array', toneType: 'num' }).join(' ')).replace(/(\D)0\b/g, '$15').replace(/(\D)$/g, '$1').split(' ')
  .map(s => /\d$/.test(s) ? s : s + '5').join(' ');

const lines = [];
const seen = new Set();
for (const [cat, list] of Object.entries(SRC)) {
  const entries = list.split(' ').filter(w => { if (seen.has(w)) { console.error('dup', w); return false; } seen.add(w); return true; }).map(w => {
    const simp = toCN(w);
    return `${w} ${rd(w)}${simp !== w ? '/' + simp : ''}`;
  });
  lines.push(`    ${JSON.stringify(cat)}: '${entries.join(';')}'`);
}
const fs = require('fs'), path = require('path'), GAME = path.join(__dirname, '..', 'game.js');
const patch = (tag, body) => { const re = new RegExp('(// <' + tag + '>\\n)[\\s\\S]*?(\\n?[ \\t]*// </' + tag + '>)'); let g = fs.readFileSync(GAME, 'utf8'); if (!re.test(g)) throw new Error('marker ' + tag); fs.writeFileSync(GAME, g.replace(re, (m, a, b) => a + body + b)); };
patch('bank', lines.join(',\n'));

// syllable inventory: every toneless pinyin the library gives for a CJK character, spelled the way it is typed
const set = new Set();
for (let c = 0x4e00; c <= 0x9fff; c++) {
  const ch = String.fromCodePoint(c);
  let r; try { r = pinyin(ch, { type: 'array', toneType: 'none', multiple: true }); } catch { continue; }
  (Array.isArray(r) ? r : [r]).forEach(s => { if (/^[a-zü]+$/.test(s)) set.add(s); });
}
const arr = [...set].sort();
patch('syl', "    '" + arr.join(' ') + "'");
console.log('words', seen.size, 'syllables', arr.length);
