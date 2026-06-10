import {ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MidiKantionalService} from './MidiKantionalService';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {MatButton} from '@angular/material/button';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import 'html-midi-player';
import {MatDivider} from '@angular/material/list';
import {instrumentByPatchID} from '@tonejs/midi/src/InstrumentMaps';
import {MatOption, MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatChipSet, MatChip, MatButton, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatSlideToggle, MatDivider, MatSelect, MatOption],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {

  generiertesMidi: Uint8Array | null = null;
  midiUrl: string | null = null;
  error: string | null = null;
  outputDateiname: string = 'kantionalsatz.mid';
  arrayBuffer:ArrayBuffer|null=null;

  constructor(public midiService: MidiKantionalService, public cd:ChangeDetectorRef) {}


  onFileSelected(event: any): void {
    this.error = null;
    const file: File = event.target.files[0];

    if (file) {
      this.outputDateiname = "Satz_"+file.name;
      const reader = new FileReader();

      // Wichtig: Als ArrayBuffer lesen, da MIDI ein Binärformat ist!
      reader.onload = async (e) => {
        this.arrayBuffer=e.target?.result as ArrayBuffer;
        this.startGeneration();
      };

      reader.onerror = () => {
        this.error = "Die Datei konnte nicht gelesen werden.";
        this.cd.markForCheck();
      };

      reader.readAsArrayBuffer(file);
    }
  }

  startGeneration(){
    this.error = null;
    try {
      this.generiertesMidi = this.midiService.generiereKantionalsatz(this.arrayBuffer as ArrayBuffer);
      if (this.generiertesMidi) {
        const base64String = this.uint8ArrayToBase64(this.generiertesMidi);
        this.midiUrl = `data:audio/midi;base64,${base64String}`;
      }
      this.cd.markForCheck();
    } catch (err: any) {
      this.error = err.message || "Fehler bei der MIDI-Verarbeitung.";
      this.generiertesMidi = null;
      this.midiUrl=null;
      this.cd.markForCheck();
    }
  }

  uint8ArrayToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return window.btoa(binary);
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

  protected addForbidden(number: number, checked: boolean) {
    this.midiService.forbiddenParallels=this.midiService.forbiddenParallels.filter(n=>n!==number);
    if(!checked){
      this.midiService.forbiddenParallels.push(number)
    }
    console.log(this.midiService.forbiddenParallels)
  }

  protected readonly instrumentByPatchID = instrumentByPatchID;
}
