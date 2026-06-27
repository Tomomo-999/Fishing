import { useState } from 'react';
import fishData from '../data/fish.json';

const TECHNIQUES = [
  {
    id: 'sabiki',
    name: 'サビキ釣り',
    difficulty: 1,
    target_fish: ['aji','iwashi','saba'],
    steps: [
      { title: '仕掛けをセット', desc: 'サビキ仕掛けをロッドに取り付ける。針は5〜7号が標準' },
      { title: 'コマセを入れる', desc: 'コマセカゴにアミエビを7〜8割ほど詰める' },
      { title: '海底まで落とす', desc: '仕掛けをゆっくり海底まで沈める' },
      { title: 'コマセを撒く', desc: '竿を上下に2〜3回シャクリ、コマセを拡散させる' },
      { title: 'アタリに合わせる', desc: '穂先が曲がったらゆっくり一定速度で巻き上げる' },
    ],
    gear: [
      { name: '万能サビキロッド 3〜4m', cat: '竿', price: '3,000〜5,000円', buy: 'サビキ ロッド 万能' },
      { name: 'スピニングリール 2000〜3000番', cat: 'リール', price: '3,000〜5,000円', buy: 'スピニングリール 2000番' },
      { name: 'ナイロンライン 2〜3号', cat: 'ライン（道糸）', price: '500〜800円', buy: 'ナイロンライン 3号', line_note: 'サビキはナイロンでOK。柔らかく扱いやすい。色付きで見やすいものが便利。' },
      { name: 'サビキ仕掛け 5〜7号', cat: '仕掛け', price: '200〜400円', buy: 'サビキ仕掛け', consumable: true },
      { name: 'アミカゴ（上カゴor下カゴ）', cat: '仕掛け', price: '100〜300円', buy: 'アミカゴ サビキ', consumable: false },
      { name: 'アミエビ（コマセ）', cat: 'エサ', price: '400〜600円', buy: 'アミエビ コマセ', consumable: true },
    ],
    tips: [
      '早朝6〜8時と夕方17〜19時（マヅメ時）が最も釣れやすい',
      'コマセは多めに用意（500g〜1kg）',
      '魚が釣れたら同じタナ（深さ）をキープする',
    ],
    budget: [
      { label: 'とりあえず体験', price: '〜2,000円', icon: '💴', color: '#27AE60',
        items: ['ダイソー 万能竿セット（竿＋リール）¥1,000〜1,500', 'ダイソー サビキ仕掛け ¥110', 'アミエビ（釣具店で購入）¥500前後'],
        note: 'ダイソーの竿でも普通に釣れます。まず1回やってみたい人はこれで十分！' },
      { label: 'ちゃんとやりたい', price: '〜8,000円', icon: '💰', color: '#2E86C1',
        items: ['竿＋リールセット ¥3,000〜5,000', 'サビキ仕掛け（予備含め3セット）¥600', 'アミエビ 1kg ¥600'],
        note: '竿の感度が上がり、魚のアタリが分かりやすくなる。長く続けるならこっち。' },
    ],
    yt: 'サビキ釣り 初心者 やり方',
  },
  {
    id: 'nage_zuri',
    name: '投げ釣り',
    difficulty: 1,
    target_fish: ['kisu','karei'],
    steps: [
      { title: '仕掛けをセット', desc: '投げ釣り専用仕掛けに錘（10〜15号）を付ける' },
      { title: 'エサを付ける', desc: 'アオイソメを2〜3cmにちぎり針に通し刺し' },
      { title: 'キャスト', desc: '竿を後ろに振り、前方に投げる。最初は軽く10〜20m程度でOK' },
      { title: '待つ', desc: '着底したら糸フケをとり、置き竿にして待つ' },
      { title: '回収', desc: '5〜10分おきにゆっくり巻き寄せてエサを確認' },
    ],
    gear: [
      { name: '投げ釣り専用ロッド 3〜4m', cat: '竿', price: '3,000〜8,000円', buy: '投げ釣り ロッド' },
      { name: 'スピニングリール 3000〜4000番', cat: 'リール', price: '3,000〜5,000円', buy: 'スピニングリール 3000番' },
      { name: 'ナイロンライン 3〜5号', cat: 'ライン（道糸）', price: '500〜1,000円', buy: 'ナイロンライン 投げ釣り 4号', line_note: '基本はナイロン4号。遠投したい場合はPE1〜1.5号＋力糸（テーパーライン）の組み合わせが有効。' },
      { name: '天秤＋オモリ 15〜25号', cat: '仕掛け', price: '200〜400円', buy: '天秤 投げ釣り 15号', consumable: true },
      { name: '投げ釣り仕掛け（キス針7〜9号）', cat: '仕掛け', price: '200〜400円', buy: 'キス 投げ釣り 仕掛け', consumable: true },
      { name: 'アオイソメ', cat: 'エサ', price: '500〜700円', buy: 'アオイソメ 釣り エサ', consumable: true },
    ],
    tips: [
      '砂浜は遠投より近距離の方が釣れることも多い',
      'エサは新鮮さが大事。こまめに交換する',
      'キスは引き釣りも有効（ゆっくり手前に引きずる）',
    ],
    budget: [
      { label: 'とりあえず体験', price: '〜2,000円', icon: '💴', color: '#27AE60',
        items: ['ダイソー ちょい投げセット ¥1,000〜1,500', 'ダイソー 仕掛けセット ¥110', 'アオイソメ（釣具店）¥500前後'],
        note: 'ダイソーのちょい投げセットは侮れない。近場でキスを狙うには十分。まず砂浜に立ってみよう！' },
      { label: 'ちゃんとやりたい', price: '〜8,000円', icon: '💰', color: '#2E86C1',
        items: ['投げ竿 3〜4m ¥3,000〜5,000', 'スピニングリール 3000番 ¥3,000', '天秤＋仕掛けセット ¥400'],
        note: '本格的な竿はしなりが良く、遠投しやすい。キス・カレイを本気で狙うなら。' },
    ],
    yt: '投げ釣り キス 初心者 やり方',
  },
  {
    id: 'eging',
    name: 'エギング',
    difficulty: 2,
    target_fish: ['aori_ika','kouika','kensaki'],
    steps: [
      { title: 'エギを選ぶ', desc: '2.5〜3号のエギを選ぶ。カラーはオレンジ・ピンクが入門向け' },
      { title: 'キャスト', desc: '堤防の際や沖に向けてエギを投げる' },
      { title: '着底させる', desc: 'エギが底に着くまで待つ（糸がたるんだら着底のサイン）' },
      { title: '【入門】ズル引き（コウイカに特に有効）', desc: '着底したらそのままゆっくりリールを巻いて底を這わせる。シャクリ不要で初心者でも釣れる。コウイカはこれで十分。' },
      { title: '【次のステップ】シャクリ＋フォール', desc: '竿を上方向に2〜3回素早く振り（シャクリ）、その後3〜10秒ゆっくり沈める（フォール）。アオリイカに特に有効。' },
      { title: '取り込み', desc: '糸がふっと緩んだらイカが乗ったサイン。竿を立てて一定速度で巻く。墨が飛ぶのでタオルを準備' },
    ],
    gear: [
      { name: 'エギングロッド 8〜8.6ft', cat: '竿', price: '5,000〜10,000円', buy: 'エギング ロッド 初心者' },
      { name: 'スピニングリール 2500番', cat: 'リール', price: '3,000〜5,000円', buy: 'スピニングリール 2500番' },
      { name: 'PEライン 0.6〜0.8号', cat: 'ライン（糸）', price: '1,000〜2,000円', buy: 'PEライン エギング 0.8号', line_note: 'エギングはPEライン推奨。感度が高く軽いエギでも操作しやすい。' },
      { name: 'リーダー（フロロ）1.5〜2号', cat: 'ライン（糸）', price: '500〜1,000円', buy: 'フロロカーボン リーダー エギング', line_note: 'PEラインの先端に結ぶ。「ユニノット」か「クリンチノット」が簡単。' },
      { name: 'スナップ（サイズ1〜1.5）', cat: '小物', price: '200〜400円', buy: 'スナップ エギング サイズ1', line_note: 'エギの交換を素早くする金具。開閉の向きを確認してから使う。' },
      { name: 'エギ 2.5号（春・コウイカ向け）', cat: 'ルアー', price: '700〜1,200円', buy: 'エギ 2.5号', consumable: true, loss: true },
      { name: 'エギ 3号（秋アオリ・標準）', cat: 'ルアー', price: '700〜1,500円', buy: 'エギ 3号', consumable: true, loss: true },
    ],
    tips: [
      '【コウイカ初心者向け】着底させてズル引きするだけでOK。シャクリは不要',
      '夕方〜夜・早朝が最も釣れやすい',
      '墨が飛ぶので白い服は避ける',
      'PEラインは切れやすいので必ずリーダーを結ぶ',
    ],
    budget: [
      { label: 'とりあえず体験', price: '〜2,000円', icon: '💴', color: '#27AE60',
        items: ['ダイソー 釣り竿（1.8〜2m）¥1,000', 'ダイソー エギ ¥110〜220', 'ダイソー リール付きセットがあれば尚良し'],
        note: 'ダイソーの竿とエギで仙崎のコウイカが普通に釣れた、という話はよく聞きます。まず1本持って堤防へ！' },
      { label: 'ちゃんとやりたい', price: '〜10,000円', icon: '💰', color: '#2E86C1',
        items: ['エギングロッド 8ft ¥5,000〜7,000', 'スピニングリール 2500番 ¥3,000', 'PEライン＋リーダー ¥1,500', 'エギ 2〜3本 ¥2,000〜3,000'],
        note: 'PEラインの感度でアタリがよく分かる。アオリイカ・ケンサキへのステップアップにも。' },
    ],
    setup_videos: [
      { title: 'リールへのPEラインの巻き方', query: 'PEライン リール 巻き方 初心者' },
      { title: 'スナップの結び方（エギング）', query: 'スナップ 結び方 エギング ユニノット' },
      { title: 'リーダーの結び方（FGノット入門）', query: 'リーダー 結び方 簡単 エギング 初心者' },
    ],
    yt: 'コウイカ ズル引き エギング 初心者',
  },
  {
    id: 'uki_zuri',
    name: 'ウキ釣り',
    difficulty: 2,
    target_fish: ['mebaru','sayori','chinu'],
    steps: [
      { title: '仕掛けをセット', desc: 'ウキ止め→ウキ→オモリ→針の順にセット。タナ（深さ）は1〜2mから' },
      { title: 'エサを付ける', desc: 'オキアミを針に刺す。頭を取って尻尾から刺すと外れにくい' },
      { title: '投入', desc: 'ウキを静かに足元や沖に投入する' },
      { title: 'ウキを見る', desc: 'ウキが沈んだらアタリのサイン' },
      { title: '合わせ・巻き取り', desc: 'ウキが沈んだ瞬間に竿を立てて合わせ、一定速度で巻く' },
    ],
    gear: [
      { name: '万能サビキロッド', cat: '竿', price: '3,000〜5,000円', buy: 'サビキ ロッド 万能' },
      { name: 'スピニングリール 2000番', cat: 'リール', price: '3,000〜5,000円', buy: 'スピニングリール 2000番' },
      { name: 'ウキ仕掛けセット', cat: '仕掛け', price: '300〜500円', buy: 'ウキ釣り 仕掛け セット', consumable: true },
      { name: 'オキアミ', cat: 'エサ', price: '300〜500円', buy: 'オキアミ 釣り エサ', consumable: true },
    ],
    tips: [
      'ウキはなるべく小さいものを選ぶと食い込みがよくなる',
      '夜釣りでは電気ウキを使う',
      'サヨリは早朝の満潮前後が特によく釣れる',
    ],
    yt: 'ウキ釣り 初心者 メバル やり方',
  },
  {
    id: 'fukase',
    name: 'フカセ釣り',
    difficulty: 3,
    target_fish: ['chinu'],
    steps: [
      { title: 'コマセを作る', desc: 'オキアミとマキエを混ぜてコマセを作る。集魚効果が高い' },
      { title: '仕掛けをセット', desc: 'ウキ止めなしの全遊動仕掛けを作る。針は3〜5号' },
      { title: 'コマセを撒く', desc: 'ポイントにコマセを撒いて魚を集める' },
      { title: '仕掛けを流す', desc: 'コマセと同じ流れに仕掛けを乗せて自然に流す' },
      { title: '合わせ', desc: 'ウキが勢いよく沈んだら素早く合わせる。チヌは口が硬い' },
    ],
    gear: [
      { name: 'フカセ専用ロッド 1〜1.5号', cat: '竿', price: '15,000〜30,000円', buy: 'フカセ ロッド チヌ' },
      { name: 'レバーブレーキリール', cat: 'リール', price: '10,000〜30,000円', buy: 'レバーブレーキ リール フカセ' },
      { name: 'ウキ（円錐ウキ0〜B）', cat: '仕掛け', price: '500〜1,500円', buy: '円錐ウキ チヌ フカセ', consumable: true },
      { name: 'オキアミ（生）', cat: 'エサ', price: '600〜900円', buy: 'オキアミ 生 フカセ', consumable: true },
      { name: 'マキエ（集魚剤）', cat: 'エサ', price: '400〜700円', buy: 'マキエ 集魚剤 チヌ', consumable: true },
    ],
    tips: [
      '仕掛けとコマセを同じ潮の流れに乗せるのが最大のコツ',
      '道具が高価なので最初はレンタルも検討を',
      '上級者に教わりながら始めるのがおすすめ',
    ],
    yt: 'フカセ釣り 初心者 チヌ やり方',
  },
];

