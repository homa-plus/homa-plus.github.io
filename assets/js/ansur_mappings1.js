const categoryMappings = {
    personal: {
        en: "Personal Parameters",
        ru: "Личные параметры"
    },
    main_parameters: {
        en: "Main Body Parameters",
        ru: "Основные параметры тела"
    },
    body_width: {
        en: "Body Widths",
        ru: "Ширина тела"
    },
    body_circumferences: {
        en: "Body Circumferences",
        ru: "Обхваты тела"
    },
    limbs: {
        en: "Arms and Legs",
        ru: "Руки и ноги"
    },
    head: {
        en: "Head",
        ru: "Голова"
    },
    hands: {
        en: "Hands",
        ru: "Кисти рук"
    },
    head_face_detailed: {
        en: "Detailed Head and Facial Measurements",
        ru: "Детальные параметры головы и лица"
    },
    others: {
        en: "Other Parameters",
        ru: "Прочие параметры"
    }
};

const specialFields = {
    heightin: {
        en: "Height (inches)",
        ru: "Рост (дюймы)",
        numeric: true,
        values: null
    },
    weightkg: {
        en: "Weight (kilograms, ×10)",
        ru: "Вес (килограммы, ×10)",
        numeric: true,
        values: null
    },
    weightlbs: {
        en: "Weight (pounds)",
        ru: "Вес (фунты)",
        numeric: true,
        values: null
    },
    age: {
        en: "Age (years)",
        ru: "Возраст (годы)",
        numeric: true,
        values: null
    },
    date: {
        en: "Measurement Date",
        ru: "Дата измерения",
        numeric: false,
        values: null
    },
    gender: {
        en: "Gender",
        ru: "Пол",
        numeric: false,
        values: ["Male", "Female"]
    },
    branch: {
        en: "Military Branch",
        ru: "Род войск",
        numeric: false,
        values: [
            "Combat Arms",
            "Combat Support",
            "Combat Service Support"
        ]
    },
    component: {
        en: "Military Component",
        ru: "Военный компонент",
        numeric: false,
        values: [
            "Regular Army",
            "Army Reserve",
            "Army National Guard"
        ]
    },
    ethnicity: {
        en: "Ethnicity",
        ru: "Этническая принадлежность",
        numeric: false,
        values: null
    },
    dodrace: {
        en: "DoD Race Code",
        ru: "Код расовой категории DoD",
        numeric: false,
        values: null
    },
    subjectnumericrace: {
        en: "Subject Race Code",
        ru: "Числовой код расовой категории",
        numeric: false,
        values: null
    },
    installation: {
        en: "Military Installation",
        ru: "Военная база",
        numeric: false,
        values: null
    },
    primarymos: {
        en: "Primary Military Occupational Specialty",
        ru: "Основная военно-учётная специальность",
        numeric: false,
        values: null
    },
    subjectsbirthlocation: {
        en: "Subject's Birth Location",
        ru: "Место рождения участника",
        numeric: false,
        values: null
    },
    writingpreference: {
        en: "Writing Hand Preference",
        ru: "Предпочитаемая пишущая рука",
        numeric: false,
        values: ["Right hand", "Left hand", "Both"]
    },
    subjectid: {
        en: "Subject ID",
        ru: "Идентификатор участника",
        numeric: false,
        values: null
    }
};

