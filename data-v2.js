export const DATA = {
  version: '2.0.0',
  title: '经络寻行 V2',
  standardPointTotal: 361,
  sources: {
    national: 'GB/T 12346-2021《经穴名称与定位》',
    whoLocation: 'WHO Standard Acupuncture Point Locations in the Western Pacific Region (2008)',
    whoNomenclature: 'WHO Standard Acupuncture Nomenclature（361 经穴）',
    classic: '《黄帝内经·灵枢·经脉》',
    note: '经穴名称、编码、经脉归属及标准定位摘要按公开标准资料整理；三维点位、脏器形态与体内循行均为教学映射，不用于针刺定位或诊疗。'
  },
  elementColors: {
    木: '#55b878',
    火: '#e35c4b',
    土: '#d5ab55',
    金: '#e7edf2',
    水: '#426b9a',
    普通: '#4e91df'
  },
  organs: [
    { id: 'lung', name: '肺', type: '脏', color: '#d9b8b8', position: [0, 1.30, 0.02], scale: [0.63, 0.82, 0.36], bilateral: true, note: '左右肺教学示意' },
    { id: 'heart', name: '心', type: '脏', color: '#b84d58', position: [-0.12, 0.92, 0.22], scale: [0.34, 0.43, 0.29], note: '胸腔偏左的教学示意' },
    { id: 'liver', name: '肝', type: '脏', color: '#7e4a35', position: [0.26, 0.34, 0.12], scale: [0.62, 0.30, 0.34], note: '右上腹教学示意' },
    { id: 'spleen', name: '脾', type: '脏', color: '#8f566d', position: [-0.48, 0.24, 0.02], scale: [0.20, 0.34, 0.18], note: '左上腹教学示意' },
    { id: 'kidney', name: '肾', type: '脏', color: '#6b4454', position: [0, 0.02, -0.22], scale: [0.19, 0.34, 0.17], bilateral: true, note: '腰部后方教学示意' },
    { id: 'stomach', name: '胃', type: '腑', color: '#c58762', position: [-0.26, 0.16, 0.18], scale: [0.38, 0.45, 0.24], note: '上腹部教学示意' },
    { id: 'gallbladder', name: '胆', type: '腑', color: '#5b8a4b', position: [0.36, 0.18, 0.25], scale: [0.11, 0.25, 0.10], note: '肝下方教学示意' },
    { id: 'small-intestine', name: '小肠', type: '腑', color: '#d28c68', position: [0, -0.28, 0.18], scale: [0.48, 0.48, 0.20], tube: true, note: '腹腔盘曲教学示意' },
    { id: 'large-intestine', name: '大肠', type: '腑', color: '#a87054', position: [0, -0.18, 0.14], scale: [0.63, 0.57, 0.20], frameTube: true, note: '结肠框架教学示意' },
    { id: 'bladder', name: '膀胱', type: '腑', color: '#d0ad69', position: [0, -0.78, 0.20], scale: [0.24, 0.30, 0.20], note: '盆腔教学示意' },
    { id: 'triple', name: '三焦', type: '腑', color: '#6fc4bb', position: [0, 0.18, 0.02], scale: [0.70, 1.35, 0.38], region: true, note: '上中下三焦区域化教学表达' },
    { id: 'pericardium', name: '心包', type: '脏腑系统', color: '#7e6ca8', position: [-0.12, 0.92, 0.22], scale: [0.42, 0.52, 0.37], shell: true, note: '心包络教学示意' }
  ],
  channels: []
};

const C = DATA.channels;
const p = (code, name, position, options = {}) => ({
  code,
  name,
  pinyin: options.pinyin || '',
  position,
  location: options.location || `标准定位请参照 ${DATA.sources.national}。`,
  categories: options.categories || ['普通穴位'],
  element: options.element || null,
  crossing: options.crossing || [],
  reminders: options.reminders || [],
  traditional: options.traditional || [],
  sourceLevel: options.sourceLevel || '标准名称与教学摘要'
});
const ch = (o) => C.push({
  group: 'primary',
  bilateral: true,
  hasOwnPoints: true,
  internalNote: '体内联系依据传统经脉理论作教学示意，存在不同学术解释。',
  points: [],
  ...o
});

