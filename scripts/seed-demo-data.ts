/**
 * Seed the database with realistic demo data for all of Greater London.
 * Covers every London outcode so any London postcode returns data.
 *
 * Run: npx tsx scripts/seed-demo-data.ts
 */
import { getScriptDb, initSchema } from "./utils/db";

// ──────────────────────────────────────────────────────────────────────
// All London outcodes with approximate centre lat/lng and borough
// ──────────────────────────────────────────────────────────────────────
interface OutcodeEntry {
  outcode: string;
  lat: number;
  lng: number;
  district: string;
}

const LONDON_OUTCODES: OutcodeEntry[] = [
  // E - East London
  { outcode: "E1", lat: 51.5152, lng: -0.0722, district: "TOWER HAMLETS" },
  { outcode: "E1W", lat: 51.5100, lng: -0.0650, district: "TOWER HAMLETS" },
  { outcode: "E2", lat: 51.5294, lng: -0.0583, district: "TOWER HAMLETS" },
  { outcode: "E3", lat: 51.5282, lng: -0.0326, district: "TOWER HAMLETS" },
  { outcode: "E4", lat: 51.6275, lng: -0.0107, district: "WALTHAM FOREST" },
  { outcode: "E5", lat: 51.5563, lng: -0.0518, district: "HACKNEY" },
  { outcode: "E6", lat: 51.5219, lng: 0.0512, district: "NEWHAM" },
  { outcode: "E7", lat: 51.5462, lng: 0.0280, district: "NEWHAM" },
  { outcode: "E8", lat: 51.5432, lng: -0.0557, district: "HACKNEY" },
  { outcode: "E9", lat: 51.5459, lng: -0.0393, district: "HACKNEY" },
  { outcode: "E10", lat: 51.5619, lng: -0.0136, district: "WALTHAM FOREST" },
  { outcode: "E11", lat: 51.5688, lng: 0.0046, district: "WALTHAM FOREST" },
  { outcode: "E12", lat: 51.5519, lng: 0.0485, district: "NEWHAM" },
  { outcode: "E13", lat: 51.5262, lng: 0.0320, district: "NEWHAM" },
  { outcode: "E14", lat: 51.5054, lng: -0.0235, district: "TOWER HAMLETS" },
  { outcode: "E15", lat: 51.5413, lng: 0.0013, district: "NEWHAM" },
  { outcode: "E16", lat: 51.5096, lng: 0.0308, district: "NEWHAM" },
  { outcode: "E17", lat: 51.5841, lng: -0.0195, district: "WALTHAM FOREST" },
  { outcode: "E18", lat: 51.5899, lng: 0.0248, district: "REDBRIDGE" },
  { outcode: "E20", lat: 51.5471, lng: -0.0098, district: "NEWHAM" },

  // EC - East Central
  { outcode: "EC1A", lat: 51.5204, lng: -0.1006, district: "ISLINGTON" },
  { outcode: "EC1M", lat: 51.5216, lng: -0.1031, district: "ISLINGTON" },
  { outcode: "EC1N", lat: 51.5186, lng: -0.1088, district: "CAMDEN" },
  { outcode: "EC1R", lat: 51.5242, lng: -0.1074, district: "ISLINGTON" },
  { outcode: "EC1V", lat: 51.5271, lng: -0.0982, district: "ISLINGTON" },
  { outcode: "EC1Y", lat: 51.5245, lng: -0.0908, district: "ISLINGTON" },
  { outcode: "EC2A", lat: 51.5225, lng: -0.0849, district: "HACKNEY" },
  { outcode: "EC2M", lat: 51.5156, lng: -0.0860, district: "CITY OF LONDON" },
  { outcode: "EC2N", lat: 51.5139, lng: -0.0884, district: "CITY OF LONDON" },
  { outcode: "EC2R", lat: 51.5136, lng: -0.0908, district: "CITY OF LONDON" },
  { outcode: "EC2V", lat: 51.5134, lng: -0.0941, district: "CITY OF LONDON" },
  { outcode: "EC2Y", lat: 51.5199, lng: -0.0896, district: "CITY OF LONDON" },
  { outcode: "EC3A", lat: 51.5127, lng: -0.0818, district: "CITY OF LONDON" },
  { outcode: "EC3M", lat: 51.5106, lng: -0.0832, district: "CITY OF LONDON" },
  { outcode: "EC3N", lat: 51.5106, lng: -0.0777, district: "CITY OF LONDON" },
  { outcode: "EC3R", lat: 51.5096, lng: -0.0856, district: "CITY OF LONDON" },
  { outcode: "EC3V", lat: 51.5121, lng: -0.0892, district: "CITY OF LONDON" },
  { outcode: "EC4A", lat: 51.5151, lng: -0.1064, district: "CITY OF LONDON" },
  { outcode: "EC4M", lat: 51.5131, lng: -0.0989, district: "CITY OF LONDON" },
  { outcode: "EC4N", lat: 51.5116, lng: -0.0939, district: "CITY OF LONDON" },
  { outcode: "EC4R", lat: 51.5107, lng: -0.0920, district: "CITY OF LONDON" },
  { outcode: "EC4V", lat: 51.5126, lng: -0.1015, district: "CITY OF LONDON" },
  { outcode: "EC4Y", lat: 51.5147, lng: -0.1082, district: "CITY OF LONDON" },

  // N - North London
  { outcode: "N1", lat: 51.5369, lng: -0.1035, district: "ISLINGTON" },
  { outcode: "N1C", lat: 51.5352, lng: -0.1254, district: "CAMDEN" },
  { outcode: "N2", lat: 51.5875, lng: -0.1690, district: "BARNET" },
  { outcode: "N3", lat: 51.5948, lng: -0.1835, district: "BARNET" },
  { outcode: "N4", lat: 51.5672, lng: -0.0983, district: "HARINGEY" },
  { outcode: "N5", lat: 51.5530, lng: -0.0978, district: "ISLINGTON" },
  { outcode: "N6", lat: 51.5723, lng: -0.1449, district: "HARINGEY" },
  { outcode: "N7", lat: 51.5526, lng: -0.1085, district: "ISLINGTON" },
  { outcode: "N8", lat: 51.5839, lng: -0.1164, district: "HARINGEY" },
  { outcode: "N9", lat: 51.6254, lng: -0.0672, district: "ENFIELD" },
  { outcode: "N10", lat: 51.5910, lng: -0.1376, district: "HARINGEY" },
  { outcode: "N11", lat: 51.6102, lng: -0.1413, district: "BARNET" },
  { outcode: "N12", lat: 51.6130, lng: -0.1729, district: "BARNET" },
  { outcode: "N13", lat: 51.6224, lng: -0.1019, district: "ENFIELD" },
  { outcode: "N14", lat: 51.6396, lng: -0.1286, district: "ENFIELD" },
  { outcode: "N15", lat: 51.5834, lng: -0.0798, district: "HARINGEY" },
  { outcode: "N16", lat: 51.5632, lng: -0.0744, district: "HACKNEY" },
  { outcode: "N17", lat: 51.5975, lng: -0.0734, district: "HARINGEY" },
  { outcode: "N18", lat: 51.6210, lng: -0.0748, district: "ENFIELD" },
  { outcode: "N19", lat: 51.5625, lng: -0.1295, district: "ISLINGTON" },
  { outcode: "N20", lat: 51.6290, lng: -0.1766, district: "BARNET" },
  { outcode: "N21", lat: 51.6425, lng: -0.1010, district: "ENFIELD" },
  { outcode: "N22", lat: 51.5990, lng: -0.1048, district: "HARINGEY" },

  // NW - North West London
  { outcode: "NW1", lat: 51.5340, lng: -0.1448, district: "CAMDEN" },
  { outcode: "NW2", lat: 51.5609, lng: -0.2079, district: "BRENT" },
  { outcode: "NW3", lat: 51.5552, lng: -0.1740, district: "CAMDEN" },
  { outcode: "NW4", lat: 51.5905, lng: -0.2270, district: "BARNET" },
  { outcode: "NW5", lat: 51.5516, lng: -0.1399, district: "CAMDEN" },
  { outcode: "NW6", lat: 51.5454, lng: -0.1905, district: "CAMDEN" },
  { outcode: "NW7", lat: 51.6164, lng: -0.2308, district: "BARNET" },
  { outcode: "NW8", lat: 51.5327, lng: -0.1731, district: "WESTMINSTER" },
  { outcode: "NW9", lat: 51.5856, lng: -0.2533, district: "BRENT" },
  { outcode: "NW10", lat: 51.5414, lng: -0.2364, district: "BRENT" },
  { outcode: "NW11", lat: 51.5770, lng: -0.1943, district: "BARNET" },

  // SE - South East London
  { outcode: "SE1", lat: 51.5046, lng: -0.0889, district: "SOUTHWARK" },
  { outcode: "SE2", lat: 51.4820, lng: 0.0895, district: "GREENWICH" },
  { outcode: "SE3", lat: 51.4700, lng: 0.0180, district: "GREENWICH" },
  { outcode: "SE4", lat: 51.4597, lng: -0.0390, district: "LEWISHAM" },
  { outcode: "SE5", lat: 51.4746, lng: -0.0896, district: "SOUTHWARK" },
  { outcode: "SE6", lat: 51.4395, lng: -0.0152, district: "LEWISHAM" },
  { outcode: "SE7", lat: 51.4846, lng: 0.0481, district: "GREENWICH" },
  { outcode: "SE8", lat: 51.4747, lng: -0.0316, district: "LEWISHAM" },
  { outcode: "SE9", lat: 51.4500, lng: 0.0700, district: "GREENWICH" },
  { outcode: "SE10", lat: 51.4826, lng: -0.0077, district: "GREENWICH" },
  { outcode: "SE11", lat: 51.4909, lng: -0.1053, district: "LAMBETH" },
  { outcode: "SE12", lat: 51.4433, lng: 0.0350, district: "LEWISHAM" },
  { outcode: "SE13", lat: 51.4556, lng: -0.0139, district: "LEWISHAM" },
  { outcode: "SE14", lat: 51.4700, lng: -0.0480, district: "LEWISHAM" },
  { outcode: "SE15", lat: 51.4687, lng: -0.0609, district: "SOUTHWARK" },
  { outcode: "SE16", lat: 51.4935, lng: -0.0469, district: "SOUTHWARK" },
  { outcode: "SE17", lat: 51.4888, lng: -0.0908, district: "SOUTHWARK" },
  { outcode: "SE18", lat: 51.4772, lng: 0.0688, district: "GREENWICH" },
  { outcode: "SE19", lat: 51.4162, lng: -0.0799, district: "CROYDON" },
  { outcode: "SE20", lat: 51.4115, lng: -0.0549, district: "BROMLEY" },
  { outcode: "SE21", lat: 51.4363, lng: -0.0837, district: "SOUTHWARK" },
  { outcode: "SE22", lat: 51.4556, lng: -0.0695, district: "SOUTHWARK" },
  { outcode: "SE23", lat: 51.4327, lng: -0.0491, district: "LEWISHAM" },
  { outcode: "SE24", lat: 51.4500, lng: -0.1000, district: "LAMBETH" },
  { outcode: "SE25", lat: 51.3979, lng: -0.0615, district: "CROYDON" },
  { outcode: "SE26", lat: 51.4256, lng: -0.0458, district: "LEWISHAM" },
  { outcode: "SE27", lat: 51.4320, lng: -0.1090, district: "LAMBETH" },
  { outcode: "SE28", lat: 51.4917, lng: 0.0993, district: "GREENWICH" },

  // SW - South West London
  { outcode: "SW1A", lat: 51.5014, lng: -0.1419, district: "WESTMINSTER" },
  { outcode: "SW1E", lat: 51.4979, lng: -0.1392, district: "WESTMINSTER" },
  { outcode: "SW1H", lat: 51.4984, lng: -0.1339, district: "WESTMINSTER" },
  { outcode: "SW1P", lat: 51.4943, lng: -0.1309, district: "WESTMINSTER" },
  { outcode: "SW1V", lat: 51.4899, lng: -0.1404, district: "WESTMINSTER" },
  { outcode: "SW1W", lat: 51.4938, lng: -0.1511, district: "WESTMINSTER" },
  { outcode: "SW1X", lat: 51.4968, lng: -0.1542, district: "WESTMINSTER" },
  { outcode: "SW1Y", lat: 51.5051, lng: -0.1357, district: "WESTMINSTER" },
  { outcode: "SW2", lat: 51.4494, lng: -0.1224, district: "LAMBETH" },
  { outcode: "SW3", lat: 51.4915, lng: -0.1596, district: "KENSINGTON AND CHELSEA" },
  { outcode: "SW4", lat: 51.4620, lng: -0.1369, district: "LAMBETH" },
  { outcode: "SW5", lat: 51.4913, lng: -0.1897, district: "KENSINGTON AND CHELSEA" },
  { outcode: "SW6", lat: 51.4753, lng: -0.1930, district: "HAMMERSMITH AND FULHAM" },
  { outcode: "SW7", lat: 51.4966, lng: -0.1764, district: "KENSINGTON AND CHELSEA" },
  { outcode: "SW8", lat: 51.4771, lng: -0.1236, district: "LAMBETH" },
  { outcode: "SW9", lat: 51.4673, lng: -0.1136, district: "LAMBETH" },
  { outcode: "SW10", lat: 51.4841, lng: -0.1855, district: "KENSINGTON AND CHELSEA" },
  { outcode: "SW11", lat: 51.4622, lng: -0.1668, district: "WANDSWORTH" },
  { outcode: "SW12", lat: 51.4452, lng: -0.1470, district: "WANDSWORTH" },
  { outcode: "SW13", lat: 51.4710, lng: -0.2380, district: "RICHMOND UPON THAMES" },
  { outcode: "SW14", lat: 51.4622, lng: -0.2652, district: "RICHMOND UPON THAMES" },
  { outcode: "SW15", lat: 51.4554, lng: -0.2215, district: "WANDSWORTH" },
  { outcode: "SW16", lat: 51.4259, lng: -0.1290, district: "LAMBETH" },
  { outcode: "SW17", lat: 51.4310, lng: -0.1618, district: "WANDSWORTH" },
  { outcode: "SW18", lat: 51.4510, lng: -0.1862, district: "WANDSWORTH" },
  { outcode: "SW19", lat: 51.4194, lng: -0.1872, district: "MERTON" },
  { outcode: "SW20", lat: 51.4116, lng: -0.2167, district: "MERTON" },

  // W - West London
  { outcode: "W1B", lat: 51.5155, lng: -0.1398, district: "WESTMINSTER" },
  { outcode: "W1C", lat: 51.5141, lng: -0.1503, district: "WESTMINSTER" },
  { outcode: "W1D", lat: 51.5136, lng: -0.1319, district: "WESTMINSTER" },
  { outcode: "W1F", lat: 51.5138, lng: -0.1358, district: "WESTMINSTER" },
  { outcode: "W1G", lat: 51.5181, lng: -0.1462, district: "WESTMINSTER" },
  { outcode: "W1H", lat: 51.5167, lng: -0.1566, district: "WESTMINSTER" },
  { outcode: "W1J", lat: 51.5084, lng: -0.1446, district: "WESTMINSTER" },
  { outcode: "W1K", lat: 51.5119, lng: -0.1506, district: "WESTMINSTER" },
  { outcode: "W1S", lat: 51.5111, lng: -0.1438, district: "WESTMINSTER" },
  { outcode: "W1T", lat: 51.5210, lng: -0.1356, district: "CAMDEN" },
  { outcode: "W1U", lat: 51.5184, lng: -0.1515, district: "WESTMINSTER" },
  { outcode: "W1W", lat: 51.5201, lng: -0.1430, district: "WESTMINSTER" },
  { outcode: "W2", lat: 51.5155, lng: -0.1780, district: "WESTMINSTER" },
  { outcode: "W3", lat: 51.5077, lng: -0.2677, district: "EALING" },
  { outcode: "W4", lat: 51.4889, lng: -0.2625, district: "HOUNSLOW" },
  { outcode: "W5", lat: 51.5095, lng: -0.3056, district: "EALING" },
  { outcode: "W6", lat: 51.4928, lng: -0.2250, district: "HAMMERSMITH AND FULHAM" },
  { outcode: "W7", lat: 51.5118, lng: -0.3231, district: "EALING" },
  { outcode: "W8", lat: 51.5005, lng: -0.1916, district: "KENSINGTON AND CHELSEA" },
  { outcode: "W9", lat: 51.5285, lng: -0.1883, district: "WESTMINSTER" },
  { outcode: "W10", lat: 51.5245, lng: -0.2111, district: "KENSINGTON AND CHELSEA" },
  { outcode: "W11", lat: 51.5155, lng: -0.2043, district: "KENSINGTON AND CHELSEA" },
  { outcode: "W12", lat: 51.5086, lng: -0.2388, district: "HAMMERSMITH AND FULHAM" },
  { outcode: "W13", lat: 51.5132, lng: -0.3188, district: "EALING" },
  { outcode: "W14", lat: 51.4950, lng: -0.2105, district: "HAMMERSMITH AND FULHAM" },

  // WC - West Central
  { outcode: "WC1A", lat: 51.5172, lng: -0.1208, district: "CAMDEN" },
  { outcode: "WC1B", lat: 51.5215, lng: -0.1240, district: "CAMDEN" },
  { outcode: "WC1E", lat: 51.5232, lng: -0.1306, district: "CAMDEN" },
  { outcode: "WC1H", lat: 51.5268, lng: -0.1266, district: "CAMDEN" },
  { outcode: "WC1N", lat: 51.5224, lng: -0.1194, district: "CAMDEN" },
  { outcode: "WC1R", lat: 51.5192, lng: -0.1148, district: "CAMDEN" },
  { outcode: "WC1V", lat: 51.5170, lng: -0.1156, district: "CAMDEN" },
  { outcode: "WC1X", lat: 51.5268, lng: -0.1137, district: "ISLINGTON" },
  { outcode: "WC2A", lat: 51.5150, lng: -0.1153, district: "CAMDEN" },
  { outcode: "WC2B", lat: 51.5157, lng: -0.1229, district: "CAMDEN" },
  { outcode: "WC2E", lat: 51.5118, lng: -0.1229, district: "WESTMINSTER" },
  { outcode: "WC2H", lat: 51.5127, lng: -0.1266, district: "WESTMINSTER" },
  { outcode: "WC2N", lat: 51.5094, lng: -0.1259, district: "WESTMINSTER" },
  { outcode: "WC2R", lat: 51.5108, lng: -0.1176, district: "WESTMINSTER" },

  // Outer London — remaining boroughs
  // Barking and Dagenham
  { outcode: "IG11", lat: 51.5339, lng: 0.0876, district: "BARKING AND DAGENHAM" },
  { outcode: "RM6", lat: 51.5544, lng: 0.1204, district: "BARKING AND DAGENHAM" },
  { outcode: "RM7", lat: 51.5652, lng: 0.1611, district: "BARKING AND DAGENHAM" },
  { outcode: "RM8", lat: 51.5488, lng: 0.1220, district: "BARKING AND DAGENHAM" },
  { outcode: "RM9", lat: 51.5410, lng: 0.1120, district: "BARKING AND DAGENHAM" },
  { outcode: "RM10", lat: 51.5540, lng: 0.1500, district: "BARKING AND DAGENHAM" },

  // Bexley
  { outcode: "DA5", lat: 51.4319, lng: 0.1569, district: "BEXLEY" },
  { outcode: "DA6", lat: 51.4460, lng: 0.1443, district: "BEXLEY" },
  { outcode: "DA7", lat: 51.4584, lng: 0.1376, district: "BEXLEY" },
  { outcode: "DA14", lat: 51.4202, lng: 0.1066, district: "BEXLEY" },
  { outcode: "DA15", lat: 51.4411, lng: 0.1117, district: "BEXLEY" },
  { outcode: "DA16", lat: 51.4576, lng: 0.1148, district: "BEXLEY" },
  { outcode: "DA17", lat: 51.4795, lng: 0.1117, district: "BEXLEY" },
  { outcode: "DA18", lat: 51.4920, lng: 0.1202, district: "BEXLEY" },
  { outcode: "SE2X", lat: 51.4820, lng: 0.0895, district: "BEXLEY" }, // alias

  // Bromley
  { outcode: "BR1", lat: 51.4037, lng: 0.0198, district: "BROMLEY" },
  { outcode: "BR2", lat: 51.3845, lng: 0.0274, district: "BROMLEY" },
  { outcode: "BR3", lat: 51.4054, lng: -0.0217, district: "BROMLEY" },
  { outcode: "BR4", lat: 51.3837, lng: -0.0379, district: "BROMLEY" },
  { outcode: "BR5", lat: 51.3843, lng: 0.0736, district: "BROMLEY" },
  { outcode: "BR6", lat: 51.3605, lng: 0.0604, district: "BROMLEY" },
  { outcode: "BR7", lat: 51.4150, lng: 0.0500, district: "BROMLEY" },

  // Croydon
  { outcode: "CR0", lat: 51.3762, lng: -0.0982, district: "CROYDON" },
  { outcode: "CR2", lat: 51.3502, lng: -0.0826, district: "CROYDON" },
  { outcode: "CR7", lat: 51.3975, lng: -0.0878, district: "CROYDON" },
  { outcode: "CR9", lat: 51.3725, lng: -0.0995, district: "CROYDON" },

  // Ealing (additional)
  { outcode: "UB1", lat: 51.5081, lng: -0.3441, district: "EALING" },
  { outcode: "UB2", lat: 51.5048, lng: -0.3786, district: "EALING" },
  { outcode: "UB5", lat: 51.5415, lng: -0.3647, district: "EALING" },
  { outcode: "UB6", lat: 51.5400, lng: -0.3354, district: "EALING" },

  // Enfield (additional)
  { outcode: "EN1", lat: 51.6520, lng: -0.0805, district: "ENFIELD" },
  { outcode: "EN2", lat: 51.6625, lng: -0.0930, district: "ENFIELD" },
  { outcode: "EN3", lat: 51.6630, lng: -0.0460, district: "ENFIELD" },
  { outcode: "EN4", lat: 51.6520, lng: -0.1645, district: "BARNET" },
  { outcode: "EN5", lat: 51.6512, lng: -0.1901, district: "BARNET" },

  // Harrow
  { outcode: "HA0", lat: 51.5567, lng: -0.2989, district: "BRENT" },
  { outcode: "HA1", lat: 51.5802, lng: -0.3364, district: "HARROW" },
  { outcode: "HA2", lat: 51.5766, lng: -0.3577, district: "HARROW" },
  { outcode: "HA3", lat: 51.5925, lng: -0.3121, district: "HARROW" },
  { outcode: "HA4", lat: 51.5719, lng: -0.3998, district: "HILLINGDON" },
  { outcode: "HA5", lat: 51.5962, lng: -0.3789, district: "HARROW" },
  { outcode: "HA7", lat: 51.6098, lng: -0.3188, district: "HARROW" },
  { outcode: "HA8", lat: 51.6049, lng: -0.2744, district: "BARNET" },
  { outcode: "HA9", lat: 51.5608, lng: -0.2829, district: "BRENT" },

  // Havering
  { outcode: "RM1", lat: 51.5762, lng: 0.1846, district: "HAVERING" },
  { outcode: "RM2", lat: 51.5761, lng: 0.2191, district: "HAVERING" },
  { outcode: "RM3", lat: 51.5830, lng: 0.2194, district: "HAVERING" },
  { outcode: "RM5", lat: 51.5775, lng: 0.1742, district: "HAVERING" },
  { outcode: "RM11", lat: 51.5676, lng: 0.2012, district: "HAVERING" },
  { outcode: "RM12", lat: 51.5546, lng: 0.2127, district: "HAVERING" },
  { outcode: "RM13", lat: 51.5417, lng: 0.2090, district: "HAVERING" },
  { outcode: "RM14", lat: 51.5613, lng: 0.2473, district: "HAVERING" },

  // Hillingdon
  { outcode: "UB3", lat: 51.4923, lng: -0.4341, district: "HILLINGDON" },
  { outcode: "UB4", lat: 51.5211, lng: -0.3989, district: "HILLINGDON" },
  { outcode: "UB7", lat: 51.4876, lng: -0.4727, district: "HILLINGDON" },
  { outcode: "UB8", lat: 51.5339, lng: -0.4771, district: "HILLINGDON" },
  { outcode: "UB9", lat: 51.5668, lng: -0.4747, district: "HILLINGDON" },
  { outcode: "UB10", lat: 51.5558, lng: -0.4508, district: "HILLINGDON" },

  // Hounslow
  { outcode: "TW3", lat: 51.4666, lng: -0.3604, district: "HOUNSLOW" },
  { outcode: "TW4", lat: 51.4672, lng: -0.3827, district: "HOUNSLOW" },
  { outcode: "TW5", lat: 51.4815, lng: -0.3780, district: "HOUNSLOW" },
  { outcode: "TW7", lat: 51.4717, lng: -0.3296, district: "HOUNSLOW" },
  { outcode: "TW8", lat: 51.4824, lng: -0.3068, district: "HOUNSLOW" },
  { outcode: "TW13", lat: 51.4392, lng: -0.3751, district: "HOUNSLOW" },
  { outcode: "TW14", lat: 51.4501, lng: -0.3913, district: "HOUNSLOW" },

  // Kingston upon Thames
  { outcode: "KT1", lat: 51.4103, lng: -0.3000, district: "KINGSTON UPON THAMES" },
  { outcode: "KT2", lat: 51.4182, lng: -0.2854, district: "KINGSTON UPON THAMES" },
  { outcode: "KT3", lat: 51.4026, lng: -0.2588, district: "KINGSTON UPON THAMES" },
  { outcode: "KT5", lat: 51.3907, lng: -0.2826, district: "KINGSTON UPON THAMES" },
  { outcode: "KT6", lat: 51.3849, lng: -0.2980, district: "KINGSTON UPON THAMES" },
  { outcode: "KT9", lat: 51.3683, lng: -0.2963, district: "KINGSTON UPON THAMES" },

  // Redbridge (additional)
  { outcode: "IG1", lat: 51.5577, lng: 0.0667, district: "REDBRIDGE" },
  { outcode: "IG2", lat: 51.5706, lng: 0.0599, district: "REDBRIDGE" },
  { outcode: "IG3", lat: 51.5656, lng: 0.0932, district: "REDBRIDGE" },
  { outcode: "IG4", lat: 51.5784, lng: 0.0487, district: "REDBRIDGE" },
  { outcode: "IG5", lat: 51.5853, lng: 0.0419, district: "REDBRIDGE" },
  { outcode: "IG6", lat: 51.5868, lng: 0.0724, district: "REDBRIDGE" },
  { outcode: "IG7", lat: 51.6041, lng: 0.0668, district: "REDBRIDGE" },
  { outcode: "IG8", lat: 51.6007, lng: 0.0300, district: "REDBRIDGE" },

  // Richmond upon Thames (additional)
  { outcode: "TW1", lat: 51.4497, lng: -0.3268, district: "RICHMOND UPON THAMES" },
  { outcode: "TW2", lat: 51.4410, lng: -0.3500, district: "RICHMOND UPON THAMES" },
  { outcode: "TW9", lat: 51.4632, lng: -0.2926, district: "RICHMOND UPON THAMES" },
  { outcode: "TW10", lat: 51.4450, lng: -0.2994, district: "RICHMOND UPON THAMES" },
  { outcode: "TW11", lat: 51.4266, lng: -0.3413, district: "RICHMOND UPON THAMES" },
  { outcode: "TW12", lat: 51.4137, lng: -0.3571, district: "RICHMOND UPON THAMES" },

  // Sutton
  { outcode: "SM1", lat: 51.3638, lng: -0.1953, district: "SUTTON" },
  { outcode: "SM2", lat: 51.3510, lng: -0.1894, district: "SUTTON" },
  { outcode: "SM3", lat: 51.3645, lng: -0.2130, district: "SUTTON" },
  { outcode: "SM4", lat: 51.3912, lng: -0.1953, district: "MERTON" },
  { outcode: "SM5", lat: 51.3628, lng: -0.1614, district: "SUTTON" },
  { outcode: "SM6", lat: 51.3602, lng: -0.1485, district: "SUTTON" },
  { outcode: "SM7", lat: 51.3401, lng: -0.2132, district: "SUTTON" },
];