const categories = {
    personal: [
        "age",
        "branch",
        "component",
        "date",
        "dodrace",
        "ethnicity",
        "gender",
        "installation",
        "primarymos",
        "subjectid",
        "subjectnumericrace",
        "subjectsbirthlocation",
        "writingpreference"
    ],

    main_parameters: [
        "stature",
        "heightin",
        "sittingheight",
        "weightkg",
        "weightlbs",
        "crotchheight",
        "footlength"
    ],

    body_width: [
        "biacromialbreadth",
        "bicristalbreadth",
        "bideltoidbreadth",
        "chestbreadth",
        "hipbreadth",
        "hipbreadthsitting",
        "interscyei",
        "interscyeii",
        "waistbreadth"
    ],

    body_circumferences: [
        "anklecircumference",
        "balloffootcircumference",
        "bicepscircumferenceflexed",
        "buttockcircumference",
        "calfcircumference",
        "chestcircumference",
        "forearmcircumferenceflexed",
        "heelanklecircumference",
        "neckcircumference",
        "neckcircumferencebase",
        "shouldercircumference",
        "thighcircumference",
        "lowerthighcircumference",
        "verticaltrunkcircumferenceusa",
        "waistcircumference",
        "wristcircumference"
    ],

    limbs: [
        "acromionradialelength",
        "bimalleolarbreadth",
        "balloffootlength",
        "buttockkneelength",
        "buttockpopliteallength",
        "footbreadthhorizontal",
        "forearmcenterofgriplength",
        "forearmforearmbreadth",
        "forearmhandlength",
        "functionalleglength",
        "heelbreadth",
        "kneeheightmidpatella",
        "kneeheightsitting",
        "lateralfemoralepicondyleheight",
        "lateralmalleolusheight",
        "overheadfingertipreachsitting",
        "poplitealheight",
        "radialestylionlength",
        "shoulderelbowlength",
        "shoulderlength",
        "sleevelengthspinewrist",
        "sleeveoutseam",
        "span",
        "tibialheight",
        "trochanterionheight",
        "wristheight"
    ],

    head: [
        "headbreadth",
        "headcircumference",
        "headlength",
        "tragiontopofhead"
    ],

    hands: [
        "handbreadth",
        "handcircumference",
        "handlength",
        "palmlength",
        "thumbtipreach"
    ],

    head_face_detailed: [
        "bitragionchinarc",
        "bitragionsubmandibulararc",
        "bizygomaticbreadth",
        "earbreadth",
        "earlength",
        "earprotrusion",
        "interpupillarybreadth",
        "mentonsellionlength"
    ],

    others: [
        "abdominalextensiondepthsitting",
        "acromialheight",
        "axillaheight",
        "buttockdepth",
        "buttockheight",
        "cervicaleheight",
        "chestdepth",
        "chestheight",
        "crotchlengthomphalion",
        "crotchlengthposterioromphalion",
        "elbowrestheight",
        "eyeheightsitting",
        "iliocristaleheight",
        "suprasternaleheight",
        "tenthribheight",
        "thighclearance",
        "waistbacklength",
        "waistdepth",
        "waistfrontlengthsitting",
        "waistheightomphalion"
    ]
};