// ── 仕掛け図 SVG ────────────────────────────────────────────
const RigDiagram = ({ techId }) => {
  if (techId === 'sabiki') return (
    <svg viewBox="0 0 760 470" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
      <defs>
        <linearGradient id="sg_rod" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4AA40"/>
          <stop offset="45%" stopColor="#A07828"/>
          <stop offset="100%" stopColor="#6B4810"/>
        </linearGradient>
        <linearGradient id="sg_cork" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DDB880"/>
          <stop offset="100%" stopColor="#B89060"/>
        </linearGradient>
        <linearGradient id="sg_cage" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A0A0A0"/>
          <stop offset="40%" stopColor="#D8D8D8"/>
          <stop offset="100%" stopColor="#A0A0A0"/>
        </linearGradient>
      </defs>

      {/* ── 竿 ── */}
      <polygon points="68,92 68,95 310,100 310,95" fill="url(#sg_rod)"/>
      <polygon points="310,95 310,101 540,107 540,100" fill="url(#sg_rod)"/>
      <polygon points="540,100 540,108 660,112 660,104" fill="url(#sg_rod)"/>
      {/* 竿のハイライト */}
      <line x1="68" y1="93" x2="660" y2="105" stroke="#E8CC70" strokeWidth="1" opacity="0.5"/>
      {/* 節の帯 */}
      {[130,210,295,380,465,548].map((x,i) => {
        const y = 93 + (x-68)*0.016;
        return <rect key={i} x={x-3} y={y} width={6} height={8} rx={1} fill="#7B4010" stroke="#5A2C08" strokeWidth="0.5"/>;
      })}
      {/* ガイドリング */}
      {[108,185,268,352,437,522].map((x,i) => {
        const y = 91 + (x-68)*0.016;
        const r = 7 - i*0.7;
        return (
          <g key={i}>
            <circle cx={x} cy={y-r-1} r={r} fill="none" stroke="#C0C0C0" strokeWidth="2"/>
            <rect x={x-3} y={y-2} width={6} height={4} rx={1} fill="#A0A0A0" stroke="#888" strokeWidth="0.8"/>
          </g>
        );
      })}
      {/* コルクグリップ */}
      <rect x="660" y="100" width="88" height="16" rx="8" fill="url(#sg_cork)" stroke="#9A7040" strokeWidth="1.5"/>
      {[670,681,692,703,714,725,736,747].map((x,i) => (
        <ellipse key={i} cx={x} cy={108} rx={4} ry={6} fill="none" stroke="#C8A060" strokeWidth="0.8" opacity="0.6"/>
      ))}
      {/* 道糸（ライン）竿に沿って走る */}
      <line x1="68" y1="91" x2="660" y2="103" stroke="#3A9ECC" strokeWidth="2"/>
      {/* 竿ラベル */}
      <text x="390" y="82" fontSize="14" fill="#7B4A18" fontWeight="700">竿</text>
      {/* 道糸ラベル */}
      <text x="210" y="84" fontSize="12" fill="#3A9ECC" fontWeight="600">道糸</text>

      {/* ── 竿先から下へライン ── */}
      <line x1="68" y1="95" x2="68" y2="144" stroke="#3A9ECC" strokeWidth="2"/>

      {/* ── 上カゴ ── */}
      {/* トップリング */}
      <ellipse cx="68" cy="148" rx="18" ry="6" fill="#B0B0B0" stroke="#888" strokeWidth="1.5"/>
      {/* カゴ本体 */}
      <rect x="50" y="148" width="36" height="48" fill="url(#sg_cage)" stroke="#888" strokeWidth="1.5"/>
      {/* メッシュ横線 */}
      {[158,168,178,188].map(y => (
        <line key={y} x1="50" y1={y} x2="86" y2={y} stroke="#909090" strokeWidth="0.9"/>
      ))}
      {/* メッシュ縦線 */}
      {[58,68,78].map(x => (
        <line key={x} x1={x} y1="148" x2={x} y2="196" stroke="#909090" strokeWidth="0.9"/>
      ))}
      {/* ボトムリング */}
      <ellipse cx="68" cy="196" rx="18" ry="6" fill="#B0B0B0" stroke="#888" strokeWidth="1.5"/>
      {/* 下の接続線 */}
      <line x1="68" y1="202" x2="68" y2="212" stroke="#888" strokeWidth="2.5" strokeLinecap="round"/>
      {/* 上カゴラベル */}
      <line x1="87" y1="168" x2="135" y2="155" stroke="#555" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="138" y="152" fontSize="13" fill="#222" fontWeight="700">上カゴ</text>
      <text x="138" y="166" fontSize="12" fill="#444">（アミカゴ）</text>
      <line x1="87" y1="185" x2="135" y2="188" stroke="#555" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="138" y="196" fontSize="12" fill="#666">アミエビを入れる</text>

      {/* ── 幹糸 ── */}
      <line x1="68" y1="212" x2="68" y2="415" stroke="#CCCCCC" strokeWidth="2.2"/>
      <line x1="69" y1="315" x2="108" y2="315" stroke="#AAA" strokeWidth="1"/>
      <text x="111" y="320" fontSize="12" fill="#888">幹糸</text>

      {/* ── サビキ針×5本 ── */}
      {[
        { y:232, n:5, c:'#E85555', c2:'#AA2222' },
        { y:275, n:6, c:'#44AACC', c2:'#226688' },
        { y:318, n:7, c:'#FFCC33', c2:'#AA8800' },
        { y:361, n:6, c:'#66CC88', c2:'#338855' },
        { y:404, n:5, c:'#EE7799', c2:'#BB4466' },
      ].map(({y,n,c,c2},i) => (
        <g key={i}>
          {/* 枝糸 */}
          <line x1="68" y1={y} x2="112" y2={y} stroke="#CCC" strokeWidth="1.4"/>
          {/* ルアー本体（小魚形） */}
          <ellipse cx="128" cy={y} rx="16" ry="6" fill={c} stroke={c2} strokeWidth="1.2"/>
          {/* 尾びれ */}
          <polygon points={`144,${y-6} 144,${y+6} 153,${y}`} fill={c2}/>
          {/* 目 */}
          <circle cx="117" cy={y-1} r="3" fill="white"/>
          <circle cx="117" cy={y-1} r="1.5" fill="#222"/>
          <circle cx="116" cy={y-2} r="0.8" fill="white"/>
          {/* ルアーの光沢線 */}
          <line x1="124" y1={y-4} x2="134" y2={y-2} stroke="white" strokeWidth="1.2" opacity="0.6"/>
          {/* 針（J字） */}
          <path d={`M153,${y} Q170,${y} 170,${y+13} Q170,${y+25} 157,${y+27}`}
            stroke="#888" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          {/* 返し */}
          <line x1={157} y1={y+27} x2={162} y2={y+21} stroke="#888" strokeWidth="1.8" strokeLinecap="round"/>
          {/* 号数ラベル */}
          <text x="178" y={y+5} fontSize="12" fill="#555">針 {n}号</text>
        </g>
      ))}

      {/* ── 下カゴ ── */}
      <ellipse cx="68" cy="420" rx="16" ry="5" fill="#B0B0B0" stroke="#888" strokeWidth="1.5"/>
      <rect x="52" y="420" width="32" height="40" fill="url(#sg_cage)" stroke="#888" strokeWidth="1.5"/>
      {[430,440,450].map(y => (
        <line key={y} x1="52" y1={y} x2="84" y2={y} stroke="#909090" strokeWidth="0.9"/>
      ))}
      {[60,68,76].map(x => (
        <line key={x} x1={x} y1="420" x2={x} y2="460" stroke="#909090" strokeWidth="0.9"/>
      ))}
      <ellipse cx="68" cy="460" rx="16" ry="5" fill="#B0B0B0" stroke="#888" strokeWidth="1.5"/>
      {/* 下カゴラベル */}
      <line x1="85" y1="440" x2="125" y2="440" stroke="#555" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="128" y="444" fontSize="13" fill="#222" fontWeight="700">下カゴ</text>
      <text x="128" y="458" fontSize="11" fill="#666">（下かご式の場合）</text>
    </svg>
  );

  if (techId === 'nage_zuri') return (
    <svg viewBox="0 0 760 470" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
      <defs>
        <linearGradient id="ng_rod" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4AA40"/>
          <stop offset="45%" stopColor="#A07828"/>
          <stop offset="100%" stopColor="#6B4810"/>
        </linearGradient>
        <linearGradient id="ng_cork" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DDB880"/>
          <stop offset="100%" stopColor="#B89060"/>
        </linearGradient>
      </defs>

      {/* 竿 */}
      <polygon points="68,92 68,95 310,100 310,95" fill="url(#ng_rod)"/>
      <polygon points="310,95 310,101 540,107 540,100" fill="url(#ng_rod)"/>
      <polygon points="540,100 540,108 660,112 660,104" fill="url(#ng_rod)"/>
      <line x1="68" y1="93" x2="660" y2="105" stroke="#E8CC70" strokeWidth="1" opacity="0.5"/>
      {[130,210,295,380,465,548].map((x,i) => {
        const y = 93 + (x-68)*0.016;
        return <rect key={i} x={x-3} y={y} width={6} height={8} rx={1} fill="#7B4010" stroke="#5A2C08" strokeWidth="0.5"/>;
      })}
      {[108,185,268,352,437,522].map((x,i) => {
        const y = 91 + (x-68)*0.016;
        const r = 7 - i*0.7;
        return (
          <g key={i}>
            <circle cx={x} cy={y-r-1} r={r} fill="none" stroke="#C0C0C0" strokeWidth="2"/>
            <rect x={x-3} y={y-2} width={6} height={4} rx={1} fill="#A0A0A0" stroke="#888" strokeWidth="0.8"/>
          </g>
        );
      })}
      <rect x="660" y="100" width="88" height="16" rx="8" fill="url(#ng_cork)" stroke="#9A7040" strokeWidth="1.5"/>
      {[670,681,692,703,714,725,736,747].map((x,i) => (
        <ellipse key={i} cx={x} cy={108} rx={4} ry={6} fill="none" stroke="#C8A060" strokeWidth="0.8" opacity="0.6"/>
      ))}
      <line x1="68" y1="91" x2="660" y2="103" stroke="#3A9ECC" strokeWidth="2"/>
      <text x="390" y="82" fontSize="14" fill="#7B4A18" fontWeight="700">竿（投げ竿 3〜4m）</text>
      <text x="200" y="84" fontSize="12" fill="#3A9ECC" fontWeight="600">道糸 ナイロン 3〜5号</text>

      {/* 竿先からライン下へ */}
      <line x1="68" y1="95" x2="68" y2="148" stroke="#3A9ECC" strokeWidth="2"/>

      {/* よりもどし */}
      <circle cx="68" cy="152" r="7" fill="#777" stroke="#555" strokeWidth="1.5"/>
      <circle cx="68" cy="152" r="3" fill="#AAA"/>
      <line x1="76" y1="152" x2="120" y2="152" stroke="#888" strokeWidth="1" strokeDasharray="2,2"/>
      <text x="123" y="156" fontSize="12" fill="#666">よりもどし</text>

      {/* 天秤 */}
      <line x1="68" y1="159" x2="68" y2="210" stroke="#888" strokeWidth="2"/>
      <line x1="35" y1="185" x2="68" y2="185" stroke="#888" strokeWidth="2"/>
      {/* オモリ */}
      <ellipse cx="35" cy="200" rx="13" ry="20" fill="#909090" stroke="#666" strokeWidth="1.5"/>
      <line x1="35" y1="180" x2="35" y2="185" stroke="#888" strokeWidth="2"/>
      <ellipse cx="30" cy="196" rx="3" ry="6" fill="white" opacity="0.3"/>
      <text x="5" y="198" fontSize="12" fill="#666" textAnchor="middle">おもり</text>
      <text x="5" y="212" fontSize="11" fill="#888" textAnchor="middle">15〜25号</text>
      <text x="72" y="181" fontSize="12" fill="#666">天秤</text>

      {/* ハリス */}
      <line x1="68" y1="210" x2="68" y2="300" stroke="#CCCCCC" strokeWidth="1.8"/>
      <line x1="69" y1="258" x2="110" y2="258" stroke="#AAA" strokeWidth="1"/>
      <text x="113" y="254" fontSize="12" fill="#888">ハリス</text>
      <text x="113" y="266" fontSize="11" fill="#888">フロロ 1〜1.5号</text>

      {/* キス針 */}
      <path d="M68,300 Q90,300 90,320 Q90,340 72,344"
        stroke="#777" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <line x1="72" y1="344" x2="80" y2="336" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
      <text x="95" y="318" fontSize="12" fill="#555">キス針 7〜9号</text>

      {/* アオイソメ */}
      <path d="M72,344 C82,356 68,370 76,385 C84,400 70,415 78,428"
        stroke="#C8A050" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M72,344 C78,352 66,362 72,372" stroke="#A07030" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <line x1="80" y1="388" x2="120" y2="388" stroke="#AAA" strokeWidth="1" strokeDasharray="2,2"/>
      <text x="123" y="384" fontSize="12" fill="#888">アオイソメ</text>
      <text x="123" y="397" fontSize="11" fill="#AAA">（エサ）</text>

      {/* 海底 */}
      <path d="M10,450 Q95,440 180,450 Q265,460 350,450 Q435,440 520,450 Q600,458 690,450"
        stroke="#C8A050" strokeWidth="2.5" fill="none"/>
      <path d="M10,456 Q95,446 180,456 Q265,466 350,456" stroke="#C8A050" strokeWidth="1" fill="none" opacity="0.4"/>
      <text x="350" y="468" fontSize="12" fill="#C8A050" textAnchor="middle">砂地の海底</text>
    </svg>
  );

  if (techId === 'eging') return (
    <div>
      <svg viewBox="0 0 760 310" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="eg_rod" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4AA40"/>
            <stop offset="45%" stopColor="#A07828"/>
            <stop offset="100%" stopColor="#6B4810"/>
          </linearGradient>
          <linearGradient id="eg_cork" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DDB880"/>
            <stop offset="100%" stopColor="#B89060"/>
          </linearGradient>
        </defs>

        {/* 竿 */}
        <polygon points="68,92 68,95 310,100 310,95" fill="url(#eg_rod)"/>
        <polygon points="310,95 310,101 540,107 540,100" fill="url(#eg_rod)"/>
        <polygon points="540,100 540,108 660,112 660,104" fill="url(#eg_rod)"/>
        <line x1="68" y1="93" x2="660" y2="105" stroke="#E8CC70" strokeWidth="1" opacity="0.5"/>
        {[130,210,295,380,465,548].map((x,i) => {
          const y = 93 + (x-68)*0.016;
          return <rect key={i} x={x-3} y={y} width={6} height={8} rx={1} fill="#7B4010" stroke="#5A2C08" strokeWidth="0.5"/>;
        })}
        {[108,185,268,352,437,522].map((x,i) => {
          const y = 91 + (x-68)*0.016;
          const r = 7 - i*0.7;
          return (
            <g key={i}>
              <circle cx={x} cy={y-r-1} r={r} fill="none" stroke="#C0C0C0" strokeWidth="2"/>
              <rect x={x-3} y={y-2} width={6} height={4} rx={1} fill="#A0A0A0" stroke="#888" strokeWidth="0.8"/>
            </g>
          );
        })}
        <rect x="660" y="100" width="88" height="16" rx="8" fill="url(#eg_cork)" stroke="#9A7040" strokeWidth="1.5"/>
        {[670,681,692,703,714,725,736,747].map((x,i) => (
          <ellipse key={i} cx={x} cy={108} rx={4} ry={6} fill="none" stroke="#C8A060" strokeWidth="0.8" opacity="0.6"/>
        ))}
        <line x1="68" y1="91" x2="660" y2="103" stroke="#27AE60" strokeWidth="2"/>
        <text x="360" y="82" fontSize="14" fill="#7B4A18" fontWeight="700">竿（エギングロッド 8〜9ft）</text>
        <text x="190" y="83" fontSize="12" fill="#27AE60" fontWeight="600">PEライン 0.6〜0.8号</text>

        {/* 竿先からライン */}
        <line x1="68" y1="95" x2="68" y2="148" stroke="#27AE60" strokeWidth="2"/>

        {/* FGノット */}
        <rect x="56" y="150" width="24" height="18" rx="5" fill="#F4A820" stroke="#D68910" strokeWidth="1.5"/>
        <text x="68" y="163" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="700">結び目</text>
        <line x1="81" y1="159" x2="130" y2="159" stroke="#D68910" strokeWidth="1" strokeDasharray="2,2"/>
        <text x="133" y="155" fontSize="12" fill="#7D6608" fontWeight="600">FGノット</text>
        <text x="133" y="168" fontSize="11" fill="#999">（動画で確認推奨）</text>

        {/* リーダー */}
        <line x1="68" y1="168" x2="68" y2="265" stroke="#CCCCCC" strokeWidth="2"/>
        <line x1="69" y1="220" x2="110" y2="220" stroke="#AAA" strokeWidth="1"/>
        <text x="113" y="216" fontSize="12" fill="#888">リーダー</text>
        <text x="113" y="228" fontSize="11" fill="#888">フロロカーボン 2号</text>
        <text x="113" y="240" fontSize="11" fill="#999">長さ 1〜1.5m</text>

        {/* スナップ */}
        <path d="M61,265 Q61,283 68,285 Q75,287 75,271 Q75,265 68,265"
          stroke="#777" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="76" y1="275" x2="120" y2="275" stroke="#888" strokeWidth="1" strokeDasharray="2,2"/>
        <text x="123" y="271" fontSize="12" fill="#666">スナップ</text>
        <text x="123" y="284" fontSize="11" fill="#999">（エギ交換用の金具）</text>

        {/* スナップ下の矢印 */}
        <line x1="68" y1="287" x2="68" y2="302" stroke="#777" strokeWidth="2"/>
        <polygon points="62,302 68,310 74,302" fill="#777"/>
      </svg>

      {/* エギ写真 + ラベル */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0 8px 8px' }}>
        <img src="/figure/fig_egi.jpeg" alt="エギ"
          style={{ width: '55%', maxWidth: '260px', borderRadius: '10px', objectFit: 'contain' }}/>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '6px' }}>エギ（イカ用ルアー）</div>
          <div style={{ fontSize: '12px', color: '#555', marginBottom: '3px' }}>コウイカ向け：2.5号</div>
          <div style={{ fontSize: '12px', color: '#555', marginBottom: '3px' }}>アオリイカ向け：3号</div>
          <div style={{ fontSize: '11px', color: '#27AE60', marginTop: '6px' }}>💴 ダイソーでも買える！</div>
        </div>
      </div>
      <div style={{ margin: '0 8px 8px', padding: '6px 10px', background: '#EBF5FB', borderRadius: '6px', fontSize: '11px', color: '#1A5276' }}>
        💡 号数（ごうすう）＝大きいほどエギのサイズが大きくなる
      </div>
    </div>
  );

  return null;
};

