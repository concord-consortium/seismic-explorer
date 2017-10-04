const data = [
  {
    idx: 2,
    lat: 54.00776876193478,
    lng: -157.06054687500003,
    info: 'PAC-NAM',
    velocity: 63,
    angle: 330,
    type: 'convergent'
  },
  {
    idx: 3,
    lat: 46.164614496897094,
    lng: -125.81542968750001,
    info: 'JdF-NAM',
    velocity: 35,
    angle: 52,
    type: 'convergent'
  },
  {
    idx: 4,
    lat: 37.21283151445594,
    lng: -121.99218750000001,
    info: 'PAC-NAM',
    velocity: 51,
    angle: 145,
    type: 'transform'
  },
  {
    idx: 5,
    lat: 15.199386048560008,
    lng: -97.3828125,
    info: 'COC-NAM',
    velocity: 71,
    angle: 33,
    type: 'convergent'
  },
  {
    idx: 6,
    lat: 6.096859818887948,
    lng: -102.39257812500001,
    info: 'PAC-COC',
    velocity: 112,
    angle: 259,
    type: 'divergent'
  },
  {
    idx: 7,
    lat: 2.3284603685731593,
    lng: -93.51562500000001,
    info: 'COC-NAZ',
    velocity: 58,
    angle: 29,
    type: 'divergent'
  },
  {
    idx: 8,
    lat: -16.914939206301646,
    lng: -113.15368652343751,
    info: 'PAC-NAZ',
    velocity: 141,
    angle: 284,
    type: 'divergent'
  },
  {
    idx: 9,
    lat: -47.03269459852137,
    lng: -112.86254882812501,
    info: 'PAC-ANT',
    velocity: 89,
    angle: 285,
    type: 'divergent'
  },
  {
    idx: 10,
    lat: -40.01078714046552,
    lng: -91.505126953125,
    info: 'ANT-NAZ',
    velocity: 51,
    angle: 266,
    type: 'divergent'
  },
  {
    idx: 11,
    lat: -17.046281225389077,
    lng: -172.364501953125,
    info: 'PAC-AUS',
    velocity: 82,
    angle: 271,
    type: 'convergent'
  },
  {
    idx: 12,
    lat: -33.26165676732799,
    lng: -112.44506835937501,
    info: 'PAC-AUS',
    velocity: 85,
    angle: 306,
    type: 'divergent'
  },
  {
    idx: 13,
    lat: -19.746024239625427,
    lng: -71.52099609375001,
    info: 'NAZ-SAM',
    velocity: 73,
    angle: 75,
    type: 'convergent'
  },
  {
    idx: 14,
    lat: -50.17689812200105,
    lng: -76.88232421875001,
    info: 'ANT-SAM',
    velocity: 19,
    angle: 87,
    type: 'convergent'
  },
  {
    idx: 15,
    lat: 48.09275716032736,
    lng: -27.641601562500004,
    info: 'NAM-EUR',
    velocity: 22,
    angle: 276,
    type: 'divergent'
  },
  {
    idx: 16,
    lat: 27.70784710660343,
    lng: -44.01123046875001,
    info: 'NAM-AFR (Nubia)',
    velocity: 23,
    angle: 282,
    type: 'divergent'
  },
  {
    idx: 17,
    lat: 10.347343930125362,
    lng: -61.04003906250001,
    info: 'SAM-CAR',
    velocity: 20,
    angle: 255,
    type: 'transform'
  },
  {
    idx: 18,
    lat: -26.23430203240673,
    lng: -13.952636718750002,
    info: 'SAM-AFR (Nubia)',
    velocity: 33,
    angle: 257,
    type: 'divergent'
  },
  {
    idx: 19,
    lat: -57.189855357148154,
    lng: -24.213867187500004,
    info: 'SAM-Sandw',
    velocity: 71,
    angle: 254,
    type: 'convergent'
  },
  {
    idx: 20,
    lat: 34.279914398549934,
    lng: 25.037841796875004,
    info: 'AFR (Nubia)-EUR',
    velocity: 10,
    angle: 355,
    type: 'convergent'
  },
  {
    idx: 21,
    lat: 32.27784451498272,
    lng: 48.10913085937501,
    info: 'ARA-EUR',
    velocity: 27,
    angle: 9,
    type: 'convergent'
  },
  {
    idx: 22,
    lat: -52.948637884883205,
    lng: 21.225585937500004,
    info: 'AFR (Nubia)-ANT',
    velocity: 16,
    angle: 24,
    type: 'divergent'
  },
  {
    idx: 23,
    lat: 8.320212289522944,
    lng: 58.69995117187501,
    info: 'AFR (Somalia)-IND',
    velocity: 23,
    angle: 214,
    type: 'divergent'
  },
  {
    idx: 24,
    lat: 28.357567857801694,
    lng: 81.49658203125,
    info: 'IND-EUR',
    velocity: 43,
    angle: 21,
    type: 'convergent'
  },
  {
    idx: 25,
    lat: -19.31114335506464,
    lng: 65.87402343750001,
    info: 'AFR (Somalia)-IND',
    velocity: 37,
    angle: 231,
    type: 'divergent'
  },
  {
    idx: 26,
    lat: -36.16448788632063,
    lng: 52.99804687500001,
    info: 'AFR (Somalia)-ANT',
    velocity: 15,
    angle: 357,
    type: 'divergent'
  },
  {
    idx: 27,
    lat: -43.5326204268101,
    lng: 92.43896484375,
    info: 'ANT-AUS',
    velocity: 67,
    angle: 217,
    type: 'divergent'
  },
  {
    idx: 28,
    lat: -8.42890409287538,
    lng: 104.78759765625001,
    info: 'AUS-Sunda',
    velocity: 64,
    angle: 15,
    type: 'convergent'
  },
  {
    idx: 29,
    lat: 23.089838367476705,
    lng: 120.41015625000001,
    info: 'PHL-EUR',
    velocity: 79,
    angle: 304,
    type: 'convergent'
  },
  {
    idx: 30,
    lat: 55.56592203025787,
    lng: 132.27539062500003,
    info: 'Amur-EUR',
    velocity: 2.5,
    angle: 102,
    type: 'transform'
  },
  // Missing angle and velocity data:
  // {idx: 31, lat: -7, lng: 138, info: 'AUS-PNG (?)'}
  {
    idx: 32,
    lat: -21.94304553343818,
    lng: 169.40917968750003,
    info: 'AUS-PAC',
    velocity: 74,
    angle: 75,
    type: 'convergent'
  },
  {
    idx: 33,
    lat: 16.161920953785344,
    lng: 147.78808593750003,
    info: 'PAC-PHL',
    velocity: 26,
    angle: 312,
    type: 'convergent'
  },
  {
    idx: 34,
    lat: 39.90973623453719,
    lng: 144.30541992187503,
    info: 'PAC-NAM',
    velocity: 83,
    angle: 293,
    type: 'convergent'
  },
  {
    idx: 35,
    lat: 53.173119202640635,
    lng: 162.68554687500003,
    info: 'PAC-NAM',
    velocity: 77,
    angle: 308,
    type: 'convergent'
  }
]

export default data