ch({
  code: 'LU', name: '手太阴肺经', english: 'Lung Meridian', polarity: 'yin', organ: 'lung', pair: 'LI', officialPointCount: 11,
  color: '#4a8b80', summary: '由胸走手，属肺，络大肠。',
  path: [[-0.42,1.48,0.46],[-0.66,1.38,0.38],[-0.92,1.10,0.18],[-1.18,0.72,0.10],[-1.42,0.28,0.08],[-1.70,-0.12,0.10],[-1.82,-0.32,0.12]],
  internalPath: [[-0.42,1.48,0.24],[-0.18,1.30,0.08],[0,1.25,0],[-0.04,0.85,0.06],[-0.12,0.70,0.12]],
  points: [
    p('LU1','中府',[-0.42,1.48,0.50],{pinyin:'Zhōngfǔ',categories:['肺募穴','手足太阴交会穴'],crossing:['手太阴肺经','足太阴脾经'],location:'前胸外上方，第1肋间隙，前正中线旁开6寸。',traditional:['咳嗽、气喘等传统应用索引']}),
    p('LU5','尺泽',[-1.18,0.72,0.14],{pinyin:'Chǐzé',categories:['合穴','五输穴'],element:'水',location:'肘横纹上，肱二头肌腱桡侧凹陷中。'}),
    p('LU6','孔最',[-1.42,0.28,0.12],{pinyin:'Kǒngzuì',categories:['郗穴'],location:'前臂掌面桡侧，腕掌侧远端横纹上7寸。'}),
    p('LU7','列缺',[-1.63,-0.02,0.14],{pinyin:'Lièquē',categories:['络穴','八脉交会穴'],crossing:['任脉（八脉交会配属）'],location:'前臂桡侧，腕掌侧远端横纹上1.5寸区域。'}),
    p('LU8','经渠',[-1.69,-0.14,0.14],{pinyin:'Jīngqú',categories:['经穴','五输穴'],element:'金'}),
    p('LU9','太渊',[-1.72,-0.22,0.15],{pinyin:'Tàiyuān',categories:['输穴','原穴','五输穴','八会穴·脉会'],element:'土',location:'腕掌侧横纹桡侧，桡动脉搏动处。'}),
    p('LU10','鱼际',[-1.79,-0.29,0.16],{pinyin:'Yújì',categories:['荥穴','五输穴'],element:'火'}),
    p('LU11','少商',[-1.84,-0.35,0.16],{pinyin:'Shàoshāng',categories:['井穴','五输穴'],element:'木',location:'拇指末节桡侧，指甲根角侧上方。'})
  ]
});

ch({
  code: 'LI', name: '手阳明大肠经', english: 'Large Intestine Meridian', polarity: 'yang', organ: 'large-intestine', pair: 'LU', officialPointCount: 20,
  color: '#e3a85e', summary: '由手走头，属大肠，络肺。',
  path: [[-1.84,-0.34,0.06],[-1.68,-0.10,0.02],[-1.42,0.32,0.00],[-1.16,0.75,0.00],[-0.82,1.28,0.03],[-0.52,1.62,0.16],[-0.30,2.10,0.22],[-0.18,2.72,0.32]],
  internalPath: [[-0.52,1.62,0.02],[-0.25,1.25,-0.02],[0,0.35,0.02],[0,-0.18,0.08]],
  points: [
    p('LI1','商阳',[-1.84,-0.34,0.08],{categories:['井穴','五输穴'],element:'金'}),
    p('LI2','二间',[-1.78,-0.25,0.07],{categories:['荥穴','五输穴'],element:'水'}),
    p('LI3','三间',[-1.73,-0.18,0.06],{categories:['输穴','五输穴'],element:'木'}),
    p('LI4','合谷',[-1.70,-0.12,0.10],{categories:['原穴'],location:'手背，第2掌骨桡侧中点附近。',traditional:['头面部、疼痛等传统应用索引']}),
    p('LI5','阳溪',[-1.60,0.02,0.05],{categories:['经穴','五输穴'],element:'火'}),
    p('LI6','偏历',[-1.45,0.28,0.04],{categories:['络穴']}),
    p('LI7','温溜',[-1.34,0.47,0.03],{categories:['郗穴']}),
    p('LI11','曲池',[-1.16,0.75,0.04],{categories:['合穴','五输穴'],element:'土',location:'屈肘，肘横纹外侧端与肱骨外上髁连线中点附近。'}),
    p('LI15','肩髃',[-0.70,1.48,0.10],{categories:['交会穴'],crossing:['手阳明大肠经','阳跷脉']}),
    p('LI20','迎香',[-0.18,2.72,0.36],{categories:['交会穴'],crossing:['手阳明大肠经','足阳明胃经'],location:'鼻翼外缘中点旁，鼻唇沟中。'})
  ]
});