// ──────────────────────────────────────────────────────────────────────
// Price base ranges by borough
// ──────────────────────────────────────────────────────────────────────
const DISTRICT_PRICE_BASE: Record<string, { flat: number; house: number }> = {
  "TOWER HAMLETS": { flat: 420000, house: 680000 },
  "WESTMINSTER": { flat: 850000, house: 2200000 },
  "CITY OF LONDON": { flat: 750000, house: 1800000 },
  "HACKNEY": { flat: 450000, house: 750000 },
  "ISLINGTON": { flat: 520000, house: 1100000 },
  "SOUTHWARK": { flat: 440000, house: 720000 },
  "KENSINGTON AND CHELSEA": { flat: 1100000, house: 3500000 },
  "CAMDEN": { flat: 580000, house: 1400000 },
  "GREENWICH": { flat: 340000, house: 550000 },
  "WANDSWORTH": { flat: 420000, house: 850000 },
  "LAMBETH": { flat: 400000, house: 700000 },
  "LEWISHAM": { flat: 320000, house: 520000 },
  "HAMMERSMITH AND FULHAM": { flat: 500000, house: 1200000 },
  "NEWHAM": { flat: 320000, house: 500000 },
  "WALTHAM FOREST": { flat: 340000, house: 530000 },
  "HARINGEY": { flat: 380000, house: 650000 },
  "BARNET": { flat: 370000, house: 680000 },
  "ENFIELD": { flat: 290000, house: 480000 },
  "BRENT": { flat: 360000, house: 600000 },
  "MERTON": { flat: 370000, house: 680000 },
  "RICHMOND UPON THAMES": { flat: 450000, house: 900000 },
  "CROYDON": { flat: 260000, house: 420000 },
  "BROMLEY": { flat: 280000, house: 480000 },
  "EALING": { flat: 370000, house: 620000 },
  "HOUNSLOW": { flat: 320000, house: 500000 },
  "REDBRIDGE": { flat: 300000, house: 490000 },
  "BARKING AND DAGENHAM": { flat: 230000, house: 380000 },
  "HAVERING": { flat: 260000, house: 420000 },
  "HILLINGDON": { flat: 290000, house: 480000 },
  "HARROW": { flat: 310000, house: 540000 },
  "BEXLEY": { flat: 250000, house: 400000 },
  "SUTTON": { flat: 260000, house: 430000 },
  "KINGSTON UPON THAMES": { flat: 350000, house: 600000 },
};

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = ["F", "F", "F", "F", "T", "T", "S", "D"];
const TENURE = ["L", "L", "L", "F"];
const STREETS = [
  "HIGH STREET", "CHURCH ROAD", "STATION ROAD", "VICTORIA ROAD", "KING STREET",
  "QUEEN STREET", "LONDON ROAD", "PARK ROAD", "MANOR ROAD", "THE GROVE",
  "MILL LANE", "ALBION ROAD", "CAMBRIDGE ROAD", "COMMERCIAL ROAD", "BRICK LANE",
  "GREEN LANE", "CHURCH LANE", "HILL ROAD", "BRIDGE ROAD", "MAPLE AVENUE",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePrice(district: string, propType: string, year: number): number {
  const base = DISTRICT_PRICE_BASE[district] || { flat: 350000, house: 550000 };
  const isFlat = propType === "F";
  let price = isFlat ? base.flat : base.house;
  const yearFactor = 1 + (year - 2021) * (0.03 + Math.random() * 0.02);
  price *= yearFactor;
  price *= 0.8 + Math.random() * 0.4;
  return Math.round(price / 1000) * 1000;
}

function generateFloorArea(propType: string): number {
  switch (propType) {
    case "F": return randomInt(35, 95);
    case "T": return randomInt(75, 140);
    case "S": return randomInt(80, 160);
    case "D": return randomInt(100, 250);
    default: return randomInt(50, 100);
  }
}

// Generate incode digits for postcodes within an outcode
function generateIncode(): string {
  const digit = randomInt(0, 9);
  const letters = "ABDEFGHJLNPQRSTUWXYZ"; // valid incode letters
  const l1 = letters[randomInt(0, letters.length - 1)];
  const l2 = letters[randomInt(0, letters.length - 1)];
  return `${digit}${l1}${l2}`;
}

// ──────────────────────────────────────────────────────────────────────
// Main seeding function
// ──────────────────────────────────────────────────────────────────────
async function main() {
  const db = getScriptDb();
  initSchema(db);
  console.log("Seeding comprehensive London demo data...\n");

  // Generate postcodes for every outcode (3 per outcode for density)
  interface PostcodeEntry {
    postcode: string;
    lat: number;
    lng: number;
    outcode: string;
    district: string;
    lsoa_code: string;
    ward: string;
  }

  const allPostcodes: PostcodeEntry[] = [];
  let lsoaCounter = 1000;

  for (const oc of LONDON_OUTCODES) {
    const numPostcodes = 3;
    for (let i = 0; i < numPostcodes; i++) {
      const incode = generateIncode();
      const postcode = `${oc.outcode} ${incode}`;
      const lat = oc.lat + (Math.random() - 0.5) * 0.008;
      const lng = oc.lng + (Math.random() - 0.5) * 0.012;
      const lsoaCode = `E01${String(lsoaCounter++).padStart(6, "0")}`;

      allPostcodes.push({
        postcode,
        lat,
        lng,
        outcode: oc.outcode,
        district: oc.district,
        lsoa_code: lsoaCode,
        ward: `Ward ${oc.outcode}`,
      });
    }
  }

  // 1. Insert postcodes
  const insertPostcode = db.prepare(`
    INSERT OR IGNORE INTO postcodes (postcode, lat, lng, lsoa_code, lsoa_name, ward_name, district, outcode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertRtree = db.prepare(`
    INSERT OR IGNORE INTO postcodes_rtree (id, min_lat, max_lat, min_lng, max_lng)
    VALUES (?, ?, ?, ?, ?)
  `);

  const txPostcodes = db.transaction(() => {
    allPostcodes.forEach((pc, i) => {
      insertPostcode.run(
        pc.postcode, pc.lat, pc.lng, pc.lsoa_code,
        `${pc.ward} - ${pc.district}`, pc.ward, pc.district, pc.outcode
      );
      insertRtree.run(i + 1, pc.lat, pc.lat, pc.lng, pc.lng);
    });
  });
  txPostcodes();
  console.log(`Inserted ${allPostcodes.length} postcodes across ${LONDON_OUTCODES.length} outcodes.`);

  // 2. Insert price paid records
  const insertPP = db.prepare(`
    INSERT OR IGNORE INTO price_paid
      (id, price, date_of_transfer, postcode, property_type, new_build, tenure, paon, saon, street, district)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let ppCount = 0;
  const txPP = db.transaction(() => {
    for (const pc of allPostcodes) {
      const numTransactions = randomInt(12, 30);
      for (let t = 0; t < numTransactions; t++) {
        const year = randomInt(2021, 2025);
        const month = String(randomInt(1, 12)).padStart(2, "0");
        const day = String(randomInt(1, 28)).padStart(2, "0");
        const propType = randomChoice(PROPERTY_TYPES);
        const price = generatePrice(pc.district, propType, year);
        const id = `{${crypto.randomUUID().toUpperCase()}}`;

        insertPP.run(
          id, price, `${year}-${month}-${day}`, pc.postcode,
          propType, Math.random() < 0.1 ? "Y" : "N",
          propType === "F" ? randomChoice(TENURE) : "F",
          String(randomInt(1, 150)),
          propType === "F" ? `FLAT ${randomInt(1, 20)}` : "",
          randomChoice(STREETS), pc.district
        );
        ppCount++;
      }
    }
  });
  txPP();
  console.log(`Inserted ${ppCount} price paid records.`);

  // 3. Insert EPC records
  const insertEPC = db.prepare(`
    INSERT OR IGNORE INTO epc
      (lmk_key, address, postcode, total_floor_area, current_energy_rating, property_type, built_form, construction_age_band)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let epcCount = 0;
  const energyRatings = ["A", "B", "B", "C", "C", "C", "D", "D", "D", "D", "E", "E", "F"];
  const ageBands = [
    "before 1900", "1900-1929", "1930-1949", "1950-1966",
    "1967-1975", "1976-1982", "1983-1990", "1991-1995",
    "1996-2002", "2003-2006", "2007-2011", "2012 onwards",
  ];

  const txEPC = db.transaction(() => {
    for (const pc of allPostcodes) {
      const numEpc = randomInt(8, 20);
      for (let e = 0; e < numEpc; e++) {
        const paon = String(randomInt(1, 150));
        const propType = randomChoice(PROPERTY_TYPES);
        const floorArea = generateFloorArea(propType);
        const builtForm = propType === "F" ? "Enclosed Mid-Floor Flat" :
          propType === "T" ? "Mid-Terrace" :
          propType === "S" ? "Semi-Detached" : "Detached";

        insertEPC.run(
          crypto.randomUUID(), `${paon} ${randomChoice(STREETS)}, LONDON`,
          pc.postcode, floorArea, randomChoice(energyRatings),
          propType === "F" ? "Flat" : "House", builtForm,
          `England and Wales: ${randomChoice(ageBands)}`
        );
        epcCount++;
      }
    }
  });
  txEPC();
  console.log(`Inserted ${epcCount} EPC records.`);

  // 4. Insert schools — distribute across the map
  const insertSchool = db.prepare(`
    INSERT OR IGNORE INTO schools
      (urn, name, phase, type, postcode, lat, lng, ofsted_rating, last_inspection_date, number_of_pupils, gender, religious_character, website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertSchoolRtree = db.prepare(`
    INSERT OR IGNORE INTO schools_rtree (id, min_lat, max_lat, min_lng, max_lng)
    VALUES (?, ?, ?, ?, ?)
  `);

  const schoolPrefixes = ["St Mary's", "St Paul's", "Holy Trinity", "All Saints", "Oakwood", "Riverside", "Greenfield", "Parkview", "Hillside", "The", "Central", "North", "South", "East", "West"];
  const schoolSuffixes = ["Primary School", "Academy", "Church School", "Junior School", "Secondary School", "School", "College"];
  const ofstedRatings = ["Outstanding", "Good", "Good", "Good", "Good", "Requires improvement"];

  let schoolCount = 0;
  const txSchools = db.transaction(() => {
    for (const oc of LONDON_OUTCODES) {
      // 2-4 schools per outcode
      const numSchools = randomInt(2, 4);
      for (let s = 0; s < numSchools; s++) {
        const urn = 100000 + schoolCount;
        const phase = s < 2 ? "Primary" : "Secondary";
        const name = `${randomChoice(schoolPrefixes)} ${oc.district.split(" ")[0]} ${randomChoice(schoolSuffixes)}`;
        const lat = oc.lat + (Math.random() - 0.5) * 0.015;
        const lng = oc.lng + (Math.random() - 0.5) * 0.02;
        const pc = allPostcodes.find((p) => p.outcode === oc.outcode) || allPostcodes[0];

        insertSchool.run(
          urn, name, phase, "Academy", pc.postcode, lat, lng,
          randomChoice(ofstedRatings),
          `${randomInt(2020, 2025)}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`,
          phase === "Primary" ? randomInt(200, 500) : randomInt(600, 1500),
          "Mixed", Math.random() < 0.3 ? "Church of England" : null, null
        );
        insertSchoolRtree.run(urn, lat, lat, lng, lng);
        schoolCount++;
      }
    }
  });
  txSchools();
  console.log(`Inserted ${schoolCount} schools.`);

  // 5. Insert demographics (IMD by LSOA)
  const insertDemo = db.prepare(`
    INSERT OR IGNORE INTO lsoa_demographics
      (lsoa_code, lsoa_name, imd_rank, imd_decile, income_rank, employment_rank, education_rank,
       health_rank, crime_rank, housing_rank, environment_rank, population, median_age)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const uniqueLsoas = [...new Set(allPostcodes.map((p) => p.lsoa_code))];
  const txDemo = db.transaction(() => {
    for (const lsoa of uniqueLsoas) {
      const pc = allPostcodes.find((p) => p.lsoa_code === lsoa)!;
      // IMD decile somewhat correlated with property prices
      const priceBase = DISTRICT_PRICE_BASE[pc.district] || { flat: 350000 };
      const wealthFactor = Math.min(10, Math.max(1, Math.round(priceBase.flat / 120000)));
      const imdDecile = Math.min(10, Math.max(1, wealthFactor + randomInt(-2, 2)));
      const imdRank = imdDecile * randomInt(2500, 3500);

      insertDemo.run(
        lsoa, `${pc.ward} - ${pc.district}`,
        imdRank, imdDecile,
        randomInt(1000, 30000), randomInt(1000, 30000),
        randomInt(1000, 30000), randomInt(1000, 30000),
        randomInt(1000, 30000), randomInt(1000, 30000),
        randomInt(1000, 30000), randomInt(1200, 3500),
        randomInt(28, 42) + Math.random() * 5
      );
    }
  });
  txDemo();
  console.log(`Inserted ${uniqueLsoas.length} LSOA demographics records.`);

  // 6. Compute price per sqm
  console.log("\nComputing price per sqm...");
  const ppRecords = db.prepare(`
    SELECT pp.id, pp.price, pp.date_of_transfer, pp.postcode, pp.property_type, pp.paon,
           e.lmk_key, e.total_floor_area, e.address
    FROM price_paid pp
    INNER JOIN epc e ON pp.postcode = e.postcode
    WHERE e.total_floor_area > 0
  `).all() as { id: string; price: number; date_of_transfer: string; postcode: string; property_type: string; paon: string; lmk_key: string; total_floor_area: number; address: string }[];

  const insertPsm = db.prepare(`
    INSERT OR IGNORE INTO price_per_sqm
      (price_paid_id, epc_lmk_key, price, floor_area, price_per_sqm, date_of_transfer, postcode, property_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let psmCount = 0;
  const seen = new Set<string>();
  const txPsm = db.transaction(() => {
    for (const r of ppRecords) {
      const key = `${r.id}-${r.lmk_key}`;
      if (seen.has(key)) continue;
      const saleNum = r.paon?.match(/^(\d+)/)?.[1];
      const epcNum = r.address?.match(/^(\d+)/)?.[1];
      if (saleNum && epcNum && saleNum !== epcNum) continue;
      const psm = Math.round(r.price / r.total_floor_area);
      if (psm < 500 || psm > 50000) continue;
      insertPsm.run(r.id, r.lmk_key, r.price, r.total_floor_area, psm, r.date_of_transfer, r.postcode, r.property_type);
      seen.add(key);
      psmCount++;
    }
  });
  txPsm();
  console.log(`Computed ${psmCount} price-per-sqm records.`);

  // Print summary
  console.log("\n=== Database Summary ===");
  const tables = ["postcodes", "price_paid", "epc", "price_per_sqm", "schools", "lsoa_demographics"];
  for (const table of tables) {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
    console.log(`  ${table}: ${row.count} records`);
  }

  db.close();
  console.log("\nDemo data seeded successfully!");
  console.log("Any Greater London postcode should now return data.");
}

main().catch(console.error);
