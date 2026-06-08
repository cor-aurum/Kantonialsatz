import {ChangeDetectorRef, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MidiKantionalService} from './MidiKantionalService';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, MatAccordion],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  generiertesMidi: Uint8Array | null = null;
  error: string | null = null;
  outputDateiname: string = 'kantionalsatz.mid';

  constructor(public midiService: MidiKantionalService, private cd: ChangeDetectorRef) {}

  onFileSelected(event: any): void {
    this.error = null;
    const file: File = event.target.files[0];

    if (file) {
      this.outputDateiname = "Satz_"+file.name;
      const reader = new FileReader();

      // Wichtig: Als ArrayBuffer lesen, da MIDI ein Binärformat ist!
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        try {
          this.generiertesMidi = this.midiService.generiereKantionalsatz(arrayBuffer);
        } catch (err: any) {
          this.error = err.message || "Fehler bei der MIDI-Verarbeitung.";
          this.generiertesMidi = null;
        }
      };

      reader.onerror = () => {
        this.error = "Die Datei konnte nicht gelesen werden.";
      };

      reader.readAsArrayBuffer(file);
      this.cd.markForCheck();
    }
  }

  // Stellt das binäre MIDI-Array als Browser-Download bereit
  downloadMidi(): void {
    if (!this.generiertesMidi) return;

    console.log(this.generiertesMidi)
    // @ts-ignore
    const blob = new Blob([this.generiertesMidi], { type: 'audio/midi' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = this.outputDateiname;
    link.click();

    window.URL.revokeObjectURL(url);
  }
}