ch({
  code: 'ST', name: '足阳明胃经', english: 'Stomach Meridian', polarity: 'yang', organ: 'stomach', pair: 'SP', officialPointCount: 45,
  color: '#f0c85e', summary: '由头走足，属胃，络脾。',
  path: [[-0.16,2.80,0.40],[-0.22,2.36,0.38],[-0.38,1.72,0.46],[-0.32,1.05,0.48],[-0.30,0.25,0.45],[-0.42,-0.55,0.37],[-0.48,-1.45,0.30],[-0.44,-2.35,0.24],[-0.38,-3.08,0.30],[-0.56,-3.22,0.48]],
  internalPath: [[-0.32,1.05,0.12],[-0.20,0.55,0.10],[-0.26,0.16,0.18],[0,-0.10,0.08]],
  points: [
    p('ST1','承泣',[-0.15,2.80,0.43],{categories:['交会穴'],crossing:['足阳明胃经','阳跷脉','任脉']}),
    p('ST25','天枢',[-0.30,-0.05,0.50],{categories:['大肠募穴'],location:'腹部，脐中旁开2寸。'}),
    p('ST34','梁丘',[-0.48,-1.35,0.34],{categories:['郗穴']}),
    p('ST36','足三里',[-0.46,-1.88,0.34],{categories:['合穴','五输穴'],element:'土',location:'小腿前外侧，犊鼻下3寸，胫骨前嵴外一横指。'}),
    p('ST40','丰隆',[-0.50,-2.28,0.30],{categories:['络穴']}),
    p('ST41','解溪',[-0.43,-3.02,0.31],{categories:['经穴','五输穴'],element:'火'}),
    p('ST42','冲阳',[-0.44,-3.11,0.36],{categories:['原穴']}),
    p('ST43','陷谷',[-0.48,-3.16,0.42],{categories:['输穴','五输穴'],element:'木'}),
    p('ST44','内庭',[-0.53,-3.20,0.46],{categories:['荥穴','五输穴'],element:'水'}),
    p('ST45','厉兑',[-0.58,-3.23,0.50],{categories:['井穴','五输穴'],element:'金'})
  ]
});

ch({
  code: 'SP', name: '足太阴脾经', english: 'Spleen Meridian', polarity: 'yin', organ: 'spleen', pair: 'ST', officialPointCount: 21,
  color: '#8b7750', summary: '由足走胸，属脾，络胃。',
  path: [[-0.26,-3.20,0.22],[-0.32,-2.85,0.16],[-0.33,-2.05,0.10],[-0.30,-1.30,0.12],[-0.28,-0.62,0.20],[-0.38,0.12,0.38],[-0.50,0.78,0.46],[-0.58,1.42,0.38]],
  internalPath: [[-0.38,0.12,0.10],[-0.48,0.24,0.02],[-0.18,0.14,0.12],[0.0,0.42,0.04]],
  points: [
    p('SP1','隐白',[-0.26,-3.20,0.25],{categories:['井穴','五输穴'],element:'木'}),
    p('SP2','大都',[-0.29,-3.11,0.23],{categories:['荥穴','五输穴'],element:'火'}),
    p('SP3','太白',[-0.30,-3.02,0.21],{categories:['输穴','原穴','五输穴'],element:'土',location:'足内侧缘，第1跖趾关节近端下方赤白肉际。',reminders:['五行属土，是脾经输穴，也是脾经原穴。']}),
    p('SP4','公孙',[-0.31,-2.92,0.19],{categories:['络穴','八脉交会穴'],crossing:['冲脉（八脉交会配属）']}),
    p('SP5','商丘',[-0.32,-2.84,0.18],{categories:['经穴','五输穴'],element:'金'}),
    p('SP6','三阴交',[-0.33,-2.48,0.14],{categories:['交会穴'],crossing:['足太阴脾经','足厥阴肝经','足少阴肾经'],location:'小腿内侧，内踝尖上3寸，胫骨内侧缘后际。',reminders:['足三阴经交会，界面会同时提示三条交会经。']}),
    p('SP8','地机',[-0.32,-2.05,0.12],{categories:['郗穴']}),
    p('SP9','阴陵泉',[-0.30,-1.48,0.13],{categories:['合穴','五输穴'],element:'水'}),
    p('SP21','大包',[-0.62,1.20,0.20],{categories:['大络']})
  ]
});

