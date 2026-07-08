import type { Vehicle, AppState } from "../types";

type SeedRow = Pick<
  Vehicle,
  "lane" | "run" | "year" | "make" | "model" | "miles" | "cr" | "mmr" | "flag" | "color" | "vin"
>;

const RAW_SEED: SeedRow[] = [
  { lane: 5, run: 26, year: 2024, make: "CHEVY", model: "MALIBU LT", miles: 52234, cr: 3.9, mmr: 17550, flag: "GB", color: "White", vin: "1G1ZE5ST8RF236430" },
  { lane: 5, run: 28, year: 2024, make: "VW", model: "JETTA S", miles: 53290, cr: 4, mmr: 14450, flag: "G", color: "Black", vin: "3VW5M7BUXRM049832" },
  { lane: 5, run: 29, year: 2025, make: "GMC", model: "SIERRA 1500 SLT", miles: 40258, cr: 4.4, mmr: 39100, flag: "GB", color: "White", vin: "1GTUUDED4SZ221169" },
  { lane: 5, run: 32, year: 2024, make: "CHEVY", model: "MALIBU LT", miles: 47837, cr: 4, mmr: 17100, flag: "GB", color: "White", vin: "1G1ZD5ST5RF227395" },
  { lane: 5, run: 33, year: 2024, make: "RAM", model: "1500 CLASS WAR", miles: 52297, cr: 4, mmr: 27600, flag: "G", color: "White", vin: "1C6RR7LG6RS156275" },
  { lane: 5, run: 36, year: 2024, make: "VW", model: "TIGUAN WOLFS", miles: 48916, cr: 4, mmr: 18200, flag: "GB", color: "Black", vin: "3VV6B7AX7RM231496" },
  { lane: 5, run: 66, year: 2025, make: "HONDA", model: "ODYSSEY EX-L", miles: 55596, cr: 4.1, mmr: 29200, flag: "GB", color: "Silver", vin: "5FNRL6H65SB055851" },
  { lane: 5, run: 68, year: 2024, make: "VW", model: "JETTA S", miles: 52380, cr: 4.1, mmr: 14750, flag: "GB", color: "White", vin: "3VW5M7BU4RM088254" },
  { lane: 6, run: 2, year: 2024, make: "RAM", model: "1500 REBEL", miles: 14107, cr: 4.3, mmr: 47100, flag: "G", color: "Black", vin: "1C6SRFLT5RN108192" },
  { lane: 6, run: 30, year: 2024, make: "RAM", model: "2500 HD BH", miles: 38531, cr: 2.9, mmr: 39400, flag: "G", color: "White", vin: "3C6UR5DLXRG332083" },
  { lane: 6, run: 48, year: 2024, make: "CHEVY", model: "SILV 2500HD LT", miles: 56259, cr: 3.3, mmr: 42500, flag: "G", color: "White", vin: "1GC1YNEY9RF254180" },
  { lane: 6, run: 59, year: 2017, make: "CHEVY", model: "MALIBU LS", miles: 60486, cr: 2.8, mmr: 8625, flag: "G", color: "Black", vin: "1G1ZB5ST9HF164435" },
  { lane: 6, run: 62, year: 2021, make: "GMC", model: "SIERRA 1500 SLT", miles: 61108, cr: 4.1, mmr: 32200, flag: "G", color: "Gray", vin: "3GTU9DET5MG325049" },
  { lane: 7, run: 4, year: 2023, make: "TOYOTA", model: "RAV4 XLE", miles: 51410, cr: 4.6, mmr: 25400, flag: "G", color: "Blue", vin: "2T3W1RFV1PW278829" },
  { lane: 8, run: 50, year: 2025, make: "RAM", model: "1500 BH", miles: 15496, cr: 4.3, mmr: 35500, flag: "G", color: "White", vin: "1C6RRFFG5SN664571" },
  { lane: 8, run: 96, year: 2021, make: "CHEVY", model: "MALIBU RS", miles: 39279, cr: 3.4, mmr: 16350, flag: "GB", color: "Silver", vin: "1G1ZG5ST8MF012691" },
  { lane: 8, run: 98, year: 2021, make: "HONDA", model: "PILOT", miles: 87790, cr: 3.4, mmr: 19850, flag: "GB", color: "Blue", vin: "5FNYF6H26MB098663" },
  { lane: 8, run: 102, year: 2020, make: "CHEVY", model: "SILV 1500 CUS", miles: 79501, cr: 4.5, mmr: 21700, flag: "GB", color: "Black", vin: "3GCPYBEK5LG250329" },
  { lane: 8, run: 106, year: 2018, make: "RAM", model: "1500 REBEL", miles: 78697, cr: 3.7, mmr: 22600, flag: "GB", color: "Black", vin: "1C6RR7YT5JS155807" },
  { lane: 8, run: 114, year: 2016, make: "HONDA", model: "PILOT EX-L", miles: 96884, cr: 2.8, mmr: 10950, flag: "GB", color: "White", vin: "5FNYF5H67GB040272" },
  { lane: 8, run: 116, year: 2018, make: "CHEVY", model: "COLORADO LT", miles: 67245, cr: 3.9, mmr: 17800, flag: "GB", color: "White", vin: "1GCGTCEN4J1308425" },
  { lane: 8, run: 120, year: 2023, make: "VW", model: "GOLF GTI", miles: 56928, cr: 4.3, mmr: 23300, flag: "GB", color: "White", vin: "WVW6A7CD2PW131128" },
  { lane: 8, run: 121, year: 2024, make: "GMC", model: "CANYON DEN", miles: 22779, cr: 4.3, mmr: 42600, flag: "G", color: "Black", vin: "1GTP6FEK6R1273249" },
  { lane: 8, run: 125, year: 2024, make: "HONDA", model: "CR-V LX", miles: 49064, cr: 4.2, mmr: 24700, flag: "G", color: "Blue", vin: "2HKRS4H26RH409750" },
  { lane: 8, run: 131, year: 2024, make: "CHEVY", model: "COLORADO LT", miles: 27983, cr: 3.1, mmr: 26700, flag: "G", color: "White", vin: "1GCPSCEK9R1296292" },
  { lane: 9, run: 1, year: 2025, make: "RAM", model: "1500 BH", miles: 21198, cr: 4.7, mmr: 37900, flag: "G", color: "Silver", vin: "1C6SRFFP4SN735311" },
  { lane: 9, run: 52, year: 2025, make: "VW", model: "JETTA SPORT", miles: 26709, cr: 4.2, mmr: 17450, flag: "GB", color: "Black", vin: "3VWBX7BU7SM084683" },
  { lane: 9, run: 66, year: 2025, make: "CHEVY", model: "EXPRESS LT", miles: 9767, cr: 4, mmr: 33800, flag: "GB", color: "White", vin: "1GAZGPFP2S1229754" },
  { lane: 9, run: 71, year: 2026, make: "CHEVY", model: "SUBURBAN RST", miles: 16674, cr: 4.8, mmr: 67100, flag: "GB", color: "White", vin: "1GNS6EKD0TR197389" },
  { lane: 9, run: 92, year: 2024, make: "CHEVY", model: "SILV 1500 LT", miles: 63515, cr: 3.5, mmr: 28100, flag: "", color: "", vin: "1GCPDDEK2RZ216610" },
  { lane: 9, run: 101, year: 2025, make: "GMC", model: "SIERRA 1500 SLT", miles: 28878, cr: 0, mmr: 41200, flag: "", color: "Gray", vin: "1GTUUDEDXSZ291128" },
  { lane: 10, run: 13, year: 2025, make: "RAM", model: "1500 BIG HORN", miles: 16612, cr: 4.4, mmr: 38100, flag: "G", color: "White", vin: "1C6SRFFP3SN654574" },
  { lane: 10, run: 56, year: 2019, make: "CHEVY", model: "CAMARO SS", miles: 71733, cr: 0, mmr: 27500, flag: "", color: "Gray", vin: "1G1FH1R7XK0120490" },
  { lane: 10, run: 57, year: 2023, make: "CHEVY", model: "SILV 1500 RST", miles: 61418, cr: 0, mmr: 31800, flag: "", color: "", vin: "2GCPADED5P1135391" },
  { lane: 11, run: 80, year: 2021, make: "HONDA", model: "CIVIC SP TOUR", miles: 60559, cr: 3.5, mmr: 21000, flag: "G", color: "White", vin: "SHHFK7H95MU200944" },
  { lane: 11, run: 82, year: 2022, make: "HONDA", model: "CIVIC LX", miles: 54764, cr: 3.1, mmr: 17050, flag: "G", color: "Black", vin: "2HGFE2F21NH545922" },
  { lane: 11, run: 91, year: 2023, make: "HONDA", model: "CR-V EX", miles: 76833, cr: 4, mmr: 22400, flag: "G", color: "Black", vin: "5J6RS3H40PL003056" },
  { lane: 11, run: 131, year: 2022, make: "HONDA", model: "ACCORD EX-L", miles: 79809, cr: 3.7, mmr: 20200, flag: "G", color: "White", vin: "1HGCV1F51NA011888" },
  { lane: 11, run: 211, year: 2018, make: "CHEVY", model: "BOLT EV LT", miles: 44931, cr: 3.8, mmr: 9275, flag: "GY", color: "Black", vin: "1G1FW6S06J4140274" },
  { lane: 12, run: 201, year: 2022, make: "DODGE", model: "CHALLENGER GT", miles: 53509, cr: 3.7, mmr: 19850, flag: "GB", color: "White", vin: "2C3CDZJG1NH206694" },
  { lane: 13, run: 57, year: 2023, make: "CHEVY", model: "MALIBU RS", miles: 48736, cr: 3.8, mmr: 16050, flag: "GB", color: "Black", vin: "1G1ZG5ST7PF150002" },
  { lane: 14, run: 1, year: 2022, make: "CHEVY", model: "MALIBU PREM", miles: 28466, cr: 4.1, mmr: 24000, flag: "G", color: "White", vin: "1G1ZE5SX1NF146985" },
  { lane: 14, run: 41, year: 2023, make: "TOYOTA", model: "RAV4 HY XLE PRM", miles: 91110, cr: 4.1, mmr: 26300, flag: "GB", color: "Silver", vin: "4T3B6RFV2PU120886" },
  { lane: 14, run: 46, year: 2016, make: "TOYOTA", model: "RAV4 LTD", miles: 95402, cr: 3.5, mmr: 15400, flag: "GB", color: "White", vin: "2T3YFREV5GW258627" },
  { lane: 14, run: 77, year: 2023, make: "CHEVY", model: "MALIBU LT", miles: 70327, cr: 4.7, mmr: 13850, flag: "G", color: "White", vin: "1G1ZD5ST1PF248970" },
];

export const SEED_VEHICLES: Vehicle[] = RAW_SEED.map((v, i) => ({
  id: `seed-${i + 1}`,
  ...v,
  cf: "",
  bb: "",
  ret: "",
  sell: "",
  buy: "",
  bought: false,
  boughtPrice: "",
}));

export const SEED_DATE = "2026-07-08";

export const INITIAL_STATE: AppState = {
  days: [{ date: SEED_DATE, vehicles: SEED_VEHICLES }],
  activeDate: SEED_DATE,
};