const mappingsMOS = {
  "00": {
    "Z": {en:"Nominative Sergeant Major",ru:"Главный сержант (назначаемый)",class:2}
  },

  "11": {
    "A": {en:"Infantry Officer",ru:"Офицер пехоты",class:4},
    "B": {en:"Infantryman",ru:"Пехотинец",class:5},
    "C": {en:"Indirect Fire Infantryman",ru:"Специалист пехоты по непрямому огню",class:5},
    "Z": {en:"Infantry Senior Sergeant",ru:"Старший сержант пехоты",class:3}
  },

  "12": {
    "A": {en:"Engineer Senior Sergeant",ru:"Старший сержант инженерных войск",class:2},
    "B": {en:"Combat Engineer",ru:"Боевой инженер",class:5},
    "C": {en:"Bridge Crewmember",ru:"Специалист мостовых подразделений",class:5},
    "H": {en:"Construction Engineering Supervisor",ru:"Руководитель строительных работ",class:3},
    "K": {en:"Plumber",ru:"Сантехник",class:3},
    "M": {en:"Firefighter",ru:"Пожарный",class:5},
    "N": {en:"Horizontal Construction Engineer",ru:"Инженер горизонтального строительства",class:3},
    "R": {en:"Interior Electrician",ru:"Электрик внутренних сетей",class:3},
    "W": {en:"Carpentry and Masonry Specialist",ru:"Специалист по плотницким и каменным работам",class:3},
    "Y": {en:"Geospatial Engineer",ru:"Геопространственный инженер",class:2},
    "Z": {en:"Combat Engineering Senior Sergeant",ru:"Старший сержант боевых инженеров",class:2}
  },

  "13": {
    "A": {en:"Field Artillery Officer",ru:"Офицер полевой артиллерии",class:3},
    "B": {en:"Cannon Crewmember",ru:"Расчёт артиллерийского орудия",class:5},
    "D": {en:"Field Artillery Automated Tactical Data Systems Specialist",ru:"Специалист автоматизированных систем управления артиллерией",class:2},
    "F": {en:"Joint Fire Support Specialist",ru:"Специалист огневой поддержки",class:5},
    "M": {en:"MLRS/HIMARS Crewmember",ru:"Оператор реактивной системы залпового огня",class:5},
    "P": {en:"MLRS Operational Fire Direction Specialist",ru:"Специалист управления огнём РСЗО",class:3},
    "R": {en:"Field Artillery Firefinder Radar Operator",ru:"Оператор артиллерийской радиолокационной станции",class:5},
    "T": {en:"Field Artillery Surveyor/Meteorological Crewmember",ru:"Артиллерийский топограф-метеоролог",class:3},
    "Z": {en:"Field Artillery Senior Sergeant",ru:"Старший сержант полевой артиллерии",class:2}
  },

  "14": {
    "E": {en:"Patriot Fire Control Operator/Maintainer",ru:"Оператор и техник системы управления огнём Patriot",class:3},
    "J": {en:"Air Defense C4I Tactical Operations Center Operator/Maintainer",ru:"Оператор центра управления ПВО",class:3},
    "S": {en:"Avenger Crewmember",ru:"Расчёт зенитного комплекса Avenger",class:4},
    "T": {en:"Patriot Launching Station Operator/Maintainer",ru:"Оператор пусковой установки Patriot",class:3},
    "Z": {en:"Air Defense Artillery Senior Sergeant",ru:"Старший сержант войск ПВО",class:2}
  },

  "15": {
    "E": {en:"Tactical Unmanned Aircraft System Repairer",ru:"Техник беспилотных летательных систем",class:3},
    "G": {en:"Aircraft Structural Repairer",ru:"Специалист по ремонту конструкций летательных аппаратов",class:3},
    "P": {en:"Aviation Operations Specialist",ru:"Специалист авиационных операций",class:2},
    "R": {en:"AH-64 Attack Helicopter Repairer",ru:"Техник вертолётов AH-64 Apache",class:3},
    "T": {en:"UH-60 Helicopter Repairer",ru:"Техник вертолётов UH-60 Black Hawk",class:3},
    "U": {en:"CH-47 Helicopter Repairer",ru:"Техник вертолётов CH-47 Chinook",class:3},
    "W": {en:"Unmanned Aircraft Systems Operator",ru:"Оператор беспилотных летательных аппаратов",class:2},
    "Z": {en:"Aircraft Senior Sergeant",ru:"Старший сержант авиационных подразделений",class:2}
  },

  "19": {
    "A": {en:"Armor Officer",ru:"Офицер бронетанковых войск",class:3},
    "C": {en:"Bradley Crewmember",ru:"Член экипажа БМП Bradley",class:5},
    "D": {en:"Cavalry Scout",ru:"Разведчик кавалерийских подразделений",class:5},
    "K": {en:"M1 Armor Crewman",ru:"Член экипажа танка M1 Abrams",class:5},
    "Z": {en:"Armor Senior Sergeant",ru:"Старший сержант бронетанковых войск",class:2}
  },

  "21": {
    "B": {en:"Combat Engineer",ru:"Боевой инженер",class:5},
    "C": {en:"Bridge Crewmember",ru:"Специалист мостовых подразделений",class:5},
    "E": {en:"Construction Equipment Operator",ru:"Оператор строительной техники",class:3},
    "H": {en:"Construction Engineering Supervisor",ru:"Руководитель строительных работ",class:3}
  },

  "25": {
    "A": {en:"Signal Officer",ru:"Офицер войск связи",class:2},
    "B": {en:"Information Technology Specialist",ru:"Специалист информационных технологий",class:1},
    "C": {en:"Radio Operator-Maintainer",ru:"Радиооператор-техник",class:3},
    "E": {en:"Electromagnetic Spectrum Manager",ru:"Специалист по управлению электромагнитным спектром",class:2},
    "F": {en:"Network Switching Systems Operator-Maintainer",ru:"Оператор и техник сетевых коммутационных систем",class:3},
    "L": {en:"Cable Systems Installer-Maintainer",ru:"Специалист по монтажу и обслуживанию кабельных систем",class:3},
    "N": {en:"Nodal Network Systems Operator-Maintainer",ru:"Оператор и техник узловых сетевых систем",class:3},
    "P": {en:"Microwave Systems Operator-Maintainer",ru:"Оператор и техник микроволновых систем связи",class:3},
    "Q": {en:"Multichannel Transmission Systems Operator-Maintainer",ru:"Оператор многоканальных систем передачи",class:3},
    "S": {en:"Satellite Communication Systems Operator-Maintainer",ru:"Оператор спутниковых систем связи",class:2},
    "U": {en:"Signal Operations Support Specialist",ru:"Специалист технической поддержки связи",class:3},
    "W": {en:"Telecommunications Operations Chief",ru:"Руководитель подразделения телекоммуникаций",class:2},
    "X": {en:"Chief Signal NCO",ru:"Главный сержант войск связи",class:2}
  },

  "27": {
    "D": {en:"Paralegal Specialist",ru:"Специалист юридической службы",class:1}
  },

  "31": {
    "A": {en:"Military Police Officer",ru:"Офицер военной полиции",class:3},
    "B": {en:"Military Police",ru:"Военный полицейский",class:4}
  },

  "35": {
    "D": {en:"All-Source Intelligence Officer",ru:"Офицер разведки (анализ всех источников)",class:2},
    "F": {en:"Intelligence Analyst",ru:"Аналитик военной разведки",class:1},
    "G": {en:"Geospatial Intelligence Imagery Analyst",ru:"Аналитик геопространственной разведки",class:1},
    "L": {en:"Counterintelligence Agent",ru:"Агент контрразведки",class:3},
    "M": {en:"Human Intelligence Collector",ru:"Специалист агентурной разведки",class:3},
    "N": {en:"Signals Intelligence Analyst",ru:"Аналитик радиоэлектронной разведки",class:1},
    "P": {en:"Cryptologic Linguist",ru:"Специалист-криптолог-лингвист",class:1},
    "T": {en:"Military Intelligence Systems Maintainer/Integrator",ru:"Специалист по обслуживанию разведывательных систем",class:3},
    "X": {en:"Intelligence Senior Sergeant",ru:"Старший сержант разведки",class:2},
    "Z": {en:"Intelligence Sergeant Major",ru:"Главный сержант разведки",class:2}
  },

  "36": {
    "B": {en:"Financial Management Technician",ru:"Специалист финансового обеспечения",class:1}
  },

  "38": {
    "B": {en:"Civil Affairs Specialist",ru:"Специалист по гражданским делам",class:4}
  },

  "42": {
    "A": {en:"Human Resources Specialist",ru:"Специалист кадровой службы",class:1}
  },

  "46": {
    "Z": {en:"Chief Public Affairs NCO",ru:"Главный сержант службы по связям с общественностью",class:2}
  },

  "51": {
    "C": {en:"Acquisition, Logistics and Technology Contracting NCO",ru:"Сержант по контрактам, закупкам и логистике",class:1}
  },

  "56": {
    "A": {en:"Chaplain",ru:"Военный капеллан",class:1},
    "M": {en:"Religious Affairs Specialist",ru:"Специалист по религиозному обеспечению",class:2}
  },

  "63": {
    "B": {en:"Wheeled Vehicle Mechanic",ru:"Механик колёсной техники",class:3}
  },

  "68": {
    "A": {en:"Biomedical Equipment Specialist",ru:"Специалист по биомедицинскому оборудованию",class:2},
    "E": {en:"Dental Specialist",ru:"Стоматологический специалист",class:2},
    "J": {en:"Medical Logistics Specialist",ru:"Специалист медицинского снабжения",class:2},
    "K": {en:"Medical Laboratory Specialist",ru:"Специалист медицинской лаборатории",class:2},
    "P": {en:"Radiology Specialist",ru:"Специалист радиологии",class:2},
    "W": {en:"Combat Medic Specialist",ru:"Боевой медицинский специалист",class:4}
  },

  "70": {
    "B": {en:"Health Services Administrator",ru:"Администратор медицинской службы",class:1}
  },

  "74": {
    "D": {en:"CBRN Specialist",ru:"Специалист радиационной, химической и биологической защиты",class:3}
  },

  "88": {
    "M": {en:"Motor Transport Operator",ru:"Водитель военного транспорта",class:5},
    "N": {en:"Transportation Management Coordinator",ru:"Координатор транспортных операций",class:3},
    "Z": {en:"Transportation Senior Sergeant",ru:"Старший сержант транспортных подразделений",class:2}
  },

  "89": {
    "A": {en:"Ammunition Stock Control and Accounting Specialist",ru:"Специалист учёта и контроля боеприпасов",class:2},
    "B": {en:"Ammunition Specialist",ru:"Специалист по боеприпасам",class:4}
  },

  "90": {
    "A": {en:"Logistician",ru:"Офицер логистики",class:2}
  },

  "91": {
    "A": {en:"M1 Abrams Tank System Maintainer",ru:"Техник танков M1 Abrams",class:3},
    "B": {en:"Wheeled Vehicle Mechanic",ru:"Механик колёсной техники",class:3},
    "C": {en:"Utilities Equipment Repairer",ru:"Техник инженерного оборудования",class:3},
    "D": {en:"Tactical Power Generation Specialist",ru:"Специалист по обслуживанию генераторов",class:3},
    "E": {en:"Allied Trades Specialist",ru:"Специалист по металлообработке и смежным профессиям",class:3},
    "F": {en:"Small Arms and Towed Artillery Repairer",ru:"Техник стрелкового оружия и буксируемой артиллерии",class:3},
    "H": {en:"Track Vehicle Repairer",ru:"Механик гусеничной техники",class:3},
    "J": {en:"Quartermaster and Chemical Equipment Repairer",ru:"Техник интендантского и химического оборудования",class:3},
    "L": {en:"Construction Equipment Repairer",ru:"Механик строительной техники",class:3},
    "M": {en:"Bradley Fighting Vehicle System Maintainer",ru:"Техник боевых машин Bradley",class:3},
    "P": {en:"Artillery Mechanic",ru:"Механик артиллерийских систем",class:3},
    "X": {en:"Maintenance Supervisor",ru:"Руководитель технического обслуживания",class:2},
    "Z": {en:"Mechanical Maintenance Supervisor",ru:"Руководитель механического обслуживания",class:2},
	"K": {en:"Armament Repairer",ru:"Специалист по ремонту вооружения",class:3}
  },

  "92": {
    "A": {en:"Automated Logistical Specialist",ru:"Специалист автоматизированного логистического учёта",class:3},
    "F": {en:"Petroleum Supply Specialist",ru:"Специалист по снабжению топливом",class:4},
    "G": {en:"Culinary Specialist",ru:"Военный повар",class:4},
    "R": {en:"Parachute Rigger",ru:"Специалист по укладке парашютов",class:4},
    "S": {en:"Shower and Laundry Specialist",ru:"Специалист банно-прачечного обслуживания",class:4},
    "W": {en:"Water Treatment Specialist",ru:"Специалист водоподготовки",class:4},
    "Y": {en:"Unit Supply Specialist",ru:"Специалист снабжения подразделения",class:2},
    "Z": {en:"Senior Noncommissioned Logistician",ru:"Старший сержант логистики",class:2}
  },

  "94": {
    "A": {en:"Land Combat Electronic Missile System Repairer",ru:"Техник электронных систем ракетного вооружения",class:3},
    "E": {en:"Radio Equipment Repairer",ru:"Техник радиооборудования",class:3},
    "F": {en:"Computer Detection Systems Repairer",ru:"Техник компьютерных систем обнаружения",class:2},
    "M": {en:"Radar Repairer",ru:"Техник радиолокационных систем",class:3}
  },

  "default": {
    "3":{
        en: "Military Occupational Specialty",
        ru: "Военно-учётная специальность",
        class: 3
    },
    "4":{
        en: "Warrant Officer Specialty",
        ru: "Специальность уорент-офицера",
        class: 2
    }
  }

};