ch({
  code: 'HT', name: '手少阴心经', english: 'Heart Meridian', polarity: 'yin', organ: 'heart', pair: 'SI', officialPointCount: 9,
  color: '#8f4256', summary: '由胸走手，属心，络小肠。',
  path: [[-0.55,1.25,0.30],[-0.78,1.18,0.14],[-1.02,0.84,0.04],[-1.27,0.45,0.03],[-1.54,0.05,0.06],[-1.78,-0.27,0.08]],
  internalPath: [[-0.55,1.25,0.05],[-0.16,0.98,0.18],[-0.05,0.75,0.05],[0,-0.10,0]],
  points: [
    p('HT3','少海',[-1.04,0.80,0.05],{categories:['合穴','五输穴'],element:'水'}),
    p('HT4','灵道',[-1.45,0.17,0.07],{categories:['经穴','五输穴'],element:'金'}),
    p('HT5','通里',[-1.52,0.07,0.08],{categories:['络穴']}),
    p('HT6','阴郄',[-1.58,-0.02,0.09],{categories:['郗穴']}),
    p('HT7','神门',[-1.62,-0.10,0.10],{categories:['输穴','原穴','五输穴'],element:'土',location:'腕掌侧横纹尺侧端，尺侧腕屈肌腱桡侧。'}),
    p('HT8','少府',[-1.72,-0.22,0.10],{categories:['荥穴','五输穴'],element:'火'}),
    p('HT9','少冲',[-1.80,-0.30,0.11],{categories:['井穴','五输穴'],element:'木'})
  ]
});

ch({
  code: 'SI', name: '手太阳小肠经', english: 'Small Intestine Meridian', polarity: 'yang', organ: 'small-intestine', pair: 'HT', officialPointCount: 19,
  color: '#df6d5e', summary: '由手走头，属小肠，络心。',
  path: [[-1.82,-0.31,-0.02],[-1.55,0.02,-0.08],[-1.28,0.45,-0.10],[-1.00,0.88,-0.13],[-0.70,1.40,-0.22],[-0.40,1.72,-0.32],[-0.22,2.15,-0.26],[-0.31,2.65,0.02]],
  internalPath: [[-0.40,1.72,-0.08],[-0.08,1.05,0.02],[0,-0.35,0.08]],
  points: [
    p('SI1','少泽',[-1.82,-0.31,0.00],{categories:['井穴','五输穴'],element:'金'}),
    p('SI2','前谷',[-1.75,-0.23,-0.01],{categories:['荥穴','五输穴'],element:'水'}),
    p('SI3','后溪',[-1.68,-0.14,-0.03],{categories:['输穴','五输穴','八脉交会穴'],element:'木',crossing:['督脉（八脉交会配属）'],location:'手掌尺侧，第5掌指关节近端赤白肉际。'}),
    p('SI4','腕骨',[-1.58,-0.01,-0.06],{categories:['原穴']}),
    p('SI5','阳谷',[-1.51,0.08,-0.08],{categories:['经穴','五输穴'],element:'火'}),
    p('SI6','养老',[-1.44,0.19,-0.09],{categories:['郗穴']}),
    p('SI7','支正',[-1.34,0.36,-0.10],{categories:['络穴']}),
    p('SI8','小海',[-1.06,0.79,-0.12],{categories:['合穴','五输穴'],element:'土'}),
    p('SI19','听宫',[-0.31,2.65,0.06],{categories:['交会穴'],crossing:['手太阳小肠经','手少阳三焦经','足少阳胆经']})
  ]
});

ch({
  code: 'BL', name: '足太阳膀胱经', english: 'Bladder Meridian', polarity: 'yang', organ: 'bladder', pair: 'KI', officialPointCount: 67,
  color: '#65a7e8', summary: '由头走足，属膀胱，络肾；背部形成内外两行。',
  path: [[-0.10,2.84,0.20],[-0.18,2.42,-0.22],[-0.22,1.72,-0.42],[-0.24,0.90,-0.44],[-0.28,0.10,-0.43],[-0.36,-0.72,-0.35],[-0.48,-1.55,-0.26],[-0.50,-2.42,-0.22],[-0.42,-3.10,-0.10],[-0.62,-3.22,0.06]],
  secondaryPath: [[-0.34,1.70,-0.45],[-0.44,0.86,-0.44],[-0.50,0.06,-0.40],[-0.62,-0.68,-0.32],[-0.72,-1.45,-0.24],[-0.62,-2.30,-0.18]],
  internalPath: [[-0.24,0.20,-0.14],[-0.28,-0.10,-0.24],[-0.25,-0.80,-0.08],[0,-0.82,0.18]],
  points: [
    p('BL13','肺俞',[-0.22,1.18,-0.48],{categories:['背俞穴'],reminders:['肺的背俞穴']}),
    p('BL15','心俞',[-0.23,0.92,-0.48],{categories:['背俞穴'],reminders:['心的背俞穴']}),
    p('BL18','肝俞',[-0.25,0.50,-0.47],{categories:['背俞穴'],reminders:['肝的背俞穴']}),
    p('BL20','脾俞',[-0.26,0.26,-0.46],{categories:['背俞穴'],reminders:['脾的背俞穴']}),
    p('BL21','胃俞',[-0.27,0.12,-0.45],{categories:['背俞穴'],reminders:['胃的背俞穴']}),
    p('BL23','肾俞',[-0.29,-0.16,-0.43],{categories:['背俞穴'],location:'腰部，第2腰椎棘突下旁开1.5寸。',reminders:['肾的背俞穴']}),
    p('BL40','委中',[-0.48,-1.66,-0.30],{categories:['合穴','五输穴'],element:'土'}),
    p('BL58','飞扬',[-0.55,-2.32,-0.20],{categories:['络穴']}),
    p('BL60','昆仑',[-0.46,-3.00,-0.13],{categories:['经穴','五输穴'],element:'火'}),
    p('BL62','申脉',[-0.48,-3.06,-0.08],{categories:['八脉交会穴'],crossing:['阳跷脉（八脉交会配属）']}),
    p('BL63','金门',[-0.52,-3.10,-0.03],{categories:['郗穴']}),
    p('BL64','京骨',[-0.56,-3.14,0.01],{categories:['原穴']}),
    p('BL65','束骨',[-0.58,-3.17,0.03],{categories:['输穴','五输穴'],element:'木'}),
    p('BL66','足通谷',[-0.60,-3.19,0.05],{categories:['荥穴','五输穴'],element:'水'}),
    p('BL67','至阴',[-0.63,-3.22,0.08],{categories:['井穴','五输穴'],element:'金'})
  ]
});