// エギウィザード用データ
const EGI_STEPS = [
  { id: 'time', q: '何時頃に釣りますか？', choices: [
    { v: 'dawn',  icon: '🌅', label: '夜明け前〜朝まずめ' },
    { v: 'day',   icon: '☀️', label: '日中' },
    { v: 'dusk',  icon: '🌇', label: '夕まずめ〜日没後' },
    { v: 'night', icon: '🌙', label: '夜（常夜灯周り）' },
  ]},
  { id: 'sea', q: '海の色・濁りは？', choices: [
    { v: 'clear',   icon: '🔵', label: '澄んでいる（青・透明）' },
    { v: 'slight',  icon: '🟢', label: 'やや濁りあり' },
    { v: 'muddy',   icon: '🟤', label: '濁り強め（茶色・緑）' },
    { v: 'unknown', icon: '🤷', label: 'よくわからない' },
  ]},
  { id: 'target', q: '狙うイカは？', choices: [
    { v: 'aori',    icon: '🦑', label: 'アオリイカ' },
    { v: 'kouika',  icon: '🦑', label: 'コウイカ' },
    { v: 'kensaki', icon: '🦑', label: 'ケンサキイカ（仙崎イカ）' },
    { v: 'any',     icon: '🎯', label: 'なんでもOK' },
  ]},
];

