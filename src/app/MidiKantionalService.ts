import {Injectable} from '@angular/core';
import {Midi, Track} from '@tonejs/midi';
import {Akkord} from './akkord';

@Injectable({
  providedIn: 'root'
})
export class MidiKantionalService {
  public septs: boolean=false;
  public functionsString: string="";

  constructor() {
  }

  /**
   * Nimmt ein ArrayBuffer einer hochgeladenen MIDI-Datei,
   * fügt die Begleitstimmen hinzu und gibt das neue MIDI als Uint8Array zurück.
   */
  public generiereKantionalsatz(fileBuffer: ArrayBuffer): Uint8Array {
    this.functionsString="";
    // 1. Bestehende MIDI-Datei einlesen
    const midi = new Midi(fileBuffer);
    //console.log(JSON.parse(JSON.stringify(midi)))

    // Wir nehmen an, dass die erste Spur (oder die einzige) die Melodie enthält
    let melodieSpur = midi.tracks[0];
    for (let i = 0; i < midi.tracks.length; i++) {
      if (midi.tracks[i].notes.length > 0) {
        melodieSpur = midi.tracks[i];
      }
    }
    melodieSpur.name = "Sopran";
    melodieSpur.instrument.name = "trumpet";
    if (midi.tracks.length > 1) {
      midi.tracks = [melodieSpur]
    }
    if (!melodieSpur || melodieSpur.notes.length === 0) {
      console.log(melodieSpur)
      console.error("Keine Noten in der ersten MIDI-Spur gefunden.")
      //throw new Error("Keine Noten in der ersten MIDI-Spur gefunden.");
    }

    const finalis: number = melodieSpur.notes[melodieSpur.notes.length - 1].midi;
    const possibleAkkords = Akkord.generateValidAkkords(finalis, this.septs);
    // 2. Drei neue Spuren für den Chorsatz anlegen
    const altSpur = midi.addTrack();
    altSpur.name = "Alt";
    altSpur.instrument.name = "trumpet"

    const tenorSpur = midi.addTrack();
    tenorSpur.name = "Tenor";
    tenorSpur.instrument.name = "trombone";

    const bassSpur = midi.addTrack();
    bassSpur.name = "Bass";
    bassSpur.instrument.name = "trombone";

    // 3. Jede einzelne Note der Melodie spiegeln und harmonisieren
    const akkorde: Akkord[] = [];
    if (!this.createNextAkkordRecursivly(akkorde, melodieSpur, [], finalis, possibleAkkords)) {
      console.error("Keine Harmonisierung gefunden")
    }
    melodieSpur.notes.forEach((note, index) => {
      this.functionsString+=akkorde[index].functionstring+"; ";
      // Alt hinzufügen (exakt dieselbe Startzeit und Dauer wie der Sopran)
      altSpur.addNote({
        midi: akkorde[index].alt,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity * 0.9 // Etwas leiser als die Hauptstimme
      });

      // Tenor hinzufügen
      tenorSpur.addNote({
        midi: akkorde[index].tenor,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity * 0.85
      });

      // Bass hinzufügen
      bassSpur.addNote({
        midi: akkorde[index].bass,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity * 0.9,
      });
    })

    // 4. Das modifizierte MIDI-Objekt wieder in ein binäres Format (Uint8Array) umwandeln
    return midi.toArray();
  }

  createNextAkkordRecursivly(
    akkorde: Akkord[],
    melodieSpur: Track,
    indexTable: number[],
    finalis: number,
    possibleAkkords: Akkord[],
  ): boolean {
    const diatonischeToene = Array.from(new Set(possibleAkkords.flatMap(akkord => akkord.sopran % 12)))
    if (akkorde.length === melodieSpur.notes.length) {
      return true;
    }

    if (indexTable.length <= akkorde.length) {
      indexTable.push(0);
    }

    const aktuelleMidi = melodieSpur.notes[akkorde.length].midi;
    const aktuellerTonInOktave = aktuelleMidi % 12; // Normalisieren auf C, C#, D...

    // Prüfen, ob der Melodieton leitereigen (diatonisch) ist
    const istLeitereigen = diatonischeToene.includes(aktuellerTonInOktave);

    let tmp: Akkord[] = [];

    // 1. REGULÄRE AKKORDGENERIERUNG
    if (akkorde.length === 0) {
      tmp = Akkord.createFirstAkkords(aktuelleMidi, finalis, possibleAkkords);
    } else {
      tmp = akkorde[akkorde.length - 1].generatePossibleSuccessors(aktuelleMidi, akkorde.length+1>=melodieSpur.notes.length, possibleAkkords);
    }

    // =========================================================================
    // LOGIK-UPDATE: Alteration NUR erlauben, wenn der Ton NICHT leitereigen ist
    // =========================================================================
    if (tmp.length === 0 && !istLeitereigen && akkorde.length > 0) {
      console.log("Leiterfremder Ton erkannt. Versuche Alteration...");
      tmp = Akkord.generateValidAkkords(finalis+1,this.septs,"*");
    }
    // Wenn der Ton leitereigen ist, bleibt tmp leer.
    // Das zwingt den Algorithmus ins Backtracking (Vorgängertöne ändern),
    // statt sich mit einem leiterfremden Akkord herauszureden!
    // =========================================================================

    let index = indexTable[akkorde.length];

    if (index >= tmp.length) {
      indexTable.pop();
      return false;
    }

    akkorde.push(tmp[index]);

    let erfolg = this.createNextAkkordRecursivly(akkorde, melodieSpur, indexTable, finalis, possibleAkkords);

    if (erfolg) {
      return true;
    }

    akkorde.pop();
    indexTable[akkorde.length] = indexTable[akkorde.length] + 1;

    return this.createNextAkkordRecursivly(akkorde, melodieSpur, indexTable, finalis, possibleAkkords);
  }
}