ch({
  code: 'KI', name: '足少阴肾经', english: 'Kidney Meridian', polarity: 'yin', organ: 'kidney', pair: 'BL', officialPointCount: 27,
  color: '#3d678e', summary: '由足走胸，属肾，络膀胱。',
  path: [[-0.18,-3.20,0.02],[-0.30,-2.90,0.08],[-0.26,-2.20,0.08],[-0.24,-1.48,0.10],[-0.20,-0.70,0.18],[-0.18,0.10,0.36],[-0.20,0.82,0.42],[-0.24,1.45,0.36]],
  internalPath: [[-0.18,0.10,0.08],[-0.24,0.02,-0.22],[0,-0.75,0.06],[0,0.75,0.02]],
  points: [
    p('KI1','涌泉',[-0.18,-3.20,0.04],{categories:['井穴','五输穴'],element:'木',location:'足底，屈足卷趾时足心最凹陷处。'}),
    p('KI2','然谷',[-0.25,-3.04,0.08],{categories:['荥穴','五输穴'],element:'火'}),
    p('KI3','太溪',[-0.30,-2.93,0.08],{categories:['输穴','原穴','五输穴'],element:'土',location:'内踝尖与跟腱之间凹陷中。'}),
    p('KI4','大钟',[-0.28,-2.84,0.07],{categories:['络穴']}),
    p('KI5','水泉',[-0.29,-2.78,0.07],{categories:['郗穴']}),
    p('KI6','照海',[-0.28,-2.72,0.08],{categories:['八脉交会穴'],crossing:['阴跷脉（八脉交会配属）']}),
    p('KI7','复溜',[-0.27,-2.60,0.08],{categories:['经穴','五输穴'],element:'金'}),
    p('KI10','阴谷',[-0.24,-1.48,0.11],{categories:['合穴','五输穴'],element:'水'}),
    p('KI27','俞府',[-0.24,1.45,0.40],{categories:['交会穴'],crossing:['足少阴肾经','冲脉']})
  ]
});

ch({
  code: 'PC', name: '手厥阴心包经', english: 'Pericardium Meridian', polarity: 'yin', organ: 'pericardium', pair: 'TE', officialPointCount: 9,
  color: '#75619a', summary: '由胸走手，属心包，络三焦。',
  path: [[-0.42,1.28,0.40],[-0.68,1.18,0.22],[-0.96,0.83,0.10],[-1.25,0.42,0.10],[-1.53,0.02,0.12],[-1.78,-0.28,0.15]],
  internalPath: [[-0.42,1.28,0.08],[-0.14,0.92,0.20],[0,0.50,0.05],[0,-0.42,0.03]],
  points: [
    p('PC3','曲泽',[-1.00,0.78,0.12],{categories:['合穴','五输穴'],element:'水'}),
    p('PC4','郄门',[-1.34,0.30,0.12],{categories:['郗穴']}),
    p('PC5','间使',[-1.45,0.14,0.13],{categories:['经穴','五输穴'],element:'金'}),
    p('PC6','内关',[-1.54,0.01,0.14],{categories:['络穴','八脉交会穴'],crossing:['阴维脉（八脉交会配属）'],location:'前臂掌侧，腕横纹上2寸，两筋之间。'}),
    p('PC7','大陵',[-1.62,-0.10,0.15],{categories:['输穴','原穴','五输穴'],element:'土'}),
    p('PC8','劳宫',[-1.72,-0.22,0.16],{categories:['荥穴','五输穴'],element:'火'}),
    p('PC9','中冲',[-1.80,-0.31,0.17],{categories:['井穴','五输穴'],element:'木'})
  ]
});