const EGI_COLORS = {
  dawn:  { clear: ['ケイムラ（紫外線発光）','ピンク・オレンジ','ナチュラル系'], slight: ['ケイムラ＋オレンジ','ピンク・赤','ケイムラ'], muddy: ['赤・ダークレッド','紫・パープル','ゴールド'], unknown: ['ピンク・オレンジ（万能）','ケイムラ','赤・オレンジ'] },
  day:   { clear: ['ナチュラル（半透明）','ブルー・グリーン','ピンク'], slight: ['ピンク・オレンジ','ナチュラル系','ブラウン'], muddy: ['オレンジ・ゴールド','赤・チャート','紫'], unknown: ['ピンク・オレンジ（万能）','ナチュラル系','ブルー・グリーン'] },
  dusk:  { clear: ['オレンジ・ピンク','赤・レッド','夜光グロー'], slight: ['オレンジ・赤オレンジ','赤','夜光グロー'], muddy: ['赤・紫（強アピール）','ゴールド','夜光グロー'], unknown: ['オレンジ・ピンク','赤系','夜光グロー'] },
  night: { clear: ['夜光（グロー）白・クリア','ピンク夜光','オレンジ夜光'], slight: ['ピンク夜光','赤夜光','白夜光'], muddy: ['赤夜光','紫夜光','オレンジ夜光'], unknown: ['夜光（グロー）白（鉄板）','ピンク夜光','赤夜光'] },
};

