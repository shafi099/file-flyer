import { Component, ViewChild, ElementRef } from '@angular/core';
import * as JSZip from 'jszip';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'file-flyer';
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
    (event.currentTarget as HTMLElement).classList.add('drag-over'); // Use type assertion
  }
  

  items: any[] = [];
  sizes:any[] = [];

itemsLength(){
  return this.items.length
}

itemsSize() {
  let bytes = 0;

  for (let size of this.sizes) {
    bytes += parseFloat(size);
  }

  const megabytes = bytes / (1024 * 1024);
  return megabytes.toFixed(2) + ' MB';
}

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('drag-over');

    const files = event.dataTransfer!.files;

    if (files.length > 0) {
      this.handleFiles(files);
    }
  }

  handleFiles(files: FileList) {
    const fileListArray = Array.from(files);
  
    for (let i = 0; i < fileListArray.length; i++) {
      const file = fileListArray[i];
      console.log('File dropped:', file.name);
      this.items.push({
        name: file.name,
        size: this.formatFileSize(file.size)
      });
      this.sizes.push(file.size.toString()); // Store raw file size in bytes
      // You can process the file here, e.g., upload to a server.
    }
  }
  
  
  formatFileSize(size: number): string {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  onDelete(index: number) {
    this.items.splice(index, 1);
    this.sizes.splice(index,1);
  }
  
  


  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  private blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsArrayBuffer(blob);
    });
  }

  async convertToBase128(blob: Blob): Promise<string> {
    const arrayBuffer = await this.blobToArrayBuffer(blob);
    const uintArray = new Uint8Array(arrayBuffer);

    let result = '';
    for (const value of uintArray) {
      const base128Value = value.toString(2).padStart(7, '0');
      result += base128Value;
    }

    return result;
  }

  async compressFiles(files: File[]): Promise<Blob> {
    const zip = new JSZip();

    for (const file of files) {
      const fileArrayBuffer = await this.readFileAsync(file);
      zip.file(file.name, fileArrayBuffer);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
  }

  private readFileAsync(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          const arrayBuffer = event.target.result as ArrayBuffer;
          resolve(new Uint8Array(arrayBuffer));
        } else {
          reject(new Error('Error reading file'));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  fileEncode() {
    const files = this.items.map(item => item.name);
    this.compressFiles(files)
      .then(zipBlob => {
        this.convertToBase128(zipBlob)
          .then(base128String => {
            console.log('Base128-encoded data:', base128String);
          })
          .catch(error => {
            console.error('Error converting to Base128:', error);
          });
      })
      .catch(error => {
        console.error('Error compressing files:', error);
      });
  }
}