ch({
  code: 'TE', name: '手少阳三焦经', english: 'Triple Energizer Meridian', polarity: 'yang', organ: 'triple', pair: 'PC', officialPointCount: 23,
  color: '#68d0c9', summary: '由手走头，属三焦，络心包。',
  path: [[-1.80,-0.31,-0.10],[-1.58,-0.02,-0.16],[-1.30,0.42,-0.18],[-1.02,0.86,-0.20],[-0.70,1.42,-0.25],[-0.38,1.78,-0.30],[-0.30,2.28,-0.18],[-0.36,2.70,0.08]],
  internalPath: [[-0.38,1.78,-0.02],[-0.10,1.20,0.02],[0,0.20,0.02],[0,-0.70,0.02]],
  points: [
    p('TE1','关冲',[-1.80,-0.31,-0.08],{categories:['井穴','五输穴'],element:'金'}),
    p('TE2','液门',[-1.74,-0.23,-0.10],{categories:['荥穴','五输穴'],element:'水'}),
    p('TE3','中渚',[-1.68,-0.15,-0.12],{categories:['输穴','五输穴'],element:'木'}),
    p('TE4','阳池',[-1.59,-0.03,-0.15],{categories:['原穴']}),
    p('TE5','外关',[-1.50,0.08,-0.17],{categories:['络穴','八脉交会穴'],crossing:['阳维脉（八脉交会配属）'],location:'前臂后区，腕背侧横纹上2寸，尺骨与桡骨间隙中点。'}),
    p('TE6','支沟',[-1.43,0.19,-0.18],{categories:['经穴','五输穴'],element:'火'}),
    p('TE7','会宗',[-1.37,0.28,-0.18],{categories:['郗穴']}),
    p('TE10','天井',[-1.04,0.82,-0.20],{categories:['合穴','五输穴'],element:'土'}),
    p('TE23','丝竹空',[-0.36,2.70,0.12],{categories:['交会穴'],crossing:['手少阳三焦经','足少阳胆经']})
  ]
});

ch({
  code: 'GB', name: '足少阳胆经', english: 'Gallbladder Meridian', polarity: 'yang', organ: 'gallbladder', pair: 'LR', officialPointCount: 44,
  color: '#92d45e', summary: '由头走足，属胆，络肝。',
  path: [[-0.32,2.76,0.16],[-0.46,2.30,-0.08],[-0.60,1.68,-0.12],[-0.72,1.05,0.00],[-0.68,0.36,0.12],[-0.62,-0.48,0.16],[-0.66,-1.34,0.10],[-0.70,-2.16,0.08],[-0.58,-2.94,0.12],[-0.62,-3.20,0.32]],
  internalPath: [[-0.68,0.36,0.04],[-0.30,0.28,0.03],[0.28,0.24,0.16],[0.36,0.18,0.22]],
  points: [
    p('GB20','风池',[-0.40,2.17,-0.18],{categories:['交会穴'],crossing:['足少阳胆经','阳维脉']}),
    p('GB24','日月',[-0.64,0.64,0.28],{categories:['胆募穴']}),
    p('GB34','阳陵泉',[-0.68,-1.48,0.12],{categories:['合穴','五输穴','八会穴·筋会'],element:'土',location:'小腿外侧，腓骨头前下方凹陷中。'}),
    p('GB36','外丘',[-0.70,-1.86,0.10],{categories:['郗穴']}),
    p('GB37','光明',[-0.70,-2.04,0.10],{categories:['络穴']}),
    p('GB38','阳辅',[-0.68,-2.24,0.10],{categories:['经穴','五输穴'],element:'火'}),
    p('GB40','丘墟',[-0.60,-2.96,0.14],{categories:['原穴']}),
    p('GB41','足临泣',[-0.60,-3.10,0.22],{categories:['输穴','五输穴','八脉交会穴'],element:'木',crossing:['带脉（八脉交会配属）']}),
    p('GB43','侠溪',[-0.62,-3.17,0.29],{categories:['荥穴','五输穴'],element:'水'}),
    p('GB44','足窍阴',[-0.64,-3.21,0.34],{categories:['井穴','五输穴'],element:'金'})
  ]
});