const EGI_SIZES = {
  aori:    { best: '3号', sub: '3.5号（秋）/ 2.5号（春・渋い時）', note: '秋は新子が多く3号が基本。春の大型は2.5号が有効な場合も。' },
  kouika:  { best: '2.5号', sub: '3号（大型狙い）', note: 'コウイカは体が小さい。2.5号で底をゆっくり引くのがコツ。' },
  kensaki: { best: '2.5号', sub: '3号（夏の大型期）', note: 'ケンサキイカは細身。2.5号が基本、活性が高い夏は3号も有効。' },
  any:     { best: '3号', sub: '2.5号（2本目）', note: '迷ったら3号を1本。反応がなければ2.5号に落とす。' },
};

const EGI_GLOW = {
  dawn:  '夜明け前はグロー（夜光）→明るくなったら通常カラーに切替',
  day:   '日中は通常カラーでOK。夜光タイプは不要。',
  dusk:  '暗くなり始めたらグロー（夜光）タイプに切替を。',
  night: '夜釣りはグロー必須。常夜灯でエギを光らせてから投げる。',
};

const TIME_LABELS  = { dawn: '朝まずめ', day: '日中', dusk: '夕まずめ', night: '夜' };
const SEA_LABELS   = { clear: '澄んだ海', slight: 'やや濁り', muddy: '濁り強め', unknown: '状況不明' };
const TARGET_LABELS= { aori: 'アオリイカ', kouika: 'コウイカ', kensaki: 'ケンサキイカ', any: 'なんでも' };

