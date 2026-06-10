export class Akkord {
  sopran: number;
  alt: number;
  tenor: number;
  bass: number;
  functionstring: string;
  finalis: number;

  constructor(sopran: number, alt: number, tenor: number, bass: number, inversion: string, finalis: number) {
    this.sopran = sopran;
    this.alt = alt;
    this.tenor = tenor;
    this.bass = bass;
    this.functionstring = inversion;
    this.finalis = finalis;
  }

  public static createFirstAkkords(next: number, finalis: number, possibleValues: Akkord[]): Akkord[] {
    const ret: Akkord[] = [];
    possibleValues.forEach(a => {
      if (Math.abs(a.sopran - next) % 12 === 0) {
        ret.push(a);
      }
    })
    return ret;
  }

  generatePossibleSuccessors(next: number, finalis: boolean, possibleValues: Akkord[], forbiddenParallels:number[]): Akkord[] {
    const ret: Akkord[] = [];
    possibleValues.forEach(a => {
      if (Math.abs(a.sopran - next) % 12 === 0) {
        if (!this.parallels(a, forbiddenParallels)) {
          let add: Akkord = new Akkord(a.sopran, a.alt, a.tenor, a.bass, a.functionstring, a.finalis);

          if (add.alt - this.alt > 7) {
            add.alt -= 12;
          }
          if (this.alt - add.alt > 7) {
            add.alt += 12;
          }
          if (add.tenor - this.tenor > 7) {
            add.tenor -= 12;
          }
          if (this.tenor - add.tenor > 7) {
            add.tenor += 12;
          }
          if (add.bass - this.bass > 7) {
            add.bass -= 12;
          }
          if (this.bass - add.bass > 7) {
            add.bass += 12;
          }


          if (add.alt < 54) {
            add.alt += 12;
          }
          if (add.tenor < 48) {
            add.tenor += 12;
          }
          if (add.bass < 40) {
            add.bass += 12;
          }
          if (add.alt > next) {
            add.alt = add.alt - (a.sopran - next);
          }
          if (add.tenor > next) {
            add.tenor = add.tenor - (a.sopran - next);
            add.bass = add.bass - (a.sopran - next);
          }

          if (!finalis) {
            ret.push(add);
          } else {
            if (add.functionstring === "T") {
              ret.push(add);
            }
          }
        }
      }
    })
    //TODO Sort Best possible Akkords
    return ret;
  }

  private parallels(a: Akkord, fp:number[]) {
    let sum =
      this.parallelInterval(this.sopran, this.alt, a.sopran, a.alt,fp) +
      this.parallelInterval(this.sopran, this.tenor, a.sopran, a.tenor,fp) +
      this.parallelInterval(this.sopran, this.bass, a.sopran, a.bass,fp) +
      this.parallelInterval(this.alt, this.tenor, a.alt, a.tenor,fp) +
      this.parallelInterval(this.alt, this.bass, a.alt, a.bass,fp) +
      this.parallelInterval(this.tenor, this.bass, a.tenor, a.bass,fp);

    return sum > 0;
  }

  private parallelInterval(t1: number, o1: number, t2: number, o2: number, forbiddenParallels:number[]) {
    if (forbiddenParallels.includes(Math.abs(t1 - o1) % 12)) {
      if (Math.abs(t1 - o1) % 12 === Math.abs(t2 - o2) % 12) {
        return 1;
      }
    }
    return 0;
  }

  public static generateValidAkkords(finalis: number, septs: boolean, parallels:boolean, mark?: string): Akkord[] {
    const tonika: Akkord = new Akkord(finalis + 7, finalis + 4, finalis, finalis - 12, "T", finalis)
    const tonika1: Akkord = new Akkord(finalis + 4, finalis, finalis - 5, finalis - 12, "T", finalis)
    const tonika2: Akkord = new Akkord(finalis, finalis - 5, finalis - 8, finalis - 12, "T", finalis)

    const subdominante: Akkord = new Akkord(finalis, finalis - 3, finalis - 7, finalis - 12, "S", finalis)
    const subdominante1: Akkord = new Akkord(finalis + 5, finalis, finalis - 3, finalis - 12, "S", finalis)
    const subdominante2: Akkord = new Akkord(finalis + 9, finalis + 5, finalis - 3, finalis - 12, "S", finalis)

    const dominante: Akkord = new Akkord(finalis + 2, finalis - 1, finalis - 5, finalis - 17, "D", finalis)
    const dominante1: Akkord = new Akkord(finalis + 7, finalis + 2, finalis - 1, finalis - 17, "D", finalis)
    const dominante2: Akkord = new Akkord(finalis - 1, finalis - 5, finalis - 10, finalis - 17, "D", finalis)
    const ret = [tonika, tonika1, tonika2,
      subdominante, subdominante1, subdominante2,
      dominante, dominante1, dominante2,
    ];

    if(parallels) {
      // --- TONIKAPARALLELE (Tp) ---
// Grundton liegt 3 Halbtöne unter der Tonika (finalis - 3)
      const tonikaparallele: Akkord = new Akkord(finalis + 4, finalis, finalis - 3, finalis - 15, "Tp", finalis);
      const tonikaparallele1: Akkord = new Akkord(finalis + 9, finalis + 4, finalis, finalis - 15, "Tp", finalis);
      const tonikaparallele2: Akkord = new Akkord(finalis, finalis - 3, finalis - 8, finalis - 15, "Tp", finalis);

// --- SUBDOMINANTPARALLELE (Sp) ---
// Grundton liegt 2 Halbtöne über der Tonika / 3 unter der Subdominante (finalis + 2)
      const subdominantparallele: Akkord = new Akkord(finalis + 9, finalis + 5, finalis + 2, finalis - 10, "Sp", finalis);
      const subdominantparallele1: Akkord = new Akkord(finalis + 14, finalis + 9, finalis + 5, finalis - 10, "Sp", finalis);
      const subdominantparallele2: Akkord = new Akkord(finalis + 5, finalis + 2, finalis - 3, finalis - 10, "Sp", finalis);

// --- DOMINANTPARALLELE (Dp) ---
// Grundton liegt 4 Halbtöne über der Tonika / 3 unter der Dominante (finalis + 4)
      const dominantparallele: Akkord = new Akkord(finalis + 11, finalis + 7, finalis + 4, finalis - 8, "Dp", finalis);
      const dominantparallele1: Akkord = new Akkord(finalis + 16, finalis + 11, finalis + 7, finalis - 8, "Dp", finalis);
      const dominantparallele2: Akkord = new Akkord(finalis + 7, finalis + 4, finalis - 1, finalis - 8, "Dp", finalis);

      ret.push(tonikaparallele, tonikaparallele1, tonikaparallele2,
        subdominantparallele, subdominantparallele1, subdominantparallele2,
        dominantparallele, dominantparallele1, dominantparallele2)
    }

    if (septs) {
      // ==========================================
// DOMINANTSEPTtable (D7)
// Grundton: G (finalis + 7)
// ==========================================
// Grundstellung (Bass: G)
      const dominantsept: Akkord = new Akkord(finalis + 17, finalis + 14, finalis + 11, finalis - 5, "D7", finalis);
// 1. Umkehrung / Quintsextakkord (Bass: H / Terz)
      const dominantsept1: Akkord = new Akkord(finalis + 23, finalis + 17, finalis + 14, finalis - 1, "D7", finalis);
// 2. Umkehrung / Terzquartakkord (Bass: D / Quinte)
      const dominantsept2: Akkord = new Akkord(finalis + 26, finalis + 23, finalis + 17, finalis + 2, "D7", finalis);
// 3. Umkehrung / Sekundakkord (Bass: F / Septime)
      const dominantsept3: Akkord = new Akkord(finalis + 29, finalis + 26, finalis + 23, finalis + 5, "D7", finalis);


// ==========================================
// TONIKAPARALLELE MIT SEPTIME (Tp7)
// Grundton: A (finalis - 3)
// ==========================================
// Grundstellung (Bass: A)
      const tonikaparalleleSept: Akkord = new Akkord(finalis + 7, finalis + 4, finalis, finalis - 15, "Tp7", finalis);
// 1. Umkehrung (Bass: C / Terz)
      const tonikaparalleleSept1: Akkord = new Akkord(finalis + 12, finalis + 7, finalis + 4, finalis - 12, "Tp7", finalis);
// 2. Umkehrung (Bass: E / Quinte)
      const tonikaparalleleSept2: Akkord = new Akkord(finalis + 16, finalis + 12, finalis + 7, finalis - 8, "Tp7", finalis);
// 3. Umkehrung (Bass: G / Septime)
      const tonikaparalleleSept3: Akkord = new Akkord(finalis + 19, finalis + 16, finalis + 12, finalis - 5, "Tp7", finalis);


// ==========================================
// SUBDOMINANTPARALLELE MIT SEPTIME (Sp7)
// Grundton: D (finalis + 2)
// ==========================================
// Grundstellung (Bass: D)
      const subdominantparalleleSept: Akkord = new Akkord(finalis + 12, finalis + 9, finalis + 5, finalis - 10, "Sp7", finalis);
// 1. Umkehrung (Bass: F / Terz)
      const subdominantparalleleSept1: Akkord = new Akkord(finalis + 14, finalis + 12, finalis + 9, finalis - 7, "Sp7", finalis);
// 2. Umkehrung (Bass: A / Quinte)
      const subdominantparalleleSept2: Akkord = new Akkord(finalis + 17, finalis + 14, finalis + 12, finalis - 3, "Sp7", finalis);
// 3. Umkehrung (Bass: C / Septime)
      const subdominantparalleleSept3: Akkord = new Akkord(finalis + 21, finalis + 17, finalis + 14, finalis, "Sp7", finalis);


// ==========================================
// DOMINANTPARALLELE MIT SEPTIME (Dp7)
// Grundton: E (finalis + 4)
// ==========================================
// Grundstellung (Bass: E)
      const dominantparalleleSept: Akkord = new Akkord(finalis + 14, finalis + 11, finalis + 7, finalis - 8, "Dp7", finalis);
// 1. Umkehrung (Bass: G / Terz)
      const dominantparalleleSept1: Akkord = new Akkord(finalis + 16, finalis + 14, finalis + 11, finalis - 5, "Dp7", finalis);
// 2. Umkehrung (Bass: H / Quinte)
      const dominantparalleleSept2: Akkord = new Akkord(finalis + 19, finalis + 16, finalis + 14, finalis - 1, "Dp7", finalis);
// 3. Umkehrung (Bass: D / Septime)
      const dominantparalleleSept3: Akkord = new Akkord(finalis + 23, finalis + 19, finalis + 16, finalis + 2, "Dp7", finalis);

      ret.push(tonikaparalleleSept, tonikaparalleleSept1, tonikaparalleleSept2, tonikaparalleleSept3,
        subdominantparalleleSept, subdominantparalleleSept1, subdominantparalleleSept2, subdominantparalleleSept3,
        dominantparalleleSept, dominantparalleleSept1, dominantparalleleSept2, dominantparalleleSept3)
    }

    if (mark) {
      ret.forEach(a => a.functionstring += mark);
    }

    return ret;
  }


}