ch({
  code: 'LR', name: '足厥阴肝经', english: 'Liver Meridian', polarity: 'yin', organ: 'liver', pair: 'GB', officialPointCount: 14,
  color: '#547b50', summary: '由足走胸，属肝，络胆。',
  path: [[-0.12,-3.20,0.22],[-0.22,-2.92,0.16],[-0.24,-2.16,0.12],[-0.25,-1.42,0.12],[-0.22,-0.64,0.18],[-0.30,0.10,0.38],[-0.44,0.74,0.44]],
  internalPath: [[-0.30,0.10,0.08],[0.18,0.28,0.08],[0.28,0.35,0.10],[0.10,0.75,0.02]],
  points: [
    p('LR1','大敦',[-0.12,-3.20,0.24],{categories:['井穴','五输穴'],element:'木'}),
    p('LR2','行间',[-0.16,-3.13,0.21],{categories:['荥穴','五输穴'],element:'火'}),
    p('LR3','太冲',[-0.20,-3.05,0.19],{categories:['输穴','原穴','五输穴'],element:'土',location:'足背，第1、2跖骨间，跖骨底结合部前方凹陷中。'}),
    p('LR4','中封',[-0.22,-2.92,0.17],{categories:['经穴','五输穴'],element:'金'}),
    p('LR5','蠡沟',[-0.24,-2.55,0.14],{categories:['络穴']}),
    p('LR6','中都',[-0.24,-2.32,0.13],{categories:['郗穴']}),
    p('LR8','曲泉',[-0.25,-1.42,0.13],{categories:['合穴','五输穴'],element:'水'}),
    p('LR13','章门',[-0.50,0.34,0.28],{categories:['脾募穴','八会穴·脏会'],crossing:['足厥阴肝经','足少阳胆经']}),
    p('LR14','期门',[-0.44,0.74,0.48],{categories:['肝募穴'],crossing:['足厥阴肝经','足太阴脾经','阴维脉']})
  ]
});

ch({
  code: 'GV', name: '督脉', english: 'Governing Vessel', group: 'extra', polarity: 'yang', organ: null, pair: 'CV', officialPointCount: 28,
  bilateral: false, color: '#e0b95a', summary: '行于后正中线，为奇经八脉之一，具有独立经穴。',
  path: [[0,-0.92,-0.34],[0,-0.35,-0.48],[0,0.45,-0.50],[0,1.30,-0.48],[0,2.15,-0.35],[0,2.92,0.05],[0,2.72,0.36]],
  internalPath: [[0,-0.92,-0.20],[0,-0.20,-0.05],[0,0.70,-0.08],[0,1.80,-0.15]],
  points: [
    p('GV1','长强',[0,-0.92,-0.38],{categories:['络穴','交会穴']}),
    p('GV4','命门',[0,-0.18,-0.53],{categories:['督脉穴']}),
    p('GV9','至阳',[0,0.62,-0.54],{categories:['督脉穴']}),
    p('GV14','大椎',[0,1.54,-0.51],{categories:['交会穴'],crossing:['督脉','六阳经'],reminders:['传统上作为督脉与诸阳经的重要交会点提示。']}),
    p('GV16','风府',[0,2.14,-0.39],{categories:['交会穴'],crossing:['督脉','阳维脉']}),
    p('GV20','百会',[0,2.94,0.06],{categories:['交会穴'],crossing:['督脉','足太阳膀胱经','足少阳胆经','足厥阴肝经'],location:'头顶部，前发际正中直上5寸，或两耳尖连线中点附近。'}),
    p('GV26','水沟',[0,2.72,0.39],{categories:['交会穴'],crossing:['督脉','手阳明大肠经','足阳明胃经']})
  ]
});

ch({
  code: 'CV', name: '任脉', english: 'Conception Vessel', group: 'extra', polarity: 'yin', organ: null, pair: 'GV', officialPointCount: 24,
  bilateral: false, color: '#7fd0ae', summary: '行于前正中线，为奇经八脉之一，具有独立经穴。',
  path: [[0,-0.92,0.38],[0,-0.58,0.48],[0,-0.08,0.50],[0,0.50,0.49],[0,1.06,0.48],[0,1.62,0.44],[0,2.15,0.38],[0,2.58,0.42]],
  internalPath: [[0,-0.92,0.18],[0,-0.30,0.08],[0,0.45,0.06],[0,1.10,0.08]],
  points: [
    p('CV3','中极',[0,-0.64,0.52],{categories:['膀胱募穴','交会穴'],crossing:['任脉','足三阴经']}),
    p('CV4','关元',[0,-0.50,0.53],{categories:['小肠募穴','交会穴'],crossing:['任脉','足三阴经'],location:'下腹部，脐中下3寸，前正中线上。'}),
    p('CV5','石门',[0,-0.40,0.53],{categories:['三焦募穴']}),
    p('CV6','气海',[0,-0.31,0.53],{categories:['任脉穴'],location:'下腹部，脐中下1.5寸，前正中线上。'}),
    p('CV8','神阙',[0,-0.08,0.53],{categories:['任脉穴'],location:'脐中央。'}),
    p('CV12','中脘',[0,0.48,0.52],{categories:['胃募穴','八会穴·腑会','交会穴'],crossing:['任脉','手太阳小肠经','手少阳三焦经','足阳明胃经'],location:'上腹部，脐中上4寸，前正中线上。'}),
    p('CV14','巨阙',[0,0.75,0.51],{categories:['心募穴']}),
    p('CV17','膻中',[0,1.18,0.50],{categories:['心包募穴','八会穴·气会'],location:'前正中线上，平第4肋间隙。'}),
    p('CV22','天突',[0,1.92,0.44],{categories:['交会穴'],crossing:['任脉','阴维脉']}),
    p('CV24','承浆',[0,2.58,0.45],{categories:['交会穴'],crossing:['任脉','督脉','足阳明胃经']})
  ]
});