const EgiWizard = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [history, setHistory] = useState([]);
  const [done, setDone] = useState(false);

  const pick = (id, val) => {
    setHistory(h => [...h, { step, answers: { ...answers } }]);
    const next = { ...answers, [id]: val };
    setAnswers(next);
    if (step < EGI_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setDone(true);
    }
  };

  const back = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setStep(prev.step);
    setAnswers(prev.answers);
    setHistory(h => h.slice(0, -1));
    setDone(false);
  };

  const reset = () => { setStep(0); setAnswers({}); setHistory([]); setDone(false); };

  if (done) {
    const { time, sea, target } = answers;
    const colors = EGI_COLORS[time][sea];
    const sizeInfo = EGI_SIZES[target];
    const glowMsg = EGI_GLOW[time];
    const q = `エギ ${sizeInfo.best} ${colors[0].split('（')[0]} セット`;

    return (
      <div style={{ fontSize: '13px' }}>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C2833', marginBottom: '2px' }}>おすすめエギ</div>
          <div style={{ fontSize: '11px', color: '#566573' }}>{TIME_LABELS[time]} / {SEA_LABELS[sea]} / {TARGET_LABELS[target]}</div>
        </div>
        <div style={{ background: '#FEF3CD', borderLeft: '3px solid #F4A820', borderRadius: '0 8px 8px 0', padding: '10px 12px', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#7D6608', marginBottom: '4px' }}>🎨 色（まずここを合わせる）</div>
          {colors.map((c, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#7D6608', padding: '2px 0' }}>
              {['①最優先','②2番手','③3番手'][i]} {c}
            </div>
          ))}
        </div>
        <div style={{ background: '#F0F8FF', borderLeft: '3px solid #2E86C1', borderRadius: '0 8px 8px 0', padding: '10px 12px', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#0C2D48', marginBottom: '4px' }}>⚖️ 号数（次にここ）</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2833' }}>{sizeInfo.best} がベスト <span style={{ fontSize: '11px', color: '#566573' }}>/ {sizeInfo.sub}</span></div>
          <div style={{ fontSize: '11px', color: '#566573', marginTop: '3px' }}>{sizeInfo.note}</div>
        </div>
        <div style={{ background: '#F5F0E8', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#566573', marginBottom: '3px' }}>💡 夜光（グロー）について</div>
          <div style={{ fontSize: '12px', color: '#566573' }}>{glowMsg}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => window.open(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer')}
            style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #2E86C1', background: '#F0F8FF', color: '#2E86C1', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            🛒 Amazonで探す <span style={{ fontSize: '10px' }}>(PR)</span>
          </button>
          <button
            onClick={reset}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5EAF0', background: '#fff', color: '#566573', fontSize: '12px', cursor: 'pointer' }}
          >
            やり直す
          </button>
        </div>
      </div>
    );
  }

  const s = EGI_STEPS[step];
  const prog = EGI_STEPS.map((_, i) => (
    <span key={i} style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: i < step ? '#2E86C1' : i === step ? '#F4A820' : '#E5EAF0', marginRight: '3px' }} />
  ));

  return (
    <div style={{ fontSize: '13px' }}>
      <div style={{ marginBottom: '8px' }}>{prog}</div>
      {step > 0 && (
        <button onClick={back} style={{ fontSize: '12px', color: '#566573', background: 'none', border: 'none', cursor: 'pointer', padding: '0', marginBottom: '10px' }}>← 戻る</button>
      )}
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2833', marginBottom: '10px' }}>{s.q}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {s.choices.map(c => (
          <button
            key={c.v}
            onClick={() => pick(s.id, c.v)}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5EAF0', background: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
          >
            <span>{c.icon}</span><span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const DIFF_COLORS = { 1: { bg: '#D5F5E3', color: '#2D6A4F', label: '★☆☆ 入門向け' }, 2: { bg: '#FEF3CD', color: '#7D6608', label: '★★☆ 中級向け' }, 3: { bg: '#FADBD8', color: '#E74C3C', label: '★★★ 上級者向け' } };

// 予算別スターターカード
const BudgetCard = ({ budget }) => {
  if (!budget) return null;
  return (
    <div style={{ margin: '0 16px 12px' }}>
      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C2833', marginBottom: '8px' }}>💡 まずはこれだけ買えばOK</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {budget.map((b, i) => (
          <div key={i} style={{ borderRadius: '12px', border: `1.5px solid ${b.color}20`, background: `${b.color}08`, overflow: 'hidden' }}>
            {/* ヘッダー */}
            <div style={{ background: b.color, padding: '7px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{b.icon} {b.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', opacity: 0.9 }}>{b.price}</span>
            </div>
            {/* 買うもの */}
            <div style={{ padding: '10px 12px 6px' }}>
              {b.items.map((item, j) => (
                <div key={j} style={{ fontSize: '12px', color: '#1C2833', padding: '3px 0', display: 'flex', gap: '6px' }}>
                  <span style={{ color: b.color, flexShrink: 0 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            {/* コメント */}
            <div style={{ margin: '4px 12px 10px', padding: '7px 10px', background: '#fff', borderRadius: '8px', fontSize: '11px', color: '#566573', lineHeight: 1.6 }}>
              {b.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ガイド詳細
const TechniqueDetail = ({ techId, onBack }) => {
  const t = TECHNIQUES.find(x => x.id === techId);
  if (!t) return null;
  const d = DIFF_COLORS[t.difficulty];
  const targets = t.target_fish.map(id => fishData.find(x => x.id === id)).filter(Boolean);

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '14px 16px', fontSize: '14px', color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        ← 一覧に戻る
      </button>

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1C2833' }}>{t.name}</div>
        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '99px', fontWeight: 600, background: d.bg, color: d.color, marginTop: '6px', display: 'inline-block' }}>{d.label}</span>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
          {targets.map(f => (
            <span key={f.id} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#F0F8FF', border: '1px solid #E5EAF0', color: '#566573' }}>{f.emoji}{f.name}</span>
          ))}
        </div>
      </div>

      {/* 仕掛け図 */}
      {['sabiki','nage_zuri','eging'].includes(t.id) && (
        <>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>仕掛け図</div>
          <div style={{ margin: '0 16px 12px', background: '#F8F9FA', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'center' }}>
            <RigDiagram techId={t.id} />
          </div>
        </>
      )}

      {/* ライン説明（エギングのみ） */}
      {t.id === 'eging' && (
        <>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>糸（ライン）の種類</div>
          <div style={{ margin: '0 16px 8px', padding: '12px 14px', background: '#F0F8FF', borderLeft: '3px solid #2E86C1', borderRadius: '0 8px 8px 0', fontSize: '12px', color: '#566573', lineHeight: 1.7 }}>
            <strong style={{ color: '#0C2D48' }}>🧵 糸（ライン）の種類について</strong><br />
            <strong>PEライン（推奨）</strong>：細くて感度が高い。ただしリーダーが必要。<br />
            <strong>フロロカーボン</strong>：根ずれに強く扱いやすい。初心者のうちはフロロ単体でも可。<br />
            <strong>ナイロン</strong>：柔らかく巻きやすい。感度はやや低い。サビキ・投げ釣り向き。
          </div>
        </>
      )}

      {/* 手順 */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>手順</div>
      <div style={{ padding: '0 16px' }}>
        {t.steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', position: 'relative' }}>
            {i < t.steps.length - 1 && (
              <div style={{ position: 'absolute', left: '13px', top: '38px', bottom: 0, width: '2px', background: '#F0F8FF', borderRadius: '1px' }} />
            )}
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2E86C1', color: '#fff', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, paddingTop: '3px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C2833' }}>{s.title}</div>
              <div style={{ fontSize: '12px', color: '#566573', marginTop: '3px', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* アドバイス */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>ワンポイントアドバイス</div>
      <div style={{ margin: '0 16px 8px', padding: '12px', background: '#FEF3CD', borderRadius: '8px' }}>
        {t.tips.map((tip, i) => (
          <div key={i} style={{ fontSize: '13px', color: '#7D6608', padding: '3px 0', lineHeight: 1.5 }}>💡 {tip}</div>
        ))}
      </div>

      {/* エギウィザード */}
      {t.id === 'eging' && (
        <>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>🦑 今日のエギを選ぶ</div>
          <div style={{ margin: '0 16px 8px', background: '#fff', border: '1px solid #E5EAF0', borderRadius: '12px', padding: '14px' }}>
            <EgiWizard key={techId} />
          </div>
        </>
      )}

      {/* セットアップ動画 */}
      {t.setup_videos && t.setup_videos.length > 0 && (
        <>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>📹 事前に見ておく動画</div>
          <div style={{ margin: '0 16px 8px', background: '#fff', border: '1px solid #E5EAF0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px 6px', fontSize: '12px', color: '#566573', lineHeight: 1.5 }}>現地でいきなり困らないよう、出発前に確認しておこう。</div>
            {t.setup_videos.map((v, i) => (
              <button
                key={i}
                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(v.query)}`, '_blank', 'noopener,noreferrer')}
                style={{ width: '100%', borderTop: i > 0 ? '1px solid #E5EAF0' : 'none', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'none', border: 'none', borderTop: i > 0 ? '1px solid #E5EAF0' : 'none' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: '14px' }}>▶</span>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2833' }}>{v.title}</div>
                  <div style={{ fontSize: '11px', color: '#566573', marginTop: '2px' }}>YouTube で検索 →</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* 予算別スターターセット */}
      <BudgetCard budget={t.budget} />

      {/* 道具リスト（詳細） */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>道具の詳細（参考）</div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {t.gear.map((g, i) => (
          <div key={i} style={{ background: g.cat.includes('ライン') ? '#F0F8FF' : '#fff', border: '1px solid #E5EAF0', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#F0F8FF', color: '#566573', flexShrink: 0, marginTop: '2px' }}>{g.cat}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2833' }}>{g.name}</div>
              <div style={{ fontSize: '11px', color: '#566573', marginTop: '2px' }}>{g.price}</div>
              {g.line_note && <div style={{ fontSize: '11px', color: '#1A5276', marginTop: '3px', lineHeight: 1.5 }}>💡 {g.line_note}</div>}
              {g.loss && <div style={{ fontSize: '11px', color: '#E74C3C', marginTop: '2px' }}>⚠️ ロストしやすい。予備を複数本持参推奨</div>}
            </div>
            {(g.consumable || g.line_note) && (
              <button
                onClick={() => window.open(`https://www.amazon.co.jp/s?k=${encodeURIComponent(g.buy)}`, '_blank', 'noopener,noreferrer')}
                style={{ fontSize: '11px', color: '#2E86C1', padding: '4px 8px', border: '1px solid #2E86C1', borderRadius: '4px', cursor: 'pointer', background: 'none', flexShrink: 0, alignSelf: 'center' }}
              >
                Amazon PR
              </button>
            )}
          </div>
        ))}
      </div>

      {/* YouTube参考動画 */}
      <button
        onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(t.yt)}`, '_blank', 'noopener,noreferrer')}
        style={{ margin: '12px 16px 8px', width: 'calc(100% - 32px)', padding: '14px', borderRadius: '12px', border: 'none', background: '#0C2D48', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        ▶ YouTubeで参考動画を探す →
      </button>
    </div>
  );
};

// ガイド一覧
const TechniqueGuide = () => {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div>
      {selectedId ? (
        <TechniqueDetail techId={selectedId} onBack={() => setSelectedId(null)} />
      ) : (
        <>
          {/* ヒーロー */}
          <div style={{ margin: '12px 16px', padding: '16px', background: 'linear-gradient(135deg, #0C2D48, #1A5276)', borderRadius: '14px', color: '#fff', boxShadow: '0 4px 14px rgba(12,45,72,.25)' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>🎣 道具は安くていい。まず釣ってみよう。</div>
            <div style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1.7 }}>
              ダイソーの1,000円竿でイカが釣れることもあります。<br/>
              高い道具より、<strong>まず海に行くこと</strong>が大事。<br/>
              このガイドでは予算別の「最低限セット」も紹介します。
            </div>
          </div>

          {/* ダイソー豆知識バナー */}
          <div style={{ margin: '0 16px 12px', padding: '12px 14px', background: '#D5F5E3', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>💴</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#2D6A4F', marginBottom: '3px' }}>100均（ダイソー）で始める人も多い</div>
              <div style={{ fontSize: '12px', color: '#2D6A4F', lineHeight: 1.6 }}>
                竿・リール・仕掛け・エギまで揃う時代。<br/>
                まず1〜2,000円で体験してみて、続けるなら道具を揃えるのがおすすめ。
              </div>
            </div>
          </div>

          <h2 className="section-header">釣り方を選ぶ</h2>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TECHNIQUES.map(t => {
              const d = DIFF_COLORS[t.difficulty];
              const targets = t.target_fish.map(id => fishData.find(x => x.id === id)).filter(Boolean);
              const minBudget = t.budget?.[0]?.price;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className="card"
                  style={{ padding: '14px', cursor: 'pointer', textAlign: 'left', width: '100%', border: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1C2833', flex: 1 }}>{t.name}</div>
                    <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '99px', fontWeight: 600, background: d.bg, color: d.color }}>{d.label}</span>
                  </div>
                  {minBudget && (
                    <div style={{ fontSize: '11px', color: '#27AE60', fontWeight: 600, marginBottom: '6px' }}>
                      💴 {minBudget}から始められる
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {targets.map(f => (
                      <span key={f.id} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#F0F8FF', border: '1px solid #E5EAF0', color: '#566573' }}>{f.emoji}{f.name}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TechniqueGuide;
