// YKWIM 中文版 rules. Authoritative: runs in the host's browser (and in node for tests).
// Clients send intents via handle(); every peer gets its own filtered view() so hidden info
// (the keyword, the clues) only reaches the people allowed to see it.
//
// 字字珠璣 (YKWIM Chinese Version). The English game is about the order and cost of letters; here a clue is written characters only, and
// the cost is doubling (15, 30, 60...) for each clue-giver. The ban is by sound: no character that sounds like one of the keyword's characters.
// A later clue-giver sees only the sounds (no tone, no order) of the earlier clues, and the guesser sees the characters.
(function (root) {
  // Keyword bank. Each entry is "漢字 pin1 yin1/简体" (the simplified form is only there when it differs). Generated from tools/gen-bank.js: edit the word
  // lists there, not here. Neutral tone is written 5.
  const BANK = {
    // <bank>
    "動物": '熊貓 xiong2 mao1/熊猫;老虎 lao3 hu3;獅子 shi1 zi3/狮子;大象 da4 xiang4;猴子 hou2 zi5;兔子 tu4 zi5;烏龜 wu1 gui1/乌龟;海豚 hai3 tun2;企鵝 qi3 e2/企鹅;老鷹 lao3 ying1/老鹰;蜜蜂 mi4 feng1;蝴蝶 hu2 die2;青蛙 qing1 wa1;鯊魚 sha1 yu2/鲨鱼;蝸牛 wo1 niu2/蜗牛;螃蟹 pang2 xie4;孔雀 kong3 que4;駱駝 luo4 tuo2/骆驼;袋鼠 dai4 shu3;刺蝟 ci4 wei4/刺猬;長頸鹿 chang2 jing3 lu4/长颈鹿;無尾熊 wu2 wei3 xiong2/无尾熊;大猩猩 da4 xing1 xing1;黑猩猩 hei1 xing1 xing1;穿山甲 chuan1 shan1 jia3;啄木鳥 zhuo2 mu4 niao3/啄木鸟;食蟻獸 shi2 yi3 shou4/食蚁兽;梅花鹿 mei2 hua1 lu4;小白兔 xiao3 bai2 tu4;蜻蜓 qing1 ting2;北極熊 bei3 ji2 xiong2/北极熊;變色龍 bian4 se4 long2/变色龙;貓頭鷹 mao1 tou2 ying1/猫头鹰;金絲猴 jin1 si1 hou2/金丝猴;大白鯊 da4 bai2 sha1/大白鲨;小丑魚 xiao3 chou3 yu2/小丑鱼;大熊貓 da4 xiong2 mao1/大熊猫;白頭海鵰 bai2 tou2 hai3 diao1/白头海雕',
    "食物": '披薩 pi1 sa4/披萨;漢堡 han4 bao3/汉堡;蛋糕 dan4 gao1;餃子 jiao3 zi3/饺子;包子 bao1 zi3;麵包 mian4 bao1/面包;壽司 shou4 si1/寿司;布丁 bu4 ding1;薯條 shu3 tiao2/薯条;西瓜 xi1 gua1;蘋果 pin2 guo3/苹果;香蕉 xiang1 jiao1;草莓 cao3 mei2;芒果 mang2 guo3;檸檬 ning2 meng2/柠檬;湯圓 tang1 yuan2/汤圆;粽子 zong4 zi3;月餅 yue4 bing3/月饼;巧克力 qiao3 ke4 li4;冰淇淋 bing1 qi2 lin2;臭豆腐 chou4 dou4 fu5;小籠包 xiao3 long2 bao1/小笼包;蚵仔煎 e2 zai3 jian1;牛肉麵 niu2 rou4 mian4/牛肉面;滷肉飯 lu3 rou4 fan4/卤肉饭;蛋炒飯 dan4 chao3 fan4/蛋炒饭;三明治 san1 ming2 zhi4;爆米花 bao4 mi3 hua1;棉花糖 mian2 hua1 tang2;珍珠奶茶 zhen1 zhu1 nai3 cha2;鴛鴦火鍋 yuan1 yang1 huo3 guo1/鸳鸯火锅;北京烤鴨 bei3 jing1 kao3 ya1/北京烤鸭;麻婆豆腐 ma2 po2 dou4 fu5;鳳梨酥 feng4 li2 su1/凤梨酥;蛋黃酥 dan4 huang2 su1/蛋黄酥;煎餅果子 jian1 bing3 guo3 zi3/煎饼果子;小龍蝦 xiao3 long2 xia1/小龙虾;紅燒肉 hong2 shao1 rou4/红烧肉;宮保雞丁 gong1 bao3 ji1 ding1/宫保鸡丁;糖葫蘆 tang2 hu2 lu2/糖葫芦;提拉米蘇 ti2 la1 mi3 su1/提拉米苏;草莓蛋糕 cao3 mei2 dan4 gao1;地瓜球 di4 gua1 qiu2;鹹酥雞 xian2 su1 ji1/咸酥鸡',
    "地方或建築": '學校 xue2 xiao4/学校;醫院 yi1 yuan4/医院;機場 ji1 chang3/机场;公園 gong1 yuan2/公园;海灘 hai3 tan1/海滩;沙漠 sha1 mo4;森林 sen1 lin2;城堡 cheng2 bao3;寺廟 si4 miao4/寺庙;市場 shi4 chang3/市场;港口 gang3 kou3;夜市 ye4 shi4;圖書館 tu2 shu1 guan3/图书馆;博物館 bo2 wu4 guan3/博物馆;遊樂園 you2 le4 yuan2/游乐园;動物園 dong4 wu4 yuan2/动物园;水族館 shui3 zu2 guan3/水族馆;體育館 ti3 yu4 guan3/体育馆;便利店 bian4 li4 dian4;萬里長城 wan4 li3 chang2 cheng2/万里长城;海市蜃樓 hai3 shi4 shen4 lou2/海市蜃楼;火車站 huo3 che1 zhan4/火车站;地鐵站 di4 tie3 zhan4/地铁站;加油站 jia1 you2 zhan4;游泳池 you2 yong3 chi2;購物中心 gou4 wu4 zhong1 xin1/购物中心;電影院 dian4 ying3 yuan4/电影院;咖啡廳 ka1 fei1 ting1/咖啡厅;溜冰場 liu1 bing1 chang3/溜冰场;摩天輪 mo2 tian1 lun2/摩天轮;自由女神像 zi4 you2 nü3 shen2 xiang4;凱旋門 kai3 xuan2 men2/凯旋门;東京鐵塔 dong1 jing1 tie3 ta3/东京铁塔;黃鶴樓 huang2 he4 lou2/黄鹤楼;艾菲爾鐵塔 ai4 fei1 er3 tie3 ta3/艾菲尔铁塔;比薩斜塔 bi3 sa4 xie2 ta3/比萨斜塔;金字塔 jin1 zi4 ta3;紫禁城 zi3 jin4 cheng2;天安門 tian1 an1 men2/天安门;故宮 gu4 gong1/故宫;兵馬俑 bing1 ma3 yong3/兵马俑;布達拉宮 bu4 da2 la1 gong1/布达拉宫;泰姬陵 tai4 ji1 ling2;吳哥窟 wu2 ge1 ku1/吴哥窟;雪梨歌劇院 xue3 li2 ge1 ju4 yuan4/雪梨歌剧院;白宮 bai2 gong1/白宫;大笨鐘 da4 ben4 zhong1/大笨钟;倫敦塔橋 lun2 dun1 ta3 qiao2/伦敦塔桥;金門大橋 jin1 men2 da4 qiao2/金门大桥;太空針塔 tai4 kong1 zhen1 ta3/太空针塔;帝國大廈 di4 guo2 da4 sha4/帝国大厦;時代廣場 shi2 dai4 guang3 chang3/时代广场;台北一零一 tai2 bei3 yi1 ling2 yi1;東方明珠 dong1 fang1 ming2 zhu1/东方明珠;小美人魚像 xiao3 mei3 ren2 yu2 xiang4/小美人鱼像;威尼斯 wei1 ni2 si1;富士山 fu4 shi4 shan1;日月潭 ri4 yue4 tan2;阿里山 a1 li3 shan1;西湖 xi1 hu2;桂林山水 gui4 lin2 shan1 shui3;黃山 huang2 shan1/黄山;故宮博物院 gu4 gong1 bo2 wu4 yuan4/故宫博物院;迪士尼樂園 di2 shi4 ni2 le4 yuan2/迪士尼乐园;環球影城 huan2 qiu2 ying3 cheng2/环球影城;羅馬競技場 luo2 ma3 jing4 ji4 chang3/罗马竞技场;萬神殿 wan4 shen2 dian4/万神殿;聖母院 sheng4 mu3 yuan4/圣母院;白金漢宮 bai2 jin1 han4 gong1/白金汉宫;清水寺 qing1 shui3 si4;金閣寺 jin1 ge2 si4/金阁寺;雷峰塔 lei2 feng1 ta3;岳陽樓 yue4 yang2 lou2/岳阳楼;滕王閣 teng2 wang2 ge2/滕王阁;天壇 tian1 tan2/天坛;頤和園 yi2 he2 yuan2/颐和园;九份老街 jiu3 fen4 lao3 jie1;墾丁 ken3 ding1/垦丁;太魯閣 tai4 lu3 ge2/太鲁阁;龍山寺 long2 shan1 si4/龙山寺;自由廣場 zi4 you2 guang3 chang3/自由广场;中正紀念堂 zhong1 zheng4 ji4 nian4 tang2/中正纪念堂;總統府 zong3 tong3 fu3/总统府',
    "城市與國家": '台北 tai2 bei3;香港 xiang1 gang3;東京 dong1 jing1/东京;北京 bei3 jing1;上海 shang4 hai3;紐約 niu3 yue1/纽约;倫敦 lun2 dun1/伦敦;巴黎 ba1 li2;羅馬 luo2 ma3/罗马;首爾 shou3 er3/首尔;曼谷 man4 gu3;澳門 ao4 men2/澳门;日本 ri4 ben3;美國 mei3 guo2/美国;英國 ying1 guo2/英国;法國 fa3 guo2/法国;韓國 han2 guo2/韩国;泰國 tai4 guo2/泰国;印度 yin4 du4;德國 de2 guo2/德国;新加坡 xin1 jia1 po1;洛杉磯 luo4 shan1 ji1/洛杉矶;舊金山 jiu4 jin1 shan1/旧金山;溫哥華 wen1 ge1 hua2/温哥华;墨爾本 mo4 er3 ben3/墨尔本;吉隆坡 ji2 long2 po1;加拿大 jia1 na2 da4;西班牙 xi1 ban1 ya2;義大利 yi4 da4 li4/义大利;澳大利亞 ao4 da4 li4 ya1/澳大利亚;馬來西亞 ma3 lai2 xi1 ya1/马来西亚;墨西哥 mo4 xi1 ge1;俄羅斯 e2 luo2 si1/俄罗斯;土耳其 tu3 er3 qi2;阿根廷 a1 gen1 ting2;紐西蘭 niu3 xi1 lan2/纽西兰;菲律賓 fei1 lü4 bin1/菲律宾;阿姆斯特丹 a1 mu3 si1 te4 dan1;維也納 wei2 ye3 na4/维也纳;伊斯坦堡 yi1 si1 tan3 bao3;拉斯維加斯 la1 si1 wei2 jia1 si1/拉斯维加斯;烏克蘭 wu1 ke4 lan2/乌克兰',
    "物品": '雨傘 yu3 san3/雨伞;鏡子 jing4 zi3/镜子;蠟燭 la4 zhu2/蜡烛;剪刀 jian3 dao1;錢包 qian2 bao1/钱包;眼鏡 yan3 jing4/眼镜;手機 shou3 ji1/手机;鑰匙 yao4 shi5/钥匙;枕頭 zhen3 tou2/枕头;椅子 yi3 zi5;桌子 zhuo1 zi5;鉛筆 qian1 bi3/铅笔;書包 shu1 bao1/书包;時鐘 shi2 zhong1/时钟;氣球 qi4 qiu2/气球;吉他 ji2 ta1;帽子 mao4 zi5;筷子 kuai4 zi5;牙刷 ya2 shua1;梯子 ti1 zi3;遙控器 yao2 kong4 qi4/遥控器;吸塵器 xi1 chen2 qi4/吸尘器;洗衣機 xi3 yi1 ji1/洗衣机;望遠鏡 wang4 yuan3 jing4/望远镜;手電筒 shou3 dian4 tong3/手电筒;溜滑梯 liu1 hua2 ti1;打火機 da3 huo3 ji1/打火机;紅綠燈 hong2 lü4 deng1/红绿灯;行李箱 xing2 li3 xiang1;太陽眼鏡 tai4 yang2 yan3 jing4/太阳眼镜;行動電源 xing2 dong4 dian4 yuan2/行动电源;魔術方塊 mo2 shu4 fang1 kuai4/魔术方块;微波爐 wei1 bo1 lu2/微波炉;吹風機 chui1 feng1 ji1/吹风机;電風扇 dian4 feng1 shan4/电风扇;充電器 chong1 dian4 qi4/充电器;安全帽 an1 quan2 mao4;自行車 zi4 xing2 che1/自行车;降落傘 jiang4 luo4 san3/降落伞;溜冰鞋 liu1 bing1 xie2;洗碗機 xi3 wan3 ji1/洗碗机;保溫杯 bao3 wen1 bei1/保温杯;行事曆 xing2 shi4 li4/行事历;電冰箱 dian4 bing1 xiang1/电冰箱',
    "自然": '海洋 hai3 yang2;河流 he2 liu2;彩虹 cai3 hong2;閃電 shan3 dian4/闪电;冰山 bing1 shan1;羽毛 yu3 mao2;影子 ying3 zi5;地震 di4 zhen4;颱風 tai2 feng1/台风;月亮 yue4 liang4;太陽 tai4 yang2/太阳;星星 xing1 xing1;雪花 xue3 hua1;火山 huo3 shan1;瀑布 pu4 bu4;珊瑚 shan1 hu2;仙人掌 xian1 ren2 zhang3;龍捲風 long2 juan3 feng1/龙卷风;北極光 bei3 ji2 guang1/北极光;流星雨 liu2 xing1 yu3;銀河系 yin2 he2 xi4/银河系;向日葵 xiang4 ri4 kui2;大峽谷 da4 xia2 gu3/大峡谷;撒哈拉沙漠 sa1 ha1 la1 sha1 mo4;喜馬拉雅山 xi3 ma3 la1 ya3 shan1/喜马拉雅山;珠穆朗瑪峰 zhu1 mu4 lang3 ma3 feng1/珠穆朗玛峰;日全食 ri4 quan2 shi2;沙塵暴 sha1 chen2 bao4/沙尘暴;熱帶雨林 re4 dai4 yu3 lin2/热带雨林;蒲公英 pu2 gong1 ying1',
    "職業": '醫生 yi1 sheng1/医生;老師 lao3 shi1/老师;農夫 nong2 fu1/农夫;警察 jing3 cha2;護士 hu4 shi4/护士;廚師 chu2 shi1/厨师;律師 lü4 shi1/律师;司機 si1 ji1/司机;歌手 ge1 shou3;畫家 hua4 jia1/画家;軍人 jun1 ren2/军人;記者 ji4 zhe3/记者;店員 dian4 yuan2/店员;消防員 xiao1 fang2 yuan2/消防员;太空人 tai4 kong1 ren2;攝影師 she4 ying3 shi1/摄影师;工程師 gong1 cheng2 shi1/工程师;科學家 ke1 xue2 jia1/科学家;理髮師 li3 fa4 shi1/理发师;魔術師 mo2 shu4 shi1/魔术师;飛行員 fei1 xing2 yuan2/飞行员;空服員 kong1 fu2 yuan2/空服员;建築師 jian4 zhu4 shi1/建筑师;運動員 yun4 dong4 yuan2/运动员;心理醫生 xin1 li3 yi1 sheng1/心理医生;美髮師 mei3 fa4 shi1/美发师;外科醫生 wai4 ke1 yi1 sheng1/外科医生;快遞員 kuai4 di4 yuan2/快递员',
    "運動與活動": '足球 zu2 qiu2;籃球 lan2 qiu2/篮球;網球 wang3 qiu2/网球;排球 pai2 qiu2;游泳 you2 yong3;跑步 pao3 bu4;滑雪 hua2 xue3;衝浪 chong1 lang4/冲浪;拳擊 quan2 ji1/拳击;射箭 she4 jian4;瑜伽 yu2 jia1;跳舞 tiao4 wu3;露營 lu4 ying2/露营;爬山 pa2 shan1;釣魚 diao4 yu2/钓鱼;唱歌 chang4 ge1;羽毛球 yu3 mao2 qiu2;保齡球 bao3 ling2 qiu2/保龄球;高爾夫 gao1 er3 fu1/高尔夫;乒乓球 ping1 pang1 qiu2;橄欖球 gan3 lan3 qiu2/橄榄球;曲棍球 qu3 gun4 qiu2;放風箏 fang4 feng1 zheng1/放风筝;堆雪人 dui1 xue3 ren2;逛夜市 guang4 ye4 shi4;騎腳踏車 qi2 jiao3 ta4 che1/骑脚踏车;高空彈跳 gao1 kong1 dan4 tiao4/高空弹跳;溜直排輪 liu1 zhi2 pai2 lun2/溜直排轮',
    "奇幻與神話": '巨龍 ju4 long2/巨龙;巫師 wu1 shi1/巫师;海盜 hai3 dao4/海盗;雪人 xue3 ren2;火箭 huo3 jian4;精靈 jing1 ling2/精灵;幽靈 you1 ling2/幽灵;殭屍 jiang1 shi1/僵尸;恐龍 kong3 long2/恐龙;天使 tian1 shi3;惡魔 e4 mo2/恶魔;神仙 shen2 xian1;獨角獸 du2 jiao3 shou4/独角兽;吸血鬼 xi1 xue4 gui3;機器人 ji1 qi4 ren2/机器人;美人魚 mei3 ren2 yu2/美人鱼;外星人 wai4 xing1 ren2;孫悟空 sun1 wu4 kong1/孙悟空;豬八戒 zhu1 ba1 jie4/猪八戒;牛魔王 niu2 mo2 wang2;嫦娥 chang2 e2;玉皇大帝 yu4 huang2 da4 di4;齊天大聖 qi2 tian1 da4 sheng4/齐天大圣;魔法棒 mo2 fa3 bang4;水晶球 shui3 jing1 qiu2;龍騎士 long2 qi2 shi4/龙骑士;小精靈 xiao3 jing1 ling2/小精灵;七仙女 qi1 xian1 nü3;沙和尚 sha1 he2 shang4;變形金剛 bian4 xing2 jin1 gang1/变形金刚',
    "人物與角色": '孔子 kong3 zi3;李白 li3 bai2;牛頓 niu2 dun4/牛顿;超人 chao1 ren2;周杰倫 zhou1 jie2 lun2/周杰伦;李小龍 li3 xiao3 long2/李小龙;鄧麗君 deng4 li4 jun1/邓丽君;皮卡丘 pi2 ka3 qiu1;蜘蛛人 zhi1 zhu1 ren2;蝙蝠俠 bian1 fu2 xia2/蝙蝠侠;鋼鐵人 gang1 tie3 ren2/钢铁人;米老鼠 mi3 lao3 shu3;唐老鴨 tang2 lao3 ya1/唐老鸭;愛麗絲 ai4 li4 si1/爱丽丝;灰姑娘 hui1 gu1 niang2;秦始皇 qin2 shi3 huang2;孫中山 sun1 zhong1 shan1/孙中山;拿破崙 na2 po4 lun2/拿破仑;達文西 da2 wen2 xi1/达文西;福爾摩斯 fu2 er3 mo2 si1/福尔摩斯;愛因斯坦 ai4 yin1 si1 tan3/爱因斯坦;莎士比亞 sha1 shi4 bi3 ya1/莎士比亚;小熊維尼 xiao3 xiong2 wei2 ni2/小熊维尼;聖誕老人 sheng4 dan4 lao3 ren2/圣诞老人;海綿寶寶 hai3 mian2 bao3 bao3/海绵宝宝;白雪公主 bai2 xue3 gong1 zhu3;哈利波特 ha1 li4 bo1 te4;愛迪生 ai4 di2 sheng1/爱迪生;梵谷 fan4 gu3;貝多芬 bei4 duo1 fen1/贝多芬;莫札特 mo4 zha2 te4;張學友 zhang1 xue2 you3/张学友;周星馳 zhou1 xing1 chi2/周星驰;睡美人 shui4 mei3 ren2;小紅帽 xiao3 hong2 mao4/小红帽;阿拉丁 a1 la1 ding1;加菲貓 jia1 fei1 mao1/加菲猫;凱蒂貓 kai3 di4 mao1/凯蒂猫;櫻桃小丸子 ying1 tao2 xiao3 wan2 zi5/樱桃小丸子;蒙娜麗莎 meng2 na4 li4 sha1/蒙娜丽莎',
    "品牌": '星巴克 xing1 ba1 ke4;麥當勞 mai4 dang1 lao2/麦当劳;肯德基 ken3 de2 ji1;優衣庫 you1 yi1 ku4/优衣库;無印良品 wu2 yin4 liang2 pin3/无印良品;樂高 le4 gao1/乐高;特斯拉 te4 si1 la1;任天堂 ren4 tian1 tang2;迪士尼 di2 shi4 ni2;奧利奧 ao4 li4 ao4/奥利奥;可口可樂 ke3 kou3 ke3 le4/可口可乐;百事可樂 bai3 shi4 ke3 le4/百事可乐;屈臣氏 qu1 chen2 shi4;寶馬 bao3 ma3/宝马;賓士 bin1 shi4/宾士;豐田 feng1 tian2/丰田;三星 san1 xing1;華為 hua2 wei2/华为;小米 xiao3 mi3;淘寶 tao2 bao3/淘宝;蝦皮 xia1 pi2/虾皮;抖音 dou3 yin1;亞馬遜 ya1 ma3 xun4/亚马逊;阿迪達斯 a1 di2 da2 si1/阿迪达斯;勞力士 lao2 li4 shi4/劳力士;法拉利 fa3 la1 li4;保時捷 bao3 shi2 jie2/保时捷;蘭博基尼 lan2 bo2 ji1 ni2/兰博基尼;愛馬仕 ai4 ma3 shi4/爱马仕;路易威登 lu4 yi4 wei1 deng1;好市多 hao3 shi4 duo1;家樂福 jia1 le4 fu2/家乐福;漢堡王 han4 bao3 wang2/汉堡王;必勝客 bi4 sheng4 ke4/必胜客',
    "成語與俗語": '守株待兔 shou3 zhu1 dai4 tu4;畫蛇添足 hua4 she2 tian1 zu2/画蛇添足;亡羊補牢 wang2 yang2 bu3 lao2/亡羊补牢;狐假虎威 hu2 jia3 hu3 wei1;井底之蛙 jing3 di3 zhi1 wa1;對牛彈琴 dui4 niu2 dan4 qin2/对牛弹琴;葉公好龍 ye4 gong1 hao4 long2/叶公好龙;掩耳盜鈴 yan3 er3 dao4 ling2/掩耳盗铃;刻舟求劍 ke4 zhou1 qiu2 jian4/刻舟求剑;愚公移山 yu2 gong1 yi2 shan1;一箭雙鵰 yi2 jian4 shuang1 diao1/一箭双雕;杯弓蛇影 bei1 gong1 she2 ying3;畫龍點睛 hua4 long2 dian3 jing1/画龙点睛;紙上談兵 zhi3 shang4 tan2 bing1/纸上谈兵;草船借箭 cao3 chuan2 jie4 jian4;三顧茅廬 san1 gu4 mao2 lu2/三顾茅庐;塞翁失馬 sai4 weng1 shi1 ma3/塞翁失马;鶴立雞群 he4 li4 ji1 qun2/鹤立鸡群;雞飛狗跳 ji1 fei1 gou3 tiao4/鸡飞狗跳;虎頭蛇尾 hu3 tou2 she2 wei3/虎头蛇尾;騎虎難下 qi2 hu3 nan2 xia4/骑虎难下;馬到成功 ma3 dao4 cheng2 gong1/马到成功;一帆風順 yi4 fan1 feng1 shun4/一帆风顺;心想事成 xin1 xiang3 shi4 cheng2;新年快樂 xin1 nian2 kuai4 le4/新年快乐;恭喜發財 gong1 xi3 fa1 cai2/恭喜发财;拍馬屁 pai1 ma3 pi4/拍马屁;抱佛腳 bao4 fo2 jiao3/抱佛脚;炒魷魚 chao3 you2 yu2/炒鱿鱼;吃豆腐 chi1 dou4 fu5;開夜車 kai1 ye4 che1/开夜车;走後門 zou3 hou4 men2/走后门;白日夢 bai2 ri4 meng4/白日梦;紙老虎 zhi3 lao3 hu3/纸老虎;打草驚蛇 da3 cao3 jing1 she2/打草惊蛇;海底撈針 hai3 di3 lao1 zhen1/海底捞针;九牛一毛 jiu3 niu2 yi4 mao2;一石二鳥 yi4 shi2 er4 niao3/一石二鸟;破釜沉舟 po4 fu3 chen2 zhou1;負荊請罪 fu4 jing1 qing3 zui4/负荆请罪;完璧歸趙 wan2 bi4 gui1 zhao4/完璧归赵;望梅止渴 wang4 mei2 zhi3 ke3;鳳毛麟角 feng4 mao2 lin2 jiao3/凤毛麟角;雪中送炭 xue3 zhong1 song4 tan4;錦上添花 jin3 shang4 tian1 hua1/锦上添花;魚目混珠 yu2 mu4 hun4 zhu1/鱼目混珠;螳臂擋車 tang2 bi4 dang3 che1/螳臂挡车;笑裡藏刀 xiao4 li3 cang2 dao1/笑里藏刀;愛屋及烏 ai4 wu1 ji2 wu1/爱屋及乌;杯水車薪 bei1 shui3 che1 xin1/杯水车薪;暗箭傷人 an4 jian4 shang1 ren2/暗箭伤人;百發百中 bai3 fa1 bai3 zhong1/百发百中;半途而廢 ban4 tu2 er2 fei4/半途而废;抱頭鼠竄 bao4 tou2 shu3 cuan4/抱头鼠窜;筆走龍蛇 bi3 zou3 long2 she2/笔走龙蛇;兵貴神速 bing1 gui4 shen2 su4/兵贵神速;不入虎穴 bu2 ru4 hu3 xue2;趁火打劫 chen4 huo3 da3 jie2;唇亡齒寒 chun2 wang2 chi3 han2/唇亡齿寒;大海撈針 da4 hai3 lao1 zhen1/大海捞针;洞若觀火 dong4 ruo4 guan1 huo3/洞若观火;對症下藥 dui4 zheng4 xia4 yao4/对症下药;多管閒事 duo1 guan3 xian2 shi4/多管闲事;豐衣足食 feng1 yi1 zu2 shi2/丰衣足食;風和日麗 feng1 he2 ri4 li2/风和日丽;蓋世無雙 gai4 shi4 wu2 shuang1/盖世无双;高枕無憂 gao1 zhen3 wu2 you1/高枕无忧;狗急跳牆 gou3 ji2 tiao4 qiang2/狗急跳墙;瓜田李下 gua1 tian2 li3 xia4;紅杏出牆 hong2 xing4 chu1 qiang2/红杏出墙;虎視眈眈 hu3 shi4 dan1 dan1/虎视眈眈;畫餅充飢 hua4 bing3 chong1 ji1/画饼充饥;緩兵之計 huan3 bing1 zhi1 ji4/缓兵之计;驚弓之鳥 jing1 gong1 zhi1 niao3/惊弓之鸟;鏡花水月 jing4 hua1 shui3 yue4/镜花水月;臥虎藏龍 wo4 hu3 cang2 long2/卧虎藏龙;沉魚落雁 chen2 yu2 luo4 yan4/沉鱼落雁;閉月羞花 bi4 yue4 xiu1 hua1/闭月羞花;兩袖清風 liang3 xiu4 qing1 feng1/两袖清风;臨陣磨槍 lin2 zhen4 mo2 qiang1/临阵磨枪;滿載而歸 man3 zai4 er2 gui1/满载而归;猛虎出柙 meng3 hu3 chu1 xia2;披星戴月 pi1 xing1 dai4 yue4;騎驢找馬 qi2 lü2 zhao3 ma3/骑驴找马;如魚得水 ru2 yu2 de2 shui3/如鱼得水;三心二意 san1 xin1 er4 yi4;守口如瓶 shou3 kou3 ru2 ping2;水到渠成 shui3 dao4 qu2 cheng2;天馬行空 tian1 ma3 xing2 kong1/天马行空;萬箭穿心 wan4 jian4 chuan1 xin1/万箭穿心;亡命天涯 wang2 ming4 tian1 ya2;唯我獨尊 wei2 wo3 du2 zun1/唯我独尊;小題大做 xiao3 ti2 da4 zuo4/小题大做;掩人耳目 yan3 ren2 er3 mu4;一見鍾情 yi2 jian4 zhong1 qing2/一见钟情;一鳴驚人 yi4 ming2 jing1 ren2/一鸣惊人;一毛不拔 yi4 mao2 bu4 ba2;因小失大 yin1 xiao3 shi1 da4;有口難言 you3 kou3 nan2 yan2/有口难言;指鹿為馬 zhi3 lu4 wei2 ma3/指鹿为马;自相矛盾 zi4 xiang1 mao2 dun4;坐井觀天 zuo4 jing3 guan1 tian1/坐井观天;青梅竹馬 qing1 mei2 zhu2 ma3/青梅竹马;洛陽紙貴 luo4 yang2 zhi3 gui4/洛阳纸贵;嘔心瀝血 ou3 xin1 li4 xue4/呕心沥血;空城計 kong1 cheng2 ji4/空城计;敲竹槓 qiao1 zhu2 gang4/敲竹杠;吹牛皮 chui1 niu2 pi2;拍案叫絕 pai1 an4 jiao4 jue2/拍案叫绝;馬馬虎虎 ma3 ma3 hu3 hu3/马马虎虎;七上八下 qi1 shang4 ba1 xia4;九死一生 jiu3 si3 yi4 sheng1;十全十美 shi2 quan2 shi2 mei3;四面楚歌 si4 mian4 chu3 ge1;五光十色 wu3 guang1 shi2 se4;八仙過海 ba1 xian1 guo4 hai3/八仙过海;百花齊放 bai3 hua1 qi2 fang4/百花齐放;千鈞一髮 qian1 jun1 yi2 fa4/千钧一发;萬事如意 wan4 shi4 ru2 yi4/万事如意;龍鳳呈祥 long2 feng4 cheng2 xiang2/龙凤呈祥;年年有餘 nian2 nian2 you3 yu2/年年有余;花好月圓 hua1 hao3 yue4 yuan2/花好月圆;張燈結綵 zhang1 deng1 jie2 cai3/张灯结彩;鴻運當頭 hong2 yun4 dang1 tou2/鸿运当头;笑逐顏開 xiao4 zhu2 yan2 kai1/笑逐颜开;手忙腳亂 shou3 mang2 jiao3 luan4/手忙脚乱;目瞪口呆 mu4 deng4 kou3 dai1;眉開眼笑 mei2 kai1 yan3 xiao4/眉开眼笑;口是心非 kou3 shi4 xin1 fei1;垂頭喪氣 chui2 tou2 sang1 qi4/垂头丧气;氣急敗壞 qi4 ji2 bai4 huai4/气急败坏;心花怒放 xin1 hua1 nu4 fang4;膽大包天 dan3 da4 bao1 tian1/胆大包天;鼠目寸光 shu3 mu4 cun4 guang1;牛頭馬面 niu2 tou2 ma3 mian4/牛头马面;龍飛鳳舞 long2 fei1 feng4 wu3/龙飞凤舞;虎背熊腰 hu3 bei4 xiong2 yao1;獅子大開口 shi1 zi3 da4 kai1 kou3/狮子大开口;雞毛蒜皮 ji1 mao2 suan4 pi2/鸡毛蒜皮;猴年馬月 hou2 nian2 ma3 yue4/猴年马月;螳螂捕蟬 tang2 lang2 bu3 chan2/螳螂捕蝉;蜻蜓點水 qing1 ting2 dian3 shui3/蜻蜓点水;蝸行牛步 wo1 xing2 niu2 bu4/蜗行牛步;魚躍龍門 yu2 yue4 long2 men2/鱼跃龙门;鳥語花香 niao3 yu3 hua1 xiang1/鸟语花香;鹿死誰手 lu4 si3 shui2 shou3/鹿死谁手;狼吞虎嚥 lang2 tun1 hu3 yan4/狼吞虎咽;羊入虎口 yang2 ru4 hu3 kou3;老馬識途 lao3 ma3 shi2 tu2/老马识途;兔死狐悲 tu4 si3 hu2 bei1;貓哭耗子 mao1 ku1 hao4 zi3/猫哭耗子;烏合之眾 wu1 he2 zhi1 zhong4/乌合之众'    // </bank>
  };
  // Every toneless pinyin syllable that exists, as typed (ju, lü, yue...). Generated with the bank.
  const SYLLABLES = new Set(
    // <syl>
    'a ai an ang ao ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu ca cai can cang cao ce cen ceng cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo ci cong cou cu cuan cui cun cuo da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo e ei en eng er fa fan fang fei fen feng fo fou fu ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo ha hai han hang hao he hei hen heng hng hong hou hu hua huai huan huang hui hun huo ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun ka kai kan kang kao ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lü lüe m ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu n na nai nan nang nao ne nei nen neng ng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nü nüe o ou pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo sa sai san sang sao se sen seng sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo si song sou su suan sui sun suo ta tai tan tang tao te tei teng ti tian tiao tie ting tong tou tu tuan tui tun tuo wa wai wan wang wei wen weng wo wu xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun za zai zan zang zao ze zei zen zeng zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo zi zong zou zu zuan zui zun zuo'
    // </syl>
    .split(' '));

  // ---------- pinyin / zhuyin ----------
  // A syllable is { i: initial, f: final, t: tone 1-5 }. The final is stored the way it is written after an initial
  // (iu, ui, un, ü...) so that ju = jü, yu = ü, wei = ui, you = iu all land on the same thing.
  const INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's'];
  const FINALS = new Set('a o e ai ei ao ou an en ang eng er i ia ie iao iu ian in iang ing iong u ua uo uai ui uan un uang ong ueng ü üe üan ün'.split(' '));
  const APICAL = ['zh', 'ch', 'sh', 'r', 'z', 'c', 's'];   // zhi chi shi ri zi ci si: the "i" is a different vowel and has no zhuyin symbol
  const TONE_MARK = { ā: ['a', 1], á: ['a', 2], ǎ: ['a', 3], à: ['a', 4], ē: ['e', 1], é: ['e', 2], ě: ['e', 3], è: ['e', 4], ī: ['i', 1], í: ['i', 2], ǐ: ['i', 3], ì: ['i', 4],
    ō: ['o', 1], ó: ['o', 2], ǒ: ['o', 3], ò: ['o', 4], ū: ['u', 1], ú: ['u', 2], ǔ: ['u', 3], ù: ['u', 4], ǖ: ['ü', 1], ǘ: ['ü', 2], ǚ: ['ü', 3], ǜ: ['ü', 4] };
  const ZY_I = { ㄅ: 'b', ㄆ: 'p', ㄇ: 'm', ㄈ: 'f', ㄉ: 'd', ㄊ: 't', ㄋ: 'n', ㄌ: 'l', ㄍ: 'g', ㄎ: 'k', ㄏ: 'h', ㄐ: 'j', ㄑ: 'q', ㄒ: 'x', ㄓ: 'zh', ㄔ: 'ch', ㄕ: 'sh', ㄖ: 'r', ㄗ: 'z', ㄘ: 'c', ㄙ: 's' };
  const ZY_FIN = { ㄚ: 'a', ㄛ: 'o', ㄜ: 'e', ㄞ: 'ai', ㄟ: 'ei', ㄠ: 'ao', ㄡ: 'ou', ㄢ: 'an', ㄣ: 'en', ㄤ: 'ang', ㄥ: 'eng', ㄦ: 'er', ㄧ: 'i', ㄧㄚ: 'ia', ㄧㄝ: 'ie', ㄧㄠ: 'iao', ㄧㄡ: 'iu', ㄧㄢ: 'ian', ㄧㄣ: 'in',
    ㄧㄤ: 'iang', ㄧㄥ: 'ing', ㄨ: 'u', ㄨㄚ: 'ua', ㄨㄛ: 'uo', ㄨㄞ: 'uai', ㄨㄟ: 'ui', ㄨㄢ: 'uan', ㄨㄣ: 'un', ㄨㄤ: 'uang', ㄨㄥ: 'ong', ㄩ: 'ü', ㄩㄝ: 'üe', ㄩㄢ: 'üan', ㄩㄣ: 'ün', ㄩㄥ: 'iong' };
  const ZY_I_INV = Object.fromEntries(Object.entries(ZY_I).map(([k, v]) => [v, k]));
  const ZY_FIN_INV = { ...Object.fromEntries(Object.entries(ZY_FIN).map(([k, v]) => [v, k])), ueng: 'ㄨㄥ' };
  const ZY_TONE = { ˉ: 1, ˊ: 2, ˇ: 3, ˋ: 4, '˙': 5 };

  // how a syllable is typed in pinyin (no tone)
  function spell(i, f) {
    if (i) return 'jqx'.includes(i) && f[0] === 'ü' ? i + 'u' + f.slice(1) : i + f;
    if (f[0] === 'i') return f === 'iu' ? 'you' : f === 'i' || f === 'in' || f === 'ing' ? 'y' + f : 'y' + f.slice(1);
    if (f[0] === 'u') return f === 'u' ? 'wu' : f === 'ui' ? 'wei' : f === 'un' ? 'wen' : 'w' + f.slice(1);
    if (f[0] === 'ü') return f === 'ü' ? 'yu' : 'yu' + f.slice(1);
    return f;
  }
  const known = (i, f) => FINALS.has(f) && SYLLABLES.has(spell(i, f));

  function splitPinyin(base) {   // 'zhu' -> { i: 'zh', f: 'u' }
    if (base[0] === 'y' || base[0] === 'w') {
      const r = base.slice(1);
      let f;
      if (base[0] === 'y') f = r[0] === 'u' || r[0] === 'ü' ? 'ü' + r.slice(1) : r === 'ou' ? 'iu' : r[0] === 'i' ? r : 'i' + r;
      else f = r === 'ei' ? 'ui' : r === 'en' ? 'un' : r[0] === 'u' ? r : 'u' + r;
      return { i: '', f };
    }
    const i = INITIALS.find(x => base.startsWith(x)) || '';
    let f = base.slice(i.length);
    if ('jqx'.includes(i) && f[0] === 'u') f = 'ü' + f.slice(1);
    if ('nl'.includes(i) && i && f === 'ue') f = 'üe';
    f = f.replace(/^iou$/, 'iu').replace(/^uei$/, 'ui').replace(/^uen$/, 'un');
    return { i, f };
  }
  // Reads what a clue-giver typed: pinyin with a tone number or tone mark (zhu2, zhú), or zhuyin (ㄓㄨˊ). Returns { i, f, t } or { err }.
  function parseReading(raw) {
    const text = String(raw == null ? '' : raw).trim();
    if (!text) return { err: '請輸入讀音' };
    if (/[ㄅ-ㄯ]/.test(text)) {   // zhuyin
      let t = 1, s = text.replace(/\s+/g, '');
      s = [...s].filter(c => { if (ZY_TONE[c]) { t = ZY_TONE[c]; return false; } return true; }).join('');
      const first = [...s][0], init = ZY_I[first] || '', rest = init ? s.slice(1) : s;
      let f = rest === '' && APICAL.includes(init) ? 'i' : ZY_FIN[rest];
      if (f === 'ong' && !init) f = 'ueng';
      if (!f || !known(init, f)) return { err: `「${text}」不是有效的注音` };
      return { i: init, f, t };
    }
    let s = text.toLowerCase().replace(/u:|v/g, 'ü').replace(/\s+/g, ''), t = 0;
    if (s.endsWith('˙')) { s = s.slice(0, -1); t = 5; }
    s = [...s].map(c => { if (TONE_MARK[c]) { t = TONE_MARK[c][1]; return TONE_MARK[c][0]; } return c; }).join('');
    const m = s.match(/^([a-zü]+)([0-5])?$/);
    if (!m) return { err: `「${text}」不是有效的拼音` };
    if (m[2] !== undefined) t = +m[2] || 5;
    const { i, f } = splitPinyin(m[1]);
    if (!known(i, f)) return { err: `「${text}」不是有效的拼音` };
    if (!t) return { err: `「${text}」要加聲調（例如 zhú，輕聲寫 ˙）` };
    return { i, f, t };
  }
  // Pinyin as it is printed: the tone is a mark on the vowel (xióng), not a number (xiong2). The mark goes on a, else e, else the o of ou,
  // else the last vowel (jiu -> jiǔ, hui -> huì). A neutral tone has no mark. parseReading reads marks, numbers and zhuyin alike.
  const MARKS = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };
  function markBase(base, t) {
    if (t < 1 || t > 4) return base;
    const at = base.includes('a') ? base.indexOf('a') : base.includes('e') ? base.indexOf('e') : base.includes('ou') ? base.indexOf('o')
      : Math.max(...[...'iouü'].map(v => base.lastIndexOf(v)));
    return at < 0 ? base : base.slice(0, at) + MARKS[base[at]][t - 1] + base.slice(at + 1);
  }
  const pinyinNum = s => spell(s.i, s.f) + s.t;   // the same thing with a tone number
  const pinyinOf = s => markBase(spell(s.i, s.f), s.t);
  // Gives whatever is being typed (zhu, zhu2, zhú) a new tone: the tone pad uses this. t is 1-4, or 5 for neutral (written ˙ after the pinyin).
  function withTone(raw, t) {
    let s = String(raw || '').toLowerCase().replace(/u:|v/g, 'ü').replace(/\s+/g, '');
    s = [...s].map(c => TONE_MARK[c] ? TONE_MARK[c][0] : c).join('').replace(/[0-5˙]+$/, '');
    return t === 5 ? s + '˙' : markBase(s, t);
  }
  function zhuyinOf(s, toneless) {
    const fin = s.f === 'i' && APICAL.includes(s.i) ? '' : ZY_FIN_INV[s.f];
    const body = (s.i ? ZY_I_INV[s.i] : '') + fin;
    return toneless || s.t === 1 ? body : s.t === 5 ? '˙' + body : body + ['', '', 'ˊ', 'ˇ', 'ˋ'][s.t];
  }
  // the sound with no tone, which is what the ban and the second clue-giver deal in. A syllable with no initial gets a placeholder.
  const soundKey = s => s.i + '|' + s.f;
  const soundOf = s => ({ py: s.i ? spell(s.i, s.f) : '∅' + s.f, zy: (s.i ? '' : '∅') + zhuyinOf(s, true) });
  const fullOf = s => ({ py: pinyinOf(s), zy: zhuyinOf(s) });
  // dictionary lookups for the hanzi a clue-giver buys (the pinyin-pro library, or anything with the same shape)
  const EXTRA = { 蚵: 'e2', 鑰: 'yao4' };   // readings the library lacks (the Taiwan ones)
  const makeReadings = P => han => {
    if (!P || !P.pinyin) return null;
    try {
      const r = P.pinyin(han, { type: 'array', toneType: 'num', multiple: true });
      return (Array.isArray(r) ? r : [r]).concat(EXTRA[han] || []).map(parseReading).filter(x => !x.err);
    } catch { return null; }
  };
  const isHan = c => /\p{Script=Han}/u.test(c);

  // ---------- words ----------
  const ALL_WORDS = Object.entries(BANK).flatMap(([cat, list]) => list.split(';').map(e => {
    const [main, alt] = e.split('/'), parts = main.split(' '), word = parts[0];
    const syl = parts.slice(1).map(parseReading);
    return { cat, word, alt: alt || null, syl, len: [...word].length };
  }));
  const TIERS = [
    { name: '二至三字', min: 2, max: 3 },
    { name: '三至四字', min: 3, max: 4 },
    { name: '四字以上', min: 4, max: 9 }
  ];
  const CATEGORIES = Object.keys(BANK);
  const tierWords = (level, cats = CATEGORIES) => {
    const t = TIERS[level - 1];
    return ALL_WORDS.filter(e => cats.includes(e.cat) && e.len >= t.min && e.len <= t.max);
  };

  // ---------- money ----------
  // A clue is written characters only (no sound-only clues). A clue-giver's first character costs 15, the second 30, the third 60 (each one
  // double the one before), and the count starts again for the next clue-giver. A symbol costs 5, flat.
  const BASE_PRICE = 15, SYMBOL_COST = 5;
  const MAX_CHARS = 4;               // characters in one clue
  const priceOf = i => BASE_PRICE * 2 ** i;
  const PRICES = Array.from({ length: MAX_CHARS }, (_, i) => priceOf(i));
  const SYMBOLS = '.,?!@#$%&*+-=/()~^:;\'_。，、？！…～＋－＝（）：；';   // allowed in a clue at a flat price
  const clueCost = items => { let k = 0; return items.reduce((a, it) => a + (it.han ? priceOf(k++) : SYMBOL_COST), 0); };
  const DEFAULT_SETTINGS = { teams: 'two', teamSize: 3, mode: 'score', target: 800, words: 6, bank: 200, categories: CATEGORIES, reward: 100, writeSecs: 45, penalty: 5, firstBonus: 20, speedSecs: 20, lastChance: 15, sequential: false, script: 'trad' };
  // One-team mode: a fixed number of words, then a grade from the final score. Cutoffs are points gained per 5 words over the starting bank
  // (they scale with the number of words). A solved word pays the reward plus bonuses (about 100-150 as the words get longer), and clues cost
  // 0-40, so a team that gets nearly everything lands in the top grades. Numbers to be tuned by playtesting.
  const RATING_CUTS = [200, 325, 425, 500];   // points gained per 5 words: an average of 40 / 65 / 85 / 100 a word
  const RATINGS = [[RATING_CUTS[3], '字字珠璣！', ''], [RATING_CUTS[2], '屢創佳績！', ''],
    [RATING_CUTS[1], '有危也有機⋯⋯', ''], [RATING_CUTS[0], '唧唧復唧唧⋯⋯', ''], [-Infinity, '菜雞⋯⋯', '']];
  const gradeNeed = (cut, words) => Math.round(cut * words / 25) * 5;
  function rating(score, bank, words) {
    const gained = score - bank, r = RATINGS.find(x => x[0] === -Infinity || gained > gradeNeed(x[0], words));
    return { label: r[1], quote: r[2], rank: RATINGS.length - 1 - RATINGS.indexOf(r), score, words };   // rank 4 = best, 0 = worst
  }
  const LEVEL_EVERY = 3;              // the word level goes up every this many words
  const LONG_WORD_MIN = 3;            // characters a word needs before it pays the long-word bonus
  const longWordBonus = (base, level) => Math.round(base * 0.25 * (level - 1) / 5) * 5;
  const PASS_MS = 10000;              // how long the other team's Clue-giver 1 has to answer a request to pass a word
  const FEEDBACK_MS = 4000;          // pass-and-play: how long the guesser's result screen shows before the device is passed on
  const GRACE_MS = 1500;             // host waits this long past a writing deadline for the client's auto-submit
  const rolesFor = size => [...Array(size - 1)].map((_, i) => 'giver' + (i + 1)).concat('guesser');
  const STAGE_ROLE = { giver1: 'giver1', giver2: 'giver2', giver3: 'giver3', guess: 'guesser' };
  const isWriting = stage => /^giver\d$/.test(stage);
  const guessText = raw => [...String(raw || '')].filter(isHan).join('').slice(0, 12);

  function createGame(opts = {}) {
    const now = opts.now || Date.now;
    const setT = opts.setTimeout || setTimeout, clearT = opts.clearTimeout || clearTimeout;
    const onChange = opts.onChange || (() => {});
    const hostId = opts.hostId || 'host';
    const readings = opts.readings || null;   // han -> [syllables], or null when there's no dictionary (then written characters can't be checked)

    const G = {
      seatNames: [[], []],                    // custom names for seats one device holds several of: seatNames[team][seat]
      phase: 'lobby',                         // lobby | round | roundEnd | over
      settings: { ...DEFAULT_SETTINGS },
      players: {},                            // id -> { name, token, connected }
      seats: [[null, null, null], [null, null, null]],
      names: ['第一隊', '第二隊'],
      scores: [0, 0], round: 0, used: new Set(), level: 1, longBonus: 0, card: null, teams: [null, null], firstCorrect: null, gaveUp: null, winner: null,
      solo: false, history: [], record: [],   // record: every finished word with who wrote what, for the game-over review
      pass: null, passUsed: [false, false], passNote: null   // a request to pass the word: { from, to, expires, timer }; each team may ask once per word
    };
    const change = () => onChange();

    // ---------- helpers ----------
    const teamOf = id => G.seats.findIndex(t => t.includes(id));
    const wordsOf = () => G.settings.words || 2 * Math.max(2, Object.keys(G.players).length);   // 0 means 2 x the players
    const seatIdx = (t, role) => (G.round + rolesFor(G.settings.teamSize).indexOf(role)) % G.settings.teamSize;
    const holder = (t, role) => G.seats[t][seatIdx(t, role)];
    // A device normally sits on one team. In pass-and-play it holds both; then the team whose turn it is is "its" team.
    const actTeam = id => {
      const ts = [0, 1].filter(t => G.seats[t].includes(id));
      if (ts.length < 2) return ts.length ? ts[0] : -1;
      const live = G.teams[0] ? ts.find(t => !['done', 'waiting'].includes(G.teams[t].stage)) : undefined;
      return live === undefined ? ts[0] : live;
    };
    const rolesOf = (id, t = actTeam(id)) => t < 0 ? [] : rolesFor(G.settings.teamSize).filter(r => holder(t, r) === id);
    // Characters cost real points, straight out of the team's score, so a team can only buy what it can afford. Clue costs are tracked
    // apart (clueSpent): a team that doesn't get the word gets them back (see finishTeam).
    const spend = (t, amount, clue) => { G.scores[t] -= amount; G.teams[t].spent += amount; if (clue) G.teams[t].clueSpent += amount; };
    function seatName(t, seatIdx) {
      const id = G.seats[t][seatIdx]; if (!id || !G.players[id]) return `座位 ${seatIdx + 1}`;
      if (G.seatNames[t][seatIdx]) return G.seatNames[t][seatIdx];
      const mine = G.seats[t].map((s, i) => s === id ? i : -1).filter(i => i >= 0);
      return mine.length > 1 ? `${G.players[id].name} (${mine.indexOf(seatIdx) + 1})` : G.players[id].name;
    }
    const roleName = (t, role) => seatName(t, seatIdx(t, role));
    // The ban is by sound: every syllable of the keyword (initial + final, any tone), so its homophones and look-alikes go with it.
    const banned = () => new Map(G.card.syl.map(s => [soundKey(s), soundOf(s)]));
    const wordShown = () => G.settings.script === 'simp' && G.card.alt ? G.card.alt : G.card.word;   // the host picks one script for every keyword in the game
    const keywordChars = () => new Set([...G.card.word, ...(G.card.alt || '')]);
    const showClue = clue => clue.map(it => it.han ? { han: it.han } : { sym: it.sym });   // the characters themselves, nothing else

    // ---------- players & lobby ----------
    function addPlayer(id, name, token) {
      name = String(name || '').trim().slice(0, 14) || '玩家';
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
      return { stage: 'giver1', deadline: null, timer: null, clues: [], spent: 0, clueSpent: 0, log: [], result: null, earned: 0, breakdown: null, guessDeadline: null, guessStart: null, awaitReady: false };
    }
    function arm(t, ms, fn) { const T = G.teams[t]; clearT(T.timer); T.timer = setT(fn, ms); }

    function startRound() {
      // the word level rises as the game goes on; longer words earn a long-word bonus
      const s = G.settings;
      const want = Math.min(TIERS.length, 1 + Math.floor(G.round / LEVEL_EVERY));
      // if the ticked categories have no words at that level, use the nearest level that does (lower first)
      const order = [want, ...Array.from({ length: want - 1 }, (_, i) => want - 1 - i), ...Array.from({ length: TIERS.length - want }, (_, i) => want + 1 + i)];
      G.level = order.find(l => tierWords(l, s.categories).length) || want;
      const pool = tierWords(G.level, s.categories);
      let fresh = pool.filter(e => !G.used.has(e.word));
      if (!fresh.length) { pool.forEach(e => G.used.delete(e.word)); fresh = pool; }   // seen them all: start that level's list over
      G.card = fresh[Math.floor(Math.random() * fresh.length)]; G.used.add(G.card.word);
      G.longBonus = G.card.len >= LONG_WORD_MIN ? longWordBonus(s.reward, G.level) : 0;   // only a long word pays it, whatever level it was drawn from
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
      const T = G.teams[t], ms = G.settings.writeSecs * 1000;
      T.stage = stage; T.deadline = now() + extraMs + ms;
      arm(t, extraMs + ms + GRACE_MS, () => { if (T.stage === stage) submitClue(t, '', true); }); // client's own auto-submit normally wins
    }
    // Turns what a clue-giver typed (characters and symbols) into checked items, or an error. A character is banned when any of its readings
    // shares the sound (initial + final, tone ignored) of a syllable of the keyword.
    function buildClue(t, text, auto, picks) {
      const ban = banned(), mine = keywordChars(), out = [];
      const later = +G.teams[t].stage.slice(5) < G.settings.teamSize - 1;   // someone writes after this clue-giver, so they will be shown its sounds
      let hans = 0;
      for (const ch of [...String(text || '')]) {
        if (/\s/.test(ch)) continue;
        let err = null, item = null;
        if (SYMBOLS.includes(ch)) item = { sym: ch };
        else if (!isHan(ch)) err = `「${ch}」不是漢字，也不是可以用的符號`;
        else if (hans >= MAX_CHARS) err = `一個提示字最多 ${MAX_CHARS} 個字`;
        else if (mine.has(ch)) err = `「${ch}」是謎底裡的字，不能用`;
        else if (readings) {
          const rs = readings(ch);
          if (!rs || !rs.length) err = `查不到「${ch}」的讀音`;
          else {
            const hit = rs.find(x => ban.has(soundKey(x)));
            if (hit) err = `「${ch}」讀 ${soundOf(hit).py}，和謎底同音，不能用`;
            else {
              const sounds = [...new Map(rs.map(x => [soundKey(x), soundOf(x)])).values()];
              let snd = sounds;
              if (later && sounds.length > 1) {   // a character with several sounds (長: chang / zhang): the next clue-giver is told the one meant
                const one = sounds.find(s => s.py === (picks && picks[ch]));
                if (one) snd = [one]; else if (auto) snd = [sounds[0]]; else err = `「${ch}」有不同的讀音，請選一個：${sounds.map(s => s.py).join(' / ')}`;
              }
              item = { han: ch, snd };
            }
          }
        } else item = { han: ch, snd: [] };   // no dictionary loaded: the character can't be checked
        if (err) { if (auto) continue; return { error: err }; }   // out of time: keep what is valid
        if (item.han) hans++;
        out.push(item);
      }
      if (auto) while (out.length && clueCost(out) > G.scores[t]) out.pop();   // keep what the team can afford
      else if (clueCost(out) > G.scores[t]) return { error: '點數不夠，買不起這個提示字。' };
      return { items: out };
    }
    function submitClue(t, text, auto, picks) {
      const T = G.teams[t], b = buildClue(t, text, auto, picks);
      if (b.error) return b;
      spend(t, clueCost(b.items), true); T.clues.push(b.items);
      clearT(T.timer); T.deadline = null;
      const k = +T.stage.slice(5);   // which clue-giver just finished
      if (k === 1 && G.pass) { clearT(G.pass.timer); G.pass = null; }   // once either Clue-giver 1 has submitted, passing is over
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
      if (result !== 'correct') { G.scores[t] += T.clueSpent; T.spent -= T.clueSpent; T.clueSpent = 0; }   // didn't get it: the characters are paid back
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
      G.record.push({ n: G.round, word: wordShown(), syl: G.card.syl.map(fullOf), cat: G.card.cat, levelName: TIERS[G.level - 1].name, teams: [0, 1].map(t => {
        const T = G.teams[t];
        return { result: T.result, earned: T.earned, spent: T.spent, breakdown: T.breakdown, clues: T.clues.map(showClue), costs: T.clues.map(clueCost), log: T.log.slice(), people: rolesFor(G.settings.teamSize).map(r => ({ role: r, name: roleName(t, r) })) };
      }) });
      const [a, b] = G.scores, s = G.settings;
      // "score" mode: first to the target. "words" mode: after a fixed number of words. A tie plays on (sudden death).
      const finished = s.mode === 'words' ? G.round + 1 >= wordsOf() : (a >= s.target || b >= s.target);
      if (G.solo) G.history.push({ n: G.round, word: wordShown(), result: G.teams[0].result, net: G.teams[0].earned - G.teams[0].spent, total: G.scores[0] });
      if (G.solo) { if (finished) { G.phase = 'over'; G.winner = 0; } else G.phase = 'roundEnd'; }
      else if (finished && a !== b) { G.phase = 'over'; G.winner = a > b ? 0 : 1; }
      else G.phase = 'roundEnd';
    }
    function guess(t, raw) {
      const T = G.teams[t], text = guessText(raw);
      if (!text) return {};
      if (text === G.card.word || text === G.card.alt) {
        T.log.push({ text: wordShown(), ok: true });
        // A correct guess pays the reward plus the first-to-guess and quick-guess bonuses (characters were already paid for).
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
    // Clue-giver 1 can ask to pass a word they don't know, but only while neither Clue-giver 1 has submitted anything yet. The other team's
    // Clue-giver 1 says yes or no. On yes, both teams get a fresh word (same word number). Each team may ask once per word.
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
      if (!G.players[id]) return { error: '你不在這個房間裡。' };
      const isHost = id === hostId;
      switch (m.type) {
        case 'sit': {
          if (G.phase !== 'lobby') return { error: '遊戲已經開始。' };
          const { team, seat } = m;
          if (team === 1 && G.settings.teams === 'one') return {};
          if (![0, 1].includes(team) || !(Number.isInteger(seat) && seat >= 0 && seat < G.settings.teamSize)) return {};
          const cur = G.seats[team][seat]; if (cur && cur !== id) return { error: '這個座位有人了。' };
          vacate(id, team); G.seats[team][seat] = id; G.seatNames[team][seat] = null; G.settings.sequential = false; change(); return {};
        }
        case 'sitAll': { // one device plays a whole team
          if (G.phase !== 'lobby') return { error: '遊戲已經開始。' };
          const { team } = m; if (![0, 1].includes(team) || (team === 1 && G.settings.teams === 'one')) return {};
          if (G.seats[team].some(s => s && s !== id)) return { error: '這一隊有座位被別人坐了。' };
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
            if (!next.length) return { error: '至少要留一個類別。' };
            s.categories = next;   // replaced, never edited in place, so the shared default list stays intact
          }
          else if (m.key === 'teams' && ['two', 'one'].includes(m.value)) {
            s.teams = m.value;
            if (m.value === 'one' && s.teamSize === 2) { s.teamSize = 3; G.seats = G.seats.map(t => Array.from({ length: 3 }, (_, i) => t[i] || null)); }
            if (m.value === 'one') { s.mode = 'words'; s.words = 6; if (s.sequential) { s.sequential = false; G.seats = [0, 1].map(() => Array(s.teamSize).fill(null)); } G.seats[1] = Array(s.teamSize).fill(null); }
            else { s.mode = 'score'; s.words = 6; }
          }
          else if (m.key === 'mode' && ['score', 'words'].includes(m.value) && s.teams === 'two') s.mode = m.value;
          else if (m.key === 'script' && ['trad', 'simp'].includes(m.value)) s.script = m.value;
          else if (m.key === 'lastChance' && [10, 15, 20].includes(n)) s.lastChance = n;
          else if (m.key === 'teamSize' && [2, 3, 4].includes(n) && !(n === 2 && s.teams === 'one')) {   // playing without an opponent needs at least 2 clue-givers
            s.teamSize = n; // seats beyond the new size are dropped
            G.seats = G.seats.map(t => Array.from({ length: n }, (_, i) => t[i] || null));
          }
          else if (m.key === 'target' && n >= 50 && n <= 2000) s.target = n;
          else if (m.key === 'words' && n >= 0 && n <= 50) s.words = n;   // 0 = twice the number of players
          else if (m.key === 'reward' && n >= 40 && n <= 400) s.reward = n;
          else if (m.key === 'bank' && n >= 0 && n <= 600) s.bank = n;
          else if (m.key === 'writeSecs' && n >= 10 && n <= 180) s.writeSecs = n;
          else if (m.key === 'penalty' && n >= 0 && n <= 20) s.penalty = n;
          else if (m.key === 'firstBonus' && n >= 0 && n <= 100) s.firstBonus = n;
          else if (m.key === 'speedSecs' && n >= 0 && n <= 40) s.speedSecs = n;
          change(); return {};
        }
        case 'resetSettings': { // back to the defaults (pass-and-play stays on if it was chosen)
          if (!isHost || G.phase !== 'lobby') return {};
          const keep = G.settings.sequential;
          G.settings = { ...DEFAULT_SETTINGS, sequential: keep };
          G.seats = G.seats.map(t => Array.from({ length: G.settings.teamSize }, (_, i) => t[i] || null));
          change(); return {};
        }
        case 'seatName': { // whoever holds several seats of a team on one device can name each of them
          if (G.phase !== 'lobby' || ![0, 1].includes(m.team) || G.seats[m.team][m.seat] !== id) return {};
          G.seatNames[m.team][m.seat] = String(m.name || '').trim().slice(0, 14) || null; change(); return {};
        }
        case 'teamName': {
          if (G.phase !== 'lobby' || ![0, 1].includes(m.team) || !(isHost || G.seats[m.team].every(s => s === id))) return {};
          G.names[m.team] = String(m.name || '').trim().slice(0, 16) || ['第一隊', '第二隊'][m.team]; change(); return {};
        }
        case 'start': {
          if (!isHost || G.phase !== 'lobby') return {};
          G.solo = G.settings.teams === 'one';
          if ((G.solo ? [G.seats[0]] : G.seats).some(t => t.some(s => !s))) return { error: '先把每個座位都坐滿。' };
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
          return submitClue(t, m.text, !!m.auto, m.picks);
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
            if (G.passUsed[t]) return { error: '這個詞你們已經跳過一次了。' };
            G.passUsed[t] = true; return swapWord(t);
          }
          const o = 1 - t, to = holder(o, 'giver1');
          if (G.teams[o].stage !== 'giver1') return { error: `${G.names[o]}已經送出提示字了，不能再跳過。` };   // passing is only open before anyone has submitted
          if (G.pass && G.pass.from === o) return acceptPass();   // both teams want to pass: done
          if (G.passUsed[t]) return { error: '你們已經提議過跳過這個詞了。' };
          if (G.pass) return {};
          if (!to || !G.players[to] || !G.players[to].connected) return { error: `${G.names[o]}的提示人 1 不在線上。` };
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
        phase: G.phase, me: id, isHost: id === hostId, hostId, settings: { ...G.settings, wordsAuto: !G.settings.words, words: wordsOf() }, names: G.names, scores: G.scores,
        winner: G.winner, ratings: !G.solo && G.phase === 'over' ? [0, 1].map(t => rating(G.scores[t], G.settings.bank, Math.max(1, G.record.length))) : null,   // VS: every team gets a grade too, over the words actually played
        history: G.solo && G.phase === 'over' ? G.history : null, record: G.phase === 'over' ? G.record : null, rating: G.solo && G.phase === 'over' ? rating(G.scores[0], G.settings.bank, G.settings.words) : null,
        costs: { prices: PRICES, symbol: SYMBOL_COST, max: MAX_CHARS },
        players: Object.entries(G.players).map(([pid, p]) => ({ id: pid, name: p.name, connected: p.connected })),
        seats: G.seats.map((t, ti) => t.map((s, si) => s ? { id: s, name: seatName(ti, si) } : null)),
        myTeam: actTeam(id) < 0 ? null : actTeam(id),
        sharedDevice: actTeam(id) >= 0 && G.seats[actTeam(id)].filter(s => s === id).length > 1   // one device, several people
      };
      if (G.phase === 'lobby' || !G.card) return v;

      const mt = v.myTeam, roles = rolesOf(id);
      v.myRoles = roles; v.round = {
        n: G.round, cat: G.card.cat, level: G.level, levelName: TIERS[G.level - 1].name, reward: G.settings.reward, longBonus: G.longBonus, blanks: [...G.card.word].map(() => 1),
        teams: [0, 1].map(t => {
          const T = G.teams[t], mine = t === mt;
          const rem = T.deadline ? T.deadline - now() : T.guessDeadline ? T.guessDeadline - now() : null;
          const tv = { stage: T.stage, result: T.result, earned: T.earned, breakdown: T.breakdown, remaining: rem === null ? null : Math.max(0, rem) };
          if (mine || reveal) tv.clues = (T.stage === 'guess' || T.stage === 'done' || reveal) ? T.clues.map(showClue) : null;
          if (mine || reveal) tv.clueCosts = T.clues.map(clueCost);
          if (mine || reveal) { tv.log = T.log.slice(); tv.spent = T.spent; tv.clueSpent = T.clueSpent; }
          if (mine) {
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
          can: !G.settings.sequential && roles.includes('giver1') && G.teams[t].stage === 'giver1' && (G.solo || G.teams[o].stage === 'giver1') && (!G.passUsed[t] || (!!p && p.from === o)) && (!p || p.from === o),
          asking: !!p && p.from === t,
          toAnswer: p && p.to === id ? { by: seatName(p.from, seatIdx(p.from, 'giver1')), team: p.from } : null
        };
      }
      v.round.passNote = G.passNote;
      v.round.firstTeam = G.firstCorrect;   // who guessed first (their bonus waits to see if the other team gets it too)
      const isGiver = roles.some(r => r.startsWith('giver'));
      if (reveal || (G.phase === 'round' && isGiver)) { v.round.word = wordShown(); v.round.syl = G.card.syl.map(fullOf); }
      if (G.phase === 'round' && isGiver) v.round.banned = [...banned().values()];
      const wk = mt !== null && G.phase === 'round' ? +(G.teams[mt].stage.match(/^giver(\d)$/) || [0, 0])[1] : 0;   // the clue-giver now writing
      if (wk >= 2 && roles.includes('giver' + wk)) {
        // A later clue-giver sees what each earlier one gave, but only the sounds (no tone, no characters) and not their order:
        // each sound once, alphabetically, plus how many characters and symbols there were in all.
        v.round.prev = G.teams[mt].clues.map((clue, i) => {
          const seen = new Map();
          clue.forEach(it => (it.snd || []).forEach(s => seen.set(s.py + '|' + s.zy, s)));
          const syms = clue.filter(it => it.sym);
          return { n: i + 1, count: clue.filter(it => it.han).length, symbols: syms.length, sounds: [...seen.values()].sort((a, b) => a.py < b.py ? -1 : a.py > b.py ? 1 : 0) };
        });
      }
      return v;
    }

    return { addPlayer, disconnect, handle, view, state: G };
  }

  const api = { withTone, pinyinNum, markBase, rating, gradeNeed, RATINGS, RATING_CUTS, CATEGORIES, TIERS, tierWords, createGame, priceOf, clueCost, parseReading, pinyinOf, zhuyinOf, soundOf, fullOf, soundKey, makeReadings, isHan, guessText,
    PRICES, SYMBOL_COST, SYMBOLS, MAX_CHARS, ALL_WORDS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.YKWIM = api;
})(typeof window !== 'undefined' ? window : globalThis);