const extra = (o) => ch({
  group: 'extra',
  hasOwnPoints: false,
  officialPointCount: 0,
  points: [],
  ...o
});
extra({code:'CHONG',name:'冲脉',english:'Thoroughfare Vessel',polarity:'yin',bilateral:false,color:'#c8759f',summary:'奇经八脉之一，无独立编号经穴，循行与足少阴、足阳明等相关联。',path:[[0,-0.90,0.10],[0,-0.35,0.18],[0,0.28,0.20],[0,0.92,0.18],[0,1.48,0.14]],internalPath:[[0,-0.90,0],[0,0.10,-0.02],[0,0.85,0]],associated:['SP4 公孙','PC6 内关'],organ:'kidney'});
extra({code:'DAI',name:'带脉',english:'Belt Vessel',polarity:'yang',bilateral:false,color:'#f0955d',summary:'奇经八脉之一，无独立编号经穴，环腰一周的教学示意。',loop:true,path:[[-0.70,-0.08,0],[-0.45,-0.08,0.45],[0,-0.08,0.58],[0.45,-0.08,0.45],[0.70,-0.08,0],[0.45,-0.08,-0.45],[0,-0.08,-0.58],[-0.45,-0.08,-0.45],[-0.70,-0.08,0]],associated:['GB41 足临泣','TE5 外关'],organ:'gallbladder'});
extra({code:'YINQIAO',name:'阴跷脉',english:'Yin Heel Vessel',polarity:'yin',color:'#596e9e',summary:'奇经八脉之一，无独立编号经穴；由内踝区域上行至目内眦的教学示意。',path:[[-0.30,-2.96,0.06],[-0.26,-2.10,0.08],[-0.24,-1.22,0.10],[-0.20,-0.32,0.18],[-0.18,0.72,0.34],[-0.14,1.72,0.36],[-0.11,2.80,0.37]],associated:['KI6 照海','LU7 列缺'],organ:'kidney'});
extra({code:'YANGQIAO',name:'阳跷脉',english:'Yang Heel Vessel',polarity:'yang',color:'#82b6e4',summary:'奇经八脉之一，无独立编号经穴；由外踝沿身体外侧上行至头面的教学示意。',path:[[-0.48,-3.03,-0.05],[-0.62,-2.22,-0.06],[-0.66,-1.30,-0.04],[-0.72,-0.40,0.02],[-0.70,0.72,0.06],[-0.58,1.62,0.08],[-0.34,2.36,0.06],[-0.12,2.80,0.34]],associated:['BL62 申脉','SI3 后溪'],organ:'bladder'});
extra({code:'YINWEI',name:'阴维脉',english:'Yin Linking Vessel',polarity:'yin',color:'#8b6aa2',summary:'奇经八脉之一，无独立编号经穴；联络诸阴经的教学示意。',path:[[-0.24,-2.66,0.08],[-0.28,-1.64,0.10],[-0.28,-0.64,0.18],[-0.36,0.30,0.34],[-0.30,1.18,0.38],[0,1.92,0.38]],associated:['PC6 内关','SP4 公孙'],organ:'pericardium'});
extra({code:'YANGWEI',name:'阳维脉',english:'Yang Linking Vessel',polarity:'yang',color:'#7fcf9a',summary:'奇经八脉之一，无独立编号经穴；联络诸阳经并上达头侧的教学示意。',path:[[-0.66,-2.50,0.02],[-0.72,-1.48,0.04],[-0.76,-0.44,0.06],[-0.72,0.70,0.02],[-0.58,1.62,-0.08],[-0.42,2.36,-0.10],[-0.18,2.92,0.02]],associated:['TE5 外关','GB41 足临泣'],organ:'triple'});

DATA.keyPointCount = DATA.channels.reduce((sum, item) => sum + item.points.length, 0);
DATA.channelCount = DATA.channels.length;
DATA.pointBearingChannelCount = DATA.channels.filter(item => item.hasOwnPoints).length;
